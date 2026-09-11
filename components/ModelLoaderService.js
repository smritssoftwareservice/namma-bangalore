// 3D Model Ingestion, Format Conversion & Validation Service
// Supports GLB, GLTF, OBJ, FBX, and ZIP archives with automatic conversion to GLB for CesiumJS

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import JSZip from "jszip";

export const SUPPORTED_EXTENSIONS = ["glb", "gltf", "obj", "fbx", "zip"];

// Validate uploaded file
export function validateModelFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  const name = file.name.toLowerCase();
  const ext = name.split(".").pop();

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file format .${ext}. Please upload .glb, .gltf, .obj, .fbx, or a .zip archive.`,
    };
  }

  // 150MB maximum file size check
  const maxBytes = 150 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: "File exceeds 150MB size limit. Please upload an optimized model.",
    };
  }

  return { valid: true, extension: ext, name: file.name };
}

// Compute 3D model metadata (bounding box dimensions & vertex count)
export function inspectThreeModel(threeObject) {
  const box = new THREE.Box3().setFromObject(threeObject);
  const size = new THREE.Vector3();
  box.getSize(size);

  let vertices = 0;
  let triangles = 0;

  threeObject.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geom = child.geometry;
      if (geom.attributes?.position) {
        vertices += geom.attributes.position.count;
      }
      if (geom.index) {
        triangles += geom.index.count / 3;
      } else if (geom.attributes?.position) {
        triangles += geom.attributes.position.count / 3;
      }
    }
  });

  return {
    width: Math.max(parseFloat(size.x.toFixed(2)), 1),
    depth: Math.max(parseFloat(size.z.toFixed(2)), 1),
    height: Math.max(parseFloat(size.y.toFixed(2)), 1),
    vertices: Math.round(vertices),
    triangles: Math.round(triangles),
  };
}

// Convert any Three.js Object3D into a binary GLB Blob URL
export function convertThreeObjectToGLB(threeObject) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      threeObject,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: "model/gltf-binary" });
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          const output = JSON.stringify(result, null, 2);
          const blob = new Blob([output], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      },
      (error) => {
        console.error("GLTF export error:", error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// Master Loader: Processes any supported file format and returns { threeScene, glbUrl, stats }
export async function processUploadedModel(file, onProgress) {
  const validation = validateModelFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const ext = validation.extension;
  const fileName = file.name.replace(/\.[^/.]+$/, "");

  if (onProgress) onProgress(20, "Reading file bytes...");

  // 1. DIRECT GLB FILE
  if (ext === "glb") {
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: "model/gltf-binary" });
    const glbUrl = URL.createObjectURL(blob);

    if (onProgress) onProgress(50, "Parsing 3D geometry...");
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, "");
    const stats = inspectThreeModel(gltf.scene);

    if (onProgress) onProgress(100, "Ready");
    return {
      name: fileName,
      format: "GLB",
      threeScene: gltf.scene,
      glbUrl: glbUrl,
      stats: stats,
    };
  }

  // 2. GLTF FILE (JSON + external or embedded buffers)
  if (ext === "gltf") {
    const text = await file.text();
    const loader = new GLTFLoader();
    if (onProgress) onProgress(50, "Parsing GLTF scene...");
    const gltf = await loader.parseAsync(text, "");
    const stats = inspectThreeModel(gltf.scene);

    if (onProgress) onProgress(75, "Compiling binary GLB...");
    const glbUrl = await convertThreeObjectToGLB(gltf.scene);

    if (onProgress) onProgress(100, "Ready");
    return {
      name: fileName,
      format: "GLTF",
      threeScene: gltf.scene,
      glbUrl: glbUrl,
      stats: stats,
    };
  }

  // 3. OBJ FILE
  if (ext === "obj") {
    const text = await file.text();
    if (onProgress) onProgress(40, "Parsing Wavefront OBJ...");
    const loader = new OBJLoader();
    const obj = loader.parse(text);

    // Apply default architectural shading if materials missing
    obj.traverse((child) => {
      if (child.isMesh) {
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xc5a059,
            metalness: 0.2,
            roughness: 0.4,
          });
        }
      }
    });

    const stats = inspectThreeModel(obj);
    if (onProgress) onProgress(75, "Converting OBJ to GLB for Cesium engine...");
    const glbUrl = await convertThreeObjectToGLB(obj);

    if (onProgress) onProgress(100, "Ready");
    return {
      name: fileName,
      format: "OBJ",
      threeScene: obj,
      glbUrl: glbUrl,
      stats: stats,
    };
  }

  // 4. FBX FILE
  if (ext === "fbx") {
    const buffer = await file.arrayBuffer();
    if (onProgress) onProgress(40, "Parsing Autodesk FBX...");

    const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
    const loader = new FBXLoader();
    const fbx = loader.parse(buffer, "");
    const stats = inspectThreeModel(fbx);

    if (onProgress) onProgress(75, "Converting FBX to GLB for Cesium engine...");
    const glbUrl = await convertThreeObjectToGLB(fbx);

    if (onProgress) onProgress(100, "Ready");
    return {
      name: fileName,
      format: "FBX",
      threeScene: fbx,
      glbUrl: glbUrl,
      stats: stats,
    };
  }

  // 5. ZIP ARCHIVE
  if (ext === "zip") {
    if (onProgress) onProgress(30, "Unpacking ZIP archive...");
    const zip = await JSZip.loadAsync(file);

    // Find main 3D file in zip
    let modelFile = null;
    let modelExt = "";

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      const lower = relativePath.toLowerCase();
      if (lower.endsWith(".glb")) {
        modelFile = zipEntry;
        modelExt = "glb";
        break;
      }
      if (lower.endsWith(".gltf")) {
        modelFile = zipEntry;
        modelExt = "gltf";
        break;
      }
      if (lower.endsWith(".obj")) {
        modelFile = zipEntry;
        modelExt = "obj";
        break;
      }
      if (lower.endsWith(".fbx")) {
        modelFile = zipEntry;
        modelExt = "fbx";
        break;
      }
    }

    if (!modelFile) {
      throw new Error(
        "No supported 3D model (.glb, .gltf, .obj, or .fbx) found inside the ZIP archive."
      );
    }

    if (onProgress) onProgress(60, `Found ${modelFile.name}, processing geometry...`);

    if (modelExt === "glb") {
      const buffer = await modelFile.async("arraybuffer");
      const blob = new Blob([buffer], { type: "model/gltf-binary" });
      const glbUrl = URL.createObjectURL(blob);
      const loader = new GLTFLoader();
      const gltf = await loader.parseAsync(buffer, "");
      const stats = inspectThreeModel(gltf.scene);
      return {
        name: fileName,
        format: "ZIP (GLB)",
        threeScene: gltf.scene,
        glbUrl: glbUrl,
        stats: stats,
      };
    }

    if (modelExt === "obj") {
      const text = await modelFile.async("text");
      const loader = new OBJLoader();
      const obj = loader.parse(text);
      const stats = inspectThreeModel(obj);
      const glbUrl = await convertThreeObjectToGLB(obj);
      return {
        name: fileName,
        format: "ZIP (OBJ)",
        threeScene: obj,
        glbUrl: glbUrl,
        stats: stats,
      };
    }

    if (modelExt === "gltf") {
      const text = await modelFile.async("text");
      const loader = new GLTFLoader();
      const gltf = await loader.parseAsync(text, "");
      const stats = inspectThreeModel(gltf.scene);
      const glbUrl = await convertThreeObjectToGLB(gltf.scene);
      return {
        name: fileName,
        format: "ZIP (GLTF)",
        threeScene: gltf.scene,
        glbUrl: glbUrl,
        stats: stats,
      };
    }

    if (modelExt === "fbx") {
      const buffer = await modelFile.async("arraybuffer");
      const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
      const loader = new FBXLoader();
      const fbx = loader.parse(buffer, "");
      const stats = inspectThreeModel(fbx);
      const glbUrl = await convertThreeObjectToGLB(fbx);
      return {
        name: fileName,
        format: "ZIP (FBX)",
        threeScene: fbx,
        glbUrl: glbUrl,
        stats: stats,
      };
    }
  }

  throw new Error("Unable to process 3D file.");
}

// Generate rich procedural architectural sample models for instant testing across all formats
export async function createSampleModel(sampleType = "skyscraper") {
  const group = new THREE.Group();

  if (sampleType === "villa") {
    // Luxury Modern Villa (OBJ format demonstration)
    const baseGeom = new THREE.BoxGeometry(26, 6, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 3;
    group.add(base);

    const upperGeom = new THREE.BoxGeometry(20, 5.5, 14);
    const upperMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3 });
    const upper = new THREE.Mesh(upperGeom, upperMat);
    upper.position.set(2, 8.75, 1);
    group.add(upper);

    const glassGeom = new THREE.BoxGeometry(16, 4, 0.4);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, roughness: 0.1 });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.set(2, 8.5, 8.1);
    group.add(glass);

    const stats = inspectThreeModel(group);
    const glbUrl = await convertThreeObjectToGLB(group);
    return {
      name: "Contemporary Luxury Villa",
      format: "OBJ",
      threeScene: group,
      glbUrl,
      stats,
    };
  } else if (sampleType === "campus") {
    // Tech Campus Pavilion (FBX format demonstration)
    const wingGeom = new THREE.BoxGeometry(45, 12, 28);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.3 });
    const wing = new THREE.Mesh(wingGeom, wingMat);
    wing.position.y = 6;
    group.add(wing);

    const atriumGeom = new THREE.CylinderGeometry(10, 10, 16, 24);
    const atriumMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const atrium = new THREE.Mesh(atriumGeom, atriumMat);
    atrium.position.y = 8;
    group.add(atrium);

    const stats = inspectThreeModel(group);
    const glbUrl = await convertThreeObjectToGLB(group);
    return {
      name: "Tech Park Research Pavilion",
      format: "FBX",
      threeScene: group,
      glbUrl,
      stats,
    };
  } else if (sampleType === "plaza") {
    // Mixed-Use Urban Block (ZIP format demonstration)
    const towerGeom = new THREE.BoxGeometry(32, 45, 26);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.2 });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = 22.5;
    group.add(tower);

    const podiumGeom = new THREE.BoxGeometry(48, 8, 38);
    const podiumMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const podium = new THREE.Mesh(podiumGeom, podiumMat);
    podium.position.y = 4;
    group.add(podium);

    const stats = inspectThreeModel(group);
    const glbUrl = await convertThreeObjectToGLB(group);
    return {
      name: "Civic Mixed-Use High-Rise",
      format: "ZIP",
      threeScene: group,
      glbUrl,
      stats,
    };
  } else {
    // Modern Commercial Skyscraper (GLB format demonstration)
    const podiumGeom = new THREE.BoxGeometry(40, 10, 36);
    const podiumMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const podium = new THREE.Mesh(podiumGeom, podiumMat);
    podium.position.y = 5;
    group.add(podium);

    const towerGeom = new THREE.BoxGeometry(32, 75, 28);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.1 });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = 47.5;
    group.add(tower);

    const crownGeom = new THREE.ConeGeometry(3, 16, 4);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const crown = new THREE.Mesh(crownGeom, crownMat);
    crown.position.y = 93;
    crown.rotation.y = Math.PI / 4;
    group.add(crown);

    const stats = inspectThreeModel(group);
    const glbUrl = await convertThreeObjectToGLB(group);
    return {
      name: "Apex International Financial Tower",
      format: "GLB",
      threeScene: group,
      glbUrl,
      stats,
    };
  }
}

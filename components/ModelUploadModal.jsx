"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Box,
  Compass,
  MapPin,
  Move,
  Layers,
  Sparkles,
} from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { processUploadedModel, createSampleModel, SUPPORTED_EXTENSIONS } from "./ModelLoaderService";

export default function ModelUploadModal({
  isOpen,
  onClose,
  activeSite,
  onConfirmPlacement,
  onStartMapPick,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processedModel, setProcessedModel] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Placement mode
  const [placementMode, setPlacementMode] = useState("center"); // 'center' | 'pick' | 'custom'
  const [customCoords, setCustomCoords] = useState({
    lat: activeSite?.center.lat || 13.1895,
    lng: activeSite?.center.lng || 77.6980,
    alt: 0,
  });

  const previewCanvasRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeSceneRef = useRef(null);
  const threeCameraRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Update custom coords if active site changes
  useEffect(() => {
    if (activeSite) {
      setCustomCoords({
        lat: activeSite.center.lat,
        lng: activeSite.center.lng,
        alt: 0,
      });
    }
  }, [activeSite]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setLoading(false);
      setErrorMsg("");
      setProcessedModel(null);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (threeRendererRef.current) {
        threeRendererRef.current.dispose();
        threeRendererRef.current = null;
      }
    }
  }, [isOpen]);

  // Render 3D Preview when model is processed
  useEffect(() => {
    if (!processedModel || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const width = canvas.clientWidth || 380;
    const height = 260;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    threeSceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    threeCameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    threeRendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight1.position.set(10, 20, 15);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-10, -5, -15);
    scene.add(dirLight2);

    // 5. Subtle Ground Grid
    const gridHelper = new THREE.GridHelper(50, 20, 0xd4af37, 0x334155);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 6. Add Clone of Model to Preview Scene
    const previewObj = processedModel.threeScene.clone();

    // Center model at origin
    const box = new THREE.Box3().setFromObject(previewObj);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    previewObj.position.x -= center.x;
    previewObj.position.y -= box.min.y; // Sit on ground plane
    previewObj.position.z -= center.z;
    scene.add(previewObj);

    // Adjust camera to frame model
    const maxDim = Math.max(size.x, size.y, size.z, 10);
    camera.position.set(maxDim * 1.3, maxDim * 0.9, maxDim * 1.5);
    camera.lookAt(0, size.y * 0.4, 0);

    // 7. OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.target.set(0, size.y * 0.4, 0);

    // 8. Animation loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, [processedModel]);

  if (!isOpen) return null;

  // Handle Drag and Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessFile = async (selectedFile) => {
    setErrorMsg("");
    setProcessedModel(null);
    setLoading(true);
    setFile(selectedFile);

    try {
      const result = await processUploadedModel(selectedFile, (pct, msg) => {
        setProgressMsg(msg);
      });
      setProcessedModel(result);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Failed to process 3D model.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async (sampleKey) => {
    setLoading(true);
    setProgressMsg("Generating sample 3D architecture...");
    setErrorMsg("");
    try {
      const model = await createSampleModel(sampleKey);
      setProcessedModel(model);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create sample model.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!processedModel) return;

    let targetLat = activeSite?.center.lat || 13.1895;
    let targetLng = activeSite?.center.lng || 77.6980;
    let targetAlt = 0;

    if (placementMode === "custom") {
      targetLat = parseFloat(customCoords.lat);
      targetLng = parseFloat(customCoords.lng);
      targetAlt = parseFloat(customCoords.alt);
    }

    onConfirmPlacement({
      name: processedModel.name,
      glbUrl: processedModel.glbUrl,
      uri: processedModel.glbUrl,
      format: processedModel.format,
      stats: processedModel.stats,
      lat: targetLat,
      lng: targetLng,
      alt: targetAlt,
      placementMode: placementMode,
      mode: placementMode,
      modelData: processedModel,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card model-upload-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <Upload size={22} style={{ color: "var(--accent-gold)" }} />
            Upload 3D Architectural Building
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-lead-text">
          Import your 3D building model into the Bengaluru development scene. Supported formats include{" "}
          <strong>.GLB, .GLTF, .OBJ, .FBX</strong>, or a <strong>.ZIP</strong> bundle.
        </p>

        {/* DRAG & DROP ZONE (If no model loaded yet) */}
        {!processedModel && (
          <>
            <div
              className={`model-dropzone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input-direct")?.click()}
            >
              <input
                id="file-input-direct"
                type="file"
                accept=".glb,.gltf,.obj,.fbx,.zip"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
              />

              {loading ? (
                <div className="dropzone-loader">
                  <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
                  <span className="dropzone-status-text">{progressMsg}</span>
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="dropzone-icon-ring">
                    <Box size={28} style={{ color: "var(--accent-gold)" }} />
                  </div>
                  <div className="dropzone-title">
                    Drop your 3D building file here or <span className="highlight-text">Browse</span>
                  </div>
                  <div className="dropzone-sub">
                    GLB • GLTF • OBJ • FBX • ZIP (Up to 150MB)
                  </div>
                </div>
              )}
            </div>

            {/* Quick-test architectural sample models */}
            <div style={{ margin: "0 24px 20px 24px", textAlign: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
                Or test with a sample 3D building prototype:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { name: "Apex Commercial Tower", key: "skyscraper", format: "GLB" },
                  { name: "Contemporary Luxury Villa", key: "villa", format: "OBJ" },
                  { name: "Tech Park Pavilion", key: "campus", format: "FBX" },
                  { name: "Civic Mixed-Use High-Rise", key: "plaza", format: "ZIP" },
                ].map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    className="action-btn-secondary"
                    style={{ fontSize: 11, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample(sample.key);
                    }}
                  >
                    <Sparkles size={13} style={{ color: "var(--accent-gold)" }} />
                    <span>{sample.name}</span>
                    <span style={{ fontSize: 10, color: "var(--accent-gold)", opacity: 0.85 }}>[{sample.format}]</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ERROR MESSAGE BANNER */}
        {errorMsg && (
          <div className="upload-error-banner">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3D MODEL PREVIEW & METADATA SECTION */}
        {processedModel && (
          <div className="model-preview-container">
            {/* Interactive Three.js Preview Canvas */}
            <div className="preview-canvas-wrapper">
              <canvas ref={previewCanvasRef} className="three-preview-canvas" />
              <div className="preview-floating-badge">
                <span className="format-tag">{processedModel.format}</span>
                <span className="preview-hint">Orbit • Scroll to Zoom</span>
              </div>
            </div>

            {/* Model Geometry Stats */}
            <div className="preview-specs-grid">
              <div className="spec-item">
                <span className="spec-label">Model Name</span>
                <span className="spec-val" title={processedModel.name}>
                  {processedModel.name}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Dimensions (W × D × H)</span>
                <span className="spec-val">
                  {processedModel.stats.width}m × {processedModel.stats.depth}m × {processedModel.stats.height}m
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Triangles / Vertices</span>
                <span className="spec-val">
                  {processedModel.stats.triangles.toLocaleString()} △ / {processedModel.stats.vertices.toLocaleString()} ⚬
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Status</span>
                <span className="spec-val" style={{ color: "var(--accent-emerald)" }}>
                  <CheckCircle2 size={13} style={{ display: "inline", marginRight: 4 }} />
                  Validated & Ready
                </span>
              </div>
            </div>

            {/* PLACEMENT TARGET SELECTION */}
            <div className="placement-mode-section">
              <div className="section-label">Choose Geospatial Placement</div>
              <div className="placement-options-row">
                <button
                  className={`placement-option-btn ${placementMode === "center" ? "active" : ""}`}
                  onClick={() => setPlacementMode("center")}
                >
                  <MapPin size={15} />
                  <div>
                    <strong>Site Center</strong>
                    <span>{activeSite?.name.split(" ")[0]} ({activeSite?.acres} Ac)</span>
                  </div>
                </button>

                <button
                  className={`placement-option-btn ${placementMode === "pick" ? "active" : ""}`}
                  onClick={() => {
                    setPlacementMode("pick");
                    if (onStartMapPick) {
                      onStartMapPick(processedModel);
                      onClose();
                    }
                  }}
                >
                  <Move size={15} />
                  <div>
                    <strong>Click on Map</strong>
                    <span>Pick pinpoint spot on terrain</span>
                  </div>
                </button>

                <button
                  className={`placement-option-btn ${placementMode === "custom" ? "active" : ""}`}
                  onClick={() => setPlacementMode("custom")}
                >
                  <Compass size={15} />
                  <div>
                    <strong>Coordinates</strong>
                    <span>Enter Lat / Lng</span>
                  </div>
                </button>
              </div>

              {/* Custom Coordinates Inputs */}
              {placementMode === "custom" && (
                <div className="custom-coords-inputs">
                  <div>
                    <label>Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customCoords.lat}
                      onChange={(e) =>
                        setCustomCoords({ ...customCoords, lat: parseFloat(e.target.value) })
                      }
                      className="search-input custom-coord-field"
                    />
                  </div>
                  <div>
                    <label>Longitude (°E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customCoords.lng}
                      onChange={(e) =>
                        setCustomCoords({ ...customCoords, lng: parseFloat(e.target.value) })
                      }
                      className="search-input custom-coord-field"
                    />
                  </div>
                  <div>
                    <label>Elevation (m)</label>
                    <input
                      type="number"
                      step="1"
                      value={customCoords.alt}
                      onChange={(e) =>
                        setCustomCoords({ ...customCoords, alt: parseFloat(e.target.value) })
                      }
                      className="search-input custom-coord-field"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="modal-actions-footer">
              <button
                className="action-btn-secondary"
                onClick={() => {
                  setProcessedModel(null);
                  setFile(null);
                }}
              >
                Choose Different File
              </button>

              <button className="action-btn-primary" onClick={handleConfirm}>
                <Sparkles size={16} />
                Place on Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

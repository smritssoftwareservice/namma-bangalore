"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Minus,
  Compass,
  Layers,
  Ruler,
  RotateCw,
  KeyRound,
  Box,
  MapPin,
  Sparkles,
  Sliders,
  Footprints,
  Maximize2,
  Eye,
  Move,
} from "lucide-react";

import SearchBox from "./SearchBox";
import PropertyCard from "./PropertyCard";
import LandmarksDrawer, { BANGALORE_LANDMARKS } from "./LandmarksDrawer";
import LayersModal from "./LayersModal";
import MeasureTool from "./MeasureTool";
import TokenSettingsModal from "./TokenSettingsModal";
import DevelopmentComparisonBar from "./DevelopmentComparisonBar";
import BuildingConfigurator from "./BuildingConfigurator";
import ModelUploadModal from "./ModelUploadModal";
import { WalkthroughController } from "./WalkthroughController";
import {
  REAL_ESTATE_SITES,
  BANGALORE_WATER_BODIES,
  BANGALORE_PARKS,
  BANGALORE_ADMIN_BOUNDARIES,
  ARCHITECTURAL_BUILDING_TYPES,
  ARCHITECTURAL_MATERIALS,
  FACADE_STYLES,
  normalizeBuilding,
  generateMasterplan,
  generateContextBuildings,
  calculatePolygonAreaSqFt,
} from "./RealEstateSites";

// Bengaluru Metropolitan Bounding Box & Altitude Limits
const BLR_BOUNDS = {
  minLat: 12.70,
  maxLat: 13.40,
  minLng: 77.25,
  maxLng: 77.95,
  minAlt: 100,
  maxAlt: 45000,
};

// Determine approximate zone/neighborhood from lat/lng
function getBangaloreZone(lat, lng) {
  if (lat > 13.15) return "Devanahalli / Airport Zone";
  if (lat > 13.03 && lng > 77.58) return "Hebbal & Manyata Tech Corridor";
  if (lat > 13.00 && lng < 77.58) return "Malleshwaram / Sadashivanagar";
  if (lat < 12.87 && lng > 77.62) return "Electronic City & Anekal Corridor";
  if (lat < 12.94 && lng > 77.60 && lng < 77.66) return "Koramangala & HSR Layout";
  if (lat < 12.94 && lng < 77.60) return "Jayanagar & JP Nagar";
  if (lat >= 12.94 && lat <= 13.01 && lng > 77.66) return "Whitefield / ITPL Hub";
  if (lat >= 12.95 && lat <= 13.00 && lng > 77.62 && lng <= 77.66) return "Indiranagar & Domlur";
  if (lat >= 12.96 && lat <= 13.01 && lng >= 77.56 && lng <= 77.62) return "CBD / MG Road & Vidhana Soudha";
  return "Greater Bengaluru Region";
}

export default function EarthViewer() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const roadOverlayLayerRef = useRef(null);
  const orbitListenerRef = useRef(null);
  const activePinEntityRef = useRef(null);
  const measureEntitiesRef = useRef([]);
  const boundaryEntitiesRef = useRef([]);
  const geoEntitiesRef = useRef([]);
  const internalEntitiesRef = useRef([]);
  const buildingEntitiesMapRef = useRef(new Map());
  const contextEntitiesRef = useRef([]);
  const walkthroughControllerRef = useRef(null);

  // Cesium script loading state
  const [cesiumReady, setCesiumReady] = useState(false);

  // UI state
  const [coords, setCoords] = useState({ lat: 13.1895, lng: 77.6980, alt: 1800, radius: 1800, heading: 35 });
  const [currentZone, setCurrentZone] = useState("Devanahalli / Airport Zone");
  const [pointingOrigin, setPointingOrigin] = useState({
    lat: 13.1895,
    lng: 77.6980,
    name: "Devanahalli Aerotropolis Hub",
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLandmarksOpen, setIsLandmarksOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [sceneMode, setSceneMode] = useState("3D");

  // Real Estate & 3D Development Platform State
  const [activeSite, setActiveSite] = useState(REAL_ESTATE_SITES[0]); // Default to Devanahalli Aerotropolis
  const [placedBuildings, setPlacedBuildings] = useState(() =>
    generateMasterplan(REAL_ESTATE_SITES[0].id, REAL_ESTATE_SITES[0].center.lat, REAL_ESTATE_SITES[0].center.lng)
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [comparisonMode, setComparisonMode] = useState("proposed"); // 'proposed' | 'existing'
  const [solarHour, setSolarHour] = useState(14.5); // 2:30 PM (optimal architectural sun angle)
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(true);
  const [isWalking, setIsWalking] = useState(false);

  // Dedicated Proposed Layer & Superimpose Comparison States
  const [proposedBlend, setProposedBlend] = useState(100); // 0 (Existing Baseline) to 100 (Proposed Development)
  const [proposedRenderMode, setProposedRenderMode] = useState("realistic"); // 'realistic' | 'transparent' | 'wireframe' | 'ghost'
  const [proposedOpacity, setProposedOpacity] = useState(0.85); // 0.1 to 1.0
  const [existingBuildingsEnabled, setExistingBuildingsEnabled] = useState(true);
  const [isEditingBoundary, setIsEditingBoundary] = useState(false);
  const [isDrawingCustomBoundary, setIsDrawingCustomBoundary] = useState(false);
  const [customBoundaryPoints, setCustomBoundaryPoints] = useState([]);

  // 3D Asset Upload, Placement & Drag States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDraggingBuilding, setIsDraggingBuilding] = useState(false);
  const [pendingPickModel, setPendingPickModel] = useState(null);

  // Mutable refs for Cesium event listeners to read fresh state without re-attaching
  const isDraggingBuildingRef = useRef(false);
  const selectedBuildingIdRef = useRef(null);
  const pendingPickModelRef = useRef(null);
  const placedBuildingsRef = useRef(placedBuildings);
  const activeSiteRef = useRef(activeSite);
  const isEditingBoundaryRef = useRef(false);
  const isDrawingCustomBoundaryRef = useRef(false);
  const customBoundaryPointsRef = useRef([]);
  const activeDraggedPegIndexRef = useRef(null);
  const proposedBlendRef = useRef(100);

  useEffect(() => {
    isDraggingBuildingRef.current = isDraggingBuilding;
  }, [isDraggingBuilding]);

  useEffect(() => {
    selectedBuildingIdRef.current = selectedBuildingId;
  }, [selectedBuildingId]);

  useEffect(() => {
    pendingPickModelRef.current = pendingPickModel;
  }, [pendingPickModel]);

  useEffect(() => {
    placedBuildingsRef.current = placedBuildings;
  }, [placedBuildings]);

  useEffect(() => {
    activeSiteRef.current = activeSite;
  }, [activeSite]);

  useEffect(() => {
    isEditingBoundaryRef.current = isEditingBoundary;
  }, [isEditingBoundary]);

  useEffect(() => {
    isDrawingCustomBoundaryRef.current = isDrawingCustomBoundary;
  }, [isDrawingCustomBoundary]);

  useEffect(() => {
    customBoundaryPointsRef.current = customBoundaryPoints;
  }, [customBoundaryPoints]);

  useEffect(() => {
    proposedBlendRef.current = proposedBlend;
  }, [proposedBlend]);

  // Layered Visualization System States
  const [visLayers, setVisLayers] = useState({
    roadNetwork: true,
    waterBodies: true,
    parks: true,
    adminBoundaries: true,
    siteBoundary: true,
    setbacks: true,
    internalRoads: true,
    proposedBuildings: true,
    otherParcels: true,
  });

  // Layer & Environment Settings
  const [activeLayer, setActiveLayer] = useState("esri-satellite");
  const [envSettings, setEnvSettings] = useState({
    terrain: true,
    lighting: true,
    atmosphere: true,
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState([]);

  // Measure mode
  const [isMeasureActive, setIsMeasureActive] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  // Ion token
  const [ionToken, setIonToken] = useState("");

  // Check when window.Cesium is loaded from CDN
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Cesium) {
      setCesiumReady(true);
      return;
    }
    const checkTimer = setInterval(() => {
      if (window.Cesium) {
        setCesiumReady(true);
        clearInterval(checkTimer);
      }
    }, 100);
    return () => clearInterval(checkTimer);
  }, []);

  // Load saved bookmarks & token from localStorage on mount
  useEffect(() => {
    try {
      const savedBm = localStorage.getItem("blr_bookmarks");
      if (savedBm) setBookmarks(JSON.parse(savedBm));

      const savedToken =
        localStorage.getItem("cesium_token") ||
        process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
        "";
      if (savedToken) setIonToken(savedToken);
    } catch (e) {
      console.warn("Storage read error", e);
    }
  }, []);

  // Helper to get ImageryProvider for a given layer ID
  const getImageryProvider = useCallback((layerId) => {
    const Cesium = window.Cesium;
    if (!Cesium) return null;

    switch (layerId) {
      case "osm-streets":
      case "esri-streets":
        return new Cesium.UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "© Esri, HERE, Garmin, USGS, NGA",
        });
      case "opentopo":
      case "esri-topo":
        return new Cesium.UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "© Esri, Intermap, NASA, USGS",
        });
      case "carto-dark":
        return new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"],
          maximumLevel: 19,
          credit: "© CartoDB, © OpenStreetMap",
        });
      case "esri-satellite":
      default:
        return new Cesium.UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "© Esri, Maxar, Earthstar Geographics",
        });
    }
  }, []);

  // Toggle Visibility of a Specific Visualization Layer
  const handleToggleVisLayer = useCallback((layerKey) => {
    setVisLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  }, []);

  // Initialize Cesium Viewer with Premium Architectural Visual Grading
  useEffect(() => {
    if (!containerRef.current || !cesiumReady) return;
    const Cesium = window.Cesium;
    if (!Cesium) return;

    window.CESIUM_BASE_URL = "https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/";

    const token =
      ionToken ||
      process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
      "";
    if (token) {
      Cesium.Ion.defaultAccessToken = token;
    }

    const baseProvider = getImageryProvider("esri-satellite");

    // Restrict initial default view rectangle to Bangalore
    const blrRectangle = Cesium.Rectangle.fromDegrees(
      BLR_BOUNDS.minLng,
      BLR_BOUNDS.minLat,
      BLR_BOUNDS.maxLng,
      BLR_BOUNDS.maxLat
    );
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = blrRectangle;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      requestRenderMode: true,
      maximumRenderTimeChange: 0.2,
      shadows: true,
      terrainShadows: Cesium.ShadowMode.ENABLED,
      contextOptions: {
        webgl: {
          preserveDrawingBuffer: false,
          powerPreference: "high-performance",
        },
      },
    });

    viewerRef.current = viewer;

    // 1. Base Satellite Imagery Layer
    viewer.imageryLayers.removeAll();
    if (baseProvider) {
      viewer.imageryLayers.addImageryProvider(baseProvider);
    }

    // 2. Subtle Road Network Vector Imagery Overlay (semi-transparent 0.42 alpha)
    try {
      const roadProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
        maximumLevel: 19,
        credit: "© Esri Transportation",
      });
      const roadLayer = viewer.imageryLayers.addImageryProvider(roadProvider);
      roadLayer.alpha = 0.42;
      roadOverlayLayerRef.current = roadLayer;
    } catch (e) {
      console.warn("Road overlay init error", e);
    }

    // High-Fidelity Architectural Visual Grading & Tonemapping
    viewer.resolutionScale = window.devicePixelRatio > 1 ? 1.2 : 1.0;
    viewer.scene.highDynamicRange = true;
    if (viewer.scene.postProcessStages?.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = true; // Crisp antialiasing on building edges
    }

    // Terrain & Atmosphere tuning
    viewer.scene.globe.maximumScreenSpaceError = 1.6; // High-detail terrain sharpness
    viewer.scene.globe.tileCacheSize = 120;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#090d16");
    viewer.scene.globe.enableLighting = true; // Natural solar lighting

    // Soft Shadow Map tuning
    if (viewer.scene.shadowMap) {
      viewer.scene.shadowMap.size = 2048;
      viewer.scene.shadowMap.softShadows = true;
      viewer.scene.shadowMap.darkness = 0.52; // Soft architectural contact shadows
    }

    // Aerial atmospheric depth & distance fog
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.brightnessShift = 0.05;
      viewer.scene.skyAtmosphere.saturationShift = 0.06;
    }
    if (viewer.scene.fog) {
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 0.00012; // Natural atmospheric scale
    }

    // Constrain camera altitude
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = BLR_BOUNDS.maxAlt;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = BLR_BOUNDS.minAlt;

    // Initial Camera position: Overlooking first prime site (Devanahalli Aerotropolis)
    const initSite = REAL_ESTATE_SITES[0];
    const initLat = initSite.center.lat;
    const initLng = initSite.center.lng;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(initLng, initLat, 2200),
      orientation: {
        heading: Cesium.Math.toRadians(initSite.camera.heading),
        pitch: Cesium.Math.toRadians(initSite.camera.pitch),
        roll: 0,
      },
    });

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(initLng, initLat, initSite.camera.height),
      orientation: {
        heading: Cesium.Math.toRadians(initSite.camera.heading),
        pitch: Cesium.Math.toRadians(initSite.camera.pitch),
        roll: 0,
      },
      duration: 2.2,
    });

    // Add 3D markers for iconic Bangalore landmarks
    BANGALORE_LANDMARKS.slice(0, 6).forEach((item) => {
      const pos = Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude, 0);
      viewer.entities.add({
        name: item.name,
        position: pos,
        point: {
          pixelSize: 7,
          color: Cesium.Color.fromCssColorString("#c5a059"),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: item.name.split(" ")[0],
          font: "11px 'Outfit', sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000),
        },
      });
    });

    // Set initial solar time
    const initialDate = new Date(2026, 8, 10, 14, 30);
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(initialDate);

    // Initialize Walkthrough controller
    walkthroughControllerRef.current = new WalkthroughController(viewer, () => {
      viewer.scene.requestRender();
    });

    // Throttled camera change listener
    let lastCameraUpdateTime = 0;
    viewer.camera.changed.addEventListener(() => {
      const now = performance.now();
      if (now - lastCameraUpdateTime < 40) return;
      lastCameraUpdateTime = now;

      const carto = viewer.camera.positionCartographic;
      if (!carto) return;
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lng = Cesium.Math.toDegrees(carto.longitude);
      const alt = carto.height;

      // Soft clamp if user wanders too far outside Bangalore
      let clampedLat = lat;
      let clampedLng = lng;
      let needsClamp = false;

      if (lat < BLR_BOUNDS.minLat) { clampedLat = BLR_BOUNDS.minLat + 0.05; needsClamp = true; }
      if (lat > BLR_BOUNDS.maxLat) { clampedLat = BLR_BOUNDS.maxLat - 0.05; needsClamp = true; }
      if (lng < BLR_BOUNDS.minLng) { clampedLng = BLR_BOUNDS.minLng + 0.05; needsClamp = true; }
      if (lng > BLR_BOUNDS.maxLng) { clampedLng = BLR_BOUNDS.maxLng - 0.05; needsClamp = true; }

      if (needsClamp) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(clampedLng, clampedLat, Math.min(alt, BLR_BOUNDS.maxAlt)),
          duration: 1.0,
        });
        return;
      }

      setCoords((prev) => ({
        ...prev,
        alt: Math.round(alt),
        radius: alt,
        heading: Math.round(Cesium.Math.toDegrees(viewer.camera.heading)),
      }));
    });

    // Throttled Mouse Move listener for live coordinates HUD, dynamic building drag & boundary peg drag
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let lastMouseMoveTime = 0;

    // LEFT_DOWN: Start dragging boundary peg if in boundary edit mode
    handler.setInputAction((click) => {
      if (isEditingBoundaryRef.current && activeSiteRef.current) {
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id) {
          const entityId = typeof picked.id === "string" ? picked.id : picked.id.id;
          if (entityId && entityId.startsWith(`site-peg-${activeSiteRef.current.id}-`)) {
            const parts = entityId.split("-");
            const pegIdx = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(pegIdx)) {
              activeDraggedPegIndexRef.current = pegIdx;
              viewer.scene.screenSpaceCameraController.enableInputs = false;
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // LEFT_UP: Release boundary peg drag
    handler.setInputAction(() => {
      if (activeDraggedPegIndexRef.current !== null) {
        activeDraggedPegIndexRef.current = null;
        viewer.scene.screenSpaceCameraController.enableInputs = true;
        viewer.scene.requestRender();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    handler.setInputAction((movement) => {
      const now = performance.now();
      if (now - lastMouseMoveTime < 45) return;
      lastMouseMoveTime = now;

      const ray = viewer.camera.getPickRay(movement.endPosition);
      if (!ray) return;
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const heading = Cesium.Math.toDegrees(viewer.camera.heading);

        setCoords((prev) => ({
          ...prev,
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          heading: Math.round(heading),
        }));

        setCurrentZone(getBangaloreZone(lat, lng));

        // Interactive Boundary Peg Dragging on Terrain
        if (activeDraggedPegIndexRef.current !== null && isEditingBoundaryRef.current) {
          const pegIdx = activeDraggedPegIndexRef.current;
          setActiveSite((prev) => {
            if (!prev || !prev.boundary) return prev;
            const newBoundary = prev.boundary.map((pt, i) =>
              i === pegIdx
                ? { lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) }
                : pt
            );
            const newAreaSqFt = calculatePolygonAreaSqFt(newBoundary);
            const newAcres = parseFloat((newAreaSqFt / 43560).toFixed(2));
            return {
              ...prev,
              boundary: newBoundary,
              areaSqFt: newAreaSqFt,
              acres: newAcres,
            };
          });
          viewer.scene.requestRender();
          return;
        }

        // Interactive Real-Time Building Dragging on Map
        if (isDraggingBuildingRef.current && selectedBuildingIdRef.current) {
          const bldId = selectedBuildingIdRef.current;
          setPlacedBuildings((prev) =>
            prev.map((b) =>
              b.id === bldId
                ? {
                    ...b,
                    lat: parseFloat(lat.toFixed(5)),
                    lng: parseFloat(lng.toFixed(5)),
                  }
                : b
            )
          );
          viewer.scene.requestRender();
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Left Click: Placement Mode, Drag Drop, Custom Parcel Draw, and Direct 3D Building Selection
    handler.setInputAction((click) => {
      // 0. If drawing custom parcel boundary on map
      if (isDrawingCustomBoundaryRef.current) {
        const ray = viewer.camera.getPickRay(click.position);
        if (!ray) return;
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          setCustomBoundaryPoints((prev) => [
            ...prev,
            { lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) },
          ]);
          viewer.scene.requestRender();
        }
        return;
      }

      // 1. If in "Click on Map" placement mode for an uploaded 3D model
      if (pendingPickModelRef.current) {
        const ray = viewer.camera.getPickRay(click.position);
        if (!ray) return;
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const alt = cartographic.height || 0;

          const pending = pendingPickModelRef.current;
          const newBldId = `bld-upload-${Date.now()}`;
          const newBuilding = {
            id: newBldId,
            typeId: "uploaded-custom",
            name: pending.name || pending.modelData?.name || "Custom 3D Building",
            modelUri: pending.uri || pending.modelData?.uri,
            format: pending.format || pending.modelData?.format,
            lat: parseFloat(lat.toFixed(5)),
            lng: parseFloat(lng.toFixed(5)),
            elevation: 0,
            height: Math.round(
              pending.stats?.dimensions?.height ||
                pending.modelData?.stats?.dimensions?.height ||
                45
            ),
            scale: 1.0,
            scaleX: 1.0,
            scaleY: 1.0,
            scaleZ: 1.0,
            rotation: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            stats: pending.stats || pending.modelData?.stats,
            isUploaded: true,
          };

          setPlacedBuildings((prev) => [...prev, newBuilding]);
          setSelectedBuildingId(newBldId);
          setIsConfiguratorOpen(true);
          setPendingPickModel(null);
          viewer.scene.requestRender();
        }
        return;
      }

      // 2. If user was dragging a building, clicking drops and locks it
      if (isDraggingBuildingRef.current) {
        setIsDraggingBuilding(false);
        return;
      }

      // 3. Direct Click Selection on 3D Buildings in the scene
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entityId =
          typeof pickedObject.id === "string" ? pickedObject.id : pickedObject.id.id;
        if (entityId) {
          const matched = placedBuildingsRef.current.find(
            (b) => entityId === b.id || entityId.startsWith(`${b.id}-`)
          );
          if (matched) {
            setSelectedBuildingId(matched.id);
            setIsConfiguratorOpen(true);
            return;
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      if (walkthroughControllerRef.current) {
        walkthroughControllerRef.current.stop();
      }
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, [getImageryProvider, ionToken, cesiumReady]);

  // Global Escape key handler to cancel drag, map-pick, or boundary editing mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (pendingPickModel) setPendingPickModel(null);
        if (isDraggingBuilding) setIsDraggingBuilding(false);
        if (isUploadModalOpen) setIsUploadModalOpen(false);
        if (isEditingBoundary) setIsEditingBoundary(false);
        if (isDrawingCustomBoundary) {
          setIsDrawingCustomBoundary(false);
          setCustomBoundaryPoints([]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingPickModel, isDraggingBuilding, isUploadModalOpen, isEditingBoundary, isDrawingCustomBoundary]);

  // Synchronize Road Overlay Layer Alpha / Visibility
  useEffect(() => {
    if (roadOverlayLayerRef.current) {
      roadOverlayLayerRef.current.show = visLayers.roadNetwork;
      viewerRef.current?.scene.requestRender();
    }
  }, [visLayers.roadNetwork]);

  // Render Base Map Geographic Infrastructure (Water Bodies, Parks, Admin Limits)
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // Clear previous geographic entities
    geoEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    geoEntitiesRef.current = [];

    // 1. Water Bodies (Lakes & Tanks)
    if (visLayers.waterBodies) {
      BANGALORE_WATER_BODIES.forEach((lake) => {
        const coords = [];
        lake.polygon.forEach((p) => coords.push(p.lng, p.lat));

        const lakeEntity = viewer.entities.add({
          id: `water-${lake.id}`,
          name: lake.name,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(coords),
            material: Cesium.Color.fromCssColorString("rgba(14, 165, 233, 0.28)"),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString("rgba(56, 189, 248, 0.7)"),
            outlineWidth: 1.5,
            classificationType: Cesium.ClassificationType.TERRAIN,
          },
          label: {
            text: lake.name.split(" ")[0],
            font: "11px 'Outfit', sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#7dd3fc"),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            position: Cesium.Cartesian3.fromDegrees(lake.polygon[0].lng, lake.polygon[0].lat, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 16000),
          },
        });
        geoEntitiesRef.current.push(lakeEntity);
      });
    }

    // 2. Parks & Urban Green Reserves
    if (visLayers.parks) {
      BANGALORE_PARKS.forEach((park) => {
        const coords = [];
        park.polygon.forEach((p) => coords.push(p.lng, p.lat));

        const parkEntity = viewer.entities.add({
          id: `park-${park.id}`,
          name: park.name,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(coords),
            material: Cesium.Color.fromCssColorString("rgba(16, 185, 129, 0.2)"),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString("rgba(52, 211, 153, 0.6)"),
            outlineWidth: 1.5,
            classificationType: Cesium.ClassificationType.TERRAIN,
          },
          label: {
            text: park.name.split(" ")[0],
            font: "11px 'Outfit', sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#a7f3d0"),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            position: Cesium.Cartesian3.fromDegrees(park.polygon[0].lng, park.polygon[0].lat, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 16000),
          },
        });
        geoEntitiesRef.current.push(parkEntity);
      });
    }

    // 3. Administrative / Municipal Planning Limits
    if (visLayers.adminBoundaries) {
      BANGALORE_ADMIN_BOUNDARIES.forEach((admin) => {
        const coords = [];
        admin.polygon.forEach((p) => coords.push(p.lng, p.lat));
        coords.push(admin.polygon[0].lng, admin.polygon[0].lat); // close

        const lineEntity = viewer.entities.add({
          id: `admin-${admin.id}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(coords),
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("rgba(99, 102, 241, 0.5)"),
              dashLength: 16.0,
            }),
            clampToGround: true,
          },
        });
        geoEntitiesRef.current.push(lineEntity);
      });
    }

    viewer.scene.requestRender();
  }, [visLayers.waterBodies, visLayers.parks, visLayers.adminBoundaries]);

  // Render Real Estate Overlays: Active Site Boundary, Setbacks, Internal Roads & Vertex Handles
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // Clear previous boundary & internal entities
    boundaryEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    boundaryEntitiesRef.current = [];
    internalEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    internalEntitiesRef.current = [];

    if (!activeSite) {
      viewer.scene.requestRender();
      return;
    }

    // 1. Secondary Non-Active Development Parcels (Subtle Architectural Outline)
    if (visLayers.otherParcels) {
      REAL_ESTATE_SITES.filter((s) => s.id !== activeSite.id).forEach((secSite) => {
        const secCoords = [];
        secSite.boundary.forEach((pt) => secCoords.push(pt.lng, pt.lat));
        secCoords.push(secSite.boundary[0].lng, secSite.boundary[0].lat);

        const secLine = viewer.entities.add({
          id: `sec-parcel-${secSite.id}`,
          name: secSite.name,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(secCoords),
            width: 1.5,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("rgba(255, 255, 255, 0.3)"),
              dashLength: 12.0,
            }),
            clampToGround: true,
          },
          label: {
            text: `${secSite.name.split(" ")[0]} (${secSite.acres} Ac)`,
            font: "10px 'Outfit', sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#94a3b8"),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            position: Cesium.Cartesian3.fromDegrees(secSite.center.lng, secSite.center.lat, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000),
          },
        });
        internalEntitiesRef.current.push(secLine);
      });
    }

    const coordsArray = [];
    activeSite.boundary.forEach((pt) => {
      coordsArray.push(pt.lng, pt.lat);
    });

    // 2. Active Site Primary Cadastral Boundary (Subtle Glowing Edge + Transparent Fill)
    if (visLayers.siteBoundary) {
      const polyEntity = viewer.entities.add({
        id: `site-boundary-poly-${activeSite.id}`,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(coordsArray),
          material: Cesium.Color.fromCssColorString(
            isEditingBoundary ? "rgba(16, 185, 129, 0.16)" : "rgba(212, 175, 55, 0.10)"
          ),
          classificationType: Cesium.ClassificationType.TERRAIN,
        },
      });
      boundaryEntitiesRef.current.push(polyEntity);

      // Outer Boundary Edge Glow
      const closedCoords = [...coordsArray, coordsArray[0], coordsArray[1]];
      const lineEntity = viewer.entities.add({
        id: `site-boundary-line-${activeSite.id}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(closedCoords),
          width: isEditingBoundary ? 3.5 : 2.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: isEditingBoundary ? 0.4 : 0.25,
            color: Cesium.Color.fromCssColorString(isEditingBoundary ? "#10b981" : "#d4af37"),
          }),
          clampToGround: true,
        },
      });
      boundaryEntitiesRef.current.push(lineEntity);

      // Corner / Vertex Handles with Elevation Readout & Interactive Dragging
      activeSite.boundary.forEach((pt, idx) => {
        const pegEntity = viewer.entities.add({
          id: `site-peg-${activeSite.id}-${idx}`,
          position: Cesium.Cartesian3.fromDegrees(pt.lng, pt.lat, 0),
          point: {
            pixelSize: isEditingBoundary ? 14 : 8,
            color: Cesium.Color.fromCssColorString(isEditingBoundary ? "#10b981" : "#d4af37"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isEditingBoundary ? 3 : 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: isEditingBoundary
              ? `Peg ${idx + 1}\n(Drag on terrain)`
              : `Peg ${idx + 1}\n${pt.lat.toFixed(4)}°N, ${pt.lng.toFixed(4)}°E`,
            font: isEditingBoundary ? "bold 11px 'Outfit', sans-serif" : "10px 'Outfit', sans-serif",
            fillColor: isEditingBoundary ? Cesium.Color.fromCssColorString("#6ee7b7") : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, isEditingBoundary ? -16 : -12),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4500),
          },
        });
        boundaryEntitiesRef.current.push(pegEntity);
      });
    }

    // 3. Peripheral Setback Perimeter Lines (Mandatory Regulatory Clearances)
    if (visLayers.setbacks) {
      const insetFactor = 0.94;
      const setbackCoords = [];
      activeSite.boundary.forEach((pt) => {
        const dLat = pt.lat - activeSite.center.lat;
        const dLng = pt.lng - activeSite.center.lng;
        setbackCoords.push(
          activeSite.center.lng + dLng * insetFactor,
          activeSite.center.lat + dLat * insetFactor
        );
      });
      setbackCoords.push(setbackCoords[0], setbackCoords[1]); // close

      const setbackLine = viewer.entities.add({
        id: `site-setback-${activeSite.id}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(setbackCoords),
          width: 1.5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString("rgba(16, 185, 129, 0.6)"),
            dashLength: 10.0,
          }),
          clampToGround: true,
        },
      });
      internalEntitiesRef.current.push(setbackLine);
    }

    // 4. Internal Masterplan Roads & Site Driveways
    if (visLayers.internalRoads && activeSite.internalRoads) {
      activeSite.internalRoads.forEach((roadPath, rIdx) => {
        const roadCoords = [];
        roadPath.forEach((pt) => roadCoords.push(pt.lng, pt.lat));

        const roadLine = viewer.entities.add({
          id: `site-internal-road-${activeSite.id}-${rIdx}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(roadCoords),
            width: 7, // 7-meter wide asphalt driveway
            material: Cesium.Color.fromCssColorString("#27272a"), // Charcoal asphalt
            clampToGround: true,
          },
        });
        internalEntitiesRef.current.push(roadLine);
      });
    }

    // 5. Draft Custom Parcel Boundary Visualization
    if (isDrawingCustomBoundary && customBoundaryPoints.length > 0) {
      const draftCoords = [];
      customBoundaryPoints.forEach((pt) => draftCoords.push(pt.lng, pt.lat));
      if (customBoundaryPoints.length >= 2) {
        const draftLine = viewer.entities.add({
          id: `draft-custom-boundary-line`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(draftCoords),
            width: 2.5,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("#06b6d4"),
              dashLength: 14.0,
            }),
            clampToGround: true,
          },
        });
        boundaryEntitiesRef.current.push(draftLine);
      }
      customBoundaryPoints.forEach((pt, idx) => {
        const draftPeg = viewer.entities.add({
          id: `draft-peg-${idx}`,
          position: Cesium.Cartesian3.fromDegrees(pt.lng, pt.lat, 0),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString("#06b6d4"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `Point ${idx + 1}`,
            font: "10px 'Outfit', sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        boundaryEntitiesRef.current.push(draftPeg);
      });
    }

    viewer.scene.requestRender();
  }, [activeSite, visLayers, isEditingBoundary, isDrawingCustomBoundary, customBoundaryPoints]);

  // Render Surrounding Existing Context Buildings (Baseline Environment)
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // Clear previous context entities
    contextEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    contextEntitiesRef.current = [];

    if (!activeSite || !existingBuildingsEnabled) {
      viewer.scene.requestRender();
      return;
    }

    const contextBuildings = generateContextBuildings(
      activeSite.id,
      activeSite.center.lat,
      activeSite.center.lng
    );

    contextBuildings.forEach((bld) => {
      const pos = Cesium.Cartesian3.fromDegrees(
        bld.lng,
        bld.lat,
        (bld.elevation || 0) + bld.height / 2
      );
      const hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(bld.rotation || 0),
        0,
        0
      );
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);

      const entity = viewer.entities.add({
        id: bld.id,
        name: bld.name,
        position: pos,
        orientation: orientation,
        box: {
          dimensions: new Cesium.Cartesian3(bld.width, bld.depth, bld.height),
          material: Cesium.Color.fromCssColorString(bld.color || "#64748b").withAlpha(0.85),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString("rgba(255, 255, 255, 0.25)"),
          outlineWidth: 1,
          shadows: Cesium.ShadowMode.ENABLED,
        },
        label: {
          text: `[Existing Context]\n${bld.height}m`,
          font: "10px 'Outfit', sans-serif",
          fillColor: Cesium.Color.fromCssColorString("#94a3b8"),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4500),
        },
      });

      contextEntitiesRef.current.push(entity);
    });

    viewer.scene.requestRender();
  }, [activeSite, existingBuildingsEnabled]);

  // Render & Synchronize Proposed 3D Buildings with 4 Architectural Modes & Continuous Blend Slider
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // Clear previous building entities
    buildingEntitiesMapRef.current.forEach((entities) => {
      entities.forEach((e) => viewer.entities.remove(e));
    });
    buildingEntitiesMapRef.current.clear();

    // If proposed layer is at 0% (Existing Baseline) or toggled off, skip rendering
    if (proposedBlend <= 0 || !visLayers.proposedBuildings) {
      viewer.scene.requestRender();
      return;
    }

    const blendFactor = proposedBlend / 100;
    const effectiveAlpha = Math.max(0.08, Math.min(1.0, proposedOpacity * blendFactor));

    const isRealistic = proposedRenderMode === "realistic";
    const isTransparent = proposedRenderMode === "transparent";
    const isWireframe = proposedRenderMode === "wireframe";
    const isGhost = proposedRenderMode === "ghost";

    const shadowMode = isRealistic ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.DISABLED;

    // Render each placed building with selected architectural mode & properties
    placedBuildings.forEach((bld) => {
      const isSelected = bld.id === selectedBuildingId;
      const typeDef = ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === bld.typeId);
      const bldEntities = [];

      const scaleX = bld.scaleX ?? bld.scale ?? 1.0;
      const scaleY = bld.scaleY ?? bld.scale ?? 1.0;
      const scaleZ = bld.scaleZ ?? 1.0;

      const baseWidth = (bld.width ?? typeDef?.defaultWidth ?? 34) * scaleX;
      const baseDepth = (bld.length ?? bld.depth ?? typeDef?.defaultLength ?? typeDef?.defaultDepth ?? 32) * scaleY;
      const floorHeight = bld.floorHeight ?? typeDef?.defaultFloorHeight ?? 3.2;
      const floors = bld.floors ?? Math.max(1, Math.round((bld.height || 50) / floorHeight));
      const height = (bld.height ?? parseFloat((floors * floorHeight).toFixed(1))) * scaleZ;
      const elevation = bld.elevation || 0;

      const bldOpacity = bld.opacity !== undefined ? bld.opacity : (typeDef?.defaultOpacity ?? 0.90);
      const effectiveAlpha = Math.max(0.08, Math.min(1.0, proposedOpacity * blendFactor * bldOpacity));

      const isBuildingWireframe = bld.wireframe === true || isWireframe;
      const isBuildingShadow = bld.shadow !== false && !isBuildingWireframe && isRealistic;
      const shadowMode = isBuildingShadow ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.DISABLED;

      // 3D Euler rotation angles: Heading/Yaw (Z), Pitch (X), Roll (Y)
      const heading = Cesium.Math.toRadians(bld.rotationZ ?? bld.rotation ?? 0);
      const pitch = Cesium.Math.toRadians(bld.rotationX ?? 0);
      const roll = Cesium.Math.toRadians(bld.rotationY ?? 0);

      const bldPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, elevation);
      const bldHpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const bldOrientation = Cesium.Transforms.headingPitchRollQuaternion(bldPos, bldHpr);

      // Material colors
      let glassHex = bld.color || typeDef?.glassColor || "#38bdf8";
      let concreteHex = typeDef?.concreteColor || "#334155";
      if (bld.material === "precast-concrete") {
        glassHex = "#38bdf8";
        concreteHex = "#e2e8f0";
      } else if (bld.material === "glass-steel") {
        glassHex = "#0284c7";
        concreteHex = "#334155";
      } else if (bld.material === "bronze-glass") {
        glassHex = "#c5a059";
        concreteHex = "#1e293b";
      } else if (bld.material === "slate-granite") {
        glassHex = "#64748b";
        concreteHex = "#1e293b";
      } else if (bld.material === "timber-stucco") {
        glassHex = "#818cf8";
        concreteHex = "#f8fafc";
      } else if (bld.material === "terracotta") {
        glassHex = "#f97316";
        concreteHex = "#9a3412";
      }
      const glassColor = Cesium.Color.fromCssColorString(glassHex);
      const concreteColor = Cesium.Color.fromCssColorString(concreteHex);

      if (bld.modelUri) {
        // Uploaded custom .glb / .gltf / converted 3D model
        let modelColor = Cesium.Color.WHITE.withAlpha(effectiveAlpha);
        let colorBlendMode = Cesium.ColorBlendMode.MIX;
        let colorBlendAmount = (1 - blendFactor) * 0.4;
        let silhouetteColor = undefined;
        let silhouetteSize = 0.0;

        if (isTransparent) {
          modelColor = Cesium.Color.fromCssColorString("#38bdf8").withAlpha(Math.min(0.35, effectiveAlpha * 0.45));
          colorBlendMode = Cesium.ColorBlendMode.MIX;
          colorBlendAmount = 0.65;
          silhouetteColor = Cesium.Color.CYAN;
          silhouetteSize = 2.0;
        } else if (isBuildingWireframe) {
          modelColor = Cesium.Color.fromCssColorString("#0f172a").withAlpha(0.18 * blendFactor);
          colorBlendMode = Cesium.ColorBlendMode.REPLACE;
          silhouetteColor = Cesium.Color.fromCssColorString("#00f0ff");
          silhouetteSize = 2.8;
        } else if (isGhost) {
          modelColor = Cesium.Color.fromCssColorString("#06b6d4").withAlpha(0.45 * blendFactor);
          colorBlendMode = Cesium.ColorBlendMode.REPLACE;
          silhouetteColor = Cesium.Color.fromCssColorString("#67e8f9");
          silhouetteSize = 2.2;
        }

        const modelOpts = {
          uri: bld.modelUri,
          scale: (bld.scale || 1.0) * scaleZ * (bld.modelScaleMultiplier || 1.0),
          minimumPixelSize: 48,
          maximumScale: 20000,
          shadows: shadowMode,
        };

        if (modelColor) {
          modelOpts.color = modelColor;
          modelOpts.colorBlendMode = colorBlendMode;
          modelOpts.colorBlendAmount = colorBlendAmount;
        }
        if (silhouetteColor) {
          modelOpts.silhouetteColor = silhouetteColor;
          modelOpts.silhouetteSize = silhouetteSize;
        }

        const modelEntity = viewer.entities.add({
          id: bld.id,
          name: bld.name,
          position: bldPos,
          orientation: bldOrientation,
          model: modelOpts,
          label: {
            text: `${bld.name}\n${Math.round(height)}m • ${floors}F • ${bld.units || 0} Units`,
            font: isSelected ? "bold 12px 'Outfit', sans-serif" : "11px 'Outfit', sans-serif",
            fillColor: isSelected ? Cesium.Color.fromCssColorString("#f59e0b") : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -25),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000),
          },
        });
        bldEntities.push(modelEntity);

        // Architectural Ground Selection Halo
        if (isSelected) {
          const haloEntity = viewer.entities.add({
            id: `${bld.id}-selection-ring`,
            position: Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, elevation + 0.1),
            ellipse: {
              semiMajorAxis: Math.max(16, (bld.stats?.dimensions?.width || 32) * 0.8 * scaleX),
              semiMinorAxis: Math.max(16, (bld.stats?.dimensions?.depth || 32) * 0.8 * scaleY),
              material: Cesium.Color.fromCssColorString("rgba(245, 158, 11, 0.25)"),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString("#f59e0b"),
              outlineWidth: 2.5,
            },
          });
          bldEntities.push(haloEntity);
        }
      } else {
        // MULTI-TIER ARCHITECTURAL PROCEDURAL 3D GEOMETRY
        // 1. Concrete / Granite Plinth Podium Base
        const podiumH = typeDef?.podiumHeight || (height > 30 ? 8 : 2.5);
        const podiumPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, elevation + podiumH / 2);
        const podiumOrientation = Cesium.Transforms.headingPitchRollQuaternion(
          podiumPos,
          bldHpr
        );

        let podiumMaterial;
        let podiumOutlineColor;
        if (isBuildingWireframe) {
          podiumMaterial = Cesium.Color.fromCssColorString("rgba(15, 23, 42, 0.15)");
          podiumOutlineColor = Cesium.Color.fromCssColorString("#00f0ff");
        } else if (isGhost) {
          podiumMaterial = Cesium.Color.fromCssColorString("#0891b2").withAlpha(0.35 * blendFactor);
          podiumOutlineColor = Cesium.Color.fromCssColorString("#67e8f9");
        } else if (isTransparent) {
          podiumMaterial = concreteColor.withAlpha(0.25 * effectiveAlpha);
          podiumOutlineColor = Cesium.Color.fromCssColorString("rgba(56, 189, 248, 0.6)");
        } else {
          podiumMaterial = concreteColor.withAlpha(effectiveAlpha);
          podiumOutlineColor = Cesium.Color.fromCssColorString("rgba(255, 255, 255, 0.25)");
        }

        const podiumEntity = viewer.entities.add({
          id: `${bld.id}-podium`,
          position: podiumPos,
          orientation: podiumOrientation,
          box: {
            dimensions: new Cesium.Cartesian3(baseWidth * 1.06, baseDepth * 1.06, podiumH),
            material: podiumMaterial,
            outline: true,
            outlineColor: podiumOutlineColor,
            outlineWidth: 1,
            shadows: shadowMode,
          },
        });
        bldEntities.push(podiumEntity);

        // 2. Main Glazed Tower Body
        const towerH = Math.max(height - podiumH, 3);
        const towerCenterZ = elevation + podiumH + towerH / 2;
        const towerPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, towerCenterZ);
        const towerOrientation = Cesium.Transforms.headingPitchRollQuaternion(
          towerPos,
          bldHpr
        );

        let towerMaterial;
        let towerOutlineColor;
        let towerOutlineWidth = isSelected ? 3 : 1;

        if (isBuildingWireframe) {
          towerMaterial = Cesium.Color.fromCssColorString("rgba(15, 23, 42, 0.1)");
          towerOutlineColor = Cesium.Color.fromCssColorString("#00f0ff");
          towerOutlineWidth = 2.5;
        } else if (isGhost) {
          towerMaterial = Cesium.Color.fromCssColorString("#06b6d4").withAlpha(0.45 * blendFactor);
          towerOutlineColor = Cesium.Color.fromCssColorString("#67e8f9");
          towerOutlineWidth = 2.0;
        } else if (isTransparent) {
          towerMaterial = glassColor.withAlpha(Math.min(0.35, effectiveAlpha * 0.4));
          towerOutlineColor = Cesium.Color.fromCssColorString("#38bdf8");
          towerOutlineWidth = 1.8;
        } else {
          towerMaterial = glassColor.withAlpha(effectiveAlpha * (typeDef?.isLandscape ? 0.95 : 0.85));
          towerOutlineColor = isSelected
            ? Cesium.Color.fromCssColorString("#d4af37")
            : Cesium.Color.fromCssColorString("rgba(255, 255, 255, 0.35)");
          towerOutlineWidth = isSelected ? 3 : 1;
        }

        const mainTowerEntity = viewer.entities.add({
          id: bld.id,
          name: bld.name,
          position: towerPos,
          orientation: towerOrientation,
          box: {
            dimensions: new Cesium.Cartesian3(baseWidth, baseDepth, towerH),
            material: towerMaterial,
            outline: true,
            outlineColor: towerOutlineColor,
            outlineWidth: towerOutlineWidth,
            shadows: shadowMode,
          },
          label: {
            text: `${bld.name}\n${Math.round(height)}m • ${floors}F • ${bld.units || 0} Units`,
            font: "11px 'Outfit', sans-serif",
            fillColor: isSelected
              ? Cesium.Color.fromCssColorString("#d4af37")
              : isGhost || isBuildingWireframe
              ? Cesium.Color.fromCssColorString("#67e8f9")
              : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 7500),
          },
        });
        bldEntities.push(mainTowerEntity);

        // 3. Dynamic Architectural Floor Slab Striations (Dynamically spaced based on floors)
        if (towerH > 6 && !isBuildingWireframe) {
          const slabStep = floors <= 32 ? 1 : (floors <= 60 ? 2 : 3);
          const slabThickness = Math.max(0.35, Math.min(0.75, floorHeight * 0.18));
          const isBalconies = bld.facadeStyle === "balcony-terraces" || typeDef?.balconies;
          const balconyExtend = isBalconies ? 1.08 : 1.02;

          for (let f = slabStep; f < floors; f += slabStep) {
            const slabZ = elevation + podiumH + (f / floors) * towerH;
            const slabPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, slabZ);
            const slabOrientation = Cesium.Transforms.headingPitchRollQuaternion(
              slabPos,
              new Cesium.HeadingPitchRoll(heading, pitch, roll)
            );

            const slabMaterial = isGhost
              ? Cesium.Color.fromCssColorString("#67e8f9").withAlpha(0.5 * blendFactor)
              : concreteColor.withAlpha(effectiveAlpha);

            const slabEntity = viewer.entities.add({
              id: `${bld.id}-slab-${f}`,
              position: slabPos,
              orientation: slabOrientation,
              box: {
                dimensions: new Cesium.Cartesian3(baseWidth * balconyExtend, baseDepth * balconyExtend, slabThickness),
                material: slabMaterial,
                shadows: shadowMode,
              },
            });
            bldEntities.push(slabEntity);
          }
        }

        // 4. Ribbed Louvers for Parking Structures or Louver Facades
        if ((bld.facadeStyle === "ribbed-louvers" || bld.typeId === "parking-structure") && !isBuildingWireframe) {
          const louverCount = Math.min(floors * 2, 20);
          for (let l = 1; l <= louverCount; l++) {
            const louverZ = elevation + podiumH + (l / (louverCount + 1)) * towerH;
            const louverPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, louverZ);
            const louverEntity = viewer.entities.add({
              id: `${bld.id}-louver-${l}`,
              position: louverPos,
              orientation: bldOrientation,
              box: {
                dimensions: new Cesium.Cartesian3(baseWidth * 1.04, baseDepth * 1.04, 0.22),
                material: Cesium.Color.fromCssColorString("#94a3b8").withAlpha(0.7 * effectiveAlpha),
                shadows: shadowMode,
              },
            });
            bldEntities.push(louverEntity);
          }
        }

        // 4. Rooftop Penthouse & Spire (for Skyscraper)
        if (typeDef?.spire) {
          const plantPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, elevation + height + 3);
          const plantEntity = viewer.entities.add({
            id: `${bld.id}-plant`,
            position: plantPos,
            orientation: towerOrientation,
            box: {
              dimensions: new Cesium.Cartesian3(baseWidth * 0.6, baseDepth * 0.6, 6),
              material: isGhost
                ? Cesium.Color.fromCssColorString("#0891b2").withAlpha(0.4 * blendFactor)
                : Cesium.Color.fromCssColorString("#1e293b").withAlpha(effectiveAlpha),
              shadows: shadowMode,
            },
          });
          bldEntities.push(plantEntity);

          const spirePos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, elevation + height + 16);
          const spireEntity = viewer.entities.add({
            id: `${bld.id}-spire`,
            position: spirePos,
            cylinder: {
              length: 22,
              topRadius: 0.3,
              bottomRadius: 2.8,
              material: isGhost
                ? Cesium.Color.fromCssColorString("#67e8f9").withAlpha(0.7 * blendFactor)
                : Cesium.Color.WHITE.withAlpha(effectiveAlpha),
              shadows: shadowMode,
            },
          });
          bldEntities.push(spireEntity);
        }

        // 5. Sky-Bridge (for Twin Towers)
        if (typeDef?.skybridge) {
          const bridgePos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat, elevation + height * 0.72);
          const bridgeEntity = viewer.entities.add({
            id: `${bld.id}-bridge`,
            position: bridgePos,
            orientation: towerOrientation,
            box: {
              dimensions: new Cesium.Cartesian3(baseWidth * 0.95, baseDepth * 0.35, 7),
              material: Cesium.Color.fromCssColorString("#c5a059").withAlpha(0.85 * effectiveAlpha),
              shadows: shadowMode,
            },
          });
          bldEntities.push(bridgeEntity);
        }

        // 6. Villa Cantilevers & Plunge Pool
        if (typeDef?.pool) {
          const poolPos = Cesium.Cartesian3.fromDegrees(bld.lng, bld.lat + 0.0001, elevation + 0.6);
          const poolEntity = viewer.entities.add({
            id: `${bld.id}-pool`,
            position: poolPos,
            orientation: towerOrientation,
            box: {
              dimensions: new Cesium.Cartesian3(baseWidth * 0.5, baseDepth * 0.35, 0.8),
              material: Cesium.Color.fromCssColorString("rgba(14, 165, 233, 0.85)").withAlpha(effectiveAlpha),
            },
          });
          bldEntities.push(poolEntity);
        }
      }

      buildingEntitiesMapRef.current.set(bld.id, bldEntities);
    });

    viewer.scene.requestRender();
  }, [placedBuildings, selectedBuildingId, visLayers.proposedBuildings, proposedBlend, proposedRenderMode, proposedOpacity]);

  // Synchronize Solar Time of Day for Realistic Sun Angles & Contact Shadows
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    const hours = Math.floor(solarHour);
    const minutes = Math.round((solarHour - hours) * 60);
    const date = new Date(2026, 8, 10, hours, minutes);
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
    viewer.scene.globe.enableLighting = true;
    viewer.shadows = true;
    viewer.scene.requestRender();
  }, [solarHour]);

  // Smooth Fly To Location
  const flyToLocation = useCallback((lat, lng, height = 1000, pitch = -40, heading = 0, duration = 2.5) => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    if (orbitListenerRef.current) {
      viewer.clock.onTick.removeEventListener(orbitListenerRef.current);
      orbitListenerRef.current = null;
      setIsOrbiting(false);
    }
    if (walkthroughControllerRef.current?.active) {
      walkthroughControllerRef.current.stop();
      setIsWalking(false);
    }

    const targetLat = Math.min(Math.max(lat, BLR_BOUNDS.minLat), BLR_BOUNDS.maxLat);
    const targetLng = Math.min(Math.max(lng, BLR_BOUNDS.minLng), BLR_BOUNDS.maxLng);
    const targetHeight = Math.min(height, BLR_BOUNDS.maxAlt);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(targetLng, targetLat, targetHeight),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        roll: 0,
      },
      duration: duration,
    });
  }, []);

  // 360° Drone Orbit around Target Site
  const toggleOrbit = useCallback((lat, lng) => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    if (isOrbiting && orbitListenerRef.current) {
      viewer.clock.onTick.removeEventListener(orbitListenerRef.current);
      orbitListenerRef.current = null;
      setIsOrbiting(false);
      return;
    }

    if (walkthroughControllerRef.current?.active) {
      walkthroughControllerRef.current.stop();
      setIsWalking(false);
    }

    setIsOrbiting(true);
    const targetLat = lat || activeSite?.center.lat || 13.1895;
    const targetLng = lng || activeSite?.center.lng || 77.6980;
    const center = Cesium.Cartesian3.fromDegrees(targetLng, targetLat, 0);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    viewer.camera.lookAtTransform(
      transform,
      new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), 1400)
    );

    const orbitCallback = () => {
      viewer.camera.rotateRight(0.0028);
      viewer.scene.requestRender();
    };

    viewer.clock.onTick.addEventListener(orbitCallback);
    orbitListenerRef.current = orbitCallback;
  }, [isOrbiting, activeSite]);

  // Toggle First-Person Pedestrian Walk Mode (1.7m eye level)
  const toggleWalkMode = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || !walkthroughControllerRef.current) return;

    if (isWalking) {
      walkthroughControllerRef.current.stop();
      setIsWalking(false);
      if (activeSite) {
        flyToLocation(
          activeSite.center.lat,
          activeSite.center.lng,
          activeSite.camera.height,
          activeSite.camera.pitch,
          activeSite.camera.heading
        );
      }
    } else {
      if (isOrbiting && orbitListenerRef.current) {
        viewer.clock.onTick.removeEventListener(orbitListenerRef.current);
        orbitListenerRef.current = null;
        setIsOrbiting(false);
      }
      setIsWalking(true);
      const targetLat = activeSite?.center.lat || 13.1895;
      const targetLng = activeSite?.center.lng || 77.6980;
      walkthroughControllerRef.current.start(targetLat, targetLng);
    }
  }, [isWalking, activeSite, isOrbiting, flyToLocation]);

  // Top-Down Orthographic Masterplan View
  const handleOrthoMasterplan = useCallback(() => {
    if (!activeSite) return;
    flyToLocation(
      activeSite.center.lat,
      activeSite.center.lng,
      1200,
      -90,
      0,
      2.0
    );
  }, [activeSite, flyToLocation]);

  // Switch Active Site
  const handleSelectSite = useCallback((site) => {
    setActiveSite(site);
    setSelectedProperty({
      name: site.name,
      fullName: `${site.name} • ${site.acres} Acres (${site.locality})`,
      description: site.description,
      latitude: site.center.lat,
      longitude: site.center.lng,
      acres: site.acres,
      zoning: site.zoning,
      authority: site.authority,
      permissibleFAR: site.permissibleFAR,
      metrics: site.metrics,
      type: "Real Estate Land Parcel",
    });

    flyToLocation(
      site.center.lat,
      site.center.lng,
      site.camera.height,
      site.camera.pitch,
      site.camera.heading
    );

    const defaultPlan = generateMasterplan(site.id, site.center.lat, site.center.lng);
    setPlacedBuildings(defaultPlan);
    setSelectedBuildingId(defaultPlan[0]?.id || null);
  }, [flyToLocation]);

  // Add Building to Current Site Center with Full Architectural Parameters
  const handleAddBuilding = useCallback((typeId) => {
    if (!activeSite) return;
    const typeDef = ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === typeId) || ARCHITECTURAL_BUILDING_TYPES[0];
    const newId = `bld-user-${Date.now()}`;
    const offset = (Math.random() - 0.5) * 0.0006;

    const floors = typeDef.defaultFloors || 25;
    const floorHeight = typeDef.defaultFloorHeight || 3.2;
    const height = typeDef.defaultHeight || parseFloat((floors * floorHeight).toFixed(1));
    const width = typeDef.defaultWidth || 34;
    const length = typeDef.defaultLength || typeDef.defaultDepth || 32;
    const unitsPerFloor = typeDef.unitsPerFloor || 8;
    const units = typeDef.defaultUnits || Math.round(floors * unitsPerFloor);
    const buaSqFt = typeDef.buaSqFt || Math.round(width * length * 10.7639 * floors);

    const newBuilding = {
      id: newId,
      typeId: typeId,
      name: `${typeDef.name || "Architectural Structure"} #${placedBuildings.length + 1}`,
      lat: parseFloat((activeSite.center.lat + offset).toFixed(5)),
      lng: parseFloat((activeSite.center.lng + offset).toFixed(5)),
      floors,
      floorHeight,
      height,
      width,
      length,
      depth: length,
      scale: 1.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      rotation: Math.round(Math.random() * 4) * 45,
      rotationZ: Math.round(Math.random() * 4) * 45,
      rotationX: 0,
      rotationY: 0,
      elevation: 0,
      unitsPerFloor,
      units,
      buaSqFt,
      opacity: typeDef.defaultOpacity ?? 0.90,
      material: typeDef.defaultMaterial || "glass-steel",
      facadeStyle: typeDef.defaultFacadeStyle || "curtain-wall",
      glassPercentage: typeDef.defaultGlassPercentage || 75,
      shadow: true,
      wireframe: false,
      color: typeDef.glassColor || "#38bdf8",
    };

    setPlacedBuildings((prev) => [...prev, newBuilding]);
    setSelectedBuildingId(newId);
    setIsConfiguratorOpen(true);
  }, [activeSite, placedBuildings.length]);

  // Handle 3D Asset Upload & Placement Confirmation
  const handleConfirmPlacement = useCallback((payload) => {
    if (!payload) return;
    const modelData = payload.modelData || payload;
    const modelUri = modelData.uri || modelData.glbUrl;
    const mode = payload.mode || payload.placementMode || "center";

    if (mode === "pick") {
      setPendingPickModel(modelData);
      setIsUploadModalOpen(false);
      return;
    }

    let targetLat = payload.lat ?? payload.customCoords?.lat ?? (activeSite?.center.lat || 13.1895);
    let targetLng = payload.lng ?? payload.customCoords?.lng ?? (activeSite?.center.lng || 77.6980);
    let targetAlt = payload.alt ?? payload.customCoords?.alt ?? 0;

    if (mode === "center" && activeSite) {
      targetLat = activeSite.center.lat;
      targetLng = activeSite.center.lng;
    }

    const newId = `bld-upload-${Date.now()}`;
    const newBuilding = {
      id: newId,
      typeId: "uploaded-custom",
      name: modelData.name || "Custom 3D Building",
      modelUri: modelUri,
      format: modelData.format || "GLB",
      lat: targetLat,
      lng: targetLng,
      elevation: targetAlt,
      height: Math.round(
        modelData.stats?.dimensions?.height || modelData.stats?.height || 45
      ),
      floors: Math.max(1, Math.round((modelData.stats?.dimensions?.height || 45) / 3.2)),
      floorHeight: 3.2,
      width: Math.round(modelData.stats?.dimensions?.width || 34),
      length: Math.round(modelData.stats?.dimensions?.depth || 32),
      depth: Math.round(modelData.stats?.dimensions?.depth || 32),
      units: 120,
      buaSqFt: 180000,
      scale: 1.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      opacity: 0.95,
      material: "glass-steel",
      facadeStyle: "curtain-wall",
      glassPercentage: 80,
      shadow: true,
      wireframe: false,
      stats: modelData.stats,
      isUploaded: true,
    };

    setPlacedBuildings((prev) => [...prev, newBuilding]);
    setSelectedBuildingId(newId);
    setIsConfiguratorOpen(true);
    setIsUploadModalOpen(false);

    // Smooth camera fly-to so the user sees the newly placed building immediately
    flyToLocation(targetLat, targetLng, 450, -35, 45, 1.8);
  }, [activeSite, flyToLocation]);

  const handleStartMapPick = useCallback((modelData) => {
    setPendingPickModel(modelData);
    setIsUploadModalOpen(false);
  }, []);

  // Quick fallback model handler
  const handleUploadModel = useCallback((modelData) => {
    handleConfirmPlacement({
      mode: "center",
      modelData: modelData,
    });
  }, [handleConfirmPlacement]);

  // Update Building Properties with Two-Way Mathematical Synchronization
  const handleUpdateBuilding = useCallback((bldId, rawUpdates) => {
    setPlacedBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== bldId) return b;
        const updates = { ...rawUpdates };

        // 1. If floors changed without explicit height override:
        if (updates.floors !== undefined && updates.height === undefined) {
          const fl = Math.max(1, updates.floors);
          const flH = updates.floorHeight ?? b.floorHeight ?? 3.2;
          updates.height = parseFloat((fl * flH).toFixed(1));
          if (updates.units === undefined) {
            const upf = updates.unitsPerFloor ?? b.unitsPerFloor ?? 8;
            updates.units = Math.round(fl * upf);
          }
          if (updates.buaSqFt === undefined) {
            const w = updates.width ?? b.width ?? 34;
            const l = updates.length ?? b.length ?? b.depth ?? 32;
            updates.buaSqFt = Math.round(w * l * 10.7639 * fl);
          }
        }
        // 2. If floorHeight changed without explicit height override:
        else if (updates.floorHeight !== undefined && updates.height === undefined) {
          const fl = updates.floors ?? b.floors ?? 25;
          updates.height = parseFloat((fl * updates.floorHeight).toFixed(1));
        }
        // 3. If height changed without explicit floors override:
        else if (updates.height !== undefined && updates.floors === undefined) {
          const flH = updates.floorHeight ?? b.floorHeight ?? 3.2;
          const fl = Math.max(1, Math.round(updates.height / flH));
          updates.floors = fl;
          if (updates.units === undefined) {
            const upf = updates.unitsPerFloor ?? b.unitsPerFloor ?? 8;
            updates.units = Math.round(fl * upf);
          }
          if (updates.buaSqFt === undefined) {
            const w = updates.width ?? b.width ?? 34;
            const l = updates.length ?? b.length ?? b.depth ?? 32;
            updates.buaSqFt = Math.round(w * l * 10.7639 * fl);
          }
        }

        // 4. If width or length changed without explicit buaSqFt override:
        if ((updates.width !== undefined || updates.length !== undefined) && updates.buaSqFt === undefined) {
          const fl = updates.floors ?? b.floors ?? 25;
          const w = updates.width ?? b.width ?? 34;
          const l = updates.length ?? b.length ?? b.depth ?? 32;
          updates.buaSqFt = Math.round(w * l * 10.7639 * fl);
        }

        // 5. Keep rotation and rotationZ synchronized
        if (updates.rotation !== undefined && updates.rotationZ === undefined) {
          updates.rotationZ = updates.rotation;
        } else if (updates.rotationZ !== undefined && updates.rotation === undefined) {
          updates.rotation = updates.rotationZ;
        }

        return { ...b, ...updates };
      })
    );
  }, []);

  // Delete Building
  const handleDeleteBuilding = useCallback((bldId) => {
    setPlacedBuildings((prev) => prev.filter((b) => b.id !== bldId));
    if (selectedBuildingId === bldId) setSelectedBuildingId(null);
  }, [selectedBuildingId]);

  // Duplicate Building
  const handleDuplicateBuilding = useCallback((bldId) => {
    const original = placedBuildings.find((b) => b.id === bldId);
    if (!original) return;

    const newId = `bld-dup-${Date.now()}`;
    const duplicated = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      lat: original.lat + 0.0003,
      lng: original.lng + 0.0003,
    };

    setPlacedBuildings((prev) => [...prev, duplicated]);
    setSelectedBuildingId(newId);
  }, [placedBuildings]);

  // Auto-Deploy Masterplan
  const handleGenerateMasterplan = useCallback(() => {
    if (!activeSite) return;
    const plan = generateMasterplan(activeSite.id, activeSite.center.lat, activeSite.center.lng);
    setPlacedBuildings(plan);
    setSelectedBuildingId(plan[0]?.id || null);
  }, [activeSite]);

  // Clear All Buildings
  const handleClearAllBuildings = useCallback(() => {
    setPlacedBuildings([]);
    setSelectedBuildingId(null);
  }, []);

  // Nudge Site Boundary Vertex Peg with dynamic area & acre recalculation
  const handleNudgeSiteVertex = useCallback((vertexIdx, dLat, dLng) => {
    setActiveSite((prev) => {
      if (!prev || !prev.boundary) return prev;
      const updatedBoundary = prev.boundary.map((pt, idx) =>
        idx === vertexIdx
          ? { lat: parseFloat((pt.lat + dLat).toFixed(5)), lng: parseFloat((pt.lng + dLng).toFixed(5)) }
          : pt
      );
      const newAreaSqFt = calculatePolygonAreaSqFt(updatedBoundary);
      const newAcres = parseFloat((newAreaSqFt / 43560).toFixed(2));
      return {
        ...prev,
        boundary: updatedBoundary,
        areaSqFt: newAreaSqFt,
        acres: newAcres,
      };
    });
  }, []);

  // Boundary Editing: Add a vertex
  const handleAddSiteVertex = useCallback(() => {
    setActiveSite((prev) => {
      if (!prev || !prev.boundary || prev.boundary.length < 2) return prev;
      const b = prev.boundary;
      const midLat = (b[0].lat + b[1].lat) / 2;
      const midLng = (b[0].lng + b[1].lng) / 2;
      const newBoundary = [
        b[0],
        { lat: parseFloat(midLat.toFixed(5)), lng: parseFloat(midLng.toFixed(5)) },
        ...b.slice(1),
      ];
      const newAreaSqFt = calculatePolygonAreaSqFt(newBoundary);
      const newAcres = parseFloat((newAreaSqFt / 43560).toFixed(2));
      return {
        ...prev,
        boundary: newBoundary,
        areaSqFt: newAreaSqFt,
        acres: newAcres,
      };
    });
  }, []);

  // Boundary Editing: Delete a vertex (requires > 3 vertices)
  const handleDeleteSiteVertex = useCallback((idx) => {
    setActiveSite((prev) => {
      if (!prev || !prev.boundary || prev.boundary.length <= 3) return prev;
      const newBoundary = prev.boundary.filter((_, i) => i !== idx);
      const newAreaSqFt = calculatePolygonAreaSqFt(newBoundary);
      const newAcres = parseFloat((newAreaSqFt / 43560).toFixed(2));
      return {
        ...prev,
        boundary: newBoundary,
        areaSqFt: newAreaSqFt,
        acres: newAcres,
      };
    });
  }, []);

  // Custom Boundary Delineation Finish
  const handleFinishCustomBoundary = useCallback(() => {
    if (customBoundaryPoints.length < 3) return;
    const newAreaSqFt = calculatePolygonAreaSqFt(customBoundaryPoints);
    const newAcres = parseFloat((newAreaSqFt / 43560).toFixed(2));
    const sumLat = customBoundaryPoints.reduce((s, p) => s + p.lat, 0);
    const sumLng = customBoundaryPoints.reduce((s, p) => s + p.lng, 0);
    const centerLat = parseFloat((sumLat / customBoundaryPoints.length).toFixed(5));
    const centerLng = parseFloat((sumLng / customBoundaryPoints.length).toFixed(5));

    setActiveSite({
      id: `custom-site-${Date.now()}`,
      name: "Custom Land Parcel",
      locality: "Bengaluru Custom Delineated Site",
      category: "custom",
      authority: "BBMP / BDA",
      zoning: "Mixed-Use Urban",
      acres: newAcres,
      areaSqFt: newAreaSqFt,
      permissibleFAR: 2.75,
      setbackMeters: 6,
      center: { lat: centerLat, lng: centerLng, alt: 900 },
      camera: { height: 850, pitch: -45, heading: 45 },
      boundary: customBoundaryPoints,
      description: "Custom delineated development parcel drawn directly on Bengaluru terrain.",
      metrics: {
        proposedBUA: Math.round(newAreaSqFt * 2.75),
        groundCoverage: 35,
        estimatedGDV: "₹ 550 Cr",
        capacity: "450 Residential / Commercial Units",
      },
    });

    setIsDrawingCustomBoundary(false);
    setCustomBoundaryPoints([]);
  }, [customBoundaryPoints]);

  // Layer change handler
  const handleLayerChange = (layerId) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    setActiveLayer(layerId);
    viewer.imageryLayers.removeAll();
    const provider = getImageryProvider(layerId);
    if (provider) {
      viewer.imageryLayers.addImageryProvider(provider);
      // Re-add road overlay layer if active
      if (roadOverlayLayerRef.current) {
        viewer.imageryLayers.add(roadOverlayLayerRef.current);
      }
      viewer.scene.requestRender();
    }
  };

  // Environment Settings Toggle
  const handleToggleSetting = (settingKey) => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    setEnvSettings((prev) => {
      const updated = { ...prev, [settingKey]: !prev[settingKey] };

      if (settingKey === "lighting") {
        viewer.scene.globe.enableLighting = updated.lighting;
      }
      if (settingKey === "atmosphere" && viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = updated.atmosphere;
      }
      if (settingKey === "terrain") {
        if (updated.terrain && ionToken) {
          try {
            if (typeof Cesium.Terrain?.fromWorldTerrain === "function") {
              viewer.scene.setTerrain(Cesium.Terrain.fromWorldTerrain());
            } else if (typeof Cesium.createWorldTerrainAsync === "function") {
              Cesium.createWorldTerrainAsync().then((tp) => {
                viewer.terrainProvider = tp;
              });
            }
          } catch {
            viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
          }
        } else {
          viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }
      }
      return updated;
    });
  };

  // Bookmarks
  const handleSaveBookmark = (item) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) =>
          Math.abs(b.latitude - item.latitude) < 0.0001 &&
          Math.abs(b.longitude - item.longitude) < 0.0001
      );
      let updated;
      if (exists) {
        updated = prev.filter(
          (b) =>
            Math.abs(b.latitude - item.latitude) >= 0.0001 ||
            Math.abs(b.longitude - item.longitude) >= 0.0001
        );
      } else {
        updated = [...prev, item];
      }
      try {
        localStorage.setItem("blr_bookmarks", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage error:", e);
      }
      return updated;
    });
  };

  const handleDeleteBookmark = (index) => {
    setBookmarks((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem("blr_bookmarks", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage error:", e);
      }
      return updated;
    });
  };

  // Save Token
  const handleSaveToken = (token) => {
    setIonToken(token);
    const Cesium = window.Cesium;
    try {
      localStorage.setItem("cesium_token", token);
      if (token && Cesium) {
        Cesium.Ion.defaultAccessToken = token;
      }
    } catch (e) {
      console.warn("Token storage error:", e);
    }
  };

  // Measure Tool Clear
  const handleClearMeasure = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      measureEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
      measureEntitiesRef.current = [];
    }
    setMeasurePoints([]);
    setTotalDistance(0);
  };

  // Compass Reset North
  const handleResetNorth = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: viewer.camera.position,
      orientation: {
        heading: 0,
        pitch: viewer.camera.pitch,
        roll: 0,
      },
      duration: 1.5,
    });
  };

  // Switch Scene Mode
  const handleToggleSceneMode = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (sceneMode === "3D") {
      viewer.scene.morphTo2D(1.5);
      setSceneMode("2D");
    } else if (sceneMode === "2D") {
      viewer.scene.morphToColumbusView(1.5);
      setSceneMode("Columbus");
    } else {
      viewer.scene.morphTo3D(1.5);
      setSceneMode("3D");
    }
  };

  if (!cesiumReady) {
    return (
      <div className="loading-screen">
        <div className="loader-glow"></div>
        <div className="loader-spinner"></div>
        <div className="loader-content">
          <h2>ನಮ್ಮ Bengaluru 3D Real Estate Platform</h2>
          <p>Loading Bangalore terrain, satellite maps, site boundaries & 3D development engines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earth-container">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="earth-viewer" />

      {/* TOPBAR HUD */}
      <header className="topbar">
        <div
          className="logo-badge"
          onClick={() => {
            if (activeSite) {
              flyToLocation(
                activeSite.center.lat,
                activeSite.center.lng,
                activeSite.camera.height,
                activeSite.camera.pitch,
                activeSite.camera.heading
              );
            } else {
              flyToLocation(12.9796, 77.5907, 12000, -50, 0, 2.5);
            }
          }}
        >
          <div className="logo-icon">
            <Building2 size={18} color="#0b0f19" />
          </div>
          <span className="logo-title">ನಮ್ಮ Bengaluru 3D</span>
          <span className="logo-sub">Masterplan Visualization</span>
        </div>

        {/* Bangalore Locality Search */}
        <SearchBox
          onSelectLocation={(loc) => {
            flyToLocation(loc.latitude, loc.longitude, 1100);
            setSelectedProperty(loc);
            setPointingOrigin({
              lat: loc.latitude,
              lng: loc.longitude,
              name: loc.name,
            });

            const viewer = viewerRef.current;
            const Cesium = window.Cesium;
            if (viewer && Cesium) {
              if (activePinEntityRef.current) {
                viewer.entities.remove(activePinEntityRef.current);
              }
              const pos = Cesium.Cartesian3.fromDegrees(loc.longitude, loc.latitude, 0);
              activePinEntityRef.current = viewer.entities.add({
                name: loc.name,
                position: pos,
                point: {
                  pixelSize: 14,
                  color: Cesium.Color.fromCssColorString("#d4af37"),
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 3,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                label: {
                  text: loc.name,
                  font: "13px 'Outfit', sans-serif",
                  fillColor: Cesium.Color.WHITE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 3,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  pixelOffset: new Cesium.Cartesian2(0, -18),
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
              });
            }
          }}
        />

        {/* Right Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className={`logo-badge tower-planner-topbar-btn ${isConfiguratorOpen ? "active" : ""}`}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              cursor: "pointer",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.32), rgba(212, 175, 55, 0.18))",
              borderColor: "var(--accent-gold)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.35)",
            }}
            onClick={() => setIsConfiguratorOpen(!isConfiguratorOpen)}
            title="Apartment & Tower Planner - Add blocks, towers, and edit properties"
          >
            <Building2 size={16} style={{ color: "var(--accent-gold)" }} />
            <span>Apartment & Tower Planner</span>
          </button>

          <button
            className="logo-badge add-building-topbar-btn"
            style={{
              padding: "8px 14px",
              fontSize: 13,
              cursor: "pointer",
              background: "rgba(15, 23, 42, 0.65)",
              borderColor: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 500,
            }}
            onClick={() => setIsUploadModalOpen(true)}
            title="Upload Custom 3D Model (GLB, GLTF, OBJ, FBX, ZIP)"
          >
            <Plus size={15} style={{ color: "var(--accent-gold)" }} />
            <span>Upload 3D</span>
          </button>

          <button
            className="logo-badge"
            style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
            onClick={() => setIsLandmarksOpen(true)}
          >
            <Sparkles size={15} style={{ color: "var(--accent-gold)" }} />
            <span>Land Parcels</span>
          </button>
        </div>
      </header>

      {/* FLOATING PENDING PLACEMENT / MAP PICK BANNER */}
      {pendingPickModel && (
        <div className="pending-placement-banner">
          <div className="pending-placement-info">
            <MapPin className="animate-bounce" size={18} style={{ color: "var(--accent-gold)" }} />
            <span>Click anywhere on the map or site to place <strong>{pendingPickModel.name}</strong></span>
          </div>
          <button
            className="pending-cancel-btn"
            onClick={() => setPendingPickModel(null)}
          >
            Cancel (ESC)
          </button>
        </div>
      )}

      {/* FLOATING REAL-TIME MAP DRAG BANNER */}
      {isDraggingBuilding && (
        <div className="pending-placement-banner" style={{ borderColor: "#38bdf8", boxShadow: "0 0 25px rgba(56, 189, 248, 0.35)" }}>
          <div className="pending-placement-info">
            <Move className="animate-pulse" size={18} style={{ color: "#38bdf8" }} />
            <span>Moving <strong>{placedBuildings.find((b) => b.id === selectedBuildingId)?.name || "Building"}</strong> on map — Click to lock position</span>
          </div>
          <button
            className="pending-cancel-btn"
            onClick={() => setIsDraggingBuilding(false)}
          >
            Done (ESC)
          </button>
        </div>
      )}

      {/* FLOATING BOUNDARY EDITING BANNER */}
      {isEditingBoundary && (
        <div
          className="pending-placement-banner"
          style={{
            borderColor: "#10b981",
            boxShadow: "0 0 25px rgba(16, 185, 129, 0.35)",
            background: "rgba(6, 78, 59, 0.88)",
          }}
        >
          <div className="pending-placement-info">
            <span className="animate-pulse" style={{ color: "#34d399", fontWeight: 700 }}>● BOUNDARY EDIT ACTIVE</span>
            <span>
              Drag corner pegs on map to adjust parcel geometry • Calculated Area:{" "}
              <strong style={{ color: "#ffffff" }}>
                {activeSite?.acres} Acres ({(activeSite?.areaSqFt || calculatePolygonAreaSqFt(activeSite?.boundary)).toLocaleString()} sq.ft)
              </strong>
            </span>
          </div>
          <button
            className="pending-cancel-btn"
            style={{ background: "#10b981", color: "#064e3b", fontWeight: 700 }}
            onClick={() => setIsEditingBoundary(false)}
          >
            Done Editing
          </button>
        </div>
      )}

      {/* FLOATING CUSTOM PARCEL DELINEATION BANNER */}
      {isDrawingCustomBoundary && (
        <div
          className="pending-placement-banner"
          style={{
            borderColor: "#06b6d4",
            boxShadow: "0 0 25px rgba(6, 182, 212, 0.35)",
            background: "rgba(8, 51, 68, 0.88)",
          }}
        >
          <div className="pending-placement-info">
            <span className="animate-pulse" style={{ color: "#22d3ee", fontWeight: 700 }}>● DRAW PARCEL</span>
            <span>Click on 3D map to place corner vertices ({customBoundaryPoints.length} points placed)</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {customBoundaryPoints.length >= 3 && (
              <button
                className="pending-cancel-btn"
                style={{ background: "#06b6d4", color: "#083344", fontWeight: 700 }}
                onClick={handleFinishCustomBoundary}
              >
                Close & Save Parcel
              </button>
            )}
            <button
              className="pending-cancel-btn"
              onClick={() => {
                setIsDrawingCustomBoundary(false);
                setCustomBoundaryPoints([]);
              }}
            >
              Cancel (ESC)
            </button>
          </div>
        </div>
      )}

      {/* FLOATING TOP-CENTER DEVELOPMENT COMPARISON BAR */}
      <DevelopmentComparisonBar
        proposedBlend={proposedBlend}
        onChangeProposedBlend={setProposedBlend}
        proposedRenderMode={proposedRenderMode}
        onChangeProposedRenderMode={setProposedRenderMode}
        existingBuildingsEnabled={existingBuildingsEnabled}
        onToggleExistingBuildings={() =>
          setExistingBuildingsEnabled(!existingBuildingsEnabled)
        }
        isEditingBoundary={isEditingBoundary}
        onToggleEditBoundary={() => setIsEditingBoundary(!isEditingBoundary)}
        solarHour={solarHour}
        onChangeSolarHour={setSolarHour}
        isOrbiting={isOrbiting}
        onToggleOrbit={() => {
          if (activeSite) {
            toggleOrbit(activeSite.center.lat, activeSite.center.lng);
          } else {
            toggleOrbit(coords.lat, coords.lng);
          }
        }}
        isWalking={isWalking}
        onToggleWalk={toggleWalkMode}
        onOrthoView={handleOrthoMasterplan}
        activeSite={activeSite}
      />

      {/* RIGHT SIDEBAR CONTROLS & CAMERA TOOLS */}
      <aside className="sidebar-controls">
        <div className="tool-group">
          <button
            className="tool-btn"
            onClick={() => viewerRef.current?.camera.zoomIn(500)}
            title="Zoom In"
          >
            <Plus size={20} />
            <span className="tooltip">Zoom In (+)</span>
          </button>

          <button
            className="tool-btn"
            onClick={() => viewerRef.current?.camera.zoomOut(500)}
            title="Zoom Out"
          >
            <Minus size={20} />
            <span className="tooltip">Zoom Out (−)</span>
          </button>
        </div>

        <div className="tool-group">
          <button
            className="tool-btn"
            onClick={handleResetNorth}
            title="Reset North Compass"
          >
            <Compass size={20} style={{ transform: `rotate(${-coords.heading}deg)` }} />
            <span className="tooltip">Orient North</span>
          </button>

          <button
            className={`tool-btn ${sceneMode !== "3D" ? "active" : ""}`}
            onClick={handleToggleSceneMode}
            title="View Mode"
          >
            <Box size={19} />
            <span className="tooltip">Mode: {sceneMode}</span>
          </button>

          <button
            className={`tool-btn ${isOrbiting ? "active" : ""}`}
            onClick={() => {
              if (activeSite) {
                toggleOrbit(activeSite.center.lat, activeSite.center.lng);
              } else {
                toggleOrbit(coords.lat, coords.lng);
              }
            }}
            title="360° Drone Orbit View"
          >
            <RotateCw size={19} className={isOrbiting ? "animate-spin" : ""} />
            <span className="tooltip">{isOrbiting ? "Stop Orbit" : "360° Drone Orbit"}</span>
          </button>

          <button
            className={`tool-btn ${isWalking ? "active" : ""}`}
            onClick={toggleWalkMode}
            title="Pedestrian Eye-Level Walk (1.7m)"
          >
            <Footprints size={19} />
            <span className="tooltip">{isWalking ? "Exit Walk" : "Pedestrian Walk (WASD)"}</span>
          </button>

          <button
            className="tool-btn"
            onClick={handleOrthoMasterplan}
            title="Top-Down 90° Masterplan"
          >
            <Maximize2 size={19} />
            <span className="tooltip">Top-Down Masterplan</span>
          </button>
        </div>

        <div className="tool-group">
          <button
            className={`tool-btn ${isConfiguratorOpen ? "active" : ""}`}
            onClick={() => setIsConfiguratorOpen(!isConfiguratorOpen)}
            title="Apartment & Tower Planner"
          >
            <Building2 size={19} style={{ color: "var(--accent-gold)" }} />
            <span className="tooltip">Apartment & Tower Planner</span>
          </button>

          <button
            className={`tool-btn ${isLayersOpen ? "active" : ""}`}
            onClick={() => setIsLayersOpen(true)}
            title="Layered Visualization System"
          >
            <Layers size={19} />
            <span className="tooltip">Map Layers</span>
          </button>

          <button
            className={`tool-btn ${isMeasureActive ? "active" : ""}`}
            onClick={() => {
              setIsMeasureActive(!isMeasureActive);
              if (isMeasureActive) handleClearMeasure();
            }}
            title="Measure Site Distance"
          >
            <Ruler size={19} />
            <span className="tooltip">Measure Distance</span>
          </button>

          <button
            className="tool-btn"
            onClick={() => setIsTokenModalOpen(true)}
            title="Cesium Token Settings"
          >
            <KeyRound size={19} />
            <span className="tooltip">Ion Token Settings</span>
          </button>
        </div>
      </aside>

      {/* BOTTOM COORDINATE HUD & BANGALORE ZONE */}
      <footer className="bottom-hud">
        <div className="coordinates-bar">
          <div className="coord-item">
            <span className="coord-label">PARCEL</span>
            <span className="coord-val" style={{ color: "var(--accent-gold)", fontWeight: 700 }}>
              {activeSite ? `${activeSite.name.split(" ")[0]} (${activeSite.acres} Ac)` : currentZone}
            </span>
          </div>
          <div className="coord-item">
            <span className="coord-label">ZONE</span>
            <span className="coord-val">{currentZone}</span>
          </div>
          <div className="coord-item">
            <span className="coord-label">LAT</span>
            <span className="coord-val">{coords.lat.toFixed(4)}°N</span>
          </div>
          <div className="coord-item">
            <span className="coord-label">LON</span>
            <span className="coord-val">{coords.lng.toFixed(4)}°E</span>
          </div>
          <div
            className="coord-item"
            title={`Radius / Distance from camera: ${(coords.radius / 1000).toFixed(2)} km`}
          >
            <span className="coord-label">ALT</span>
            <span className="coord-val" style={{ color: "var(--accent-gold)", fontWeight: 700 }}>
              {coords.alt >= 1000 ? `${(coords.alt / 1000).toFixed(2)} km` : `${coords.alt} m`}
            </span>
          </div>
        </div>
      </footer>

      {/* FLOATING ARCHITECTURAL 3D CONFIGURATOR DOCK */}
      <BuildingConfigurator
        isOpen={isConfiguratorOpen}
        onToggleOpen={() => setIsConfiguratorOpen(!isConfiguratorOpen)}
        activeSite={activeSite}
        onSelectSite={handleSelectSite}
        placedBuildings={placedBuildings}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={setSelectedBuildingId}
        onAddBuilding={handleAddBuilding}
        onUploadModel={handleUploadModel}
        onUpdateBuilding={handleUpdateBuilding}
        onDeleteBuilding={handleDeleteBuilding}
        onDuplicateBuilding={handleDuplicateBuilding}
        onGenerateMasterplan={handleGenerateMasterplan}
        onClearAllBuildings={handleClearAllBuildings}
        onNudgeSiteVertex={handleNudgeSiteVertex}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isDraggingBuilding={isDraggingBuilding}
        onToggleDragMode={() => setIsDraggingBuilding(!isDraggingBuilding)}
        proposedRenderMode={proposedRenderMode}
        onChangeProposedRenderMode={setProposedRenderMode}
        proposedOpacity={proposedOpacity}
        onChangeProposedOpacity={setProposedOpacity}
        existingBuildingsEnabled={existingBuildingsEnabled}
        onToggleExistingBuildings={() =>
          setExistingBuildingsEnabled(!existingBuildingsEnabled)
        }
        isEditingBoundary={isEditingBoundary}
        onToggleEditBoundary={() => setIsEditingBoundary(!isEditingBoundary)}
        onStartDrawBoundary={() => {
          setIsDrawingCustomBoundary(true);
          setCustomBoundaryPoints([]);
        }}
        onAddSiteVertex={handleAddSiteVertex}
        onDeleteSiteVertex={handleDeleteSiteVertex}
      />

      {/* 3D ASSET UPLOAD & PLACEMENT MODAL */}
      <ModelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        activeSite={activeSite}
        onConfirmPlacement={handleConfirmPlacement}
        onStartMapPick={handleStartMapPick}
      />

      {/* MEASURE TOOL HUD */}
      <MeasureTool
        isActive={isMeasureActive}
        points={measurePoints}
        totalDistance={totalDistance}
        onClear={handleClearMeasure}
        onClose={() => {
          setIsMeasureActive(false);
          handleClearMeasure();
        }}
      />

      {/* INSPECTED PROPERTY & REAL ESTATE CARD */}
      <PropertyCard
        info={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onFlyTo={flyToLocation}
        onToggleOrbit={toggleOrbit}
        isOrbiting={isOrbiting}
        onSaveBookmark={handleSaveBookmark}
        isBookmarked={
          selectedProperty &&
          bookmarks.some(
            (b) =>
              Math.abs(b.latitude - selectedProperty.latitude) < 0.0001 &&
              Math.abs(b.longitude - selectedProperty.longitude) < 0.0001
          )
        }
        onLoadSiteMasterplan={handleGenerateMasterplan}
      />

      {/* BANGALORE LANDMARKS & REAL ESTATE SITES DRAWER */}
      <LandmarksDrawer
        isOpen={isLandmarksOpen}
        onClose={() => setIsLandmarksOpen(false)}
        bookmarks={bookmarks}
        onDeleteBookmark={handleDeleteBookmark}
        onSelectRealEstateSite={(site) => {
          handleSelectSite(site);
          setIsLandmarksOpen(false);
        }}
        onFlyToLandmark={(item) => {
          flyToLocation(
            item.latitude,
            item.longitude,
            item.height || 1000,
            item.pitch || -40,
            item.heading || 0
          );
          setSelectedProperty({
            name: item.name,
            fullName: item.location || item.name,
            description: item.description,
            latitude: item.latitude,
            longitude: item.longitude,
            type: "Bengaluru Landmark",
          });
          setPointingOrigin({
            lat: item.latitude,
            lng: item.longitude,
            name: item.name,
          });
          setIsLandmarksOpen(false);
        }}
      />

      {/* LAYERED VISUALIZATION SYSTEM MODAL */}
      <LayersModal
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        activeLayer={activeLayer}
        onChangeLayer={handleLayerChange}
        settings={envSettings}
        onToggleSetting={handleToggleSetting}
        visLayers={visLayers}
        onToggleVisLayer={handleToggleVisLayer}
      />

      {/* CESIUM ION TOKEN MODAL */}
      <TokenSettingsModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        currentToken={ionToken}
        onSaveToken={handleSaveToken}
      />
    </div>
  );
}

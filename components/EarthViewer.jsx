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
} from "lucide-react";

import SearchBox from "./SearchBox";
import PropertyCard from "./PropertyCard";
import LandmarksDrawer, { BANGALORE_LANDMARKS } from "./LandmarksDrawer";
import LayersModal from "./LayersModal";
import MeasureTool from "./MeasureTool";
import TokenSettingsModal from "./TokenSettingsModal";

// Bengaluru Metropolitan Bounding Box & Altitude Limits
const BLR_BOUNDS = {
  minLat: 12.70,
  maxLat: 13.40,
  minLng: 77.25,
  maxLng: 77.95,
  minAlt: 100,
  maxAlt: 45000, // Maximum altitude to keep focus strictly on Bangalore metropolitan region
};

// Haversine distance in kilometers between two coordinates
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  const orbitListenerRef = useRef(null);
  const activePinEntityRef = useRef(null);
  const measureEntitiesRef = useRef([]);
  const lastMousePosRef = useRef(null);

  // Cesium script loading state
  const [cesiumReady, setCesiumReady] = useState(false);

  // UI state
  const [coords, setCoords] = useState({ lat: 12.9796, lng: 77.5907, alt: 3500, radius: 3500, heading: 0 });
  const [currentZone, setCurrentZone] = useState("CBD / MG Road & Vidhana Soudha");
  // Pointing Origin location from which radius is dynamically computed
  const [pointingOrigin, setPointingOrigin] = useState({
    lat: 12.9796,
    lng: 77.5907,
    name: "Vidhana Soudha (CBD Center)",
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLandmarksOpen, setIsLandmarksOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [sceneMode, setSceneMode] = useState("3D");

  // Layer & Environment Settings
  const [activeLayer, setActiveLayer] = useState("esri-satellite");
  const [envSettings, setEnvSettings] = useState({
    terrain: true,
    lighting: false,
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

  // Initialize Cesium Viewer bounded specifically to Bangalore
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
      contextOptions: {
        webgl: {
          preserveDrawingBuffer: false,
          powerPreference: "high-performance",
        },
      },
    });

    viewerRef.current = viewer;

    // Explicitly add CartoDB / Esri basemap to viewer imagery layers
    viewer.imageryLayers.removeAll();
    if (baseProvider) {
      viewer.imageryLayers.addImageryProvider(baseProvider);
    }

    // High performance rendering optimizations
    viewer.resolutionScale = 1.0;
    viewer.scene.highDynamicRange = false;
    if (viewer.scene.postProcessStages?.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = false;
    }
    viewer.scene.globe.maximumScreenSpaceError = 2.8;
    viewer.scene.globe.tileCacheSize = 100;
    viewer.scene.globe.loadingDescendantLimit = 8;
    viewer.scene.globe.preloadAncestors = false;
    viewer.scene.globe.preloadSiblings = false;

    // Set dark background for space and globe base
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a0f1d");
    viewer.scene.globe.enableLighting = false; // clear daylight view for Bengaluru streets
    viewer.scene.globe.depthTestAgainstTerrain = false;

    // Constrain camera maximum altitude so the user cannot zoom out to outer space
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = BLR_BOUNDS.maxAlt;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = BLR_BOUNDS.minAlt;

    // Initial Camera position: Overlooking Vidhana Soudha & Central Bengaluru
    const initLat = 12.9796;
    const initLng = 77.5907;
    const initAlt = 5000;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(initLng, initLat, initAlt),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
    });

    // Smooth entry camera flight
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(initLng, initLat, 2200),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0,
      },
      duration: 2.5,
    });

    // Add 3D markers for iconic Bangalore landmarks
    BANGALORE_LANDMARKS.slice(0, 8).forEach((item) => {
      const pos = Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude, 0);
      viewer.entities.add({
        name: item.name,
        position: pos,
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString("#f59e0b"),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: item.name.split(" ")[0],
          font: "12px 'Outfit', sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000),
        },
      });
    });

    // Throttled camera change listener to prevent React re-render thrashing
    let lastCameraUpdateTime = 0;
    viewer.camera.changed.addEventListener(() => {
      const now = performance.now();
      if (now - lastCameraUpdateTime < 40) return; // limit to 25 FPS for UI coordinate updates
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

      // Aerial view / Top view radius strictly matches camera altitude above ground
      setCoords((prev) => ({
        ...prev,
        alt: Math.round(alt),
        radius: alt,
        heading: Math.round(Cesium.Math.toDegrees(viewer.camera.heading)),
      }));
    });

    // Throttled Mouse Move listener for live coordinates HUD (eliminates main thread raycast lag)
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let lastMouseMoveTime = 0;

    handler.setInputAction((movement) => {
      const now = performance.now();
      if (now - lastMouseMoveTime < 60) return; // limit to ~16 FPS to prevent CPU stalls
      lastMouseMoveTime = now;

      const ray = viewer.camera.getPickRay(movement.endPosition);
      if (!ray) return;
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const heading = Cesium.Math.toDegrees(viewer.camera.heading);

        // Update ground coordinates & zone under cursor without altering aerial view radius
        setCoords((prev) => ({
          ...prev,
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          heading: Math.round(heading),
        }));

        setCurrentZone(getBangaloreZone(lat, lng));
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      handler.destroy();
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, [getImageryProvider, ionToken, cesiumReady]);

  // Click handler for inspect pin & measure tool
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);

      if (isMeasureActive) {
        // Measure Tool
        setMeasurePoints((prev) => {
          const updated = [...prev, { cartesian, lat, lng }];
          const ptEntity = viewer.entities.add({
            position: cartesian,
            point: {
              pixelSize: 8,
              color: Cesium.Color.fromCssColorString("#ef4444"),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });
          measureEntitiesRef.current.push(ptEntity);

          if (updated.length > 1) {
            const positions = updated.map((p) => p.cartesian);
            const lineEntity = viewer.entities.add({
              polyline: {
                positions: positions,
                width: 3,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.25,
                  color: Cesium.Color.fromCssColorString("#f59e0b"),
                }),
                clampToGround: true,
              },
            });
            measureEntitiesRef.current.push(lineEntity);

            let dist = 0;
            for (let i = 0; i < updated.length - 1; i++) {
              dist += Cesium.Cartesian3.distance(
                updated[i].cartesian,
                updated[i + 1].cartesian
              );
            }
            setTotalDistance(dist);
          }
          return updated;
        });
      } else {
        // Normal Mode: Inspect Bengaluru spot
        if (activePinEntityRef.current) {
          viewer.entities.remove(activePinEntityRef.current);
        }

        const zone = getBangaloreZone(lat, lng);

        const newPin = viewer.entities.add({
          name: "Inspected Spot",
          position: cartesian,
          point: {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString("#f59e0b"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: zone,
            font: "13px 'Outfit', sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        activePinEntityRef.current = newPin;

        setPointingOrigin({
          lat,
          lng,
          name: zone,
        });

        setSelectedProperty({
          name: zone,
          fullName: `Bengaluru Location: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (${zone})`,
          latitude: lat,
          longitude: lng,
          altitude: cartographic.height,
          type: "Bengaluru Spot",
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [isMeasureActive]);

  // Smooth Fly To Location bounded to Bangalore
  const flyToLocation = useCallback((lat, lng, height = 1000, pitch = -40, heading = 0, duration = 3) => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    if (orbitListenerRef.current) {
      viewer.clock.onTick.removeEventListener(orbitListenerRef.current);
      orbitListenerRef.current = null;
      setIsOrbiting(false);
    }

    // Clamp destination to Bangalore bounds
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

  // 360° Drone Orbit around Bangalore target
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

    setIsOrbiting(true);
    const center = Cesium.Cartesian3.fromDegrees(lng, lat, 0);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    viewer.camera.lookAtTransform(
      transform,
      new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), 1800)
    );

    const orbitCallback = () => {
      viewer.camera.rotateRight(0.003);
      viewer.scene.requestRender();
    };

    viewer.clock.onTick.addEventListener(orbitCallback);
    orbitListenerRef.current = orbitCallback;
  }, [isOrbiting]);

  // Layer change handler
  const handleLayerChange = (layerId) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    setActiveLayer(layerId);
    viewer.imageryLayers.removeAll();
    const provider = getImageryProvider(layerId);
    if (provider) {
      viewer.imageryLayers.addImageryProvider(provider);
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
          <h2>ನಮ್ಮ Bengaluru 3D</h2>
          <p>Loading Bangalore 3D terrain, high-res satellite & landmarks...</p>
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
          onClick={() => flyToLocation(12.9796, 77.5907, 12000, -50, 0, 2.5)}
        >
          <div className="logo-icon">
            <Building2 size={18} color="#0b0f19" />
          </div>
          <span className="logo-title">ನಮ್ಮ Bengaluru</span>
          <span className="logo-sub">3D City</span>
        </div>

        <SearchBox
          onSelectLocation={(loc) => {
            flyToLocation(loc.latitude, loc.longitude, 1200);
            setSelectedProperty(loc);
            setPointingOrigin({
              lat: loc.latitude,
              lng: loc.longitude,
              name: loc.name,
            });

            // Update pin
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
                  color: Cesium.Color.fromCssColorString("#f59e0b"),
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 3,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                label: {
                  text: loc.name,
                  font: "14px 'Outfit', sans-serif",
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

        <div style={{ width: 140, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="logo-badge"
            style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
            onClick={() => setIsLandmarksOpen(true)}
          >
            <Sparkles size={15} style={{ color: "var(--accent-gold)" }} />
            <span>Landmarks</span>
          </button>
        </div>
      </header>

      {/* RIGHT NAVIGATION & TOOLS TOOLBAR */}
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
              if (selectedProperty) {
                toggleOrbit(selectedProperty.latitude, selectedProperty.longitude);
              } else {
                toggleOrbit(coords.lat, coords.lng);
              }
            }}
            title="360° Drone Orbit View"
          >
            <RotateCw size={19} className={isOrbiting ? "animate-spin" : ""} />
            <span className="tooltip">{isOrbiting ? "Stop Orbit" : "360° Drone Orbit"}</span>
          </button>
        </div>

        <div className="tool-group">
          <button
            className={`tool-btn ${isLayersOpen ? "active" : ""}`}
            onClick={() => setIsLayersOpen(true)}
            title="Map Layers"
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
            title="Measure Distance"
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
            <span className="coord-label">ZONE</span>
            <span className="coord-val" style={{ color: "var(--accent-gold)" }}>{currentZone}</span>
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
            title={`Radius / Distance from camera to pointing location on the ground: ${(coords.radius / 1000).toFixed(2)} km (Altitude: ${(coords.alt / 1000).toFixed(2)} km)`}
          >
            <span className="coord-label">RADIUS</span>
            <span className="coord-val" style={{ color: "var(--accent-gold)", fontWeight: 700 }}>
              {(coords.radius / 1000).toFixed(2)} km
            </span>
          </div>
        </div>
      </footer>

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

      {/* INSPECTED PROPERTY CARD */}
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
      />

      {/* BANGALORE LANDMARKS DRAWER */}
      <LandmarksDrawer
        isOpen={isLandmarksOpen}
        onClose={() => setIsLandmarksOpen(false)}
        bookmarks={bookmarks}
        onDeleteBookmark={handleDeleteBookmark}
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

      {/* LAYERS MODAL */}
      <LayersModal
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        activeLayer={activeLayer}
        onChangeLayer={handleLayerChange}
        settings={envSettings}
        onToggleSetting={handleToggleSetting}
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

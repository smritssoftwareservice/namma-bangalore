'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActiveGISTool,
  CatchmentDelineationResult,
  ContourInterval,
  ContourSettings,
  FloodAffectedRoadSegment,
  FloodedBuilding,
  FloodMonitoringSettings,
  HydrologySettings,
  LiveWeatherData,
  MasterGISLayers,
  SimulationParameters,
  SimulationResult,
  SlopeSettings,
  TerrainInspectionData,
  TerrainSettings,
  TINSettings,
  ViewingMode,
  WeatherSettings,
} from '@/lib/types/gis';
import {
  CityMapDisplayMode,
  Detailed3DBuilding,
  ElevatedInfrastructure3D,
  FlyoverPath,
  LightingSettings,
  QualityProfileSettings,
} from '@/lib/types/photorealistic-city';
import {
  getElevationAt,
  inspectPointTerrain,
  generateContoursGeoJSON,
  generateFilledContourBands,
  getElevationColor,
  BENGALURU_BOUNDS,
} from '@/lib/gis/dem-data';
import { generateBengaluruTIN } from '@/lib/gis/tin-service';
import { BENGALURU_LAKES, RAJAKALUVE_SEGMENTS, WATERSHED_BOUNDARIES } from '@/lib/gis/hydrology-data';
import {
  BENGALURU_FLOOD_ZONES,
  HISTORICAL_FLOOD_EVENTS,
  WATERLOGGING_INCIDENTS,
  BENGALURU_HOTSPOTS,
} from '@/lib/gis/flood-data';
import { BENGALURU_ROADS, BENGALURU_STRUCTURES } from '@/lib/gis/structures-roads-data';
import {
  BENGALURU_3D_BUILDINGS,
  BENGALURU_ELEVATED_INFRASTRUCTURE,
  RENDERING_PROFILES,
} from '@/lib/gis/photorealistic-city-data';

export interface CesiumViewerProps {
  layers: MasterGISLayers;
  terrainSettings: TerrainSettings;
  contourSettings: ContourSettings;
  tinSettings?: TINSettings;
  slopeSettings: SlopeSettings;
  weatherSettings: WeatherSettings;
  floodSettings: FloodMonitoringSettings;
  hydrologySettings: HydrologySettings;
  weatherData: LiveWeatherData | null;
  activeTool: ActiveGISTool;
  delineatedCatchment?: CatchmentDelineationResult | null;
  floodedBuildings?: FloodedBuilding[];
  floodedRoads?: FloodAffectedRoadSegment[];
  cityDisplayMode?: CityMapDisplayMode;
  qualityProfile?: QualityProfileSettings;
  lightingSettings?: LightingSettings;
  activeFlyoverPath?: FlyoverPath | null;
  isFlyoverActive?: boolean;
  flyoverWaypointIndex?: number;
  flyoverSpeedMultiplier?: number;
  onFlyoverWaypointChange?: (index: number) => void;
  onFlyoverEnd?: () => void;
  selectedBuilding?: Detailed3DBuilding | null;
  onSelectBuilding?: (building: Detailed3DBuilding | null) => void;
  selectedInfra?: ElevatedInfrastructure3D | null;
  onSelectElevatedInfra?: (infra: ElevatedInfrastructure3D | null) => void;
  isOrbiting?: boolean;
  onInspectLocation: (data: TerrainInspectionData) => void;
  onMouseMoveCoords: (coords: { lat: number; lng: number; elev: number }) => void;
  onMeasurementChange?: (distanceKm: number, areaSqKm: number) => void;
  onSelectProfilePoints?: (start: [number, number], end: [number, number]) => void;
  onSelectCatchmentOutlet?: (lat: number, lng: number) => void;
  selectedHotspot?: string | null;
  simulationParams?: SimulationParameters | null;
  isSimulating?: boolean;
  simulationProgress?: number;
  simResult?: SimulationResult | null;
}

export default function CesiumViewer({
  layers,
  terrainSettings,
  contourSettings,
  tinSettings,
  slopeSettings,
  weatherSettings,
  floodSettings,
  hydrologySettings,
  weatherData,
  activeTool,
  delineatedCatchment,
  floodedBuildings = BENGALURU_STRUCTURES,
  floodedRoads = BENGALURU_ROADS,
  cityDisplayMode = 'photorealistic-3d',
  qualityProfile = RENDERING_PROFILES.HIGH,
  lightingSettings,
  activeFlyoverPath,
  isFlyoverActive = false,
  flyoverWaypointIndex = 0,
  flyoverSpeedMultiplier = 1.0,
  onFlyoverWaypointChange,
  onFlyoverEnd,
  selectedBuilding,
  onSelectBuilding,
  selectedInfra,
  onSelectElevatedInfra,
  isOrbiting = false,
  onInspectLocation,
  onMouseMoveCoords,
  onMeasurementChange,
  onSelectProfilePoints,
  onSelectCatchmentOutlet,
  selectedHotspot,
  simulationParams,
  isSimulating,
  simulationProgress = 0,
  simResult,
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Profile click points tracking
  const profileClicksRef = useRef<[number, number][]>([]);

  // Measure tool points state
  const measurePointsRef = useRef<any[]>([]);

  // Entities tracking refs for clean layer updates
  const layerEntitiesRef = useRef<{
    lakes: any[];
    rajakaluves: any[];
    watersheds: any[];
    floodZones: any[];
    waterlogging: any[];
    historicalFloods: any[];
    contours: any[];
    filledContourBands: any[];
    tinMesh: any[];
    catchment: any[];
    structures: any[];
    affectedRoads: any[];
    slopePolygons: any[];
    simulationEntities: any[];
    measureEntities: any[];
    profileEntities: any[];
    photorealisticBuildings: any[];
    buildingRoofs: any[];
    elevatedFlyovers: any[];
    structuralPiers: any[];
    filledContourLayer: any;
  }>({
    lakes: [],
    rajakaluves: [],
    watersheds: [],
    floodZones: [],
    waterlogging: [],
    historicalFloods: [],
    contours: [],
    filledContourBands: [],
    tinMesh: [],
    catchment: [],
    structures: [],
    affectedRoads: [],
    slopePolygons: [],
    simulationEntities: [],
    measureEntities: [],
    profileEntities: [],
    photorealisticBuildings: [],
    buildingRoofs: [],
    elevatedFlyovers: [],
    structuralPiers: [],
    filledContourLayer: null,
  });

  const radarLayerRef = useRef<any>(null);
  const baseImageryLayerRef = useRef<any>(null);

  // 1. Initialize CesiumJS WebGL Engine with 8K-Ready Pipeline
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).CESIUM_BASE_URL = '/cesium';

    if (!document.getElementById('cesium-css')) {
      const link = document.createElement('link');
      link.id = 'cesium-css';
      link.rel = 'stylesheet';
      link.href = '/cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }

    const initViewer = async () => {
      try {
        const Cesium = (window as any).Cesium;
        if (!Cesium || !containerRef.current) return;

        let terrainProvider: any;
        try {
          terrainProvider = await Cesium.createWorldTerrainAsync({
            requestVertexNormals: true,
            requestWaterMask: true,
          });
        } catch {
          terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }

        const viewer = new Cesium.Viewer(containerRef.current, {
          terrainProvider,
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          infoBox: false,
          selectionIndicator: false,
          fullscreenButton: false,
          vrButton: false,
          orderIndependentTranslucency: true,
          shadows: qualityProfile.enableDynamicShadows,
          terrainShadows: qualityProfile.enableDynamicShadows
            ? Cesium.ShadowMode.ENABLED
            : Cesium.ShadowMode.DISABLED,
          contextOptions: {
            webgl: {
              alpha: true,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
            },
          },
        });

        // 8K / High-Resolution Rendering Pipeline
        viewer.resolutionScale = qualityProfile.resolutionScale;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.terrainExaggeration = terrainSettings.elevationExaggeration;
        viewer.scene.globe.maximumScreenSpaceError = qualityProfile.maximumScreenSpaceError;

        if (viewer.scene.postProcessStages?.fxaa) {
          viewer.scene.postProcessStages.fxaa.enabled = qualityProfile.enableFxaa;
        }

        viewer.scene.highDynamicRange = qualityProfile.enableHdr;

        // Base Satellite Imagery
        viewer.imageryLayers.removeAll();
        const baseImagery = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 19,
          credit: 'Esri, Maxar, Earthstar Geographics, BBMP GIS',
        });
        baseImageryLayerRef.current = viewer.imageryLayers.addImageryProvider(baseImagery);

        // Apple Maps Dramatic 3D Initial Framing of Vidhana Soudha & Central Bengaluru
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.5907, 12.9710, 2400),
          orientation: {
            heading: Cesium.Math.toRadians(15),
            pitch: Cesium.Math.toRadians(-38),
            roll: 0.0,
          },
          duration: 2.0,
        });

        // Pointer move for coordinate & elevation telemetry
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        handler.setInputAction((movement: any) => {
          const ray = viewer.camera.getPickRay(movement.endPosition);
          if (!ray) return;
          const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const elev = getElevationAt(lat, lng);
            onMouseMoveCoords({ lat, lng, elev });
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Click handler: measurement, profiling, catchment, building pick or terrain inspection
        handler.setInputAction((click: any) => {
          if (activeTool === 'measure-distance' || activeTool === 'measure-area') {
            const ray = viewer.camera.getPickRay(click.position);
            if (!ray) return;
            const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (!cartesian) return;
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            handleMeasurementClick(
              viewer,
              cartesian,
              Cesium.Math.toDegrees(cartographic.latitude),
              Cesium.Math.toDegrees(cartographic.longitude)
            );
            return;
          } else if (activeTool === 'elevation-profile') {
            const ray = viewer.camera.getPickRay(click.position);
            if (!ray) return;
            const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (!cartesian) return;
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            handleProfileClick(
              viewer,
              cartesian,
              Cesium.Math.toDegrees(cartographic.latitude),
              Cesium.Math.toDegrees(cartographic.longitude)
            );
            return;
          } else if (activeTool === 'catchment-delineate') {
            const ray = viewer.camera.getPickRay(click.position);
            if (!ray) return;
            const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (!cartesian) return;
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            if (onSelectCatchmentOutlet) {
              onSelectCatchmentOutlet(
                Cesium.Math.toDegrees(cartographic.latitude),
                Cesium.Math.toDegrees(cartographic.longitude)
              );
            }
            return;
          }

          // Entity picking for Apple Maps 3D Buildings and Elevated Infrastructure
          const picked = viewer.scene.pick(click.position);
          if (Cesium.defined(picked) && picked.id) {
            if (picked.id._buildingData && onSelectBuilding) {
              onSelectBuilding(picked.id._buildingData);
              return;
            }
            if (picked.id._infraData && onSelectElevatedInfra) {
              onSelectElevatedInfra(picked.id._infraData);
              return;
            }
          }

          // Fallback to point terrain inspection
          const ray = viewer.camera.getPickRay(click.position);
          if (!ray) return;
          const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
          if (!cartesian) return;

          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const inspection = inspectPointTerrain(lat, lng);
          onInspectLocation(inspection);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        viewerRef.current = viewer;
        (window as any).__cesiumViewer = viewer;
        setIsReady(true);
      } catch (err: any) {
        console.error('Failed to initialize Cesium Viewer:', err);
        setLoadError(err.message || 'Error initializing 3D WebGL globe.');
      }
    };

    if (!(window as any).Cesium) {
      const script = document.createElement('script');
      script.src = '/cesium/Cesium.js';
      script.async = true;
      script.onload = () => {
        initViewer();
      };
      script.onerror = () => {
        setLoadError('Failed to load Cesium engine script from /cesium/Cesium.js');
      };
      document.body.appendChild(script);
    } else {
      initViewer();
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        (window as any).__cesiumViewer = null;
      }
    };
  }, []);

  // 2. Dynamic Graphics Quality Profile Updates (8K / 4K Resolution & Shaders)
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    viewer.resolutionScale = qualityProfile.resolutionScale;
    viewer.scene.globe.maximumScreenSpaceError = qualityProfile.maximumScreenSpaceError;
    viewer.shadows = qualityProfile.enableDynamicShadows;
    viewer.scene.globe.terrainShadows = qualityProfile.enableDynamicShadows
      ? Cesium.ShadowMode.ENABLED
      : Cesium.ShadowMode.DISABLED;

    if (viewer.scene.postProcessStages?.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = qualityProfile.enableFxaa;
    }
    viewer.scene.highDynamicRange = qualityProfile.enableHdr;
  }, [isReady, qualityProfile]);

  // 3. Realistic Day/Night Cycle, Sun Azimuth & Dynamic Shadows
  useEffect(() => {
    if (!isReady || !viewerRef.current || !lightingSettings) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;

    viewer.scene.globe.enableLighting = true;
    viewer.shadows = lightingSettings.enableShadows;

    // Convert timeOfDayHours (0-24) to Cesium JulianDate
    const now = new Date();
    const utcHours = (lightingSettings.timeOfDayHours - 5.5 + 24) % 24; // IST to UTC
    const dateStr = `${now.toISOString().slice(0, 10)}T${String(
      Math.floor(utcHours)
    ).padStart(2, '0')}:${String(Math.floor((utcHours % 1) * 60)).padStart(2, '0')}:00Z`;

    try {
      const julianDate = Cesium.JulianDate.fromIso8601(dateStr);
      viewer.clock.currentTime = julianDate;
      viewer.clock.shouldAnimate = false;
    } catch {
      // Fallback
    }
  }, [isReady, lightingSettings]);

  // 4. Photorealistic 3D Buildings & Rooftop Architectural Details
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.photorealisticBuildings) viewer.entities.remove(ent);
    for (const ent of tracking.buildingRoofs) viewer.entities.remove(ent);
    tracking.photorealisticBuildings = [];
    tracking.buildingRoofs = [];

    const showBuildings =
      layers.buildings ||
      cityDisplayMode === 'photorealistic-3d' ||
      cityDisplayMode === 'night-3d' ||
      cityDisplayMode === 'hybrid';

    if (showBuildings) {
      const isNight = lightingSettings?.isNight || cityDisplayMode === 'night-3d';

      for (const bldg of BENGALURU_3D_BUILDINGS) {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          bldg.coordinates.flatMap(([lat, lng]) => [lng, lat])
        );

        // Building Facade Color: Glowing office window lattice at night!
        const facadeColor = bldg.isSubmerged
          ? Cesium.Color.fromCssColorString('#ef4444').withAlpha(0.88)
          : isNight
          ? Cesium.Color.fromCssColorString(bldg.nightEmissiveHex).withAlpha(0.92)
          : Cesium.Color.fromCssColorString(bldg.facadeColorHex).withAlpha(0.96);

        const bldgEntity = viewer.entities.add({
          name: bldg.name,
          polygon: {
            hierarchy: positions,
            material: facadeColor,
            extrudedHeight: bldg.heightMeters,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            outline: true,
            outlineColor: isNight
              ? Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.6)
              : Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.7),
            outlineWidth: 1.5,
            shadows: Cesium.ShadowMode.ENABLED,
          },
        });
        bldgEntity._buildingData = bldg;
        tracking.photorealisticBuildings.push(bldgEntity);

        // Architectural Rooftop Crowns
        if (bldg.roofType === 'dome-heritage') {
          // Central Golden Dome of Vidhana Soudha
          const domeCenter = Cesium.Cartesian3.fromDegrees(
            bldg.center[1],
            bldg.center[0],
            bldg.groundElevationM + bldg.heightMeters + 8
          );
          const domeEntity = viewer.entities.add({
            position: domeCenter,
            ellipsoid: {
              radii: new Cesium.Cartesian3(16.0, 16.0, 10.0),
              material: Cesium.Color.fromCssColorString('#f59e0b'), // Golden Dome
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#b45309'),
            },
          });
          tracking.buildingRoofs.push(domeEntity);
        } else if (bldg.roofType === 'spire-tower') {
          // Glass Spire Crown of UB Tower
          const spirePos = Cesium.Cartesian3.fromDegrees(
            bldg.center[1],
            bldg.center[0],
            bldg.groundElevationM + bldg.heightMeters + 12
          );
          const spireEntity = viewer.entities.add({
            position: spirePos,
            cylinder: {
              length: 24.0,
              topRadius: 0.5,
              bottomRadius: 6.0,
              material: Cesium.Color.fromCssColorString('#38bdf8'),
            },
          });
          tracking.buildingRoofs.push(spireEntity);
        }
      }
    }
  }, [isReady, layers.buildings, cityDisplayMode, lightingSettings?.isNight]);

  // 5. Elevated Flyovers, Expressways & Namma Metro Viaducts with 3D Piers
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.elevatedFlyovers) viewer.entities.remove(ent);
    for (const ent of tracking.structuralPiers) viewer.entities.remove(ent);
    tracking.elevatedFlyovers = [];
    tracking.structuralPiers = [];

    const showInfra =
      layers.roads ||
      cityDisplayMode === 'photorealistic-3d' ||
      cityDisplayMode === 'night-3d' ||
      cityDisplayMode === 'hybrid';

    if (showInfra) {
      for (const infra of BENGALURU_ELEVATED_INFRASTRUCTURE) {
        // 3D Elevated Deck at true elevation clearance above ground
        const deckPositions = infra.points.map(([lat, lng]) => {
          const groundElev = getElevationAt(lat, lng);
          return Cesium.Cartesian3.fromDegrees(
            lng,
            lat,
            groundElev + infra.clearanceHeightMeters
          );
        });

        const deckEntity = viewer.entities.add({
          name: infra.name,
          polyline: {
            positions: deckPositions,
            width: infra.deckWidthMeters,
            material: Cesium.Color.fromCssColorString(
              infra.accentColorHex || infra.deckColorHex
            ),
            shadows: Cesium.ShadowMode.ENABLED,
          },
        });
        deckEntity._infraData = infra;
        tracking.elevatedFlyovers.push(deckEntity);

        // Concrete Support Pillars extending from ground up to deck
        for (const pt of infra.points) {
          const groundElev = getElevationAt(pt[0], pt[1]);
          const pierPos = Cesium.Cartesian3.fromDegrees(
            pt[1],
            pt[0],
            groundElev + infra.clearanceHeightMeters / 2
          );

          const pierEntity = viewer.entities.add({
            position: pierPos,
            cylinder: {
              length: infra.clearanceHeightMeters,
              topRadius: 1.4,
              bottomRadius: 1.8,
              material: Cesium.Color.fromCssColorString('#94a3b8'), // Concrete pier
              shadows: Cesium.ShadowMode.ENABLED,
            },
          });
          tracking.structuralPiers.push(pierEntity);
        }
      }
    }
  }, [isReady, layers.roads, cityDisplayMode]);

  // 6. Camera Orbiting Engine
  useEffect(() => {
    if (!isReady || !viewerRef.current || !isOrbiting) return;
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;

    const tickListener = () => {
      viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.0035);
    };

    viewer.clock.onTick.addEventListener(tickListener);
    return () => {
      viewer.clock.onTick.removeEventListener(tickListener);
    };
  }, [isReady, isOrbiting]);

  // 7. Cinematic 3D City Flyover Navigation Loop
  useEffect(() => {
    if (!isReady || !viewerRef.current || !isFlyoverActive || !activeFlyoverPath) return;
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;

    const waypoints = activeFlyoverPath.waypoints;
    if (!waypoints || waypoints.length === 0) return;

    const currentWp = waypoints[flyoverWaypointIndex] || waypoints[0];
    const groundElev = getElevationAt(currentWp.latitude, currentWp.longitude);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        currentWp.longitude,
        currentWp.latitude,
        groundElev + currentWp.altitudeMeters
      ),
      orientation: {
        heading: Cesium.Math.toRadians(currentWp.headingDegrees),
        pitch: Cesium.Math.toRadians(currentWp.pitchDegrees),
        roll: Cesium.Math.toRadians(currentWp.rollDegrees || 0.0),
      },
      duration: Math.max(2.0, currentWp.durationSeconds / flyoverSpeedMultiplier),
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        if (!isFlyoverActive) return;
        const nextIdx = flyoverWaypointIndex + 1;
        if (nextIdx < waypoints.length) {
          if (onFlyoverWaypointChange) onFlyoverWaypointChange(nextIdx);
        } else {
          // Loop or complete
          if (onFlyoverWaypointChange) onFlyoverWaypointChange(0);
        }
      },
    });
  }, [
    isReady,
    isFlyoverActive,
    activeFlyoverPath,
    flyoverWaypointIndex,
    flyoverSpeedMultiplier,
  ]);

  // 8. Elevation Profile Click Handler
  const handleProfileClick = (viewer: any, cartesian: any, lat: number, lng: number) => {
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    const clicks = profileClicksRef.current;
    clicks.push([lat, lng]);

    const pin = viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString(clicks.length === 1 ? '#22c55e' : '#ef4444'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: clicks.length === 1 ? 'Profile Start (A)' : 'Profile End (B)',
        font: 'bold 11px monospace',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    });
    layerEntitiesRef.current.profileEntities.push(pin);

    if (clicks.length === 2) {
      const line = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            clicks[0][1],
            clicks[0][0],
            clicks[1][1],
            clicks[1][0],
          ]),
          width: 4,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#f59e0b'),
            dashLength: 12.0,
          }),
          clampToGround: true,
        },
      });
      layerEntitiesRef.current.profileEntities.push(line);

      if (onSelectProfilePoints) {
        onSelectProfilePoints(clicks[0], clicks[1]);
      }
      profileClicksRef.current = [];
    }
  };

  // Reset profile entities if tool switched
  useEffect(() => {
    if (activeTool !== 'elevation-profile') {
      if (viewerRef.current) {
        for (const ent of layerEntitiesRef.current.profileEntities) {
          viewerRef.current.entities.remove(ent);
        }
      }
      layerEntitiesRef.current.profileEntities = [];
      profileClicksRef.current = [];
    }
  }, [activeTool]);

  // Measurement Tool Click Handler
  const handleMeasurementClick = (viewer: any, cartesian: any, lat: number, lng: number) => {
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    measurePointsRef.current.push({ cartesian, lat, lng });
    const pts = measurePointsRef.current;

    const pointEntity = viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#f59e0b'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    layerEntitiesRef.current.measureEntities.push(pointEntity);

    if (pts.length > 1) {
      const positions = pts.map((p) => p.cartesian);
      const lineEntity = viewer.entities.add({
        polyline: {
          positions,
          width: 3,
          material: Cesium.Color.fromCssColorString('#f59e0b'),
          clampToGround: true,
        },
      });
      layerEntitiesRef.current.measureEntities.push(lineEntity);

      let totalDist = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const dLat = (pts[i + 1].lat - pts[i].lat) * 111.0;
        const dLng =
          (pts[i + 1].lng - pts[i].lng) *
          111.0 *
          Math.cos((pts[i].lat * Math.PI) / 180);
        totalDist += Math.sqrt(dLat * dLat + dLng * dLng);
      }

      let areaSqKm = 0;
      if (activeTool === 'measure-area' && pts.length >= 3) {
        let sum = 0;
        for (let i = 0; i < pts.length; i++) {
          const j = (i + 1) % pts.length;
          const xi = pts[i].lng * 111.0 * Math.cos((pts[i].lat * Math.PI) / 180);
          const yi = pts[i].lat * 111.0;
          const xj = pts[j].lng * 111.0 * Math.cos((pts[j].lat * Math.PI) / 180);
          const yj = pts[j].lat * 111.0;
          sum += xi * yj - xj * yi;
        }
        areaSqKm = Math.round(Math.abs(sum / 2) * 100) / 100;
      }

      if (onMeasurementChange) {
        onMeasurementChange(Math.round(totalDist * 100) / 100, areaSqKm);
      }
    }
  };

  // Reset measurements when tool changes
  useEffect(() => {
    if (activeTool !== 'measure-distance' && activeTool !== 'measure-area') {
      if (viewerRef.current) {
        for (const ent of layerEntitiesRef.current.measureEntities) {
          viewerRef.current.entities.remove(ent);
        }
      }
      layerEntitiesRef.current.measureEntities = [];
      measurePointsRef.current = [];
    }
  }, [activeTool]);

  // Terrain Exaggeration & ViewMode Updates
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;

    viewer.scene.globe.terrainExaggeration = terrainSettings.elevationExaggeration;

    if (terrainSettings.viewMode === 'top-down') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 25000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0,
        },
        duration: 1.0,
      });
    } else if (terrainSettings.viewMode === 'ground-level') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 45),
        orientation: {
          heading: Cesium.Math.toRadians(45),
          pitch: Cesium.Math.toRadians(-10),
          roll: 0.0,
        },
        duration: 1.0,
      });
    }
  }, [isReady, terrainSettings.elevationExaggeration, terrainSettings.viewMode]);

  // Selected Hotspot Navigation
  useEffect(() => {
    if (!isReady || !viewerRef.current || !selectedHotspot) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const spot = BENGALURU_HOTSPOTS.find((h) => h.id === selectedHotspot);
    if (!spot) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        spot.longitude,
        spot.latitude,
        spot.cameraAltitude
      ),
      orientation: {
        heading: Cesium.Math.toRadians(spot.heading),
        pitch: Cesium.Math.toRadians(spot.pitch),
        roll: 0.0,
      },
      duration: 1.8,
    });
  }, [isReady, selectedHotspot]);

  // Hydrology: Lakes, Rajakaluves, Watersheds
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.lakes) viewer.entities.remove(ent);
    for (const ent of tracking.rajakaluves) viewer.entities.remove(ent);
    for (const ent of tracking.watersheds) viewer.entities.remove(ent);
    tracking.lakes = [];
    tracking.rajakaluves = [];
    tracking.watersheds = [];

    if (layers.lakes && hydrologySettings.lakes) {
      for (const lake of BENGALURU_LAKES) {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          lake.coordinates.flatMap(([lat, lng]) => [lng, lat])
        );

        const waterColor =
          lake.status === 'Alert'
            ? Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.7)
            : Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.75);

        const lakeEntity = viewer.entities.add({
          name: lake.name,
          polygon: {
            hierarchy: positions,
            material: waterColor,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
            outlineWidth: 2,
          },
          label: {
            text: `${lake.name}\n${lake.currentCapacityPct}% full`,
            font: 'bold 11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            position: Cesium.Cartesian3.fromDegrees(lake.center[1], lake.center[0], 50),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 30000),
          },
        });
        tracking.lakes.push(lakeEntity);
      }
    }

    if (layers.rajakaluves && hydrologySettings.rajakaluves) {
      for (const rk of RAJAKALUVE_SEGMENTS) {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          rk.points.flatMap(([lat, lng]) => [lng, lat])
        );
        const rkColor = rk.isBottleneck
          ? Cesium.Color.fromCssColorString('#ef4444')
          : Cesium.Color.fromCssColorString('#38bdf8');

        const ent = viewer.entities.add({
          name: `${rk.name} (Rajakaluve)`,
          polyline: {
            positions,
            width: rk.flowCapacityM3s > 100 ? 5 : 3.5,
            material: rkColor,
            clampToGround: true,
          },
        });
        tracking.rajakaluves.push(ent);
      }
    }

    if (layers.watersheds && hydrologySettings.watershedBoundaries) {
      for (const ws of WATERSHED_BOUNDARIES) {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          ws.boundary.flatMap(([lat, lng]) => [lng, lat])
        );
        const ent = viewer.entities.add({
          name: `${ws.name} Basin`,
          polygon: {
            hierarchy: positions,
            material: Cesium.Color.fromCssColorString(ws.color).withAlpha(0.12),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(ws.color),
            outlineWidth: 2,
          },
        });
        tracking.watersheds.push(ent);
      }
    }
  }, [isReady, layers.lakes, layers.rajakaluves, layers.watersheds, hydrologySettings]);

  // Contours & Filled Hypsometric Relief (Smooth Organic Terrain Form - NO SQUARES)
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.contours) viewer.entities.remove(ent);
    for (const ent of tracking.filledContourBands) viewer.entities.remove(ent);
    tracking.contours = [];
    tracking.filledContourBands = [];

    if (tracking.filledContourLayer) {
      viewer.imageryLayers.remove(tracking.filledContourLayer);
      tracking.filledContourLayer = null;
    }

    // 1. Filled Hypsometric Relief (Continuous bilinear raster texture, zero blocky squares)
    if (layers.filledContours && contourSettings.filledContours) {
      const palette = contourSettings.colorPalette || 'green-yellow-orange';
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        const data = imgData.data;
        const b = BENGALURU_BOUNDS;
        const latSpan = b.maxLat - b.minLat;
        const lngSpan = b.maxLng - b.minLng;

        for (let py = 0; py < canvas.height; py++) {
          const lat = b.maxLat - (py / canvas.height) * latSpan;
          for (let px = 0; px < canvas.width; px++) {
            const lng = b.minLng + (px / canvas.width) * lngSpan;
            const elev = getElevationAt(lat, lng);
            const hex = getElevationColor(elev, palette);
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const bCol = parseInt(hex.slice(5, 7), 16);

            const idx = (py * canvas.width + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = bCol;
            data[idx + 3] = Math.round(contourSettings.opacity * 190);
          }
        }
        ctx.putImageData(imgData, 0, 0);

        const provider = new Cesium.SingleTileImageryProvider({
          url: canvas.toDataURL(),
          rectangle: Cesium.Rectangle.fromDegrees(b.minLng, b.minLat, b.maxLng, b.maxLat),
        });
        const lyr = viewer.imageryLayers.addImageryProvider(provider);
        lyr.alpha = contourSettings.opacity;
        tracking.filledContourLayer = lyr;
      }
    }

    // 2. Continuous, Chaikin-Smoothed Contour Isolines (Every 5m clearly visible)
    if (layers.contourLines && contourSettings.enabled) {
      const geojson = generateContoursGeoJSON(undefined, contourSettings.interval);
      for (const f of geojson.features) {
        if (!f.geometry?.coordinates || f.geometry.coordinates.length < 2) continue;
        const positions = Cesium.Cartesian3.fromDegreesArray(
          f.geometry.coordinates.flatMap(([lng, lat]: any) => [lng, lat])
        );

        const isMajor = f.properties.isMajor;
        const strokeHex = isMajor
          ? contourSettings.majorColor || '#0f172a' // Solid dark charcoal
          : contourSettings.minorColor || '#059669'; // Crisp emerald
        const color = Cesium.Color.fromCssColorString(strokeHex).withAlpha(contourSettings.opacity);

        const ent = viewer.entities.add({
          name: `Contour ${f.properties.label}`,
          polyline: {
            positions,
            width: isMajor ? contourSettings.majorWidth || 2.6 : contourSettings.minorWidth || 1.3,
            material: color,
            clampToGround: true,
          },
        });
        tracking.contours.push(ent);

        // Major index elevation callout badge (every 25m)
        if (isMajor && contourSettings.showLabels && f.properties.midpoint) {
          const mid = f.properties.midpoint;
          const lbl = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(mid[0], mid[1]),
            label: {
              text: `${f.properties.elevation}m`,
              font: 'bold 11px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString('#022c22'),
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 45000),
            },
          });
          tracking.contours.push(lbl);
        }
      }
    }
  }, [
    isReady,
    layers.contourLines,
    layers.filledContours,
    contourSettings.enabled,
    contourSettings.filledContours,
    contourSettings.interval,
    contourSettings.colorPalette,
    contourSettings.opacity,
    contourSettings.majorColor,
    contourSettings.minorColor,
    contourSettings.majorWidth,
    contourSettings.minorWidth,
    contourSettings.showLabels,
  ]);

  // 3D Flood Risk & Natural Basin Inundation Layers
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.floodZones) viewer.entities.remove(ent);
    tracking.floodZones = [];

    if (layers.floodRiskZones || floodSettings.floodRiskZones) {
      for (const zone of BENGALURU_FLOOD_ZONES) {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          zone.coordinates.flatMap(([lat, lng]) => [lng, lat])
        );

        const isCritical = zone.riskLevel === 'Critical';
        const waterColor = isCritical
          ? Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.68)
          : Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.55);

        const waterEnt = viewer.entities.add({
          name: zone.name,
          polygon: {
            hierarchy: positions,
            material: waterColor,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            outline: true,
            outlineColor: isCritical
              ? Cesium.Color.fromCssColorString('#ef4444')
              : Cesium.Color.fromCssColorString('#38bdf8'),
            outlineWidth: 2.5,
          },
        });
        tracking.floodZones.push(waterEnt);

        const center = zone.coordinates[0];
        const badgeEnt = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(center[1], center[0]),
          label: {
            text: `⚠️ ${zone.name}\nElev: ${zone.avgElevationMeters}m | Risk: ${zone.riskScore}/100`,
            font: 'bold 11px sans-serif',
            fillColor: isCritical ? Cesium.Color.fromCssColorString('#fca5a5') : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 35000),
          },
        });
        tracking.floodZones.push(badgeEnt);
      }
    }
  }, [isReady, layers.floodRiskZones, floodSettings.floodRiskZones]);

  // TIN Terrain Model
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.tinMesh) viewer.entities.remove(ent);
    tracking.tinMesh = [];

    if (layers.tinMesh && tinSettings?.enabled) {
      const tinModel = generateBengaluruTIN('medium', tinSettings.colorPalette);
      const opacity = tinSettings.opacity || 0.85;

      for (const tri of tinModel.triangles) {
        const v = tri.vertices;
        const positions = Cesium.Cartesian3.fromDegreesArray([
          v[0].longitude,
          v[0].latitude,
          v[1].longitude,
          v[1].latitude,
          v[2].longitude,
          v[2].latitude,
        ]);

        const ent = viewer.entities.add({
          name: `TIN Triangle #${tri.id} (${tri.meanElevationMeters}m MSL)`,
          polygon: {
            hierarchy: positions,
            material: Cesium.Color.fromCssColorString(tri.colorHex).withAlpha(opacity),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            outline: tinSettings.showWireframe,
            outlineColor: Cesium.Color.fromCssColorString(tinSettings.wireframeColor),
            outlineWidth: 1.5,
          },
        });
        tracking.tinMesh.push(ent);
      }
    }
  }, [isReady, layers.tinMesh, tinSettings]);

  // Catchment D8 Delineation & Stream Networks
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.catchment) viewer.entities.remove(ent);
    tracking.catchment = [];

    if (layers.catchmentDelineation && delineatedCatchment) {
      const polyPositions = Cesium.Cartesian3.fromDegreesArray(
        delineatedCatchment.catchmentPolygon.flatMap(([lat, lng]) => [lng, lat])
      );

      const catchmentDivide = viewer.entities.add({
        name: `D8 Catchment (${delineatedCatchment.catchmentAreaKm2} km²)`,
        polygon: {
          hierarchy: polyPositions,
          material: Cesium.Color.fromCssColorString(delineatedCatchment.color).withAlpha(0.2),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(delineatedCatchment.color),
          outlineWidth: 3,
        },
      });
      tracking.catchment.push(catchmentDivide);

      // Outlet Pin
      const outletPin = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          delineatedCatchment.outletCoordinates[1],
          delineatedCatchment.outletCoordinates[0]
        ),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#f59e0b'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `Catchment Outlet\nArea: ${delineatedCatchment.catchmentAreaKm2} km²\nElev: ${delineatedCatchment.outletElevationMeters}m`,
          font: 'bold 11px monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });
      tracking.catchment.push(outletPin);

      // Stream Network Tributaries
      for (const stream of delineatedCatchment.streamNetwork) {
        const streamEntity = viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(
              stream.flatMap(([lat, lng]) => [lng, lat])
            ),
            width: 2.5,
            material: Cesium.Color.fromCssColorString('#38bdf8'),
            clampToGround: true,
          },
        });
        tracking.catchment.push(streamEntity);
      }
    }
  }, [isReady, layers.catchmentDelineation, delineatedCatchment]);

  // Weather Radar Overlay
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;

    if (radarLayerRef.current) {
      viewer.imageryLayers.remove(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (layers.weatherRadar && weatherSettings.weatherRadar) {
      const radarProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://tilecache.rainviewer.com/v2/radar/now/256/{z}/{x}/{y}/2/1_1.png',
        credit: 'RainViewer Live Radar Overlay',
      });
      const layer = viewer.imageryLayers.addImageryProvider(radarProvider);
      layer.alpha = weatherSettings.radarOpacity;
      radarLayerRef.current = layer;
    }
  }, [isReady, layers.weatherRadar, weatherSettings.weatherRadar, weatherSettings.radarOpacity]);

  // Interactive Flood Simulation (Animated 3D Water Rise & Inundation Mesh)
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    const tracking = layerEntitiesRef.current;

    for (const ent of tracking.simulationEntities) viewer.entities.remove(ent);
    tracking.simulationEntities = [];

    if (layers.floodSimulation && simResult) {
      const polygon = simResult.inundationPolygon;
      if (polygon && polygon.length > 3) {
        const positions = Cesium.Cartesian3.fromDegreesArray(
          polygon.flatMap(([lat, lng]) => [lng, lat])
        );

        const simWater = viewer.entities.add({
          name: `Flood Inundation Scenario: ${simResult.scenarioMm}mm`,
          polygon: {
            hierarchy: positions,
            material: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.68),
            extrudedHeight: (simulationProgress || 1) * simResult.simulatedWaterLevelMeters * 10,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
            outlineWidth: 2,
          },
        });
        tracking.simulationEntities.push(simWater);

        const center = polygon[0];
        const centerMarker = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(center[1], center[0]),
          label: {
            text: `Simulated Flood Stage: +${simResult.simulatedWaterLevelMeters}m\nArea: ${simResult.inundationAreaSqKm} km²`,
            font: 'bold 12px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          },
        });
        tracking.simulationEntities.push(centerMarker);
      }
    }
  }, [isReady, layers.floodSimulation, simResult, simulationProgress]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {loadError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6 text-center">
          <div className="max-w-md p-6 rounded-2xl bg-red-950/80 border border-red-800 text-red-200">
            <h3 className="text-lg font-bold mb-2">3D Cesium Engine Notice</h3>
            <p className="text-sm">{loadError}</p>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

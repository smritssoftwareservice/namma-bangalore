'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  ActiveGISTool,
  CatchmentDelineationResult,
  ContourSettings,
  ElevationColorPalette,
  ElevationProfileResult,
  FloodMonitoringSettings,
  GISModuleView,
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
  LandmarkSearchItem,
  LightingSettings,
  QualityProfileSettings,
  RenderingQualityProfile,
} from '@/lib/types/photorealistic-city';
import { GISTopNav } from '@/components/gis/gis-top-nav';
import { GISLayerPanel } from '@/components/gis/gis-layer-panel';
import { GISInspectorPanel } from '@/components/gis/gis-inspector-panel';
import { GISSimulationPanel } from '@/components/gis/gis-simulation-panel';
import { GISWeatherPanel } from '@/components/gis/gis-weather-panel';

import { GISElevationProfileModal } from '@/components/gis/gis-elevation-profile-modal';
import { GISScenarioComparison } from '@/components/gis/gis-scenario-comparison';
import { GISMapExportModal } from '@/components/gis/gis-map-export-modal';
import { AppleMapsControls } from '@/components/gis/apple-maps-controls';
import { runFloodSimulation } from '@/lib/gis/simulation-service';
import { generateElevationProfile, getElevationAt } from '@/lib/gis/dem-data';
import { delineateCatchmentForOutlet } from '@/lib/gis/catchment-service';
import { BENGALURU_STRUCTURES, BENGALURU_ROADS } from '@/lib/gis/structures-roads-data';
import {
  BENGALURU_3D_BUILDINGS,
  BENGALURU_ELEVATED_INFRASTRUCTURE,
  BENGALURU_FLYOVER_PATHS,
  RENDERING_PROFILES,
  calculateSunPosition,
} from '@/lib/gis/photorealistic-city-data';
import { BENGALURU_HOTSPOTS } from '@/lib/gis/flood-data';
import { getFallbackBengaluruWeather } from '@/lib/gis/weather-provider';

// Dynamically import CesiumViewer to ensure 100% client-side WebGL rendering
const CesiumViewer = dynamic(() => import('@/components/cesium/cesium-viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
      <div className="text-center">
        <div className="text-sm font-bold text-white tracking-wide">
          INITIALIZING NEXT-GEN 3D BENGALURU MAP ENGINE
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Loading 8K-Ready Terrain, 3D Buildings, Elevated Corridors & Solar Atmosphere...
        </div>
      </div>
    </div>
  ),
});

export default function ThreeDGISPlatformPage() {
  const [currentModule, setCurrentModule] = useState<GISModuleView>('monitoring');
  const [activeTool, setActiveTool] = useState<ActiveGISTool>('inspect');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('hotspot-bellandur');

  // Apple Maps Photorealistic City State
  const [cityDisplayMode, setCityDisplayMode] = useState<CityMapDisplayMode>('photorealistic-3d');
  const [qualityProfile, setQualityProfile] = useState<QualityProfileSettings>(RENDERING_PROFILES.HIGH);

  const [lightingSettings, setLightingSettings] = useState<LightingSettings>(() => {
    const sun = calculateSunPosition(14.0);
    return {
      timeOfDayHours: 14.0,
      preset: 'noon',
      isPlaying: false,
      playbackSpeedMultiplier: 1.0,
      enableShadows: true,
      sunElevationDeg: sun.elevationDeg,
      sunAzimuthDeg: sun.azimuthDeg,
      skyColorHex: sun.skyColorHex,
      ambientLightIntensity: sun.ambientLightIntensity,
      nightWindowGlowIntensity: sun.nightWindowGlowIntensity,
      streetLightIntensity: sun.streetLightIntensity,
      isNight: sun.isNight,
    };
  });

  // Cinematic 3D Flyover State
  const [isFlyoverActive, setIsFlyoverActive] = useState(false);
  const [currentFlyoverPath, setCurrentFlyoverPath] = useState<FlyoverPath>(BENGALURU_FLYOVER_PATHS[0]);
  const [flyoverWaypointIndex, setFlyoverWaypointIndex] = useState(0);
  const [flyoverSpeed, setFlyoverSpeed] = useState(1.0);
  const [isFlyoverPaused, setIsFlyoverPaused] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [is3DTilted, setIs3DTilted] = useState(true);

  // Selected 3D Building & Infrastructure Inspections
  const [selectedBuilding, setSelectedBuilding] = useState<Detailed3DBuilding | null>(null);
  const [selectedInfra, setSelectedInfra] = useState<ElevatedInfrastructure3D | null>(null);

  // Master Layers State — all overlays OFF by default for a clean 3D map
  const [layers, setLayers] = useState<MasterGISLayers>({
    // Terrain
    terrain3D: true,
    elevationDem: true,
    contourLines: false,
    filledContours: false,
    tinMesh: false,
    slopeAnalysis: false,
    aspectAnalysis: false,
    hillshade: true,

    // Weather
    rainfall: false,
    temperature: false,
    humidity: false,
    windSpeed: false,
    windDirection: false,
    cloudCover: false,
    weatherRadar: false,

    // Flood
    floodRiskZones: false,
    floodExtent: false,
    waterlogging: false,
    floodedStructures: false,
    floodAffectedRoads: false,
    floodDepth: false,
    historicalFloods: false,
    floodSimulation: false,

    // Hydrology
    lakes: false,
    rivers: false,
    stormwaterDrains: false,
    rajakaluves: false,
    watersheds: false,
    catchmentDelineation: false,
    flowDirection: false,
    flowAccumulation: false,

    // Infrastructure
    roads: false,
    bridges: false,
    buildings: false,
    hospitals: false,
    schools: false,
    emergencyServices: false,
  });

  // Terrain Settings
  const [terrainSettings, setTerrainSettings] = useState<TerrainSettings>({
    terrain3D: true,
    demHeatmap: false,
    elevationExaggeration: 1.5,
    terrainOpacity: 1.0,
    viewMode: 'oblique',
    hillshade: true,
    baseMap: 'drone',
    colorPalette: 'green-yellow-orange',
    minElevationFilter: 840,
    maxElevationFilter: 994,
  });

  // Contour Settings
  const [contourSettings, setContourSettings] = useState<ContourSettings>({
    enabled: false,
    filledContours: true,
    interval: 5, // Default to 5m for crystal clear elevation resolution
    majorIntervalMultiplier: 5,
    majorColor: '#f59e0b',
    minorColor: '#10b981',
    majorWidth: 2.8,
    minorWidth: 1.2,
    showLabels: true,
    opacity: 0.95,
    colorPalette: 'green-yellow-orange',
  });

  // TIN Mesh Settings
  const [tinSettings, setTinSettings] = useState<TINSettings>({
    enabled: false,
    showWireframe: true,
    wireframeColor: '#0ea5e9',
    opacity: 0.85,
    colorPalette: 'green-yellow-orange',
  });

  // Slope & Aspect Settings
  const [slopeSettings, setSlopeSettings] = useState<SlopeSettings>({
    enabled: false,
    unit: 'degrees',
    opacity: 0.8,
    highlightAccumulationZones: true,
  });

  // Weather Settings
  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>({
    rainfallMap: true,
    intensityHeatmap: false,
    temperatureMap: false,
    humidityMap: false,
    windSpeed: false,
    windDirection: false,
    cloudCover: false,
    weatherRadar: false,
    timeSlice: 'current',
    radarOpacity: 0.75,
  });

  // Flood Settings — all off by default for clean map
  const [floodSettings, setFloodSettings] = useState<FloodMonitoringSettings>({
    floodRiskZones: false,
    floodExtent: false,
    waterloggingMarkers: false,
    floodDepthLayer: false,
    historicalFloods: false,
    lowLyingAreas: false,
    affectedRoads: false,
    riskHeatmap: false,
  });

  // Hydrology Settings — all off by default for clean map
  const [hydrologySettings, setHydrologySettings] = useState<HydrologySettings>({
    lakes: false,
    rivers: false,
    stormwaterDrains: false,
    rajakaluves: false,
    watershedBoundaries: false,
    flowDirectionArrows: false,
    flowAccumulation: false,
    bottlenecks: false,
  });

  // Modals & Panels State
  const [isLayersOpen, setIsLayersOpen] = useState(false); // Clean Apple Maps minimal default
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [elevationProfileResult, setElevationProfileResult] = useState<ElevationProfileResult | null>(null);
  const [isScenarioComparisonOpen, setIsScenarioComparisonOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Catchment Delineation Result
  const [delineatedCatchment, setDelineatedCatchment] = useState<CatchmentDelineationResult | null>(null);

  // Weather API Data
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);

  // Cursor coordinates & Inspection
  const [cursorCoords, setCursorCoords] = useState<{
    lat: number;
    lng: number;
    elev: number;
  } | null>(null);

  const [inspectedLocation, setInspectedLocation] = useState<TerrainInspectionData | null>(null);

  // Measurements
  const [measureDistanceKm, setMeasureDistanceKm] = useState<number>(0);
  const [measureAreaSqKm, setMeasureAreaSqKm] = useState<number>(0);

  // Simulation State
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>({
    targetLocation: {
      name: 'Bellandur Lake & Ecospace',
      latitude: 12.935,
      longitude: 77.675,
      baseElevationMeters: 884.6,
    },
    rainfallScenarioMm: 100,
    rainfallDurationHours: 3,
    targetWaterLevelMeters: 1.2,
    runoffCoefficient: 0.88,
  });

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(1.0);

  // Fetch Live Weather on load
  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch('/api/gis/weather');
        if (res.ok) {
          const json = await res.json();
          if (json.data) setWeatherData(json.data);
        } else {
          setWeatherData(getFallbackBengaluruWeather());
        }
      } catch {
        setWeatherData(getFallbackBengaluruWeather());
      }
    }
    loadWeather();
  }, []);

  // No initial simulation — map starts clean without flood overlays

  // Animated Simulation Loop
  useEffect(() => {
    if (isSimulating) {
      setSimulationProgress(0);
      let p = 0;
      const interval = setInterval(() => {
        p += 0.04;
        if (p >= 1.0) {
          setSimulationProgress(1.0);
          setIsSimulating(false);
          clearInterval(interval);
        } else {
          setSimulationProgress(p);
        }
      }, 80);

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  // Update Solar Position when time of day changes
  const handleUpdateLighting = useCallback((settings: Partial<LightingSettings>) => {
    setLightingSettings((prev) => {
      const nextTime = settings.timeOfDayHours !== undefined ? settings.timeOfDayHours : prev.timeOfDayHours;
      const sun = calculateSunPosition(nextTime);
      return {
        ...prev,
        ...settings,
        timeOfDayHours: nextTime,
        sunElevationDeg: sun.elevationDeg,
        sunAzimuthDeg: sun.azimuthDeg,
        skyColorHex: sun.skyColorHex,
        ambientLightIntensity: sun.ambientLightIntensity,
        nightWindowGlowIntensity: sun.nightWindowGlowIntensity,
        streetLightIntensity: sun.streetLightIntensity,
      };
    });
  }, []);

  // 10 Map Display Modes Switching Engine
  const handleSelectCityMode = useCallback((mode: CityMapDisplayMode) => {
    setCityDisplayMode(mode);
    switch (mode) {
      case 'photorealistic-3d':
        setLayers((prev) => ({
          ...prev,
          buildings: true,
          roads: true,
          bridges: true,
          lakes: true,
          terrain3D: true,
          contourLines: false,
          filledContours: false,
          tinMesh: false,
        }));
        handleUpdateLighting({ timeOfDayHours: 14.0, preset: 'noon' });
        setTerrainSettings((prev) => ({ ...prev, elevationExaggeration: 1.5, viewMode: 'oblique' }));
        break;
      case 'night-3d':
        setLayers((prev) => ({
          ...prev,
          buildings: true,
          roads: true,
          bridges: true,
          lakes: true,
          terrain3D: true,
        }));
        handleUpdateLighting({ timeOfDayHours: 22.0, preset: 'night' });
        break;
      case 'terrain':
        setLayers((prev) => ({
          ...prev,
          contourLines: true,
          filledContours: true,
          elevationDem: true,
          buildings: false,
        }));
        setContourSettings((prev) => ({ ...prev, enabled: true, filledContours: true }));
        break;
      case 'raised-relief':
        setLayers((prev) => ({
          ...prev,
          terrain3D: true,
          elevationDem: true,
          hillshade: true,
        }));
        setTerrainSettings((prev) => ({ ...prev, elevationExaggeration: 3.0 }));
        break;
      case 'gis-analysis':
        setLayers((prev) => ({
          ...prev,
          tinMesh: true,
          catchmentDelineation: true,
          watersheds: true,
          slopeAnalysis: true,
        }));
        setTinSettings((prev) => ({ ...prev, enabled: true }));
        break;
      case 'flood-simulation':
        setLayers((prev) => ({
          ...prev,
          floodSimulation: true,
          floodRiskZones: true,
          floodedStructures: true,
          floodAffectedRoads: true,
          buildings: true,
        }));
        setCurrentModule('simulation');
        setIsInspectorOpen(true);
        break;
      case 'weather-intel':
        setLayers((prev) => ({
          ...prev,
          weatherRadar: true,
          rainfall: true,
        }));
        setWeatherSettings((prev) => ({ ...prev, weatherRadar: true }));
        setCurrentModule('weather');
        setIsInspectorOpen(true);
        break;
      case 'satellite':
        setLayers((prev) => ({
          ...prev,
          contourLines: false,
          filledContours: false,
          tinMesh: false,
          buildings: false,
        }));
        break;
      case 'hybrid':
        setLayers((prev) => ({
          ...prev,
          buildings: true,
          roads: true,
          bridges: true,
        }));
        break;
      case '2d-standard':
        setTerrainSettings((prev) => ({ ...prev, viewMode: 'top-down' }));
        break;
      default:
        break;
    }
  }, [handleUpdateLighting]);

  // Handle GIS Module Switching
  const handleSelectModule = (mod: GISModuleView) => {
    setCurrentModule(mod);
    switch (mod) {
      case 'contours':
        handleSelectCityMode('terrain');
        break;
      case 'tin-terrain':
        handleSelectCityMode('gis-analysis');
        break;
      case 'catchment':
        setLayers((prev) => ({
          ...prev,
          catchmentDelineation: true,
          lakes: true,
          rajakaluves: true,
          watersheds: true,
          flowDirection: true,
        }));
        setActiveTool('catchment-delineate');
        break;
      case 'weather':
        handleSelectCityMode('weather-intel');
        break;
      case 'simulation':
        handleSelectCityMode('flood-simulation');
        break;
      case 'comparison':
        setIsScenarioComparisonOpen(true);
        break;
      case 'reports':
        setIsExportModalOpen(true);
        break;
      case 'monitoring':
      default:
        handleSelectCityMode('photorealistic-3d');
        break;
    }
  };

  // Run Simulation Handler
  const handleRunSimulation = useCallback(() => {
    const result = runFloodSimulation(simulationParams);
    setSimResult(result);
    setLayers((prev) => ({ ...prev, floodSimulation: true }));
    setIsSimulating(true);
  }, [simulationParams]);

  // Reset Simulation
  const handleResetSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setSimResult(null);
  }, []);

  // Feature 2: Elevation Cross-Section Profile Click Callback
  const handleSelectProfilePoints = useCallback(
    (start: [number, number], end: [number, number]) => {
      const profile = generateElevationProfile(start, end, 50);
      setElevationProfileResult(profile);
      setIsProfileModalOpen(true);
    },
    []
  );

  // Feature 3: Catchment D8 Delineation Click Callback
  const handleSelectCatchmentOutlet = useCallback((lat: number, lng: number) => {
    const result = delineateCatchmentForOutlet(lat, lng);
    setDelineatedCatchment(result);
    setLayers((prev) => ({ ...prev, catchmentDelineation: true }));
    setIsInspectorOpen(true);
  }, []);

  // Apple Maps Camera Controls
  const handleResetNorth = useCallback(() => {
    const viewer = (window as any).__cesiumViewer;
    if (!viewer) return;
    const camera = viewer.camera;
    camera.flyTo({
      destination: camera.position,
      orientation: {
        heading: 0.0,
        pitch: camera.pitch,
        roll: 0.0,
      },
      duration: 1.0,
    });
  }, []);

  const handleToggle3DView = useCallback(() => {
    const viewer = (window as any).__cesiumViewer;
    if (!viewer) return;
    const Cesium = (window as any).Cesium;
    const camera = viewer.camera;
    const nextTilt = !is3DTilted;
    setIs3DTilted(nextTilt);
    camera.flyTo({
      destination: camera.position,
      orientation: {
        heading: camera.heading,
        pitch: Cesium.Math.toRadians(nextTilt ? -38 : -90),
        roll: 0.0,
      },
      duration: 1.2,
    });
  }, [is3DTilted]);

  const handleStreetLevelView = useCallback(() => {
    const viewer = (window as any).__cesiumViewer;
    if (!viewer) return;
    const Cesium = (window as any).Cesium;
    const carto = Cesium.Cartographic.fromCartesian(viewer.camera.position);
    const lat = Cesium.Math.toDegrees(carto.latitude);
    const lng = Cesium.Math.toDegrees(carto.longitude);
    const groundElev = getElevationAt(lat, lng);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, groundElev + 28),
      orientation: {
        heading: viewer.camera.heading,
        pitch: Cesium.Math.toRadians(-12),
        roll: 0.0,
      },
      duration: 1.5,
    });
    setIs3DTilted(true);
  }, []);

  const handleCaptureScreenshot = useCallback(() => {
    const viewer = (window as any).__cesiumViewer;
    if (!viewer) return;
    viewer.render();
    const canvas = viewer.scene.canvas;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `bengaluru-3d-${qualityProfile.id}-8k.png`;
    link.href = image;
    link.click();
  }, [qualityProfile.id]);

  const handleSelectLandmark = useCallback((item: LandmarkSearchItem) => {
    const viewer = (window as any).__cesiumViewer;
    if (!viewer) return;
    const Cesium = (window as any).Cesium;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        item.longitude,
        item.latitude - 0.003,
        item.elevationMeters + item.recommendedAltitude
      ),
      orientation: {
        heading: Cesium.Math.toRadians(item.recommendedHeading),
        pitch: Cesium.Math.toRadians(item.recommendedPitch),
        roll: 0.0,
      },
      duration: 2.0,
    });

    // Check if this matches a surveyed building
    const bldg = BENGALURU_3D_BUILDINGS.find(
      (b) =>
        b.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(b.name.toLowerCase())
    );
    if (bldg) {
      setSelectedBuilding(bldg);
      setSelectedInfra(null);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Compact Navigation Header */}
      <GISTopNav
        currentModule={currentModule}
        onSelectModule={handleSelectModule}
        viewMode={terrainSettings.viewMode}
        onSelectViewMode={(vm) => setTerrainSettings((prev) => ({ ...prev, viewMode: vm }))}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        selectedHotspot={selectedHotspot}
        onSelectHotspot={(spotId) => {
          setSelectedHotspot(spotId);
          const spot = BENGALURU_HOTSPOTS.find((h) => h.id === spotId);
          if (spot) {
            setSimulationParams((prev) => ({
              ...prev,
              targetLocation: {
                name: spot.name,
                latitude: spot.latitude,
                longitude: spot.longitude,
                baseElevationMeters: spot.elevationMeters,
              },
            }));
          }
        }}
        isLayersOpen={isLayersOpen}
        onToggleLayers={() => setIsLayersOpen((prev) => !prev)}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main 3D Cesium GIS Container */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Full-screen CesiumJS 3D Globe with 8K Engine */}
        <CesiumViewer
          layers={layers}
          terrainSettings={terrainSettings}
          contourSettings={contourSettings}
          tinSettings={tinSettings}
          slopeSettings={slopeSettings}
          weatherSettings={weatherSettings}
          floodSettings={floodSettings}
          hydrologySettings={hydrologySettings}
          weatherData={weatherData}
          activeTool={activeTool}
          delineatedCatchment={delineatedCatchment}
          floodedBuildings={BENGALURU_STRUCTURES}
          floodedRoads={BENGALURU_ROADS}
          cityDisplayMode={cityDisplayMode}
          qualityProfile={qualityProfile}
          lightingSettings={lightingSettings}
          activeFlyoverPath={currentFlyoverPath}
          isFlyoverActive={isFlyoverActive}
          flyoverWaypointIndex={flyoverWaypointIndex}
          flyoverSpeedMultiplier={flyoverSpeed}
          onFlyoverWaypointChange={setFlyoverWaypointIndex}
          onFlyoverEnd={() => setIsFlyoverActive(false)}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={(bldg) => {
            setSelectedBuilding(bldg);
            setSelectedInfra(null);
          }}
          selectedInfra={selectedInfra}
          onSelectElevatedInfra={(infra) => {
            setSelectedInfra(infra);
            setSelectedBuilding(null);
          }}
          isOrbiting={isOrbiting}
          onInspectLocation={(data) => {
            setInspectedLocation(data);
            setIsInspectorOpen(true);
          }}
          onMouseMoveCoords={setCursorCoords}
          onMeasurementChange={(dist, area) => {
            setMeasureDistanceKm(dist);
            setMeasureAreaSqKm(area);
          }}
          onSelectProfilePoints={handleSelectProfilePoints}
          onSelectCatchmentOutlet={handleSelectCatchmentOutlet}
          selectedHotspot={selectedHotspot}
          simulationParams={simulationParams}
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
          simResult={simResult}
        />

        {/* Apple Maps-Inspired Minimal Floating Controls (Search, Mode, Compass, Lighting, Flyover, Buildings) */}
        <AppleMapsControls
          currentMode={cityDisplayMode}
          onSelectMode={handleSelectCityMode}
          qualityProfile={qualityProfile}
          onSelectQualityProfile={(profKey) => setQualityProfile(RENDERING_PROFILES[profKey])}
          lightingSettings={lightingSettings}
          onUpdateLighting={handleUpdateLighting}
          isFlyoverActive={isFlyoverActive}
          onToggleFlyover={setIsFlyoverActive}
          currentFlyoverPath={currentFlyoverPath}
          onSelectFlyoverPath={(path) => {
            setCurrentFlyoverPath(path);
            setFlyoverWaypointIndex(0);
          }}
          flyoverWaypointIndex={flyoverWaypointIndex}
          flyoverSpeed={flyoverSpeed}
          onChangeFlyoverSpeed={setFlyoverSpeed}
          onFlyoverPlayPause={() => setIsFlyoverPaused((p) => !p)}
          isFlyoverPaused={isFlyoverPaused}
          isOrbiting={isOrbiting}
          onToggleOrbit={() => setIsOrbiting((p) => !p)}
          selectedBuilding={selectedBuilding}
          onCloseBuilding={() => setSelectedBuilding(null)}
          selectedInfra={selectedInfra}
          onCloseInfra={() => setSelectedInfra(null)}
          onSelectLandmark={handleSelectLandmark}
          onResetNorth={handleResetNorth}
          onToggle3DView={handleToggle3DView}
          is3DTilted={is3DTilted}
          onStreetLevelView={handleStreetLevelView}
          onCaptureScreenshot={handleCaptureScreenshot}
          onSimulateAtBuilding={(lat, lng, elev) => {
            setSimulationParams((prev) => ({
              ...prev,
              targetLocation: {
                name: selectedBuilding?.name || 'Selected Building',
                latitude: lat,
                longitude: lng,
                baseElevationMeters: elev,
              },
            }));
            setCurrentModule('simulation');
            handleSelectCityMode('flood-simulation');
            handleRunSimulation();
          }}
        />

        {/* Left Floating Panel: Collapsible 5-Category GIS Layer Manager */}
        {isLayersOpen && (
          <div className="absolute top-16 left-4 z-30 max-h-[calc(100vh-140px)] flex">
            <GISLayerPanel
              layers={layers}
              onUpdateLayer={(key, val) => setLayers((prev) => ({ ...prev, [key]: val }))}
              terrainSettings={terrainSettings}
              onUpdateTerrain={(st) => setTerrainSettings((prev) => ({ ...prev, ...st }))}
              contourSettings={contourSettings}
              onUpdateContours={(st) => setContourSettings((prev) => ({ ...prev, ...st }))}
              tinSettings={tinSettings}
              onUpdateTIN={(st) => setTinSettings((prev) => ({ ...prev, ...st }))}
              slopeSettings={slopeSettings}
              onUpdateSlope={(st) => setSlopeSettings((prev) => ({ ...prev, ...st }))}
              weatherSettings={weatherSettings}
              onUpdateWeather={(st) => setWeatherSettings((prev) => ({ ...prev, ...st }))}
              hydrologySettings={hydrologySettings}
              onUpdateHydrology={(st) => setHydrologySettings((prev) => ({ ...prev, ...st }))}
              onClose={() => setIsLayersOpen(false)}
            />
          </div>
        )}

        {/* Right Floating Contextual Panel: Inspector / Simulation / Weather */}
        {isInspectorOpen && (
          <div className="absolute top-16 right-16 z-30 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {currentModule === 'simulation' ? (
              <GISSimulationPanel
                params={simulationParams}
                onUpdateParams={(newParams) =>
                  setSimulationParams((prev) => ({ ...prev, ...newParams }))
                }
                onRunSimulation={handleRunSimulation}
                onResetSimulation={handleResetSimulation}
                isSimulating={isSimulating}
                onToggleSimulating={() => setIsSimulating((prev) => !prev)}
                simulationProgress={simulationProgress}
                result={simResult}
                onClose={() => setIsInspectorOpen(false)}
              />
            ) : currentModule === 'weather' ? (
              <GISWeatherPanel
                weatherData={weatherData}
                weatherSettings={weatherSettings}
                onUpdateWeatherSettings={(st) =>
                  setWeatherSettings((prev) => ({ ...prev, ...st }))
                }
                onClose={() => setIsInspectorOpen(false)}
              />
            ) : (
              <GISInspectorPanel
                data={
                  inspectedLocation || {
                    latitude: 12.935,
                    longitude: 77.675,
                    elevationMeters: 884.6,
                    slopeDegrees: 1.2,
                    slopePercent: 2.1,
                    slopeClassification: 'Very Flat',
                    aspectDegrees: 112.5,
                    aspectCardinal: 'SE',
                    waterAccumulationRisk: 'High',
                    drainageBasin: 'Koramangala-Challaghatta (KC) Valley',
                  }
                }
                onClose={() => setIsInspectorOpen(false)}
                onSimulateHere={(lat, lng) => {
                  setSimulationParams((prev) => ({
                    ...prev,
                    targetLocation: {
                      name: `Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
                      latitude: lat,
                      longitude: lng,
                      baseElevationMeters: inspectedLocation?.elevationMeters || 890,
                    },
                  }));
                  setCurrentModule('simulation');
                  handleRunSimulation();
                }}
              />
            )}
          </div>
        )}

        {/* Floating Active Measurement Readout Bar */}
        {(activeTool === 'measure-distance' || activeTool === 'measure-area') && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/40 shadow-xl flex items-center gap-4 text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              GIS MEASURE ACTIVE: Click points on 3D terrain
            </span>
            <div className="text-white">
              Distance:{' '}
              <span className="text-amber-300 font-bold">{measureDistanceKm} km</span>
              {measureDistanceKm > 0 && (
                <span className="text-slate-400 text-[10px] ml-1">
                  ({Math.round(measureDistanceKm * 1000)}m)
                </span>
              )}
            </div>
            {activeTool === 'measure-area' && (
              <div className="text-white">
                Area:{' '}
                <span className="text-amber-300 font-bold">{measureAreaSqKm} km²</span>
              </div>
            )}
            <button
              onClick={() => setActiveTool('none')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              Done
            </button>
          </div>
        )}

        {/* Cross-Section Profile Tool Instruction Pill */}
        {activeTool === 'elevation-profile' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 shadow-2xl flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300 font-bold">
              CROSS-SECTION PROFILER: Click Point A (Start), then Point B (End) on terrain
            </span>
            <button
              onClick={() => setActiveTool('none')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Catchment Delineation Instruction Pill */}
        {activeTool === 'catchment-delineate' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-blue-500/50 shadow-2xl flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-blue-300 font-bold">
              CATCHMENT DELINEATOR: Click any stream or outlet point on map
            </span>
            <button
              onClick={() => setActiveTool('none')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Elevation Cross-Section Profile Modal */}
        {isProfileModalOpen && elevationProfileResult && (
          <GISElevationProfileModal
            profile={elevationProfileResult}
            onClose={() => {
              setIsProfileModalOpen(false);
              setElevationProfileResult(null);
            }}
          />
        )}

        {/* Dual Scenario Comparison Modal */}
        {isScenarioComparisonOpen && (
          <GISScenarioComparison
            baselineScenarioMm={25}
            comparisonScenarioMm={100}
            centerLocation={simulationParams.targetLocation}
            onClose={() => setIsScenarioComparisonOpen(false)}
            onApplyScenarioToMap={(scenario) => {
              setSimulationParams((prev) => ({ ...prev, rainfallScenarioMm: scenario }));
              setCurrentModule('simulation');
              setIsScenarioComparisonOpen(false);
              handleRunSimulation();
            }}
          />
        )}

        {/* Cartographic Map Export Modal */}
        {isExportModalOpen && (
          <GISMapExportModal
            currentModule={currentModule}
            palette={contourSettings.colorPalette || 'green-yellow-orange'}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}
      </div>


    </div>
  );
}

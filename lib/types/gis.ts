// FLOODGUARD AI - 3D GIS & Geospatial Intelligence Platform Types

export type ViewingMode = 'top-down' | 'oblique' | 'ground-level';
export type ActiveGISTool =
  | 'none'
  | 'inspect'
  | 'measure-distance'
  | 'measure-area'
  | 'elevation-profile'
  | 'catchment-delineate'
  | 'draw-polygon'
  | 'draw-line';

export type GISModuleView = 
  | 'monitoring'       // Live 3D Flood Monitoring
  | 'terrain'          // 3D Terrain & DEM Engine
  | 'contours'         // Contour Map & Hypsometric Tint
  | 'tin-terrain'      // Triangulated Irregular Network (TIN)
  | 'catchment'        // Catchment Area & D8 Watershed Delineation
  | 'slope-aspect'     // Slope & Aspect Analysis
  | 'weather'          // Weather Intelligence
  | 'simulation'       // Flood Simulation Engine
  | 'comparison'       // Side-by-Side Flood Scenario Comparison
  | 'hydrology'        // Drainage & Rajakaluve Network
  | 'reports';         // Map Export & Dossiers

// -------------------------------------------------------------
// Module 1: Elevation, Contours & Color Palettes
// -------------------------------------------------------------
export type ContourInterval = 1 | 2 | 5 | 10 | 20 | 50;
export type ElevationColorPalette =
  | 'green-yellow-orange' // Classic Hypsometric (Ref Image 1)
  | 'blue-green'          // Hydrological
  | 'terrain-elevation'   // Earth tones
  | 'grayscale'           // Analytical DEM
  | 'rainbow';            // Spectral

export interface TerrainSettings {
  terrain3D: boolean;
  demHeatmap: boolean;
  elevationExaggeration: number; // 1.0 to 5.0
  terrainOpacity: number;        // 0.1 to 1.0
  viewMode: ViewingMode;
  hillshade: boolean;
  baseMap: 'drone' | 'satellite' | 'dark' | 'topo' | 'osm';
  colorPalette: ElevationColorPalette;
  minElevationFilter: number;    // e.g. 840m
  maxElevationFilter: number;    // e.g. 1000m
}

export interface ContourSettings {
  enabled: boolean;
  filledContours: boolean;       // Hypsometric tint fill (Ref Image 1)
  interval: ContourInterval;
  majorIntervalMultiplier: number; // e.g. every 5th line
  majorColor: string;            // Crisp black/gold boundary lines
  minorColor: string;
  majorWidth: number;
  minorWidth: number;
  showLabels: boolean;
  opacity: number;
  colorPalette: ElevationColorPalette;
}

// -------------------------------------------------------------
// Module 2: Elevation Cross-Section Profile
// -------------------------------------------------------------
export interface ElevationProfilePoint {
  distanceKm: number;
  elevationMeters: number;
  latitude: number;
  longitude: number;
  slopeDegrees: number;
}

export interface ElevationProfileResult {
  startLocation: [number, number]; // [lat, lng]
  endLocation: [number, number];
  totalDistanceKm: number;
  minElevationMeters: number;
  maxElevationMeters: number;
  averageElevationMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  profilePoints: ElevationProfilePoint[];
}

// -------------------------------------------------------------
// Module 3: Catchment & D8 Watershed Delineation
// -------------------------------------------------------------
export interface CatchmentDelineationResult {
  outletCoordinates: [number, number]; // [lat, lng]
  outletElevationMeters: number;
  catchmentAreaKm2: number;
  elevationMinM: number;
  elevationMaxM: number;
  elevationAvgM: number;
  dominantDrainageDirection: string;
  peakFlowAccumulation: number;
  catchmentPolygon: [number, number][]; // [lat, lng][]
  streamNetwork: Array<[number, number][]>; // Polylines
  subCatchmentsCount: number;
  waterBodyIntersected?: string;
  color: string;
}

// -------------------------------------------------------------
// Module 4: TIN (Triangulated Irregular Network)
// -------------------------------------------------------------
export interface TINVertex {
  id: number;
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

export interface TINTriangle {
  id: number;
  vertices: [TINVertex, TINVertex, TINVertex];
  centroid: [number, number, number]; // [lat, lng, elev]
  meanElevationMeters: number;
  slopeDegrees: number;
  aspectDegrees: number;
  aspectCardinal: string;
  colorHex: string;
}

export interface TINModel {
  verticesCount: number;
  trianglesCount: number;
  triangles: TINTriangle[];
  elevationRange: [number, number];
}

export interface TINSettings {
  enabled: boolean;
  showWireframe: boolean;
  wireframeColor: string;
  opacity: number;
  colorPalette: ElevationColorPalette;
}

// -------------------------------------------------------------
// Module 5 & 6: Flood Inundation & Scenario Comparison (Ref Image 2)
// -------------------------------------------------------------
export type FloodRiskTier = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Critical';

export interface FloodedBuilding {
  id: string;
  name: string;
  type: 'Hospital' | 'School' | 'Tech Park' | 'Residential Complex' | 'Commercial' | 'Emergency Station';
  coordinates: [number, number][]; // Footprint polygon [lat, lng]
  center: [number, number];
  groundElevationM: number;
  estimatedFloodDepthM: number;
  isSubmerged: boolean;
  wardName: string;
  estimatedOccupancy: number;
}

export interface FloodAffectedRoadSegment {
  id: string;
  name: string;
  points: [number, number][];
  totalLengthM: number;
  submergedLengthM: number;
  maxFloodDepthM: number;
  status: 'Passable' | 'Hazardous' | 'Impassable (Closed)';
  carriageway: 'Dual' | 'Single';
}

export interface FloodInundationLayersState {
  floodedAreas: boolean;
  floodedStructures: boolean;
  floodAffectedRoads: boolean;
  floodDepthRaster: boolean;
  catchmentElevation: boolean;
  terrainElevation: boolean;
  waterBodies: boolean;
  drainageNetwork: boolean;
}

export interface ScenarioComparisonState {
  enabled: boolean;
  mode: 'side-by-side' | 'swipe';
  baselineScenarioMm: RainfallScenarioPreset;
  comparisonScenarioMm: RainfallScenarioPreset;
  baselineDurationH: number;
  comparisonDurationH: number;
  syncNavigation: boolean;
}

export interface ScenarioDeltaMetrics {
  baselineScenarioMm: number;
  comparisonScenarioMm: number;
  baselineFloodedAreaKm2: number;
  comparisonFloodedAreaKm2: number;
  deltaFloodedAreaKm2: number;
  deltaFloodedAreaPct: number;
  baselineSubmergedRoadsKm: number;
  comparisonSubmergedRoadsKm: number;
  deltaSubmergedRoadsKm: number;
  baselineAffectedStructuresCount: number;
  comparisonAffectedStructuresCount: number;
  deltaAffectedStructuresCount: number;
  baselineRunoffVolumeM3: number;
  comparisonRunoffVolumeM3: number;
  deltaRunoffVolumeM3: number;
}

// -------------------------------------------------------------
// Module 7: Simulation Parameters
// -------------------------------------------------------------
export type RainfallScenarioPreset = 25 | 50 | 100 | 150 | 200; // mm

export interface SimulationParameters {
  targetLocation: {
    name: string;
    latitude: number;
    longitude: number;
    baseElevationMeters: number;
  };
  rainfallScenarioMm: RainfallScenarioPreset;
  rainfallDurationHours: number; // 1 to 24
  targetWaterLevelMeters: number; // 0.1 to 3.5m
  runoffCoefficient: number; // e.g. 0.88 for paved urban
  catchmentId?: string;
}

export interface SimulationResult {
  scenarioMm: number;
  durationHours: number;
  simulatedWaterLevelMeters: number;
  totalRunoffVolumeM3: number;
  inundationAreaSqKm: number;
  inundationPolygon: [number, number][];
  depthContours: Array<{
    depthMeters: number;
    contourPoints: [number, number][];
  }>;
  affectedInfrastructure: {
    roadsSubmergedKm: number;
    submergedRoadNames: string[];
    criticalFacilitiesCount: number;
    facilitiesList: Array<{
      name: string;
      type: 'Hospital' | 'School' | 'Tech Park' | 'Fire Station' | 'Transit Hub';
      distanceFromFloodCenterM: number;
      submerged: boolean;
    }>;
    estimatedPeopleImpacted: number;
  };
  modelDisclaimer: string;
}

// -------------------------------------------------------------
// Module 8: Master GIS Layers
// -------------------------------------------------------------
export interface MasterGISLayers {
  // Terrain
  terrain3D: boolean;
  elevationDem: boolean;
  contourLines: boolean;
  filledContours: boolean;
  tinMesh: boolean;
  slopeAnalysis: boolean;
  aspectAnalysis: boolean;
  hillshade: boolean;
  
  // Weather
  rainfall: boolean;
  temperature: boolean;
  humidity: boolean;
  windSpeed: boolean;
  windDirection: boolean;
  cloudCover: boolean;
  weatherRadar: boolean;
  
  // Flood
  floodRiskZones: boolean;
  floodExtent: boolean;
  waterlogging?: boolean;
  floodedStructures: boolean;
  floodAffectedRoads: boolean;
  floodDepth: boolean;
  historicalFloods: boolean;
  floodSimulation: boolean;
  
  // Hydrology
  lakes: boolean;
  rivers: boolean;
  stormwaterDrains: boolean;
  rajakaluves: boolean;
  watersheds: boolean;
  catchmentDelineation: boolean;
  flowDirection: boolean;
  flowAccumulation: boolean;
  
  // Infrastructure
  roads: boolean;
  bridges: boolean;
  buildings: boolean;
  hospitals: boolean;
  schools: boolean;
  emergencyServices: boolean;
}

// -------------------------------------------------------------
// Slope & Aspect
// -------------------------------------------------------------
export type SlopeUnit = 'degrees' | 'percent';

export interface SlopeSettings {
  enabled: boolean;
  unit: SlopeUnit;
  opacity: number;
  highlightAccumulationZones: boolean;
}

export interface AspectSettings {
  enabled: boolean;
  opacity: number;
  showDirectionArrows: boolean;
}

export interface TerrainInspectionData {
  latitude: number;
  longitude: number;
  elevationMeters: number;
  slopeDegrees: number;
  slopePercent: number;
  slopeClassification: 'Very Flat' | 'Gentle Slope' | 'Moderate Slope' | 'Steep Slope' | 'Very Steep';
  aspectDegrees: number;
  aspectCardinal: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'Flat';
  waterAccumulationRisk: 'High' | 'Moderate' | 'Low';
  drainageBasin: string;
  nearestWaterBody?: {
    name: string;
    distanceMeters: number;
    elevationDiffMeters: number;
  };
  address?: string;
  nearbyBuildingsCount?: number;
  nearbyRoadName?: string;
}

// -------------------------------------------------------------
// Weather Intelligence
// -------------------------------------------------------------
export type WeatherTimeSlice =
  | 'current'
  | 'prev-1h'
  | 'prev-6h'
  | 'prev-24h'
  | 'forecast-6h'
  | 'forecast-12h'
  | 'forecast-24h';

export interface WeatherSettings {
  rainfallMap: boolean;
  intensityHeatmap: boolean;
  temperatureMap: boolean;
  humidityMap: boolean;
  windSpeed: boolean;
  windDirection: boolean;
  cloudCover: boolean;
  weatherRadar: boolean;
  timeSlice: WeatherTimeSlice;
  radarOpacity: number;
}

export interface LiveWeatherData {
  location: string;
  timestamp: string;
  temperatureC: number;
  relativeHumidity: number;
  precipitationMm: number;
  rainMm: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  cloudCoverPct: number;
  weatherCode: number;
  weatherDescription: string;
  dataSource: 'Open-Meteo High-Resolution' | 'RainViewer' | 'IMD Cached';
  hourlyForecast: Array<{
    time: string;
    rainMm: number;
    temperatureC: number;
    humidity: number;
    windSpeedKmh: number;
  }>;
  dailyForecast: Array<{
    date: string;
    precipitationSumMm: number;
    rainProbabilityMax: number;
    tempMaxC: number;
    tempMinC: number;
  }>;
}

// -------------------------------------------------------------
// Flood Monitoring Entities
// -------------------------------------------------------------
export interface FloodMonitoringSettings {
  floodRiskZones: boolean;
  floodExtent: boolean;
  waterloggingMarkers: boolean;
  floodDepthLayer: boolean;
  historicalFloods: boolean;
  lowLyingAreas: boolean;
  affectedRoads: boolean;
  riskHeatmap: boolean;
}

export interface WaterloggingIncident {
  id: string;
  name: string;
  location: [number, number]; // [lat, lng]
  waterDepthMeters: number;
  severity: FloodRiskTier;
  status: 'Active' | 'Receding' | 'Pumped / Cleared';
  reportedAt: string;
  cause: string;
  affectedRoad: string;
  wardName: string;
  drainageIssue: string;
}

export interface FloodRiskPolygon {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
  riskLevel: FloodRiskTier;
  riskScore: number; // 0 - 100
  avgElevationMeters: number;
  catchmentAreaKm2: number;
  populationExposed: number;
  primaryRajakaluve: string;
  historicalIncidentsCount: number;
}

export interface HistoricalFloodEvent {
  id: string;
  year: number;
  eventTitle: string;
  dateStr: string;
  peakRainfall24hMm: number;
  maxFloodDepthM: number;
  summary: string;
  polygon: [number, number][];
  affectedSuburbs?: string[];
  suburbsAffected?: string[];
}

// -------------------------------------------------------------
// Hydrology & Drainage
// -------------------------------------------------------------
export interface HydrologySettings {
  lakes: boolean;
  rivers: boolean;
  stormwaterDrains: boolean;
  rajakaluves: boolean;
  watershedBoundaries: boolean;
  flowDirectionArrows: boolean;
  flowAccumulation: boolean;
  bottlenecks: boolean;
}

export interface BengaluruLake {
  id: string;
  name: string;
  coordinates: [number, number][]; // Polygon [lat, lng]
  center: [number, number];
  waterLevelMeters: number;
  fullTankLevelMeters: number;
  surfaceAreaHectares: number;
  holdingCapacityMillionLiters: number;
  currentCapacityPct: number;
  watershed: 'KC Valley' | 'Hebbal Valley' | 'Vrishabhavathi Valley';
  inflowRajakaluves: string[];
  outflowRajakaluves: string[];
  status: 'Normal' | 'Alert' | 'Overflow Imminent' | 'Overflowing';
}

export interface RajakaluveSegment {
  id: string;
  name: string;
  category: 'Primary' | 'Secondary' | 'Tertiary';
  points: [number, number][]; // [lat, lng]
  lengthKm: number;
  widthMeters: number;
  gradientPercent: number;
  flowCapacityM3s: number;
  currentDischargeM3s: number;
  siltLevelPct: number;
  isBottleneck: boolean;
  bottleneckReason?: string;
  fromLake?: string;
  toLake?: string;
}

export interface WatershedBoundary {
  id: string;
  name: string;
  areaSqKm: number;
  boundary: [number, number][];
  mainRiverValley: string;
  elevationHighM: number;
  elevationLowM: number;
  color: string;
}

export interface BengaluruHotspot {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  cameraAltitude: number;
  pitch: number;
  heading: number;
  elevationMeters: number;
  riskLevel: FloodRiskTier;
  catchment: string;
}

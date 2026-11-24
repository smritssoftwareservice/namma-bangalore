// FLOODGUARD AI - Photorealistic 3D City & Apple Maps-Style Experience Types

export type CityMapDisplayMode =
  | '2d-standard'        // 1. Standard 2D Road Map
  | 'satellite'          // 2. Pure Satellite / Aerial Imagery
  | 'hybrid'             // 3. Hybrid (Satellite + 3D Vector Infrastructure)
  | 'terrain'            // 4. Terrain Topographic & Contours
  | 'photorealistic-3d'  // 5. Photorealistic 3D City (Apple Maps style)
  | 'raised-relief'      // 6. 3D Raised-Relief Exaggerated Terrain
  | 'gis-analysis'       // 7. Scientific GIS (Slope, Aspect, TIN, D8 Catchment)
  | 'flood-simulation'   // 8. 3D Flood Deluge & Inundation Stage
  | 'weather-intel'      // 9. Live Weather, Radar & Wind Vector Map
  | 'night-3d';          // 10. Night-time 3D Illuminated City Skyline

export type RenderingQualityProfile = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export interface QualityProfileSettings {
  id: RenderingQualityProfile;
  label: string;
  description: string;
  resolutionScale: number; // 1.0 (Standard) to 2.0 (Retina/4K) to 3.0 (8K ready)
  enableFxaa: boolean;
  enableMsaa: boolean;
  msaaSamples: number; // 1, 4, 8
  enableSsao: boolean; // Screen-Space Ambient Occlusion
  enableHdr: boolean;
  enableDynamicShadows: boolean;
  shadowMapSize: number; // 1024, 2048, 4096
  maximumScreenSpaceError: number; // Level of Detail (LOD) threshold: 1.0 to 3.0
  tileCacheSize: number;
}

export type TimeOfDayPreset = 'dawn' | 'noon' | 'sunset' | 'night';

export interface LightingSettings {
  timeOfDayHours: number; // 0.0 to 24.0
  preset: TimeOfDayPreset;
  isPlaying: boolean; // Continuous 24h day-night simulation
  playbackSpeedMultiplier: number; // e.g. 1.0 = 24h in 60s
  enableShadows: boolean;
  sunElevationDeg: number;
  sunAzimuthDeg: number;
  skyColorHex: string;
  ambientLightIntensity: number;
  nightWindowGlowIntensity: number; // 0.0 to 1.0
  streetLightIntensity: number;
  isNight: boolean;
}

export type BuildingRoofType =
  | 'flat-mechanical' // Typical modern commercial rooftop with HVAC penthouses
  | 'atrium-glass'    // Architectural skylights and glass atriums
  | 'dome-heritage'   // Dravidian / Neo-Dravidian dome (Vidhana Soudha)
  | 'spire-tower'     // Spire crown (UB Tower, high-rise spires)
  | 'terracotta-pitch'// Colonial heritage pitched terracotta tile
  | 'helipad';        // Helipad rooftop (Aster, Ecospace, UB City)

export type FacadeMaterialType =
  | 'curtain-glass-blue'
  | 'curtain-glass-amber'
  | 'granite-sandstone'
  | 'modern-composite-white'
  | 'terracotta-brick'
  | 'concrete-brutalist';

export interface Detailed3DBuilding {
  id: string;
  name: string;
  category:
    | 'Commercial'
    | 'Tech Park'
    | 'Residential High-Rise'
    | 'Government / Heritage'
    | 'Hospital'
    | 'Educational'
    | 'Industrial'
    | 'Transit Hub';
  coordinates: [number, number][]; // Polygon footprint [lat, lng]
  center: [number, number];        // [lat, lng]
  groundElevationM: number;
  heightMeters: number;
  floorCount: number;
  footprintAreaSqM: number;
  roofType: BuildingRoofType;
  facadeMaterial: FacadeMaterialType;
  facadeColorHex: string;
  roofColorHex: string;
  nightEmissiveHex: string;        // Warm window lattice glow at night
  estimatedOccupancy: number;
  wardName: string;
  floodExposure: 'Low' | 'Moderate' | 'High' | 'Severe (Valley Bottom)';
  isSubmerged?: boolean;
  estimatedFloodDepthM?: number;
  hasPhotogrammetry?: boolean;
  architecturalDetails?: string;
}

export type ElevatedInfrastructureType =
  | 'Elevated Expressway'
  | 'Metro Viaduct'
  | 'Overpass Flyover'
  | 'Lakeside Bridge';

export interface ElevatedInfrastructure3D {
  id: string;
  name: string;
  type: ElevatedInfrastructureType;
  points: [number, number][];      // Centerline alignment [lat, lng]
  clearanceHeightMeters: number;  // Elevation above terrain surface (e.g. 14m for E-City expressway)
  deckWidthMeters: number;         // True geometric deck width
  deckColorHex: string;
  pierSpacingMeters: number;       // Spacing for 3D structural support pillars
  accentColorHex?: string;         // e.g. Purple for Namma Metro Purple Line, Green for Green Line
  status: 'Passable' | 'Hazardous' | 'Impassable (Closed)';
  maxFloodClearanceRemainingM?: number;
  structuralDescription: string;
}

export interface FlyoverWaypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  headingDegrees: number; // 0 = North, 90 = East
  pitchDegrees: number;   // -15 = look forward, -45 = oblique, -90 = top down
  rollDegrees?: number;
  durationSeconds: number; // Transition time to this waypoint
  description: string;
}

export interface FlyoverPath {
  id: string;
  title: string;
  subtitle: string;
  totalDurationSeconds: number;
  waypoints: FlyoverWaypoint[];
}

export interface LandmarkSearchItem {
  id: string;
  name: string;
  category: 'Landmark' | 'Tech Park' | 'Hospital' | 'Lake' | 'Flyover' | 'Transit Hub' | 'Heritage';
  latitude: number;
  longitude: number;
  elevationMeters: number;
  recommendedPitch: number;
  recommendedHeading: number;
  recommendedAltitude: number;
  description: string;
  ward: string;
}

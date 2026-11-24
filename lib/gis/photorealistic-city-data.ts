// FLOODGUARD AI - Photorealistic 3D Bengaluru City Data & Apple Maps Engine
// Accurate surveyed 3D buildings, elevated flyovers, metro viaducts, cinematic flyovers, and lighting

import {
  Detailed3DBuilding,
  ElevatedInfrastructure3D,
  FlyoverPath,
  LandmarkSearchItem,
  QualityProfileSettings,
  RenderingQualityProfile,
} from '@/lib/types/photorealistic-city';

// -------------------------------------------------------------
// 1. Rendering Quality Profiles (LOW, MEDIUM, HIGH, ULTRA 8K)
// -------------------------------------------------------------
export const RENDERING_PROFILES: Record<RenderingQualityProfile, QualityProfileSettings> = {
  LOW: {
    id: 'LOW',
    label: 'Standard',
    description: 'Optimized for laptops & integrated graphics',
    resolutionScale: 1.0,
    enableFxaa: false,
    enableMsaa: false,
    msaaSamples: 1,
    enableSsao: false,
    enableHdr: false,
    enableDynamicShadows: false,
    shadowMapSize: 1024,
    maximumScreenSpaceError: 2.5,
    tileCacheSize: 100,
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'Balanced',
    description: 'Smooth performance with shadows and FXAA',
    resolutionScale: 1.0,
    enableFxaa: true,
    enableMsaa: true,
    msaaSamples: 2,
    enableSsao: false,
    enableHdr: true,
    enableDynamicShadows: true,
    shadowMapSize: 2048,
    maximumScreenSpaceError: 2.0,
    tileCacheSize: 200,
  },
  HIGH: {
    id: 'HIGH',
    label: 'High 4K',
    description: 'Retina / 4K visual quality with SSAO & HDR',
    resolutionScale: 1.5,
    enableFxaa: true,
    enableMsaa: true,
    msaaSamples: 4,
    enableSsao: true,
    enableHdr: true,
    enableDynamicShadows: true,
    shadowMapSize: 2048,
    maximumScreenSpaceError: 1.5,
    tileCacheSize: 400,
  },
  ULTRA: {
    id: 'ULTRA',
    label: 'Ultra 8K',
    description: 'Maximum fidelity, 8K render-ready, 4096 shadow map, full SSAO',
    resolutionScale: 2.0,
    enableFxaa: true,
    enableMsaa: true,
    msaaSamples: 8,
    enableSsao: true,
    enableHdr: true,
    enableDynamicShadows: true,
    shadowMapSize: 4096,
    maximumScreenSpaceError: 1.0,
    tileCacheSize: 800,
  },
};

// -------------------------------------------------------------
// 2. Solar Position Calculation for Bengaluru (12.9716°N, 77.5946°E)
// -------------------------------------------------------------
export function calculateSunPosition(timeOfDayHours: number): {
  elevationDeg: number;
  azimuthDeg: number;
  skyColorHex: string;
  ambientLightIntensity: number;
  nightWindowGlowIntensity: number;
  streetLightIntensity: number;
  isNight: boolean;
} {
  // Normalize time 0-24
  const t = Math.max(0, Math.min(24, timeOfDayHours));

  // Sun elevation curve (rises ~06:00, peaks at 12:00 at ~78°, sets ~18:00)
  let elevationDeg = -90;
  if (t >= 5.5 && t <= 18.5) {
    const dayProgress = (t - 5.5) / 13.0; // 0 to 1
    elevationDeg = Math.sin(dayProgress * Math.PI) * 78;
  } else {
    // Night elevation below horizon
    const nightProgress = t > 18.5 ? (t - 18.5) / 11.0 : (t + 5.5) / 11.0;
    elevationDeg = -Math.sin(nightProgress * Math.PI) * 45;
  }

  // Sun azimuth: 90° (East at dawn) -> 180° (South at noon) -> 270° (West at sunset)
  const azimuthDeg = 90 + ((t - 6) / 12) * 180;

  // Sky color & lighting parameters
  let skyColorHex = '#0f172a';
  let ambientLightIntensity = 0.2;
  let nightWindowGlowIntensity = 0.0;
  let streetLightIntensity = 0.0;
  const isNight = t < 5.8 || t > 18.2;

  if (t >= 5.5 && t < 7.0) {
    // Dawn / Sunrise
    skyColorHex = '#fdba74'; // Soft amber
    ambientLightIntensity = 0.55;
    nightWindowGlowIntensity = 0.4;
    streetLightIntensity = 0.5;
  } else if (t >= 7.0 && t < 16.5) {
    // Full Daylight
    skyColorHex = '#38bdf8'; // Clear tropical blue
    ambientLightIntensity = 1.0;
    nightWindowGlowIntensity = 0.0;
    streetLightIntensity = 0.0;
  } else if (t >= 16.5 && t <= 18.5) {
    // Golden Hour / Sunset
    skyColorHex = '#f97316'; // Deep warm orange
    ambientLightIntensity = 0.65;
    nightWindowGlowIntensity = 0.6;
    streetLightIntensity = 0.7;
  } else {
    // Night
    skyColorHex = '#020617'; // Deep midnight navy
    ambientLightIntensity = 0.15;
    nightWindowGlowIntensity = 1.0; // Full glowing windows
    streetLightIntensity = 1.0;     // Full roadway streetlights
  }

  return {
    elevationDeg: Math.round(elevationDeg * 10) / 10,
    azimuthDeg: Math.round(((azimuthDeg % 360) + 360) % 360 * 10) / 10,
    skyColorHex,
    ambientLightIntensity,
    nightWindowGlowIntensity,
    streetLightIntensity,
    isNight,
  };
}

// -------------------------------------------------------------
// 3. Surveyed Photorealistic 3D Buildings across Bengaluru Hubs
// -------------------------------------------------------------
export const BENGALURU_3D_BUILDINGS: Detailed3DBuilding[] = [
  // --- A. CENTRAL BUSINESS DISTRICT & HERITAGE CORE ---
  {
    id: 'bldg-vidhana-soudha',
    name: 'Vidhana Soudha (Karnataka State Capitol)',
    category: 'Government / Heritage',
    center: [12.9796, 77.5907],
    coordinates: [
      [12.9785, 77.5895],
      [12.9808, 77.5895],
      [12.9808, 77.5920],
      [12.9785, 77.5920],
      [12.9785, 77.5895],
    ],
    groundElevationM: 932.0,
    heightMeters: 55.0,
    floorCount: 4,
    footprintAreaSqM: 26500,
    roofType: 'dome-heritage',
    facadeMaterial: 'granite-sandstone',
    facadeColorHex: '#cbd5e1', // Bangalore granite grey
    roofColorHex: '#f59e0b',   // Gold central dome
    nightEmissiveHex: '#fef08a',// Architectural accent warm floodlighting
    estimatedOccupancy: 4500,
    wardName: 'Sampangiram Nagar (Ward 110)',
    floodExposure: 'Low',
    hasPhotogrammetry: true,
    architecturalDetails: 'Neo-Dravidian architecture constructed entirely from Bangalore granite with central 18m dome crowned by 4-headed Ashoka Lion Capitol.',
  },
  {
    id: 'bldg-high-court',
    name: 'High Court of Karnataka (Attara Kacheri)',
    category: 'Government / Heritage',
    center: [12.9778, 77.5928],
    coordinates: [
      [12.9770, 77.5918],
      [12.9786, 77.5918],
      [12.9786, 77.5938],
      [12.9770, 77.5938],
      [12.9770, 77.5918],
    ],
    groundElevationM: 930.0,
    heightMeters: 32.0,
    floorCount: 2,
    footprintAreaSqM: 14200,
    roofType: 'terracotta-pitch',
    facadeMaterial: 'terracotta-brick',
    facadeColorHex: '#b91c1c', // Crimson red colonial stone
    roofColorHex: '#7f1d1d',
    nightEmissiveHex: '#fed7aa',
    estimatedOccupancy: 1800,
    wardName: 'Sampangiram Nagar (Ward 110)',
    floodExposure: 'Low',
    hasPhotogrammetry: true,
    architecturalDetails: 'Pompeian / Classical Greco-Roman red brick architecture built in 1868 facing Vidhana Soudha.',
  },
  {
    id: 'bldg-ub-tower',
    name: 'UB City - UB Tower (Flagship Skyscraper)',
    category: 'Commercial',
    center: [12.9718, 77.5958],
    coordinates: [
      [12.9710, 77.5950],
      [12.9726, 77.5950],
      [12.9726, 77.5966],
      [12.9710, 77.5966],
      [12.9710, 77.5950],
    ],
    groundElevationM: 924.0,
    heightMeters: 128.0,
    floorCount: 32,
    footprintAreaSqM: 9800,
    roofType: 'spire-tower',
    facadeMaterial: 'curtain-glass-blue',
    facadeColorHex: '#0284c7', // Reflective sapphire curtain glass
    roofColorHex: '#0f172a',
    nightEmissiveHex: '#38bdf8',// Glowing LED glass crown & office lattice
    estimatedOccupancy: 7500,
    wardName: 'Shantala Nagar (Ward 111)',
    floodExposure: 'Low',
    hasPhotogrammetry: true,
    architecturalDetails: '32-storey luxury commercial high-rise tower with distinctive crown spire, helipad, and integrated high-end retail plaza.',
  },
  {
    id: 'bldg-ub-canberra-concorde',
    name: 'UB City - Canberra & Concorde Towers',
    category: 'Commercial',
    center: [12.9705, 77.5962],
    coordinates: [
      [12.9696, 77.5954],
      [12.9712, 77.5954],
      [12.9712, 77.5972],
      [12.9696, 77.5972],
      [12.9696, 77.5954],
    ],
    groundElevationM: 923.0,
    heightMeters: 85.0,
    floorCount: 20,
    footprintAreaSqM: 12500,
    roofType: 'helipad',
    facadeMaterial: 'curtain-glass-amber',
    facadeColorHex: '#d97706',
    roofColorHex: '#334155',
    nightEmissiveHex: '#fef08a',
    estimatedOccupancy: 5200,
    wardName: 'Shantala Nagar (Ward 111)',
    floodExposure: 'Low',
  },
  {
    id: 'bldg-public-utility-mg',
    name: 'Subhash Chandra Bose Public Utility Building',
    category: 'Commercial',
    center: [12.9748, 77.6095],
    coordinates: [
      [12.9740, 77.6087],
      [12.9756, 77.6087],
      [12.9756, 77.6103],
      [12.9740, 77.6103],
      [12.9740, 77.6087],
    ],
    groundElevationM: 916.0,
    heightMeters: 106.0,
    floorCount: 25,
    footprintAreaSqM: 6400,
    roofType: 'flat-mechanical',
    facadeMaterial: 'concrete-brutalist',
    facadeColorHex: '#94a3b8',
    roofColorHex: '#475569',
    nightEmissiveHex: '#fde047',
    estimatedOccupancy: 3800,
    wardName: 'Bharathi Nagar (Ward 112)',
    floodExposure: 'Low',
    architecturalDetails: 'Historic 1973 25-storey concrete skyscraper overlooking MG Road and Mayo Hall.',
  },
  {
    id: 'bldg-chinnaswamy-stadium',
    name: 'M. Chinnaswamy International Cricket Stadium',
    category: 'Commercial',
    center: [12.9788, 77.5996],
    coordinates: [
      [12.9772, 77.5980],
      [12.9804, 77.5980],
      [12.9804, 77.6012],
      [12.9772, 77.6012],
      [12.9772, 77.5980],
    ],
    groundElevationM: 918.0,
    heightMeters: 38.0,
    floorCount: 4,
    footprintAreaSqM: 38500,
    roofType: 'atrium-glass',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#e2e8f0',
    roofColorHex: '#1e293b',
    nightEmissiveHex: '#67e8f9',
    estimatedOccupancy: 40000,
    wardName: 'Shivajinagar (Ward 92)',
    floodExposure: 'Low',
    architecturalDetails: 'World-first solar-powered cricket stadium with 40,000 capacity and state-of-the-art SubAir aeration vacuum drainage system.',
  },

  // --- B. BELLANDUR, ECOSPACE & OUTER RING ROAD TECH CORRIDOR ---
  {
    id: 'bldg-ecospace-blk-1-4',
    name: 'Ecospace Business Park (Blocks 1A-4B)',
    category: 'Tech Park',
    center: [12.9260, 77.6840],
    coordinates: [
      [12.9248, 77.6828],
      [12.9274, 77.6828],
      [12.9274, 77.6852],
      [12.9248, 77.6852],
      [12.9248, 77.6828],
    ],
    groundElevationM: 882.5,
    heightMeters: 44.0,
    floorCount: 9,
    footprintAreaSqM: 22000,
    roofType: 'helipad',
    facadeMaterial: 'curtain-glass-blue',
    facadeColorHex: '#0369a1',
    roofColorHex: '#334155',
    nightEmissiveHex: '#7dd3fc',
    estimatedOccupancy: 14500,
    wardName: 'Bellanduru (Ward 150)',
    floodExposure: 'Severe (Valley Bottom)',
    architecturalDetails: 'Major IT tech park located on the KC Valley depression between Bellandur Lake and Agara Lake, vulnerable to cloudburst backflow.',
  },
  {
    id: 'bldg-rmz-ecoworld-towers',
    name: 'RMZ Ecoworld Campus (Blocks 4A-4C, 5A)',
    category: 'Tech Park',
    center: [12.9215, 77.6865],
    coordinates: [
      [12.9202, 77.6852],
      [12.9228, 77.6852],
      [12.9228, 77.6880],
      [12.9202, 77.6880],
      [12.9202, 77.6852],
    ],
    groundElevationM: 883.2,
    heightMeters: 52.0,
    floorCount: 11,
    footprintAreaSqM: 28000,
    roofType: 'flat-mechanical',
    facadeMaterial: 'curtain-glass-blue',
    facadeColorHex: '#0284c7',
    roofColorHex: '#1e293b',
    nightEmissiveHex: '#38bdf8',
    estimatedOccupancy: 18000,
    wardName: 'Bellanduru (Ward 150)',
    floodExposure: 'High',
  },
  {
    id: 'bldg-sakra-world-hosp',
    name: 'Sakra World Hospital (Main Inpatient Block)',
    category: 'Hospital',
    center: [12.9248, 77.6830],
    coordinates: [
      [12.9240, 77.6822],
      [12.9256, 77.6822],
      [12.9256, 77.6838],
      [12.9240, 77.6838],
      [12.9240, 77.6822],
    ],
    groundElevationM: 885.0,
    heightMeters: 38.0,
    floorCount: 8,
    footprintAreaSqM: 8500,
    roofType: 'helipad',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#f8fafc',
    roofColorHex: '#dc2626', // Red cross helipad
    nightEmissiveHex: '#fef08a',
    estimatedOccupancy: 1400,
    wardName: 'Bellanduru (Ward 150)',
    floodExposure: 'Moderate',
  },
  {
    id: 'bldg-cessna-park',
    name: 'Cessna Business Park (Cisco Campus)',
    category: 'Tech Park',
    center: [12.9352, 77.6918],
    coordinates: [
      [12.9340, 77.6905],
      [12.9365, 77.6905],
      [12.9365, 77.6930],
      [12.9340, 77.6930],
      [12.9340, 77.6905],
    ],
    groundElevationM: 886.0,
    heightMeters: 40.0,
    floorCount: 8,
    footprintAreaSqM: 19500,
    roofType: 'flat-mechanical',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#e2e8f0',
    roofColorHex: '#475569',
    nightEmissiveHex: '#60a5fa',
    estimatedOccupancy: 11000,
    wardName: 'Marathahalli (Ward 85)',
    floodExposure: 'Moderate',
  },

  // --- C. HEBBAL, MANYATA TECH PARK & NORTH GATEWAY ---
  {
    id: 'bldg-manyata-tech-park',
    name: 'Manyata Embassy Business Park (Blocks D1-D4)',
    category: 'Tech Park',
    center: [13.0485, 77.6235],
    coordinates: [
      [13.0470, 77.6215],
      [13.0500, 77.6215],
      [13.0500, 77.6255],
      [13.0470, 77.6255],
      [13.0470, 77.6215],
    ],
    groundElevationM: 890.8,
    heightMeters: 46.0,
    floorCount: 10,
    footprintAreaSqM: 32000,
    roofType: 'flat-mechanical',
    facadeMaterial: 'curtain-glass-blue',
    facadeColorHex: '#0ea5e9',
    roofColorHex: '#334155',
    nightEmissiveHex: '#bae6fd',
    estimatedOccupancy: 25000,
    wardName: 'Nagavara (Ward 24)',
    floodExposure: 'High',
    architecturalDetails: '300-acre integrated business township in the Nagavara / Hebbal Valley basin.',
  },
  {
    id: 'bldg-aster-cmi-hosp',
    name: 'Aster CMI Hospital & Medical Institute',
    category: 'Hospital',
    center: [13.0560, 77.5910],
    coordinates: [
      [13.0550, 77.5898],
      [13.0570, 77.5898],
      [13.0570, 77.5922],
      [13.0550, 77.5922],
      [13.0550, 77.5898],
    ],
    groundElevationM: 902.5,
    heightMeters: 42.0,
    floorCount: 9,
    footprintAreaSqM: 9200,
    roofType: 'helipad',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#f1f5f9',
    roofColorHex: '#ef4444',
    nightEmissiveHex: '#fef08a',
    estimatedOccupancy: 1200,
    wardName: 'Hebbal (Ward 21)',
    floodExposure: 'Low',
  },
  {
    id: 'bldg-world-trade-center-blr',
    name: 'World Trade Center (WTC) Bangalore - Brigade Gateway',
    category: 'Commercial',
    center: [13.0125, 77.5555],
    coordinates: [
      [13.0115, 77.5545],
      [13.0135, 77.5545],
      [13.0135, 77.5565],
      [13.0115, 77.5565],
      [13.0115, 77.5545],
    ],
    groundElevationM: 935.0,
    heightMeters: 132.0,
    floorCount: 32,
    footprintAreaSqM: 11500,
    roofType: 'helipad',
    facadeMaterial: 'curtain-glass-blue',
    facadeColorHex: '#0284c7',
    roofColorHex: '#0f172a',
    nightEmissiveHex: '#38bdf8',
    estimatedOccupancy: 8000,
    wardName: 'Subramanyanagar (Ward 66)',
    floodExposure: 'Low',
    hasPhotogrammetry: true,
    architecturalDetails: '32-storey commercial tower in Rajajinagar, certified LEED Gold with panoramic views of West Bangalore.',
  },

  // --- D. WHITEFIELD TECH PARK & ITPL ---
  {
    id: 'bldg-itpl-discoverer',
    name: 'ITPL - International Tech Park (Discoverer Building)',
    category: 'Tech Park',
    center: [12.9868, 77.7285],
    coordinates: [
      [12.9855, 77.7272],
      [12.9880, 77.7272],
      [12.9880, 77.7298],
      [12.9855, 77.7298],
      [12.9855, 77.7272],
    ],
    groundElevationM: 888.0,
    heightMeters: 65.0,
    floorCount: 14,
    footprintAreaSqM: 24000,
    roofType: 'flat-mechanical',
    facadeMaterial: 'curtain-glass-blue',
    facadeColorHex: '#0284c7',
    roofColorHex: '#1e293b',
    nightEmissiveHex: '#67e8f9',
    estimatedOccupancy: 16000,
    wardName: 'Hagadur (Ward 84)',
    floodExposure: 'Moderate',
    architecturalDetails: 'Landmark tech park established in 1994, pioneer of Indias IT boom with distinctive cylindrical glass atrium.',
  },

  // --- E. ELECTRONIC CITY & SOUTHERN CORRIDOR ---
  {
    id: 'bldg-infosys-pyramids-ecity',
    name: 'Infosys Campus (Pyramids & Heritage Towers)',
    category: 'Tech Park',
    center: [12.8465, 77.6645],
    coordinates: [
      [12.8450, 77.6630],
      [12.8480, 77.6630],
      [12.8480, 77.6660],
      [12.8450, 77.6660],
      [12.8450, 77.6630],
    ],
    groundElevationM: 896.0,
    heightMeters: 42.0,
    floorCount: 8,
    footprintAreaSqM: 35000,
    roofType: 'atrium-glass',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#f1f5f9',
    roofColorHex: '#0284c7',
    nightEmissiveHex: '#93c5fd',
    estimatedOccupancy: 22000,
    wardName: 'Electronic City Phase 1',
    floodExposure: 'Low',
    architecturalDetails: 'Sprawling 81-acre software campus featuring dramatic glass pyramid structures, floating auditorium, and solar micro-grid.',
  },
  {
    id: 'bldg-mantri-pinnacle',
    name: 'Mantri DSK Pinnacle (South Bangalore Landmark Tower)',
    category: 'Residential High-Rise',
    center: [12.8872, 77.6015],
    coordinates: [
      [12.8862, 77.6005],
      [12.8882, 77.6005],
      [12.8882, 77.6025],
      [12.8862, 77.6025],
      [12.8862, 77.6005],
    ],
    groundElevationM: 915.0,
    heightMeters: 153.0,
    floorCount: 46,
    footprintAreaSqM: 7800,
    roofType: 'helipad',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#ffffff',
    roofColorHex: '#334155',
    nightEmissiveHex: '#fef08a',
    estimatedOccupancy: 1800,
    wardName: 'Hulimavu (Ward 193)',
    floodExposure: 'Low',
    hasPhotogrammetry: true,
    architecturalDetails: 'Tallest residential tower in South India at 153m with 46 storeys, sky lounge, and private helipad.',
  },
  {
    id: 'bldg-kendriya-vihar-towers',
    name: 'Kendriya Vihar Residential Towers (Blocks A-F)',
    category: 'Residential High-Rise',
    center: [13.1120, 77.6045],
    coordinates: [
      [13.1105, 77.6030],
      [13.1135, 77.6030],
      [13.1135, 77.6065],
      [13.1105, 77.6065],
      [13.1105, 77.6030],
    ],
    groundElevationM: 902.0,
    heightMeters: 48.0,
    floorCount: 14,
    footprintAreaSqM: 21000,
    roofType: 'flat-mechanical',
    facadeMaterial: 'modern-composite-white',
    facadeColorHex: '#cbd5e1',
    roofColorHex: '#475569',
    nightEmissiveHex: '#fef08a',
    estimatedOccupancy: 4500,
    wardName: 'Yelahanka (Ward 4)',
    floodExposure: 'High',
    architecturalDetails: 'Large residential complex adjacent to Yelahanka lake surplus weir subject to backwater flooding during 2022 cloudbursts.',
  },
];

// -------------------------------------------------------------
// 4. Elevated Flyovers, Expressways, Bridges & Namma Metro Lines
// -------------------------------------------------------------
export const BENGALURU_ELEVATED_INFRASTRUCTURE: ElevatedInfrastructure3D[] = [
  // 1. Electronic City Elevated Expressway (NH 44)
  {
    id: 'infra-ecity-expressway',
    name: 'Electronic City Elevated Expressway (NH 44)',
    type: 'Elevated Expressway',
    clearanceHeightMeters: 14.0, // 14m elevated clearance above Hosur Rd
    deckWidthMeters: 18.0,       // 4-lane dual carriageway
    deckColorHex: '#334155',     // Asphalt slate
    pierSpacingMeters: 40.0,
    accentColorHex: '#38bdf8',
    status: 'Passable',
    structuralDescription: '9.98 km toll expressway elevated on concrete piers from Central Silk Board to Electronic City Phase 1.',
    points: [
      [12.9181, 77.6234], // Silk Board Junction
      [12.9050, 77.6320], // Bommanahalli
      [12.8900, 77.6410], // Garvebhavipalya
      [12.8750, 77.6490], // Kudlu Gate
      [12.8600, 77.6570], // Singasandra
      [12.8480, 77.6640], // Electronic City Toll Plaza
    ],
  },

  // 2. Silk Board Multi-Tier Flyover & Interchange
  {
    id: 'infra-silk-board-flyover',
    name: 'Central Silk Board Multi-Tier Interchange',
    type: 'Overpass Flyover',
    clearanceHeightMeters: 12.0,
    deckWidthMeters: 14.0,
    deckColorHex: '#1e293b',
    pierSpacingMeters: 35.0,
    accentColorHex: '#f59e0b',
    status: 'Passable',
    structuralDescription: 'Critical road & metro junction connecting BTM Layout, HSR Layout, and Outer Ring Road.',
    points: [
      [12.9160, 77.6180], // BTM approach
      [12.9175, 77.6225],
      [12.9185, 77.6250], // Silk Board median
      [12.9195, 77.6290], // HSR approach
    ],
  },

  // 3. Hebbal Multi-Tier Interchange Flyover
  {
    id: 'infra-hebbal-flyover',
    name: 'Hebbal Multi-Tier Flyover Interchange',
    type: 'Overpass Flyover',
    clearanceHeightMeters: 16.0,
    deckWidthMeters: 16.0,
    deckColorHex: '#1e293b',
    pierSpacingMeters: 38.0,
    accentColorHex: '#10b981',
    status: 'Passable',
    structuralDescription: 'Complex multi-level cloverleaf crossing Indian Railways tracks and connecting NH 44 Airport Highway.',
    points: [
      [13.0320, 77.5880], // Baptist approach
      [13.0360, 77.5900], // Overpass over railway
      [13.0410, 77.5920], // Hebbal lake causeway
      [13.0460, 77.5940], // Airport expressway merge
    ],
  },

  // 4. Domlur / Inner Ring Road Flyover
  {
    id: 'infra-domlur-flyover',
    name: 'Domlur Inner Ring Road Flyover',
    type: 'Overpass Flyover',
    clearanceHeightMeters: 10.0,
    deckWidthMeters: 14.0,
    deckColorHex: '#334155',
    pierSpacingMeters: 30.0,
    status: 'Passable',
    structuralDescription: 'Elevated bypass carrying Inner Ring Road over Old Airport Road junction.',
    points: [
      [12.9570, 77.6380],
      [12.9610, 77.6400],
      [12.9645, 77.6415],
      [12.9680, 77.6430],
    ],
  },

  // 5. Namma Metro Purple Line (Elevated Viaduct)
  {
    id: 'infra-metro-purple-line',
    name: 'Namma Metro (Purple Line Elevated Viaduct)',
    type: 'Metro Viaduct',
    clearanceHeightMeters: 12.5,
    deckWidthMeters: 9.2,
    deckColorHex: '#475569',
    pierSpacingMeters: 28.0,
    accentColorHex: '#a855f7', // Signature Purple
    status: 'Passable',
    structuralDescription: 'Elevated rail transit corridor carrying BMRCL trainsets on continuous pre-stressed concrete U-girders.',
    points: [
      [12.9750, 77.6080], // MG Road Station
      [12.9755, 77.6160], // Trinity
      [12.9760, 77.6250], // Halasuru
      [12.9780, 77.6380], // Indiranagar
      [12.9810, 77.6520], // Swami Vivekananda Rd
      [12.9850, 77.6630], // Baiyappanahalli
    ],
  },

  // 6. Namma Metro Green Line (Elevated Viaduct)
  {
    id: 'infra-metro-green-line',
    name: 'Namma Metro (Green Line Elevated Viaduct)',
    type: 'Metro Viaduct',
    clearanceHeightMeters: 12.0,
    deckWidthMeters: 9.2,
    deckColorHex: '#475569',
    pierSpacingMeters: 28.0,
    accentColorHex: '#22c55e', // Signature Green
    status: 'Passable',
    structuralDescription: 'Elevated north-south transit spine spanning from Majestic across Rajajinagar to Yeshwanthpur.',
    points: [
      [12.9780, 77.5700], // Majestic
      [12.9880, 77.5600], // Srirampura
      [12.9980, 77.5540], // Rajajinagar
      [13.0080, 77.5500], // Mahalakshmi
      [13.0180, 77.5480], // Yeshwanthpur
    ],
  },

  // 7. Ulsoor Lake Causeway & Lakeside Bridge
  {
    id: 'infra-ulsoor-bridge',
    name: 'Ulsoor Lake Causeway & Bund Road',
    type: 'Lakeside Bridge',
    clearanceHeightMeters: 4.5,
    deckWidthMeters: 12.0,
    deckColorHex: '#475569',
    pierSpacingMeters: 20.0,
    accentColorHex: '#0284c7',
    status: 'Passable',
    structuralDescription: 'Historic lakeside road bridge separating Ulsoor Lake waters from Kensington Road buffers.',
    points: [
      [12.9810, 77.6180],
      [12.9825, 77.6210],
      [12.9835, 77.6240],
    ],
  },
];

// -------------------------------------------------------------
// 5. Apple Maps-Inspired Cinematic 3D City Flyovers
// -------------------------------------------------------------
export const BENGALURU_FLYOVER_PATHS: FlyoverPath[] = [
  {
    id: 'flyover-cbd-heritage',
    title: 'Heritage Core & Central Skyline',
    subtitle: 'Vidhana Soudha → Cubbon Park → UB City → MG Road → Ulsoor Lake',
    totalDurationSeconds: 45,
    waypoints: [
      {
        id: 'wp-vidhana-approach',
        name: 'Vidhana Soudha High Grounds',
        latitude: 12.9760,
        longitude: 77.5907,
        altitudeMeters: 380,
        headingDegrees: 10,
        pitchDegrees: -25,
        durationSeconds: 8,
        description: 'Sweeping view over the granite pillars and gold dome of Vidhana Soudha.',
      },
      {
        id: 'wp-cubbon-canopy',
        name: 'Cubbon Park Green Canopy',
        latitude: 12.9740,
        longitude: 77.5925,
        altitudeMeters: 280,
        headingDegrees: 140,
        pitchDegrees: -30,
        durationSeconds: 10,
        description: 'Gliding above 300 acres of lush botanical canopy in the heart of Bengaluru.',
      },
      {
        id: 'wp-ub-city-orbit',
        name: 'UB City Skyscraper Cluster',
        latitude: 12.9718,
        longitude: 77.5958,
        altitudeMeters: 320,
        headingDegrees: 60,
        pitchDegrees: -28,
        durationSeconds: 12,
        description: 'Orbiting the 128m glass spire of UB Tower and Canberra Luxury Plaza.',
      },
      {
        id: 'wp-mg-road-metro',
        name: 'MG Road Boulevard & Purple Metro',
        latitude: 12.9748,
        longitude: 77.6095,
        altitudeMeters: 250,
        headingDegrees: 80,
        pitchDegrees: -22,
        durationSeconds: 8,
        description: 'Tracking along the elevated Purple Line metro viaduct and Public Utility Building.',
      },
      {
        id: 'wp-ulsoor-lake-water',
        name: 'Ulsoor Lake Water Basin',
        latitude: 12.9825,
        longitude: 77.6210,
        altitudeMeters: 300,
        headingDegrees: 45,
        pitchDegrees: -35,
        durationSeconds: 7,
        description: 'Panoramic finale over the shimmering islands and waters of Ulsoor Lake.',
      },
    ],
  },
  {
    id: 'flyover-silicon-valley',
    title: 'Silicon Plateau & KC Valley Tech Corridor',
    subtitle: 'Indiranagar → Koramangala → Bellandur Lake → Ecospace Business Park',
    totalDurationSeconds: 50,
    waypoints: [
      {
        id: 'wp-indiranagar-start',
        name: 'Indiranagar 100ft Road',
        latitude: 12.9710,
        longitude: 77.6410,
        altitudeMeters: 350,
        headingDegrees: 170,
        pitchDegrees: -25,
        durationSeconds: 10,
        description: 'Overlooking Indiranagar residential avenues and commercial hub.',
      },
      {
        id: 'wp-koramangala-basin',
        name: 'Koramangala 4th Block Depression',
        latitude: 12.9348,
        longitude: 77.6251,
        altitudeMeters: 260,
        headingDegrees: 110,
        pitchDegrees: -30,
        durationSeconds: 12,
        description: 'Cruising over the stormwater drainage channels of the KC Valley basin.',
      },
      {
        id: 'wp-bellandur-lake-bed',
        name: 'Bellandur Lake Wetland Expanse',
        latitude: 12.9350,
        longitude: 77.6650,
        altitudeMeters: 280,
        headingDegrees: 95,
        pitchDegrees: -28,
        durationSeconds: 14,
        description: 'Flying across Bengalurus largest natural lake basin and wetland buffer.',
      },
      {
        id: 'wp-ecospace-park',
        name: 'Ecospace & RMZ Ecoworld Campus',
        latitude: 12.9240,
        longitude: 77.6840,
        altitudeMeters: 220,
        headingDegrees: 70,
        pitchDegrees: -25,
        durationSeconds: 14,
        description: 'Close-up perspective of the Outer Ring Road tech high-rises and storm drains.',
      },
    ],
  },
  {
    id: 'flyover-north-gateway',
    title: 'Northern Gateways & Basins',
    subtitle: 'Malleswaram Ridge → Sankey Tank → Hebbal Flyover → Manyata Tech Park',
    totalDurationSeconds: 40,
    waypoints: [
      {
        id: 'wp-malleswaram',
        name: 'Malleswaram High Ridge',
        latitude: 13.0030,
        longitude: 77.5680,
        altitudeMeters: 340,
        headingDegrees: 35,
        pitchDegrees: -25,
        durationSeconds: 10,
        description: 'Elevated view across historic tree-lined avenues on Bengalurus northern ridge.',
      },
      {
        id: 'wp-sankey-tank',
        name: 'Sankey Tank Water Mirror',
        latitude: 13.0080,
        longitude: 77.5740,
        altitudeMeters: 240,
        headingDegrees: 20,
        pitchDegrees: -32,
        durationSeconds: 10,
        description: 'Reflective water surface of Sankey Tank built in 1882.',
      },
      {
        id: 'wp-hebbal-cloverleaf',
        name: 'Hebbal Multi-Tier Interchange',
        latitude: 13.0380,
        longitude: 77.5910,
        altitudeMeters: 260,
        headingDegrees: 45,
        pitchDegrees: -30,
        durationSeconds: 10,
        description: 'Watching traffic flow along the multi-level elevated highway flyover.',
      },
      {
        id: 'wp-manyata-finale',
        name: 'Manyata Embassy Business Park',
        latitude: 13.0485,
        longitude: 77.6235,
        altitudeMeters: 290,
        headingDegrees: 85,
        pitchDegrees: -25,
        durationSeconds: 10,
        description: 'Gliding over 100,000 workforce tech towers in Nagavara valley.',
      },
    ],
  },
  {
    id: 'flyover-south-expressway',
    title: 'Southern Basins & Electronic City Highway',
    subtitle: 'Jayanagar → Silk Board Junction → Electronic City 10km Elevated Expressway',
    totalDurationSeconds: 45,
    waypoints: [
      {
        id: 'wp-jayanagar-grid',
        name: 'Jayanagar Planned Grid',
        latitude: 12.9300,
        longitude: 77.5830,
        altitudeMeters: 380,
        headingDegrees: 120,
        pitchDegrees: -30,
        durationSeconds: 10,
        description: 'Orderly residential blocks of one of Asias earliest planned layouts.',
      },
      {
        id: 'wp-silk-board-hub',
        name: 'Central Silk Board Flyover Hub',
        latitude: 12.9181,
        longitude: 77.6234,
        altitudeMeters: 280,
        headingDegrees: 140,
        pitchDegrees: -26,
        durationSeconds: 12,
        description: 'Bengalurus most notorious transit bottleneck and multi-level flyovers.',
      },
      {
        id: 'wp-ecity-highway-flight',
        name: 'Electronic City 14m Elevated Expressway',
        latitude: 12.8750,
        longitude: 77.6490,
        altitudeMeters: 230,
        headingDegrees: 155,
        pitchDegrees: -20,
        durationSeconds: 13,
        description: 'Low flight directly parallel to the elevated expressway above Hosur Road.',
      },
      {
        id: 'wp-infosys-pyramids',
        name: 'Electronic City Tech Campuses',
        latitude: 12.8465,
        longitude: 77.6645,
        altitudeMeters: 280,
        headingDegrees: 160,
        pitchDegrees: -28,
        durationSeconds: 10,
        description: 'Final orbit over the Infosys Pyramids and Wipro software hubs.',
      },
    ],
  },
];

// -------------------------------------------------------------
// 6. Landmark & Location Search Index
// -------------------------------------------------------------
export const BENGALURU_LANDMARK_SEARCH_INDEX: LandmarkSearchItem[] = [
  {
    id: 'search-vidhana-soudha',
    name: 'Vidhana Soudha',
    category: 'Heritage',
    latitude: 12.9796,
    longitude: 77.5907,
    elevationMeters: 932.0,
    recommendedPitch: -30,
    recommendedHeading: 10,
    recommendedAltitude: 450,
    description: 'Seat of Karnataka State Legislature, built in Neo-Dravidian architectural style.',
    ward: 'Sampangiram Nagar (Ward 110)',
  },
  {
    id: 'search-ub-city',
    name: 'UB City (UB Tower)',
    category: 'Landmark',
    latitude: 12.9718,
    longitude: 77.5958,
    elevationMeters: 924.0,
    recommendedPitch: -28,
    recommendedHeading: 45,
    recommendedAltitude: 350,
    description: '128m high-rise commercial tower and luxury lifestyle retail pavilion.',
    ward: 'Shantala Nagar (Ward 111)',
  },
  {
    id: 'search-ecospace',
    name: 'Ecospace Business Park (Outer Ring Road)',
    category: 'Tech Park',
    latitude: 12.9260,
    longitude: 77.6840,
    elevationMeters: 882.5,
    recommendedPitch: -32,
    recommendedHeading: 60,
    recommendedAltitude: 380,
    description: 'Major IT tech park in the Bellandur floodplain, sensitive to cloudburst accumulation.',
    ward: 'Bellanduru (Ward 150)',
  },
  {
    id: 'search-rmz-ecoworld',
    name: 'RMZ Ecoworld',
    category: 'Tech Park',
    latitude: 12.9215,
    longitude: 77.6865,
    elevationMeters: 883.2,
    recommendedPitch: -30,
    recommendedHeading: 75,
    recommendedAltitude: 400,
    description: 'LEED Platinum multi-tower software campus on Sarjapur-Marathahalli corridor.',
    ward: 'Bellanduru (Ward 150)',
  },
  {
    id: 'search-manyata',
    name: 'Manyata Embassy Business Park',
    category: 'Tech Park',
    latitude: 13.0485,
    longitude: 77.6235,
    elevationMeters: 890.8,
    recommendedPitch: -28,
    recommendedHeading: 40,
    recommendedAltitude: 450,
    description: 'North Bengalurus largest IT business park spanning 300 acres.',
    ward: 'Nagavara (Ward 24)',
  },
  {
    id: 'search-silk-board',
    name: 'Central Silk Board Flyover & Junction',
    category: 'Transit Hub',
    latitude: 12.9181,
    longitude: 77.6234,
    elevationMeters: 886.0,
    recommendedPitch: -35,
    recommendedHeading: 130,
    recommendedAltitude: 400,
    description: 'Key southern junction linking BTM, HSR, Hosur Road and Electronic City Expressway.',
    ward: 'Madivala (Ward 172)',
  },
  {
    id: 'search-electronic-city',
    name: 'Electronic City Phase 1 (Infosys / Wipro)',
    category: 'Tech Park',
    latitude: 12.8465,
    longitude: 77.6645,
    elevationMeters: 896.0,
    recommendedPitch: -30,
    recommendedHeading: 160,
    recommendedAltitude: 500,
    description: 'Premier electronic and software manufacturing zone at the end of NH 44 Expressway.',
    ward: 'Electronic City',
  },
  {
    id: 'search-hebbal-flyover',
    name: 'Hebbal Multi-Tier Flyover & Lake',
    category: 'Flyover',
    latitude: 13.0380,
    longitude: 77.5910,
    elevationMeters: 892.0,
    recommendedPitch: -32,
    recommendedHeading: 45,
    recommendedAltitude: 480,
    description: 'Cloverleaf junction connecting Bangalore City to Kempegowda International Airport.',
    ward: 'Hebbal (Ward 21)',
  },
  {
    id: 'search-bellandur-lake',
    name: 'Bellandur Lake & Outlet Weir',
    category: 'Lake',
    latitude: 12.9350,
    longitude: 77.6750,
    elevationMeters: 884.6,
    recommendedPitch: -38,
    recommendedHeading: 90,
    recommendedAltitude: 600,
    description: '900-acre natural water reservoir draining Koramangala-Challaghatta valley.',
    ward: 'Bellanduru (Ward 150)',
  },
  {
    id: 'search-ulsoor-lake',
    name: 'Ulsoor Lake',
    category: 'Lake',
    latitude: 12.9825,
    longitude: 77.6210,
    elevationMeters: 894.2,
    recommendedPitch: -35,
    recommendedHeading: 45,
    recommendedAltitude: 420,
    description: '120-acre urban lake built by Kempe Gowda II, popular for boating and promenades.',
    ward: 'Halasuru (Ward 90)',
  },
  {
    id: 'search-sankey-tank',
    name: 'Sankey Tank (Sadashivanagar)',
    category: 'Lake',
    latitude: 13.0080,
    longitude: 77.5740,
    elevationMeters: 918.0,
    recommendedPitch: -35,
    recommendedHeading: 20,
    recommendedAltitude: 380,
    description: 'Man-made lake built by Col. Richard Sankey in 1882 to supply Bengalurus drinking water.',
    ward: 'Aramane Nagar (Ward 35)',
  },
  {
    id: 'search-sakra-hospital',
    name: 'Sakra World Hospital',
    category: 'Hospital',
    latitude: 12.9248,
    longitude: 77.6830,
    elevationMeters: 885.0,
    recommendedPitch: -28,
    recommendedHeading: 70,
    recommendedAltitude: 320,
    description: 'Multispecialty tertiary hospital with rooftop helipad and critical care hub.',
    ward: 'Bellanduru (Ward 150)',
  },
  {
    id: 'search-itpl',
    name: 'ITPL (International Tech Park Bangalore)',
    category: 'Tech Park',
    latitude: 12.9868,
    longitude: 77.7285,
    elevationMeters: 888.0,
    recommendedPitch: -30,
    recommendedHeading: 85,
    recommendedAltitude: 450,
    description: 'Iconic tech park in Whitefield with Discoverer, Innovator and Creator complexes.',
    ward: 'Hagadur (Ward 84)',
  },
  {
    id: 'search-world-trade-center',
    name: 'World Trade Center Bangalore (WTC)',
    category: 'Landmark',
    latitude: 13.0125,
    longitude: 77.5555,
    elevationMeters: 935.0,
    recommendedPitch: -28,
    recommendedHeading: 110,
    recommendedAltitude: 400,
    description: '32-storey commercial skyscraper in Brigade Gateway, Rajajinagar.',
    ward: 'Subramanyanagar (Ward 66)',
  },
  {
    id: 'search-mantri-pinnacle',
    name: 'Mantri DSK Pinnacle (153m Tower)',
    category: 'Landmark',
    latitude: 12.8872,
    longitude: 77.6015,
    elevationMeters: 915.0,
    recommendedPitch: -25,
    recommendedHeading: 15,
    recommendedAltitude: 380,
    description: '153-meter 46-storey luxury skyscraper in South Bengaluru.',
    ward: 'Hulimavu (Ward 193)',
  },
];

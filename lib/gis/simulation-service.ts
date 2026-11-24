// FLOODGUARD AI - Hydrological Flood Inundation Simulation Engine
// Based on SCS Runoff Curve Number (USDA-SCS) & DEM Topographic Depression Filling

import { getElevationAt } from './dem-data';
import { RainfallScenarioPreset, SimulationParameters, SimulationResult } from '@/lib/types/gis';

// Key critical civic facilities inventory for infrastructure vulnerability scoring
interface Facility {
  name: string;
  type: 'Hospital' | 'School' | 'Tech Park' | 'Fire Station' | 'Transit Hub';
  lat: number;
  lng: number;
}

const CIVIC_FACILITIES: Facility[] = [
  { name: 'Sakra World Hospital (Bellandur)', type: 'Hospital', lat: 12.9248, lng: 77.6830 },
  { name: 'Manipal Hospital (Old Airport Rd)', type: 'Hospital', lat: 12.9580, lng: 77.6480 },
  { name: 'Columbia Asia / Manipal (Hebbal)', type: 'Hospital', lat: 13.0470, lng: 77.5920 },
  { name: 'Motherhood Hospital (Sarjapur Rd)', type: 'Hospital', lat: 12.9140, lng: 77.6780 },
  { name: 'Aster CMI Hospital (Hebbal)', type: 'Hospital', lat: 13.0560, lng: 77.5910 },
  { name: 'Ecospace Business Park', type: 'Tech Park', lat: 12.9260, lng: 77.6840 },
  { name: 'RMZ Ecoworld Tech Park', type: 'Tech Park', lat: 12.9210, lng: 77.6870 },
  { name: 'Manyata Embassy Business Park', type: 'Tech Park', lat: 13.0485, lng: 77.6235 },
  { name: 'Bagmane Tech Park (CV Raman Nagar)', type: 'Tech Park', lat: 12.9790, lng: 77.6620 },
  { name: 'ITPL International Tech Park', type: 'Tech Park', lat: 12.9863, lng: 77.7314 },
  { name: 'Delhi Public School (Bangalore East)', type: 'School', lat: 12.9150, lng: 77.7200 },
  { name: 'Kendriya Vidyalaya (Hebbal)', type: 'School', lat: 13.0380, lng: 77.5890 },
  { name: 'National Public School (HSR)', type: 'School', lat: 12.9140, lng: 77.6430 },
  { name: 'Sarjapur Road Fire Station', type: 'Fire Station', lat: 12.9170, lng: 77.6680 },
  { name: 'Hebbal Fire & Rescue Station', type: 'Fire Station', lat: 13.0360, lng: 77.5970 },
  { name: 'Central Silk Board BMTC Transit Hub', type: 'Transit Hub', lat: 12.9181, lng: 77.6234 },
  { name: 'KR Puram Multi-modal Railway Station', type: 'Transit Hub', lat: 12.9980, lng: 77.6780 },
];

const ARTERIAL_ROADS = [
  { name: 'Outer Ring Road (ORR - Marathahalli to Silk Board)', lat: 12.9280, lng: 77.6820 },
  { name: 'Sarjapur Main Road (Kaikondrahalli Corridor)', lat: 12.9120, lng: 77.6800 },
  { name: 'Ballari Road / Airport Expressway (Hebbal Flyover)', lat: 13.0380, lng: 77.5920 },
  { name: 'Hosur Road Expressway (Silk Board Underpass)', lat: 12.9175, lng: 77.6225 },
  { name: '100 Feet Road (Indiranagar)', lat: 12.9750, lng: 77.6410 },
  { name: 'Thanisandra Main Road (Manyata Corridor)', lat: 13.0500, lng: 77.6250 },
  { name: 'Varthur-Gunjur Main Road', lat: 12.9380, lng: 77.7350 },
];

/**
 * Executes a Topographic Inundation Simulation
 * Combines SCS-CN Runoff calculations with Digital Elevation Model depression filling.
 */
export function runFloodSimulation(params: SimulationParameters): SimulationResult {
  const { targetLocation, rainfallScenarioMm, rainfallDurationHours, targetWaterLevelMeters } = params;

  // SCS Runoff Curve Number calculation
  // P = Total rainfall in mm
  // Urban paved CN = 90
  const CN = 90;
  const P = rainfallScenarioMm;
  const S = (25400 / CN) - 254; // Potential maximum retention (~28.2 mm)
  const Ia = 0.2 * S; // Initial abstraction (~5.6 mm)

  let directRunoffMm = 0;
  if (P > Ia) {
    directRunoffMm = Math.pow(P - Ia, 2) / (P + 0.8 * S);
  }

  // Effective flood stage rise based on water level selection and runoff
  const floodStageMeters = Math.min(
    3.5,
    targetWaterLevelMeters + (directRunoffMm / 100) * 0.45 * Math.sqrt(rainfallDurationHours / 2)
  );

  const centerLat = targetLocation.latitude;
  const centerLng = targetLocation.longitude;
  const centerElev = getElevationAt(centerLat, centerLng);

  // Inundation radius expands with rainfall scenario & duration
  const baseRadiusKm = 0.4 + (rainfallScenarioMm / 200) * 1.6 * (rainfallDurationHours / 4);

  // Compute realistic topographically constrained perimeter
  const numRays = 24;
  const polygonPoints: [number, number][] = [];

  for (let i = 0; i <= numRays; i++) {
    const angle = (i / numRays) * 2 * Math.PI;
    // Radial ray marching across DEM
    let rayDistanceKm = baseRadiusKm;
    
    // Check elevation along ray: water stops when terrain rises above centerElev + floodStageMeters
    for (let step = 0.2; step <= 2.8; step += 0.2) {
      const stepKm = baseRadiusKm * (step / 1.5);
      const testLat = centerLat + (stepKm / 111.0) * Math.sin(angle);
      const testLng = centerLng + (stepKm / (111.0 * Math.cos((centerLat * Math.PI) / 180))) * Math.cos(angle);
      const elev = getElevationAt(testLat, testLng);

      if (elev > centerElev + floodStageMeters) {
        rayDistanceKm = stepKm;
        break;
      }
    }

    const pLat = centerLat + (rayDistanceKm / 111.0) * Math.sin(angle);
    const pLng = centerLng + (rayDistanceKm / (111.0 * Math.cos((centerLat * Math.PI) / 180))) * Math.cos(angle);
    polygonPoints.push([Math.round(pLat * 10000) / 10000, Math.round(pLng * 10000) / 10000]);
  }

  // Inundation area & runoff volume
  const avgRadiusM = baseRadiusKm * 1000;
  const inundationAreaSqKm = Math.round((Math.PI * Math.pow(baseRadiusKm, 2) * 0.72) * 100) / 100;
  const totalRunoffVolumeM3 = Math.round(inundationAreaSqKm * 1000000 * (directRunoffMm / 1000));

  // Depth contours (slices from 0.2m up to floodStageMeters)
  const depthIntervals = [0.2, 0.5, 1.0, 1.5, 2.0, 2.5].filter((d) => d <= floodStageMeters);
  const depthContours = depthIntervals.map((d) => {
    const ratio = Math.sqrt(d / floodStageMeters);
    const contourPoints = polygonPoints.map(([lat, lng]) => [
      centerLat + (lat - centerLat) * ratio,
      centerLng + (lng - centerLng) * ratio,
    ]) as [number, number][];
    return {
      depthMeters: d,
      contourPoints,
    };
  });

  // Evaluate affected roads
  const submergedRoadNames: string[] = [];
  for (const road of ARTERIAL_ROADS) {
    const dLat = (road.lat - centerLat) * 111.0;
    const dLng = (road.lng - centerLng) * 111.0 * Math.cos((centerLat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist <= baseRadiusKm * 1.25) {
      submergedRoadNames.push(road.name);
    }
  }

  // Evaluate affected civic facilities
  const facilitiesList: SimulationResult['affectedInfrastructure']['facilitiesList'] = [];
  for (const f of CIVIC_FACILITIES) {
    const dLat = (f.lat - centerLat) * 111.0;
    const dLng = (f.lng - centerLng) * 111.0 * Math.cos((centerLat * Math.PI) / 180);
    const distM = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1000);

    const isSubmerged = distM <= avgRadiusM && getElevationAt(f.lat, f.lng) <= centerElev + floodStageMeters;

    if (distM < 3500) {
      facilitiesList.push({
        name: f.name,
        type: f.type,
        distanceFromFloodCenterM: distM,
        submerged: isSubmerged,
      });
    }
  }

  const submergedKm = Math.round(submergedRoadNames.length * 1.8 * 10) / 10;
  const criticalFacilitiesCount = facilitiesList.filter((f) => f.submerged).length;
  const estimatedPeopleImpacted = Math.round(inundationAreaSqKm * 4200); // 4,200 people/km² avg density

  return {
    scenarioMm: rainfallScenarioMm,
    durationHours: rainfallDurationHours,
    simulatedWaterLevelMeters: Math.round(floodStageMeters * 100) / 100,
    totalRunoffVolumeM3,
    inundationAreaSqKm,
    inundationPolygon: polygonPoints,
    depthContours,
    affectedInfrastructure: {
      roadsSubmergedKm: submergedKm,
      submergedRoadNames,
      criticalFacilitiesCount,
      facilitiesList,
      estimatedPeopleImpacted,
    },
    modelDisclaimer:
      'Hydrological Scenario Model (SCS-CN Runoff & DEM Topographic Inundation). Illustrative planning scenario; not an official flood prediction.',
  };
}


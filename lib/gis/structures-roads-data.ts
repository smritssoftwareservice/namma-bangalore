// FLOODGUARD AI - Surveyed Building Structures & Road Corridor Inventory
// Enables precise spatial intersection with modeled flood inundation zones

import { FloodAffectedRoadSegment, FloodedBuilding } from '@/lib/types/gis';
import { getElevationAt } from './dem-data';

// Surveyed Building Structures in Bengaluru Flood Basins
export const BENGALURU_STRUCTURES: FloodedBuilding[] = [
  // Bellandur & Ecospace Basin
  {
    id: 'bldg-ecospace-01',
    name: 'Ecospace Business Park - Building 1 & 2',
    type: 'Tech Park',
    center: [12.9260, 77.6840],
    coordinates: [
      [12.9255, 77.6830],
      [12.9270, 77.6830],
      [12.9270, 77.6850],
      [12.9255, 77.6850],
      [12.9255, 77.6830],
    ],
    groundElevationM: 882.5,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Bellanduru (Ward 150)',
    estimatedOccupancy: 8500,
  },
  {
    id: 'bldg-rmz-ecoworld',
    name: 'RMZ Ecoworld Campus (Blocks 4A-4C)',
    type: 'Tech Park',
    center: [12.9210, 77.6870],
    coordinates: [
      [12.9200, 77.6860],
      [12.9220, 77.6860],
      [12.9220, 77.6885],
      [12.9200, 77.6885],
      [12.9200, 77.6860],
    ],
    groundElevationM: 883.2,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Bellanduru (Ward 150)',
    estimatedOccupancy: 12000,
  },
  {
    id: 'bldg-sakra-hospital',
    name: 'Sakra World Hospital Main Block',
    type: 'Hospital',
    center: [12.9248, 77.6830],
    coordinates: [
      [12.9240, 77.6820],
      [12.9255, 77.6820],
      [12.9255, 77.6840],
      [12.9240, 77.6840],
      [12.9240, 77.6820],
    ],
    groundElevationM: 884.0,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Bellanduru (Ward 150)',
    estimatedOccupancy: 650,
  },
  {
    id: 'bldg-rainbow-drive-res',
    name: 'Rainbow Drive Residential Villas (Plots 1-45)',
    type: 'Residential Complex',
    center: [12.9135, 77.7085],
    coordinates: [
      [12.9125, 77.7070],
      [12.9145, 77.7070],
      [12.9145, 77.7100],
      [12.9125, 77.7100],
      [12.9125, 77.7070],
    ],
    groundElevationM: 881.0,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Halanayakanahalli (Ward 151)',
    estimatedOccupancy: 450,
  },

  // Manyata Tech Park & Hebbal Basin
  {
    id: 'bldg-manyata-blk-d',
    name: 'Manyata Embassy Park - Block D1 & D2',
    type: 'Tech Park',
    center: [13.0485, 77.6235],
    coordinates: [
      [13.0475, 77.6220],
      [13.0495, 77.6220],
      [13.0495, 77.6250],
      [13.0475, 77.6250],
      [13.0475, 77.6220],
    ],
    groundElevationM: 890.8,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Nagavara (Ward 24)',
    estimatedOccupancy: 9500,
  },
  {
    id: 'bldg-aster-hospital',
    name: 'Aster CMI Hospital Hebbal',
    type: 'Hospital',
    center: [13.0560, 77.5910],
    coordinates: [
      [13.0550, 77.5900],
      [13.0570, 77.5900],
      [13.0570, 77.5925],
      [13.0550, 77.5925],
      [13.0550, 77.5900],
    ],
    groundElevationM: 902.5,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Hebbal (Ward 21)',
    estimatedOccupancy: 800,
  },

  // Yelahanka Basin & Kendriya Vihar
  {
    id: 'bldg-kendriya-vihar',
    name: 'Kendriya Vihar Apartment Complex (Towers A-E)',
    type: 'Residential Complex',
    center: [13.1120, 77.6045],
    coordinates: [
      [13.1105, 77.6030],
      [13.1135, 77.6030],
      [13.1135, 77.6065],
      [13.1105, 77.6065],
      [13.1105, 77.6030],
    ],
    groundElevationM: 902.0,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Yelahanka Satellite Town (Ward 4)',
    estimatedOccupancy: 4200,
  },
  {
    id: 'bldg-yelahanka-fire',
    name: 'Yelahanka Fire & Disaster Response Post',
    type: 'Emergency Station',
    center: [13.1040, 77.5980],
    coordinates: [
      [13.1030, 77.5970],
      [13.1050, 77.5970],
      [13.1050, 77.5990],
      [13.1030, 77.5990],
      [13.1030, 77.5970],
    ],
    groundElevationM: 905.0,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Yelahanka (Ward 3)',
    estimatedOccupancy: 45,
  },

  // Koramangala 4th Block Depression
  {
    id: 'bldg-sony-world-plaza',
    name: '80 Feet Road Commercial Complex (Sony World Jn)',
    type: 'Commercial',
    center: [12.9348, 77.6251],
    coordinates: [
      [12.9340, 77.6240],
      [12.9355, 77.6240],
      [12.9355, 77.6260],
      [12.9340, 77.6260],
      [12.9340, 77.6240],
    ],
    groundElevationM: 887.2,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Koramangala (Ward 151)',
    estimatedOccupancy: 1200,
  },
  {
    id: 'bldg-silk-board-hub',
    name: 'Central Silk Board BMTC Inter-modal Terminal',
    type: 'Commercial',
    center: [12.9181, 77.6234],
    coordinates: [
      [12.9170, 77.6220],
      [12.9190, 77.6220],
      [12.9190, 77.6245],
      [12.9170, 77.6245],
      [12.9170, 77.6220],
    ],
    groundElevationM: 891.0,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Madivala (Ward 172)',
    estimatedOccupancy: 5500,
  },
  {
    id: 'bldg-dps-east',
    name: 'Delhi Public School Bangalore East Campus',
    type: 'School',
    center: [12.9150, 77.7200],
    coordinates: [
      [12.9135, 77.7185],
      [12.9165, 77.7185],
      [12.9165, 77.7220],
      [12.9135, 77.7220],
      [12.9135, 77.7185],
    ],
    groundElevationM: 883.0,
    estimatedFloodDepthM: 0,
    isSubmerged: false,
    wardName: 'Dommasandra',
    estimatedOccupancy: 2800,
  },
];

// Arterial Road Network Corridors
export const BENGALURU_ROADS: FloodAffectedRoadSegment[] = [
  {
    id: 'road-orr-ecospace',
    name: 'Outer Ring Road (Marathahalli - Silk Board Corridor)',
    carriageway: 'Dual',
    totalLengthM: 8500,
    submergedLengthM: 0,
    maxFloodDepthM: 0,
    status: 'Passable',
    points: [
      [12.9550, 77.6980], // Marathahalli
      [12.9420, 77.6920],
      [12.9320, 77.6850], // Ecospace
      [12.9230, 77.6650], // Agara
      [12.9181, 77.6234], // Silk Board
    ],
  },
  {
    id: 'road-sarjapur-corridor',
    name: 'Sarjapur Main Road (Kaikondrahalli - Rainbow Drive)',
    carriageway: 'Single',
    totalLengthM: 6200,
    submergedLengthM: 0,
    maxFloodDepthM: 0,
    status: 'Passable',
    points: [
      [12.9210, 77.6580], // Jakkasandra
      [12.9140, 77.6780], // Kaikondrahalli
      [12.9135, 77.7085], // Rainbow Drive
      [12.9110, 77.7300], // Carmelaram
    ],
  },
  {
    id: 'road-thanisandra-manyata',
    name: 'Thanisandra Main Road (Manyata Tech Park Reach)',
    carriageway: 'Dual',
    totalLengthM: 4800,
    submergedLengthM: 0,
    maxFloodDepthM: 0,
    status: 'Passable',
    points: [
      [13.0380, 77.6200], // Nagavara Jn
      [13.0485, 77.6235], // Manyata Gate 5
      [13.0620, 77.6280],
    ],
  },
  {
    id: 'road-yelahanka-doddaballapur',
    name: 'Yelahanka Bypass (Kendriya Vihar Corridor)',
    carriageway: 'Dual',
    totalLengthM: 5200,
    submergedLengthM: 0,
    maxFloodDepthM: 0,
    status: 'Passable',
    points: [
      [13.0950, 77.5950],
      [13.1050, 77.6010],
      [13.1120, 77.6045], // Kendriya Vihar
      [13.1250, 77.6100],
    ],
  },
  {
    id: 'road-koramangala-80ft',
    name: 'Koramangala 80 Feet Road (Sony World - Oasis)',
    carriageway: 'Single',
    totalLengthM: 3100,
    submergedLengthM: 0,
    maxFloodDepthM: 0,
    status: 'Passable',
    points: [
      [12.9420, 77.6210],
      [12.9348, 77.6251], // Sony World
      [12.9280, 77.6290],
    ],
  },
];

/**
 * Computes spatial intersection of buildings and roads with an inundation polygon and water stage
 */
export function analyzeInundatedInfrastructure(
  inundationPolygon: [number, number][],
  waterStageMeters: number,
  floodCenterLat: number,
  floodCenterLng: number
): {
  floodedBuildings: FloodedBuilding[];
  floodedRoads: FloodAffectedRoadSegment[];
  totalAffectedStructures: number;
  totalSubmergedRoadKm: number;
} {
  const centerElev = getElevationAt(floodCenterLat, floodCenterLng);
  const waterSurfaceElev = centerElev + waterStageMeters;

  // Point in Polygon Test (Epicenter Proximity + Ray Casting)
  const isPointInInundation = (lat: number, lng: number): boolean => {
    // Proximity to deluge epicenter (< 500m)
    const dLat = (lat - floodCenterLat) * 111000;
    const dLng = (lng - floodCenterLng) * 111000 * Math.cos((floodCenterLat * Math.PI) / 180);
    const distM = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distM < 500) return true;

    let inside = false;
    for (let i = 0, j = inundationPolygon.length - 1; i < inundationPolygon.length; j = i++) {
      const xi = inundationPolygon[i][1], yi = inundationPolygon[i][0];
      const xj = inundationPolygon[j][1], yj = inundationPolygon[j][0];

      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Analyze Buildings
  const floodedBuildings = BENGALURU_STRUCTURES.map((b) => {
    const inPoly = isPointInInundation(b.center[0], b.center[1]);
    const elev = b.groundElevationM;
    const isSubmerged = inPoly && elev < waterSurfaceElev;
    const depth = isSubmerged ? Math.round((waterSurfaceElev - elev) * 10) / 10 : 0;

    return {
      ...b,
      isSubmerged,
      estimatedFloodDepthM: depth,
    };
  });

  // Analyze Roads
  const floodedRoads = BENGALURU_ROADS.map((r) => {
    let submergedPts = 0;
    for (const pt of r.points) {
      if (isPointInInundation(pt[0], pt[1])) {
        submergedPts++;
      }
    }

    const subRatio = submergedPts / r.points.length;
    const submergedLengthM = Math.round(r.totalLengthM * subRatio);
    const isImpassable = subRatio > 0.4 || waterStageMeters > 0.8;
    const status: FloodAffectedRoadSegment['status'] =
      submergedLengthM === 0
        ? 'Passable'
        : isImpassable
        ? 'Impassable (Closed)'
        : 'Hazardous';

    return {
      ...r,
      submergedLengthM,
      maxFloodDepthM: submergedLengthM > 0 ? waterStageMeters : 0,
      status,
    };
  });

  const totalAffectedStructures = floodedBuildings.filter((b) => b.isSubmerged).length;
  const totalSubmergedRoadKm =
    Math.round(
      floodedRoads.reduce((acc, r) => acc + r.submergedLengthM, 0) / 1000 * 10
    ) / 10;

  return {
    floodedBuildings,
    floodedRoads,
    totalAffectedStructures,
    totalSubmergedRoadKm,
  };
}

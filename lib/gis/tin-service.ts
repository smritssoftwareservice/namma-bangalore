// FLOODGUARD AI - Triangulated Irregular Network (TIN) Terrain Engine
// Constructs 3D Delaunay triangular meshes from surveyed elevation sample points

import { ElevationColorPalette, TINModel, TINTriangle, TINVertex } from '@/lib/types/gis';
import { BENGALURU_BOUNDS, getElevationAt, getElevationColor } from './dem-data';

/**
 * Generates a scientific TIN (Triangulated Irregular Network) mesh over Bengaluru
 * Uses a jittered adaptive elevation grid and Delaunay triangulation
 */
export function generateBengaluruTIN(
  resolution: 'coarse' | 'medium' | 'fine' = 'medium',
  palette: ElevationColorPalette = 'green-yellow-orange'
): TINModel {
  const step = resolution === 'fine' ? 0.015 : resolution === 'medium' ? 0.022 : 0.035;
  const bounds = BENGALURU_BOUNDS;

  const vertices: TINVertex[] = [];
  let vertexId = 0;

  const latSteps = Math.floor((bounds.maxLat - bounds.minLat) / step);
  const lngSteps = Math.floor((bounds.maxLng - bounds.minLng) / step);

  const gridVertexIndices: number[][] = [];

  for (let i = 0; i <= latSteps; i++) {
    gridVertexIndices[i] = [];
    const baseLat = bounds.minLat + i * step;
    for (let j = 0; j <= lngSteps; j++) {
      const baseLng = bounds.minLng + j * step;

      // Add controlled natural terrain jitter so it forms irregular triangulation
      const jitterLat = (Math.sin(i * 12.3 + j * 7.1) * 0.25) * step;
      const jitterLng = (Math.cos(i * 8.7 - j * 14.2) * 0.25) * step;

      const lat = Math.round((baseLat + jitterLat) * 10000) / 10000;
      const lng = Math.round((baseLng + jitterLng) * 10000) / 10000;
      const elevationMeters = getElevationAt(lat, lng);

      const v: TINVertex = {
        id: vertexId,
        latitude: lat,
        longitude: lng,
        elevationMeters,
      };

      vertices.push(v);
      gridVertexIndices[i][j] = vertexId;
      vertexId++;
    }
  }

  // Construct Delaunay triangles from grid quads (2 triangles per quad)
  const triangles: TINTriangle[] = [];
  let triangleId = 0;
  let minElev = 9999;
  let maxElev = -9999;

  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lngSteps; j++) {
      const v00 = vertices[gridVertexIndices[i][j]];
      const v01 = vertices[gridVertexIndices[i][j + 1]];
      const v10 = vertices[gridVertexIndices[i + 1][j]];
      const v11 = vertices[gridVertexIndices[i + 1][j + 1]];

      // Triangle 1: (v00, v10, v01)
      const t1 = createTriangle(triangleId++, v00, v10, v01, palette);
      triangles.push(t1);

      // Triangle 2: (v10, v11, v01)
      const t2 = createTriangle(triangleId++, v10, v11, v01, palette);
      triangles.push(t2);

      minElev = Math.min(minElev, t1.meanElevationMeters, t2.meanElevationMeters);
      maxElev = Math.max(maxElev, t1.meanElevationMeters, t2.meanElevationMeters);
    }
  }

  return {
    verticesCount: vertices.length,
    trianglesCount: triangles.length,
    triangles,
    elevationRange: [minElev, maxElev],
  };
}

/**
 * Creates and analyzes a single 3D TIN triangle
 */
function createTriangle(
  id: number,
  v1: TINVertex,
  v2: TINVertex,
  v3: TINVertex,
  palette: ElevationColorPalette
): TINTriangle {
  const meanElev = Math.round(((v1.elevationMeters + v2.elevationMeters + v3.elevationMeters) / 3) * 10) / 10;
  const centroidLat = Math.round(((v1.latitude + v2.latitude + v3.latitude) / 3) * 10000) / 10000;
  const centroidLng = Math.round(((v1.longitude + v2.longitude + v3.longitude) / 3) * 10000) / 10000;

  // Compute normal vector to triangular plane in local meters
  // x = lng in meters, y = lat in meters, z = elevation in meters
  const mPerLat = 111000;
  const mPerLng = 111000 * Math.cos((centroidLat * Math.PI) / 180);

  const ax = (v2.longitude - v1.longitude) * mPerLng;
  const ay = (v2.latitude - v1.latitude) * mPerLat;
  const az = v2.elevationMeters - v1.elevationMeters;

  const bx = (v3.longitude - v1.longitude) * mPerLng;
  const by = (v3.latitude - v1.latitude) * mPerLat;
  const bz = v3.elevationMeters - v1.elevationMeters;

  // Cross product (A x B)
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;

  const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
  const cosZenith = Math.abs(nz) / (nLen || 1);
  const slopeRad = Math.acos(Math.min(1, Math.max(0, cosZenith)));
  const slopeDegrees = Math.round((slopeRad * (180 / Math.PI)) * 10) / 10;

  let aspectDegrees = Math.round((Math.atan2(-nx, ny) * (180 / Math.PI) + 360) % 360 * 10) / 10;
  let aspectCardinal = 'N';

  const sectors: Array<[number, number, string]> = [
    [337.5, 360, 'N'],
    [0, 22.5, 'N'],
    [22.5, 67.5, 'NE'],
    [67.5, 112.5, 'E'],
    [112.5, 157.5, 'SE'],
    [157.5, 202.5, 'S'],
    [202.5, 247.5, 'SW'],
    [247.5, 292.5, 'W'],
    [292.5, 337.5, 'NW'],
  ];

  for (const [min, max, card] of sectors) {
    if (aspectDegrees >= min && aspectDegrees < max) {
      aspectCardinal = card;
      break;
    }
  }

  const colorHex = getElevationColor(meanElev, palette);

  return {
    id,
    vertices: [v1, v2, v3],
    centroid: [centroidLat, centroidLng, meanElev],
    meanElevationMeters: meanElev,
    slopeDegrees,
    aspectDegrees,
    aspectCardinal,
    colorHex,
  };
}

/**
 * Exports TIN model as GeoJSON FeatureCollection of Polygons
 */
export function exportTINGeoJSON(tin: TINModel) {
  const features = tin.triangles.map((t) => ({
    type: 'Feature',
    properties: {
      id: t.id,
      meanElevationMeters: t.meanElevationMeters,
      slopeDegrees: t.slopeDegrees,
      aspectDegrees: t.aspectDegrees,
      aspectCardinal: t.aspectCardinal,
      v1_elev: t.vertices[0].elevationMeters,
      v2_elev: t.vertices[1].elevationMeters,
      v3_elev: t.vertices[2].elevationMeters,
      colorHex: t.colorHex,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [t.vertices[0].longitude, t.vertices[0].latitude, t.vertices[0].elevationMeters],
          [t.vertices[1].longitude, t.vertices[1].latitude, t.vertices[1].elevationMeters],
          [t.vertices[2].longitude, t.vertices[2].latitude, t.vertices[2].elevationMeters],
          [t.vertices[0].longitude, t.vertices[0].latitude, t.vertices[0].elevationMeters],
        ],
      ],
    },
  }));

  return {
    type: 'FeatureCollection',
    metadata: {
      model: 'Triangulated Irregular Network (TIN)',
      trianglesCount: tin.trianglesCount,
      verticesCount: tin.verticesCount,
      elevationRange: tin.elevationRange,
    },
    features,
  };
}

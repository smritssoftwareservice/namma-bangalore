// FLOODGUARD AI - Routing & Route Hazard Intelligence Service
import { Hazard, RouteHazardAnalysis } from '@/lib/types/hazard';

export interface RouteCoordinates {
  start: [number, number]; // [lat, lng]
  end: [number, number]; // [lat, lng]
}

export interface RoutingProvider {
  calculateRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<{
    geometry: [number, number][]; // [lng, lat]
    distance_km: number;
    duration_minutes: number;
  }>;
}

/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates distance from a point to a line segment in meters
 */
export function distanceToSegmentMeters(
  px: number,
  py: number, // point [lng, lat]
  x1: number,
  y1: number, // segment start [lng, lat]
  x2: number,
  y2: number // segment end [lng, lat]
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return haversineDistanceMeters(py, px, y1, x1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return haversineDistanceMeters(py, px, projY, projX);
}

/**
 * Checks if a hazard is within bufferDistanceMeters of a polyline
 */
export function isHazardNearPolyline(
  hazardLat: number,
  hazardLng: number,
  polyline: [number, number][], // [lng, lat]
  bufferDistanceMeters = 250
): boolean {
  if (polyline.length < 2) return false;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [x1, y1] = polyline[i];
    const [x2, y2] = polyline[i + 1];
    const dist = distanceToSegmentMeters(hazardLng, hazardLat, x1, y1, x2, y2);
    if (dist <= bufferDistanceMeters) {
      return true;
    }
  }

  return false;
}

/**
 * OSRM Public Routing Provider with graceful simulated fallback
 */
export class OSRMRoutingProvider implements RoutingProvider {
  async calculateRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<{
    geometry: [number, number][];
    distance_km: number;
    duration_minutes: number;
  }> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            geometry: route.geometry.coordinates as [number, number][],
            distance_km: Math.round((route.distance / 1000) * 10) / 10,
            duration_minutes: Math.round(route.duration / 60),
          };
        }
      }
    } catch {
      // fallback to generated path below
    }

    return this.generateSimulatedRoute(startLat, startLng, endLat, endLng);
  }

  private generateSimulatedRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): {
    geometry: [number, number][];
    distance_km: number;
    duration_minutes: number;
  } {
    // Generate realistic waypoints along the route
    const points: [number, number][] = [];
    const steps = 14;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // add slight road-like curvature
      const jitterLng = Math.sin(t * Math.PI) * 0.008;
      const jitterLat = Math.cos(t * Math.PI * 2) * 0.004;
      const lng = startLng + (endLng - startLng) * t + jitterLng;
      const lat = startLat + (endLat - startLat) * t + jitterLat;
      points.push([lng, lat]);
    }

    const approxDistMeters = haversineDistanceMeters(startLat, startLng, endLat, endLng) * 1.35;
    const distance_km = Math.round((approxDistMeters / 1000) * 10) / 10;
    const duration_minutes = Math.round(distance_km * 2.8); // ~22 km/h city average

    return {
      geometry: points,
      distance_km,
      duration_minutes,
    };
  }
}

export const defaultRoutingProvider = new OSRMRoutingProvider();

/**
 * Analyzes hazards along a generated route
 */
export async function analyzeRouteHazards(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  allHazards: Hazard[]
): Promise<RouteHazardAnalysis> {
  const route = await defaultRoutingProvider.calculateRoute(
    startLat,
    startLng,
    endLat,
    endLng
  );

  const matchedHazards = allHazards.filter((h) =>
    isHazardNearPolyline(h.latitude, h.longitude, route.geometry, 350)
  );

  const breakdown = {
    potholes: 0,
    waterlogging: 0,
    open_manholes: 0,
    road_blocks: 0,
    accidents: 0,
    other: 0,
  };

  for (const h of matchedHazards) {
    if (h.type === 'POTHOLE' || h.type === 'LARGE_POTHOLE') breakdown.potholes++;
    else if (h.type === 'WATERLOGGING' || h.type === 'FLOODED_ROAD') breakdown.waterlogging++;
    else if (h.type === 'OPEN_MANHOLE' || h.type === 'DAMAGED_MANHOLE') breakdown.open_manholes++;
    else if (h.type === 'ROAD_BLOCKED') breakdown.road_blocks++;
    else if (h.type === 'ACCIDENT_REPORTED') breakdown.accidents++;
    else breakdown.other++;
  }

  return {
    distance_km: route.distance_km,
    duration_minutes: route.duration_minutes,
    hazards_count: matchedHazards.length,
    breakdown,
    hazards_along_route: matchedHazards,
    route_geometry: route.geometry,
  };
}

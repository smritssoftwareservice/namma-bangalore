// FLOODGUARD AI - Near Me Hazards API Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '1000'; // default 1km
    const sortBy = (searchParams.get('sortBy') as 'distance' | 'risk' | 'recency') || 'distance';

    if (!latStr || !lngStr) {
      return errorResponse('Missing required query parameters: lat and lng', 'BAD_REQUEST', 400);
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radiusMeters = parseFloat(radiusStr);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusMeters)) {
      return errorResponse('Invalid coordinates or radius', 'BAD_REQUEST', 400);
    }

    const nearby = await floodGuardStore.getNearbyHazards(lat, lng, radiusMeters, sortBy);

    return successResponse({
      center: { latitude: lat, longitude: lng },
      radius_meters: radiusMeters,
      count: nearby.length,
      hazards: nearby,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching nearby hazards';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

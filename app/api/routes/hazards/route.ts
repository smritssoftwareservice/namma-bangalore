// FLOODGUARD AI - Route Hazards Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';
import { analyzeRouteHazards } from '@/lib/routing/routing-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromLatStr = searchParams.get('fromLat');
    const fromLngStr = searchParams.get('fromLng');
    const toLatStr = searchParams.get('toLat');
    const toLngStr = searchParams.get('toLng');

    if (!fromLatStr || !fromLngStr || !toLatStr || !toLngStr) {
      return errorResponse('Missing start or end coordinates', 'BAD_REQUEST', 400);
    }

    const fromLat = parseFloat(fromLatStr);
    const fromLng = parseFloat(fromLngStr);
    const toLat = parseFloat(toLatStr);
    const toLng = parseFloat(toLngStr);

    if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
      return errorResponse('Invalid coordinates provided', 'BAD_REQUEST', 400);
    }

    // Fetch all active hazards
    const allHazards = await floodGuardStore.getHazards();

    const analysis = await analyzeRouteHazards(fromLat, fromLng, toLat, toLng, allHazards);

    return successResponse(analysis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Route hazard analysis failed';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

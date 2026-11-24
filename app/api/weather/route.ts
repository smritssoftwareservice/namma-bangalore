// FLOODGUARD AI - Weather Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { fetchCurrentWeather } from '@/lib/weather/weather-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat') || '12.9716';
    const lngStr = searchParams.get('lng') || '77.5946';

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse('Invalid coordinates', 'BAD_REQUEST', 400);
    }

    const weather = await fetchCurrentWeather(lat, lng);
    return successResponse(weather);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Weather service failed';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

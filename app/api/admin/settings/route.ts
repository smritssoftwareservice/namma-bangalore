// FLOODGUARD AI - Admin Settings Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { DEFAULT_RISK_WEIGHTS } from '@/lib/risk/risk-engine';

let activeSettings = {
  weights: { ...DEFAULT_RISK_WEIGHTS },
  demo_mode: true,
  require_admin_verification: true,
  ai_provider: 'VisionAIProvider (Fallback to DemoAIProvider)',
  weather_provider: 'Open-Meteo GIS Provider',
  auto_alert_radius_meters: 1500,
  min_confidence_threshold: 0.75,
};

export async function GET() {
  return successResponse(activeSettings);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    activeSettings = {
      ...activeSettings,
      ...body,
      weights: {
        ...activeSettings.weights,
        ...(body.weights || {}),
      },
    };

    return successResponse(activeSettings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

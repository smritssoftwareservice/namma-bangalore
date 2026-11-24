// FLOODGUARD AI - Hazards API Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';
import { reportHazardSchema } from '@/lib/validation/schemas';
import { calculateRiskScore } from '@/lib/risk/risk-engine';
import { fetchCurrentWeather } from '@/lib/weather/weather-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boundsStr = searchParams.get('bounds');
    const type = searchParams.get('type') || undefined;
    const risk_level = searchParams.get('risk_level') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const waterlogging = searchParams.get('waterlogging') === 'true';
    const ai_detected = searchParams.get('ai_detected') === 'true';

    let bounds: [number, number, number, number] | undefined = undefined;
    if (boundsStr) {
      const parts = boundsStr.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
        bounds = parts as [number, number, number, number];
      }
    }

    const hazards = await floodGuardStore.getHazards({
      bounds,
      type,
      risk_level,
      status,
      search,
      waterlogging,
      ai_detected,
    });

    return successResponse({
      count: hazards.length,
      hazards,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch hazards';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reportHazardSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Validation failed: ' + parsed.error.issues.map((i) => i.message).join(', '),
        'VALIDATION_ERROR',
        400,
        parsed.error.flatten()
      );
    }

    const data = parsed.data;

    // Fetch weather context for current coordinates
    const weather = await fetchCurrentWeather(data.latitude, data.longitude);

    // Calculate dynamic risk
    const risk = calculateRiskScore({
      hazardType: data.type,
      severity: data.severity,
      rainfall_mm: weather.rainfall,
      waterlogging_detected: data.waterlogging_detected,
      historical_reports_count: 2,
      is_major_arterial_road: true,
      reports_last_24h: 1,
    });

    const newHazard = await floodGuardStore.createHazard({
      type: data.type,
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || `Near ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
      severity: data.severity,
      risk_score: risk.final_score,
      risk_level: risk.risk_level,
      status: 'REPORTED',
      weather,
      risk_breakdown: risk,
      evidence: data.file_url
        ? [
            {
              id: `evi-${Date.now()}`,
              hazard_id: '',
              file_url: data.file_url,
              file_type: data.file_type,
              created_at: new Date().toISOString(),
            },
          ]
        : [],
      detections: data.ai_confidence
        ? [
            {
              id: `det-${Date.now()}`,
              hazard_id: '',
              object_type: data.type.toLowerCase(),
              confidence: data.ai_confidence,
              model_version: 'floodguard-vision-v2',
              created_at: new Date().toISOString(),
            },
          ]
        : [],
    });

    return successResponse(newHazard, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create hazard';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

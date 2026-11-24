import { NextRequest, NextResponse } from 'next/server';
import { runFloodSimulation } from '@/lib/gis/simulation-service';
import { RainfallScenarioPreset, SimulationParameters } from '@/lib/types/gis';
import { getElevationAt } from '@/lib/gis/dem-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lat = parseFloat(body.latitude ?? '12.9350');
    const lng = parseFloat(body.longitude ?? '77.6750');
    const locationName = body.locationName || 'Selected Location';
    const rainfallScenarioMm = (parseInt(body.rainfallScenarioMm ?? '100', 10) as RainfallScenarioPreset) || 100;
    const rainfallDurationHours = Math.max(1, Math.min(12, parseInt(body.rainfallDurationHours ?? '3', 10)));
    const targetWaterLevelMeters = Math.max(0.1, Math.min(3.5, parseFloat(body.targetWaterLevelMeters ?? '1.2')));

    const baseElevationMeters = getElevationAt(lat, lng);

    const params: SimulationParameters = {
      targetLocation: {
        name: locationName,
        latitude: lat,
        longitude: lng,
        baseElevationMeters,
      },
      rainfallScenarioMm,
      rainfallDurationHours,
      targetWaterLevelMeters,
      runoffCoefficient: 0.88,
    };

    const result = runFloodSimulation(params);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Simulation execution failed' },
      { status: 500 }
    );
  }
}


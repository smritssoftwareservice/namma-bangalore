import { NextRequest, NextResponse } from 'next/server';
import { weatherService } from '@/lib/gis/weather-provider';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '12.9716');
    const lng = parseFloat(searchParams.get('lng') || '77.5946');

    const [liveWeather, radarFrames] = await Promise.all([
      weatherService.getLiveWeather(lat, lng),
      weatherService.getRadarFrames(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...liveWeather,
        radarFrames,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Weather intelligence service failure' },
      { status: 500 }
    );
  }
}


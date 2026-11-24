import { NextRequest, NextResponse } from 'next/server';
import { inspectPointTerrain } from '@/lib/gis/dem-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat') || '12.9716';
    const lngStr = searchParams.get('lng') || '77.5946';

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const inspection = inspectPointTerrain(lat, lng);

    return NextResponse.json({
      success: true,
      data: inspection,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Terrain analysis failed' },
      { status: 500 }
    );
  }
}


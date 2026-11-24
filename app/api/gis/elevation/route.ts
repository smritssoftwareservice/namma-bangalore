import { NextRequest, NextResponse } from 'next/server';
import { getElevationAt, inspectPointTerrain } from '@/lib/gis/dem-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Missing lat or lng parameter' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid lat or lng coordinate values' },
        { status: 400 }
      );
    }

    const elevationMeters = getElevationAt(lat, lng);
    const inspection = inspectPointTerrain(lat, lng);

    return NextResponse.json({
      success: true,
      data: {
        latitude: lat,
        longitude: lng,
        elevationMeters,
        inspection,
        source: 'Copernicus DEM (GLO-30) / SRTM calibrated for Bengaluru Urban',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to calculate elevation' },
      { status: 500 }
    );
  }
}


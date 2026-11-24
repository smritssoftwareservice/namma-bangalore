import { NextRequest, NextResponse } from 'next/server';
import { generateContoursGeoJSON } from '@/lib/gis/dem-data';
import { ContourInterval } from '@/lib/types/gis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const intervalParam = parseInt(searchParams.get('interval') || '10', 10);

    const validIntervals: ContourInterval[] = [1, 2, 5, 10, 20, 50];
    const interval: ContourInterval = validIntervals.includes(intervalParam as ContourInterval)
      ? (intervalParam as ContourInterval)
      : 10;

    const geojson = generateContoursGeoJSON(undefined, interval);

    return NextResponse.json(geojson, {
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate contours' },
      { status: 500 }
    );
  }
}


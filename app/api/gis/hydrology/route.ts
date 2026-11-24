import { NextResponse } from 'next/server';
import { BENGALURU_LAKES, RAJAKALUVE_SEGMENTS, WATERSHED_BOUNDARIES } from '@/lib/gis/hydrology-data';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        lakes: BENGALURU_LAKES,
        rajakaluves: RAJAKALUVE_SEGMENTS,
        watersheds: WATERSHED_BOUNDARIES,
        summary: {
          totalLakesCount: BENGALURU_LAKES.length,
          totalRajakaluveLengthKm: Math.round(
            RAJAKALUVE_SEGMENTS.reduce((acc, s) => acc + s.lengthKm, 0) * 10
          ) / 10,
          totalCatchmentAreaKm2: WATERSHED_BOUNDARIES.reduce((acc, w) => acc + w.areaSqKm, 0),
          bottlenecksIdentified: RAJAKALUVE_SEGMENTS.filter((s) => s.isBottleneck).length,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Hydrology data failed to load' },
      { status: 500 }
    );
  }
}


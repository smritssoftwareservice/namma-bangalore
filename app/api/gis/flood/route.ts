import { NextResponse } from 'next/server';
import {
  BENGALURU_FLOOD_ZONES,
  HISTORICAL_FLOOD_EVENTS,
  WATERLOGGING_INCIDENTS,
  BENGALURU_HOTSPOTS,
} from '@/lib/gis/flood-data';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        floodRiskZones: BENGALURU_FLOOD_ZONES,
        waterloggingIncidents: WATERLOGGING_INCIDENTS,
        historicalEvents: HISTORICAL_FLOOD_EVENTS,
        hotspots: BENGALURU_HOTSPOTS,
        summary: {
          activeWaterloggingCount: WATERLOGGING_INCIDENTS.filter((w) => w.status === 'Active').length,
          criticalZonesCount: BENGALURU_FLOOD_ZONES.filter((z) => z.riskLevel === 'Critical').length,
          historicalEventsArchived: HISTORICAL_FLOOD_EVENTS.length,
          totalPopulationExposed: BENGALURU_FLOOD_ZONES.reduce((acc, z) => acc + z.populationExposed, 0),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Flood risk data retrieval error' },
      { status: 500 }
    );
  }
}


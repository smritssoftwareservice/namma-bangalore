'use client';

import React from 'react';
import {
  Compass,
  Mountain,
  Droplets,
  AlertTriangle,
  Download,
  X,
  MapPin,
  TrendingUp,
  Waves,
  ShieldAlert,
} from 'lucide-react';
import { TerrainInspectionData } from '@/lib/types/gis';

interface GISInspectorPanelProps {
  data: TerrainInspectionData | null;
  onClose?: () => void;
  onSimulateHere?: (lat: number, lng: number) => void;
}

export function GISInspectorPanel({ data, onClose, onSimulateHere }: GISInspectorPanelProps) {
  if (!data) return null;

  const exportGeoJSON = () => {
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude, data.elevationMeters],
      },
      properties: {
        elevationMeters: data.elevationMeters,
        slopeDegrees: data.slopeDegrees,
        slopePercent: data.slopePercent,
        slopeClassification: data.slopeClassification,
        aspectDegrees: data.aspectDegrees,
        aspectCardinal: data.aspectCardinal,
        drainageBasin: data.drainageBasin,
        waterAccumulationRisk: data.waterAccumulationRisk,
        surveyDatum: 'WGS84 / Copernicus DEM GLO-30',
        timestamp: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bengaluru-gis-point-${data.latitude}-${data.longitude}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-88 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl p-4 text-xs space-y-3.5 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm">Geospatial Inspector</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {data.latitude.toFixed(5)}°N, {data.longitude.toFixed(5)}°E
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Topographic Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            Elevation (MSL)
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {data.elevationMeters} <span className="text-xs text-slate-400 font-normal">m</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Copernicus DEM (±1m)</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Terrain Slope
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {data.slopeDegrees}° <span className="text-xs text-slate-400 font-normal">({data.slopePercent}%)</span>
          </div>
          <div className="text-[9px] text-amber-400 font-semibold mt-0.5">
            {data.slopeClassification}
          </div>
        </div>
      </div>

      {/* Aspect & Orientation */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Downhill Aspect</div>
            <div className="text-sm font-bold text-white font-mono">
              {data.aspectDegrees}° {data.aspectCardinal}
            </div>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-cyan-300 font-mono text-[11px] font-bold">
          Facing {data.aspectCardinal}
        </div>
      </div>

      {/* Drainage & Watershed Basin */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          Drainage Catchment
        </div>
        <div className="font-semibold text-slate-100 text-xs">{data.drainageBasin}</div>
      </div>

      {/* Water Accumulation Risk Rating */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Accumulation Risk</div>
            <div className="text-xs font-bold text-slate-100">Depression / Low Sink</div>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
            data.waterAccumulationRisk === 'High'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : data.waterAccumulationRisk === 'Moderate'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {data.waterAccumulationRisk} Risk
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex gap-2">
        {onSimulateHere && (
          <button
            onClick={() => onSimulateHere(data.latitude, data.longitude)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Simulate Flood Here
          </button>
        )}
        <button
          onClick={exportGeoJSON}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Export GeoJSON"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


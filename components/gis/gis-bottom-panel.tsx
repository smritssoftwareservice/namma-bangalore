'use client';

import React from 'react';
import { Compass, Eye, MapPin, Mountain, Clock, Globe } from 'lucide-react';
import { WeatherTimeSlice } from '@/lib/types/gis';

interface GISBottomPanelProps {
  currentCoords: { lat: number; lng: number; elev: number } | null;
  timeSlice: WeatherTimeSlice;
  onTimeSliceChange: (ts: WeatherTimeSlice) => void;
  scaleText?: string;
  projection?: string;
}

export function GISBottomPanel({
  currentCoords,
  timeSlice,
  onTimeSliceChange,
  scaleText = '1:25,000 (DEM 30m)',
  projection = 'EPSG:4326 (WGS84)',
}: GISBottomPanelProps) {
  const slices: Array<{ id: WeatherTimeSlice; label: string }> = [
    { id: 'prev-24h', label: '-24h' },
    { id: 'prev-6h', label: '-6h' },
    { id: 'prev-1h', label: '-1h' },
    { id: 'current', label: 'Live Observation' },
    { id: 'forecast-6h', label: '+6h' },
    { id: 'forecast-12h', label: '+12h' },
    { id: 'forecast-24h', label: '+24h' },
  ];

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
      {/* Real-time Cursor Coordinates & Elevation */}
      <div className="flex items-center gap-4 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span>LAT:</span>
          <span className="text-white font-bold">
            {currentCoords ? currentCoords.lat.toFixed(5) : '12.97160'}° N
          </span>
          <span className="text-slate-600">|</span>
          <span>LNG:</span>
          <span className="text-white font-bold">
            {currentCoords ? currentCoords.lng.toFixed(5) : '77.59460'}° E
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>ELEV:</span>
          <span className="text-emerald-300 font-bold">
            {currentCoords ? currentCoords.elev : 920.0} m MSL
          </span>
        </div>
      </div>

      {/* Interactive Time Horizon Bar */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <Clock className="w-3.5 h-3.5 text-cyan-400 ml-1 mr-1" />
        {slices.map((s) => (
          <button
            key={s.id}
            onClick={() => onTimeSliceChange(s.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
              timeSlice === s.id
                ? 'bg-sky-500 text-slate-950 font-black shadow-sm shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Scale & Projection info */}
      <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-500" />
          <span>{projection}</span>
        </div>
        <span className="text-slate-700">|</span>
        <span>Scale {scaleText}</span>
        <span className="text-slate-700">|</span>
        <span className="text-sky-400 font-semibold">Bengaluru 3D Engine v2.0</span>
      </div>
    </div>
  );
}


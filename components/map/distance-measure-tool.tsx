'use client';

import React from 'react';
import { Ruler, Trash2, Check, X } from 'lucide-react';

interface DistanceMeasureToolProps {
  points: [number, number][]; // [lat, lng]
  totalDistanceKm: number;
  onClear: () => void;
  onFinish: () => void;
}

export function DistanceMeasureTool({
  points,
  totalDistanceKm,
  onClear,
  onFinish,
}: DistanceMeasureToolProps) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl text-xs space-y-2.5 max-w-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <Ruler className="w-4 h-4" />
          Distance Measurement Tool
        </div>
        <button
          onClick={onFinish}
          className="p-1 rounded-md text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div className="text-[10px] text-slate-400 uppercase font-semibold">
          Cumulative Distance
        </div>
        <div className="text-xl font-black text-amber-300">
          {totalDistanceKm.toFixed(2)} km
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {points.length} waypoints selected on map
        </div>
      </div>

      <div className="text-[11px] text-slate-400 leading-snug">
        Click anywhere on the map to add measurement waypoints.
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onClear}
          className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          Clear
        </button>
        <button
          onClick={onFinish}
          className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition"
        >
          <Check className="w-3.5 h-3.5" />
          Finish
        </button>
      </div>
    </div>
  );
}

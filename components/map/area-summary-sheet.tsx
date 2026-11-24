'use client';

import React from 'react';
import { MapPin, X, AlertTriangle, Droplets, Hammer, CircleDot, ChevronRight } from 'lucide-react';

export interface AreaSummaryData {
  name: string;
  total: number;
  critical: number;
  high: number;
  moderate: number;
  waterlogging: number;
  potholes: number;
  manholes: number;
  latitude: number;
  longitude: number;
}

interface AreaSummarySheetProps {
  data: AreaSummaryData | null;
  onClose: () => void;
  onViewArea: (data: AreaSummaryData) => void;
}

export function AreaSummarySheet({ data, onClose, onViewArea }: AreaSummarySheetProps) {
  if (!data) return null;

  return (
    <div className="w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 shadow-2xl text-xs space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">{data.name}</h3>
            <span className="text-[10px] text-slate-400">Geospatial Hazard Intelligence</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
        <span className="text-slate-300 font-medium text-xs">Total Hazards Nearby</span>
        <span className="text-xl font-black text-white">{data.total}</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30">
          <span className="text-[10px] text-red-300 uppercase font-bold block">Critical</span>
          <span className="text-base font-black text-red-400">{data.critical}</span>
        </div>
        <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30">
          <span className="text-[10px] text-orange-300 uppercase font-bold block">High</span>
          <span className="text-base font-black text-orange-400">{data.high}</span>
        </div>
        <div className="p-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30">
          <span className="text-[10px] text-yellow-300 uppercase font-bold block">Moderate</span>
          <span className="text-base font-black text-yellow-400">{data.moderate}</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Waterlogging Reports
          </span>
          <span className="font-bold text-white">{data.waterlogging}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Hammer className="w-3.5 h-3.5 text-yellow-400" /> Potholes & Craters
          </span>
          <span className="font-bold text-white">{data.potholes}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CircleDot className="w-3.5 h-3.5 text-red-400" /> Open / Damaged Manholes
          </span>
          <span className="font-bold text-white">{data.manholes}</span>
        </div>
      </div>

      <button
        onClick={() => onViewArea(data)}
        className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30 transition"
      >
        <span>View Area Hazards</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

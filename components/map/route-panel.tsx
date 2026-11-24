'use client';

import React, { useState } from 'react';
import {
  Navigation,
  X,
  MapPin,
  AlertTriangle,
  Clock,
  Milestone,
  Droplets,
  Hammer,
  CircleDot,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Hazard, RouteHazardAnalysis } from '@/lib/types/hazard';
import { BENGALURU_LANDMARKS } from '@/lib/geocoding/geocoding-service';

interface RoutePanelProps {
  onClose: () => void;
  onCalculateRoute: (
    from: [number, number],
    to: [number, number],
    labels: { from: string; to: string }
  ) => Promise<RouteHazardAnalysis | null>;
  onSelectRouteHazard?: (hazard: Hazard) => void;
}

export function RoutePanel({
  onClose,
  onCalculateRoute,
  onSelectRouteHazard,
}: RoutePanelProps) {
  const [fromIndex, setFromIndex] = useState(2); // Indiranagar
  const [toIndex, setToIndex] = useState(4); // Electronic City
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteHazardAnalysis | null>(null);

  const presets = [
    { from: 2, to: 4, name: 'Indiranagar ➔ Electronic City' },
    { from: 0, to: 6, name: 'Whitefield ➔ Silk Board' },
    { from: 3, to: 9, name: 'MG Road ➔ Hebbal Flyover' },
  ];

  const handleCompute = async () => {
    const from = BENGALURU_LANDMARKS[fromIndex];
    const to = BENGALURU_LANDMARKS[toIndex];
    setLoading(true);
    try {
      const res = await onCalculateRoute(
        [from.latitude, from.longitude],
        [to.latitude, to.longitude],
        { from: from.name, to: to.name }
      );
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 shadow-2xl text-xs space-y-4 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <Navigation className="w-4 h-4 text-sky-400" />
          Route Hazard Intelligence
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
          Popular Commute Routes
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setFromIndex(p.from);
                setToIndex(p.to);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-[11px] text-slate-300 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* From / To Inputs */}
      <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Origin
          </label>
          <select
            value={fromIndex}
            onChange={(e) => setFromIndex(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {BENGALURU_LANDMARKS.map((lm, idx) => (
              <option key={lm.id} value={idx}>
                {lm.name} ({lm.display_name.split(',')[0]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> Destination
          </label>
          <select
            value={toIndex}
            onChange={(e) => setToIndex(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {BENGALURU_LANDMARKS.map((lm, idx) => (
              <option key={lm.id} value={idx}>
                {lm.name} ({lm.display_name.split(',')[0]})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCompute}
          disabled={loading || fromIndex === toIndex}
          className="w-full mt-2 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning route buffer...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Analyze Route Hazards
            </>
          )}
        </button>
      </div>

      {/* Result Breakdown */}
      {result && (
        <div className="space-y-3 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Milestone className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white">{result.distance_km} km</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">~{result.duration_minutes} mins</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{result.hazards_count} Hazards</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
              Hazards Detected on Path
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-300">
                  <Hammer className="w-3.5 h-3.5 text-yellow-400" /> Potholes
                </span>
                <span className="font-bold text-white">{result.breakdown.potholes}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Waterlogging
                </span>
                <span className="font-bold text-white">{result.breakdown.waterlogging}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-300">
                  <CircleDot className="w-3.5 h-3.5 text-red-400" /> Open Manholes
                </span>
                <span className="font-bold text-white">{result.breakdown.open_manholes}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Road Blocks
                </span>
                <span className="font-bold text-white">{result.breakdown.road_blocks}</span>
              </div>
            </div>
          </div>

          {/* Sequential hazard list */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
              Sequential Route Hazards
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {result.hazards_along_route.map((h, i) => (
                <div
                  key={h.id}
                  onClick={() => onSelectRouteHazard?.(h)}
                  className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-sky-500/50 cursor-pointer transition flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-200 line-clamp-1">{h.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-amber-400 font-bold">{h.type.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>Risk: {h.risk_score}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-800 pt-2">
            Route safety intelligence is computed from citizen reports and GIS spatial buffer models.
            Exercise caution.
          </p>
        </div>
      )}
    </div>
  );
}

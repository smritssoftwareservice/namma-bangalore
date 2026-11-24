'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Mountain,
  Ruler,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Crosshair,
  Download,
} from 'lucide-react';
import { ElevationProfileResult } from '@/lib/types/gis';

interface GISElevationProfileModalProps {
  profile: ElevationProfileResult | null;
  onClose: () => void;
  onHoverDistance?: (distKm: number | null) => void;
}

export function GISElevationProfileModal({
  profile,
  onClose,
  onHoverDistance,
}: GISElevationProfileModalProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!profile) return null;

  const points = profile.profilePoints;
  if (!points || points.length === 0) return null;

  const minElev = profile.minElevationMeters - 5;
  const maxElev = profile.maxElevationMeters + 10;
  const elevRange = maxElev - minElev || 1;

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 50 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Map profile points to SVG coordinates
  const svgPoints = points.map((p, idx) => {
    const x = padding.left + (idx / (points.length - 1)) * plotWidth;
    const y = padding.top + (1 - (p.elevationMeters - minElev) / elevRange) * plotHeight;
    return { ...p, x, y };
  });

  const polylineStr = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPathStr = `M ${svgPoints[0].x},${padding.top + plotHeight} L ${polylineStr} L ${
    svgPoints[svgPoints.length - 1].x
  },${padding.top + plotHeight} Z`;

  const hoveredPoint = hoverIndex !== null ? svgPoints[hoverIndex] : null;

  return (
    <div className="w-[680px] max-w-[95vw] rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-5 text-xs text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm">
              Terrain Elevation Cross-Section Profile
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              From [{profile.startLocation[0].toFixed(4)}°, {profile.startLocation[1].toFixed(4)}°] to [
              {profile.endLocation[0].toFixed(4)}°, {profile.endLocation[1].toFixed(4)}°]
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-6 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Distance</div>
          <div className="text-sm font-black text-white font-mono mt-0.5">
            {profile.totalDistanceKm} <span className="text-[9px] text-slate-400 font-normal">km</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Min Elev</div>
          <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
            {profile.minElevationMeters} <span className="text-[9px] text-slate-400 font-normal">m</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Max Elev</div>
          <div className="text-sm font-black text-orange-400 font-mono mt-0.5">
            {profile.maxElevationMeters} <span className="text-[9px] text-slate-400 font-normal">m</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Avg Elev</div>
          <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
            {profile.averageElevationMeters} <span className="text-[9px] text-slate-400 font-normal">m</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-red-400" /> Gain
          </div>
          <div className="text-sm font-black text-red-400 font-mono mt-0.5">
            +{profile.elevationGainMeters} <span className="text-[9px] text-slate-400 font-normal">m</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" /> Loss
          </div>
          <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
            -{profile.elevationLossMeters} <span className="text-[9px] text-slate-400 font-normal">m</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Profile Chart */}
      <div className="relative bg-slate-900/70 border border-slate-800/80 rounded-xl p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseLeave={() => {
            setHoverIndex(null);
            if (onHoverDistance) onHoverDistance(null);
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            const clampedX = Math.max(padding.left, Math.min(padding.left + plotWidth, mouseX));
            const ratio = (clampedX - padding.left) / plotWidth;
            const idx = Math.round(ratio * (points.length - 1));
            setHoverIndex(idx);
            if (onHoverDistance) onHoverDistance(points[idx].distanceKm);
          }}
        >
          <defs>
            <linearGradient id="profileElevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((t) => {
            const y = padding.top + t * plotHeight;
            const elevVal = Math.round(maxElev - t * elevRange);
            return (
              <g key={t}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {elevVal}m
                </text>
              </g>
            );
          })}

          {/* Distance tick marks */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((t) => {
            const x = padding.left + t * plotWidth;
            const distVal = Math.round(t * profile.totalDistanceKm * 10) / 10;
            return (
              <g key={t}>
                <line
                  x1={x}
                  y1={padding.top + plotHeight}
                  x2={x}
                  y2={padding.top + plotHeight + 4}
                  stroke="#64748b"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 16}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {distVal}km
                </text>
              </g>
            );
          })}

          {/* Filled Elevation Area */}
          <path d={areaPathStr} fill="url(#profileElevGrad)" />

          {/* Elevation Profile Polyline */}
          <polyline
            points={polylineStr}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + plotHeight}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="4.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Readout Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-3 right-4 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-sky-500/50 shadow-xl text-xs font-mono flex items-center gap-3">
            <span className="text-slate-400">
              Dist: <strong className="text-white">{hoveredPoint.distanceKm} km</strong>
            </span>
            <span className="text-slate-400">
              Elev: <strong className="text-amber-300">{hoveredPoint.elevationMeters} m</strong>
            </span>
            <span className="text-slate-400">
              Slope: <strong className="text-emerald-400">{hoveredPoint.slopeDegrees}°</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

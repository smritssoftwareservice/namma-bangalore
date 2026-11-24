'use client';

import React, { useState } from 'react';
import {
  Plane,
  Eye,
  EyeOff,
  Crosshair,
  ShieldAlert,
  Radio,
  Maximize,
  Camera,
  Layers,
  Compass,
} from 'lucide-react';
import { Hazard } from '@/lib/types/hazard';

interface DroneHudOverlayProps {
  zoom: number;
  pitch: number;
  bearing: number;
  center: [number, number]; // [lat, lng]
  selectedHazard?: Hazard | null;
  isVisible: boolean;
  onToggleVisible: () => void;
  onToggle3D: () => void;
  is3D: boolean;
}

export function DroneHudOverlay({
  zoom,
  pitch,
  bearing,
  center,
  selectedHazard,
  isVisible,
  onToggleVisible,
  onToggle3D,
  is3D,
}: DroneHudOverlayProps) {
  // Approximate AGL altitude based on web mercator zoom level
  const getAltitudeMeters = (z: number) => {
    if (z >= 18) return 65;
    if (z >= 17) return 140;
    if (z >= 16) return 280;
    if (z >= 15) return 550;
    if (z >= 14) return 980;
    if (z >= 13) return 1800;
    return 3200;
  };

  const getGsdResolution = (z: number) => {
    if (z >= 18) return '0.12 m/px (4K ULTRA-HD)';
    if (z >= 17) return '0.24 m/px (SUB-METER)';
    if (z >= 16) return '0.48 m/px (TACTICAL)';
    if (z >= 14) return '1.20 m/px (SECTOR)';
    return '3.50 m/px (REGIONAL)';
  };

  const altitude = getAltitudeMeters(zoom);
  const gsd = getGsdResolution(zoom);
  const pitchLabel = Math.round(pitch) === 0 ? '0° NADIR (ORTHOPHOTO)' : `${Math.round(pitch)}° OBLIQUE (3D RECON)`;
  const bearingLabel = `${Math.round((bearing + 360) % 360).toString().padStart(3, '0')}°`;

  if (!isVisible) {
    return (
      <div className="absolute top-4 left-4 z-30 pointer-events-auto">
        <button
          onClick={onToggleVisible}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs backdrop-blur-md shadow-xl transition"
          title="Enable Drone HUD"
        >
          <Camera className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>DRONE HUD [OFF]</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono select-none">
      {/* 1. Subtle Drone Vignette / Camera Lens Edge */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_65%,rgba(2,6,23,0.45)_100%)] pointer-events-none" />

      {/* 2. Tactical Corner HUD Brackets */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-emerald-400/70" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-emerald-400/70" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-emerald-400/70" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-emerald-400/70" />

      {/* 3. Top Telemetry Bar */}
      <div className="absolute top-3 left-14 right-14 flex items-center justify-between pointer-events-auto">
        {/* Left: UAV Sensor Identification */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/30 text-[11px] text-emerald-300 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white tracking-wider">UAV-01 // 4K ORTHOPHOTO STREAM</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400/90 font-semibold">{gsd}</span>
        </div>

        {/* Right: Flight Telemetry & Drone Controls */}
        <div className="flex items-center gap-2">
          {/* Quick 3D/2D Tilt Toggle Button */}
          <button
            onClick={onToggle3D}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-bold shadow-xl transition ${
              is3D
                ? 'bg-amber-500/20 border-amber-500/70 text-amber-300'
                : 'bg-slate-950/85 border-emerald-500/30 text-emerald-400 hover:bg-slate-900'
            }`}
            title="Toggle 3D Drone Perspective vs 2D Orthophoto"
          >
            <Plane className={`w-3.5 h-3.5 ${is3D ? 'rotate-45 text-amber-400' : ''}`} />
            <span>{is3D ? '3D OBLIQUE (45°)' : '2D NADIR ORTHO'}</span>
          </button>

          {/* HUD Collapse button */}
          <button
            onClick={onToggleVisible}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] backdrop-blur-md shadow-xl transition"
            title="Hide Drone HUD"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HUD</span>
          </button>
        </div>
      </div>

      {/* 4. Center Camera Reticle / Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-40">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border border-emerald-400/40 rounded-full" />
          <div className="absolute w-2 h-2 border-t border-l border-emerald-400" />
          <div className="absolute w-16 h-px bg-emerald-400/30" />
          <div className="absolute h-16 w-px bg-emerald-400/30" />
        </div>
      </div>

      {/* 5. Bottom Telemetry Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
        {/* Left Side: Live Drone Flight Data */}
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 shadow-xl max-w-xs sm:max-w-md">
          <div className="flex items-center gap-3 text-emerald-400 font-bold border-b border-slate-800/80 pb-1">
            <span>ALT: {altitude}m AGL</span>
            <span>PITCH: {pitchLabel}</span>
            <span>HDG: {bearingLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
            <span>COORDS:</span>
            <span className="text-white font-semibold">
              {center[0].toFixed(5)}°N, {center[1].toFixed(5)}°E
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">ZOOM {zoom.toFixed(1)}x</span>
          </div>
        </div>

        {/* Center: Selected Hazard Target Lock Box */}
        {selectedHazard && (
          <div className="hidden md:flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border-2 border-amber-500/80 text-[10px] text-amber-300 shadow-2xl animate-pulse">
            <div className="flex items-center gap-1.5 font-black tracking-wider text-white">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>[ TARGET ACQUIRED: {selectedHazard.id} ]</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span>TYPE: <strong className="text-amber-400">{selectedHazard.type.replace(/_/g, ' ')}</strong></span>
              <span>SEV: <strong className="text-white">{selectedHazard.severity}</strong></span>
              <span>RISK: <strong className="text-red-400">{selectedHazard.risk_score}/100</strong></span>
              {selectedHazard.weather?.rainfall ? (
                <span>PRECIP: <strong className="text-sky-300">{selectedHazard.weather.rainfall}mm</strong></span>
              ) : null}
            </div>
          </div>
        )}

        {/* Right Side: Drone System Status */}
        <div className="hidden sm:flex flex-col items-end gap-0.5 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-400 shadow-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI VISION RECON READY</span>
          </div>
          <span className="text-slate-500 text-[9px]">4K DRONE ORTHOMOSAIC ENGINE</span>
        </div>
      </div>
    </div>
  );
}

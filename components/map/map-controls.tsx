'use client';

import React from 'react';
import {
  Plus,
  Minus,
  LocateFixed,
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  Filter,
  Ruler,
  Navigation,
  Plane,
  Camera,
} from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onResetNorth: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isLayersOpen: boolean;
  onToggleLayers: () => void;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  isMeasureMode: boolean;
  onToggleMeasure: () => void;
  isRouteMode: boolean;
  onToggleRoute: () => void;
  activeFilterCount: number;
  is3D?: boolean;
  onToggle3D?: () => void;
  isDroneHudOpen?: boolean;
  onToggleDroneHud?: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onResetNorth,
  isFullscreen,
  onToggleFullscreen,
  isLayersOpen,
  onToggleLayers,
  isFiltersOpen,
  onToggleFilters,
  isMeasureMode,
  onToggleMeasure,
  isRouteMode,
  onToggleRoute,
  activeFilterCount,
  is3D = false,
  onToggle3D,
  isDroneHudOpen = true,
  onToggleDroneHud,
}: MapControlsProps) {
  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      {/* Feature action buttons */}
      <div className="flex flex-col gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
        <button
          onClick={onToggleLayers}
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
            isLayersOpen
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Layers"
          aria-label="Map Layers"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFilters}
          className={`relative p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
            isFiltersOpen
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Filter Hazards"
          aria-label="Filter Hazards"
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-400 text-slate-950 font-black text-[9px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleRoute}
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
            isRouteMode
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Route Hazard Analysis"
          aria-label="Route Navigator"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMeasure}
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
            isMeasureMode
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Measure Distance Tool"
          aria-label="Measure Distance"
        >
          <Ruler className="w-4 h-4" />
        </button>

        {onToggle3D && (
          <button
            onClick={onToggle3D}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
              is3D
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="3D Drone Perspective (45° Tilt) / 2D Ortho"
            aria-label="3D Drone Perspective"
          >
            <Plane className={`w-4 h-4 ${is3D ? 'rotate-45 text-white' : 'text-slate-300'}`} />
          </button>
        )}

        {onToggleDroneHud && (
          <button
            onClick={onToggleDroneHud}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition ${
              isDroneHudOpen
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Drone Telemetry HUD (Alt, GSD, Reticle)"
            aria-label="Drone Telemetry HUD"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Standard Zoom & Orientation controls */}
      <div className="flex flex-col gap-1 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
        <button
          onClick={onZoomIn}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-px bg-slate-800 mx-1 my-0.5" />

        <button
          onClick={onLocate}
          className="p-2.5 rounded-xl text-sky-400 hover:bg-slate-800 transition flex items-center justify-center"
          title="Near Me / Current Location"
          aria-label="Current Location"
        >
          <LocateFixed className="w-4 h-4" />
        </button>

        <button
          onClick={onResetNorth}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
          title="Reset North"
          aria-label="Reset North"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

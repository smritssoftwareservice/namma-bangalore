'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Mountain,
  CloudRain,
  Sliders,
  FileText,
  Compass,
  Eye,
  Maximize2,
  Ruler,
  Layers,
  Search,
  Navigation,
  Crosshair,
  TrendingUp,
  GitBranch,
  Triangle,
  Columns2,
  Printer,
} from 'lucide-react';
import { ActiveGISTool, GISModuleView, ViewingMode } from '@/lib/types/gis';
import { BENGALURU_HOTSPOTS } from '@/lib/gis/flood-data';

interface GISTopNavProps {
  currentModule: GISModuleView;
  onSelectModule: (mod: GISModuleView) => void;
  viewMode: ViewingMode;
  onSelectViewMode: (vm: ViewingMode) => void;
  activeTool: ActiveGISTool;
  onSelectTool: (tool: ActiveGISTool) => void;
  selectedHotspot: string | null;
  onSelectHotspot: (spotId: string) => void;
  isLayersOpen: boolean;
  onToggleLayers: () => void;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  onOpenExportModal?: () => void;
}

export function GISTopNav({
  currentModule,
  onSelectModule,
  viewMode,
  onSelectViewMode,
  activeTool,
  onSelectTool,
  selectedHotspot,
  onSelectHotspot,
  isLayersOpen,
  onToggleLayers,
  isInspectorOpen,
  onToggleInspector,
  onOpenExportModal,
}: GISTopNavProps) {
  const modules: Array<{ id: GISModuleView; label: string; icon: any }> = [
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'contours', label: 'Filled Contours', icon: Mountain },
    { id: 'tin-terrain', label: 'TIN Mesh', icon: Triangle },
    { id: 'catchment', label: 'Catchment D8', icon: GitBranch },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'comparison', label: 'Dual Comparison', icon: Columns2 },
  ];

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-40">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white flex items-center gap-1">
              BENGALURU <span className="text-sky-400">3D GIS</span>
            </div>
            <div className="text-[9px] text-slate-400 -mt-0.5 font-medium tracking-wide">
              Scientific Terrain & Flood Modelling
            </div>
          </div>
        </Link>

        {/* 2D Commuter Map Switcher */}
        <Link
          href="/map"
          className="hidden sm:inline-flex px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 transition"
        >
          ← 2D Road Map
        </Link>
      </div>

      {/* Primary GIS Modules Switcher */}
      <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = currentModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectModule(m.id)}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold text-xs whitespace-nowrap transition ${
                isActive
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Hotspot Quick Jump, Tools & Camera Controls */}
      <div className="flex items-center gap-2">
        {/* Hotspots Dropdown */}
        <div className="relative hidden md:block">
          <select
            value={selectedHotspot || ''}
            onChange={(e) => onSelectHotspot(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="" disabled>
              Navigate to Hotspot...
            </option>
            {BENGALURU_HOTSPOTS.map((h) => (
              <option key={h.id} value={h.id}>
                📍 {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Viewing Mode 3-Way Switch (Top-Down, 45° Oblique, Ground) */}
        <div className="hidden xl:flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-[10px]">
          <button
            onClick={() => onSelectViewMode('top-down')}
            className={`px-2 py-1 rounded-lg transition ${
              viewMode === 'top-down'
                ? 'bg-slate-800 text-sky-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Nadir Top-Down 2D"
          >
            Top-Down
          </button>
          <button
            onClick={() => onSelectViewMode('oblique')}
            className={`px-2 py-1 rounded-lg transition ${
              viewMode === 'oblique'
                ? 'bg-slate-800 text-sky-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="45° Oblique 3D Perspective"
          >
            3D Oblique
          </button>
          <button
            onClick={() => onSelectViewMode('ground-level')}
            className={`px-2 py-1 rounded-lg transition ${
              viewMode === 'ground-level'
                ? 'bg-slate-800 text-sky-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ground Level First-Person"
          >
            Ground
          </button>
        </div>

        {/* GIS Interactive Analysis Tools */}
        <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
          {/* Inspect Point */}
          <button
            onClick={() => onSelectTool(activeTool === 'inspect' ? 'none' : 'inspect')}
            className={`p-1.5 rounded-lg transition ${
              activeTool === 'inspect'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Inspect Coordinates & Elevation"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Feature 2: Elevation Cross-Section Profile Tool */}
          <button
            onClick={() =>
              onSelectTool(activeTool === 'elevation-profile' ? 'none' : 'elevation-profile')
            }
            className={`p-1.5 rounded-lg transition ${
              activeTool === 'elevation-profile'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Elevation Cross-Section Profile (Click 2 points)"
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>

          {/* Feature 3: Catchment Delineate Tool */}
          <button
            onClick={() =>
              onSelectTool(activeTool === 'catchment-delineate' ? 'none' : 'catchment-delineate')
            }
            className={`p-1.5 rounded-lg transition ${
              activeTool === 'catchment-delineate'
                ? 'bg-blue-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Delineate Catchment at Outlet Point"
          >
            <GitBranch className="w-3.5 h-3.5" />
          </button>

          {/* Distance Measurement */}
          <button
            onClick={() =>
              onSelectTool(activeTool === 'measure-distance' ? 'none' : 'measure-distance')
            }
            className={`p-1.5 rounded-lg transition ${
              activeTool === 'measure-distance'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Measure Geodesic Distance Path"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature 10: Cartographic Map Export Button */}
        {onOpenExportModal && (
          <button
            onClick={onOpenExportModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Export High-Res Cartographic Map"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Layer Panel & Inspector Panel Toggles */}
        <button
          onClick={onToggleLayers}
          className={`p-2 rounded-xl border transition ${
            isLayersOpen
              ? 'bg-sky-500/20 border-sky-500 text-sky-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Layers"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

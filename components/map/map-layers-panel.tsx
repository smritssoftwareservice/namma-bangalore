'use client';

import React from 'react';
import { Layers, X, Eye, EyeOff, Map as MapIcon, CloudRain, Flame, Activity } from 'lucide-react';

export type BaseMapStyle = 'drone' | 'satellite' | 'dark' | 'default' | 'terrain' | 'contour5m';

export interface LayerSettings {
  baseMap: BaseMapStyle;
  droneHud: boolean;
  droneTilt3D: boolean;
  hazards: boolean;
  floodRisk: boolean;
  rainfall: boolean;
  heatmap: boolean;
  roadConditions: boolean;
  incidents: boolean;
  contourLines5m?: boolean;
}

interface MapLayersPanelProps {
  layers: LayerSettings;
  onChange: (layers: LayerSettings) => void;
  onClose: () => void;
}

export function MapLayersPanel({ layers, onChange, onClose }: MapLayersPanelProps) {
  const updateLayer = <K extends keyof LayerSettings>(key: K, val: LayerSettings[K]) => {
    onChange({ ...layers, [key]: val });
  };

  return (
    <div className="w-84 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 shadow-2xl text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <Layers className="w-4 h-4 text-emerald-400" />
          Map Imagery & Layers
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Base Map selector */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Aerial / Base Map Style</span>
          <span className="text-[10px] text-emerald-400 font-mono">4K DRONE ACTIVE</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'drone', label: '4K Aerial Ortho', desc: 'Sub-meter Satellite' },
            { id: 'satellite', label: 'Aerial + Roads', desc: 'Hybrid Street Overlays' },
            { id: 'contour5m', label: '5m Topo Contours', desc: 'Crisp 5m DEM Isolines (Featured)', isFeatured: true },
            { id: 'terrain', label: 'Shaded Elevation', desc: 'Terrain Relief + Contours' },
            { id: 'default', label: 'Apple / Vector', desc: 'Clean City Planimetry' },
            { id: 'dark', label: 'Dark Ops GIS', desc: 'Tactical Night View' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => updateLayer('baseMap', b.id as BaseMapStyle)}
              className={`p-2.5 rounded-xl text-left border transition relative ${
                layers.baseMap === b.id
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              {b.isFeatured && (
                <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[8px] tracking-wide uppercase">
                  5M TOPO
                </span>
              )}
              <div className="font-semibold text-xs">{b.label}</div>
              <div className="text-[10px] text-slate-400 font-normal">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topographic 5-Meter Contour Layer Option */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-2">
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Topographic Contour Engine</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">5m Interval</span>
        </div>
        <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900/60 cursor-pointer">
          <div>
            <span className="font-semibold text-slate-200 block text-xs">Show 5m Contour Lines</span>
            <span className="text-[10px] text-emerald-400/90 block">Crisp isolines & elevation tags every 5 meters</span>
          </div>
          <input
            type="checkbox"
            checked={layers.contourLines5m}
            onChange={(e) => updateLayer('contourLines5m', e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900 h-4 w-4"
          />
        </label>
      </div>

      {/* Drone Reconnaissance Telemetry Options */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2">
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>UAV Drone Telemetry Controls</span>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900/60 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block text-xs">Drone Telemetry HUD</span>
              <span className="text-[10px] text-slate-400 block">Altitude, GPS, reticle & GSD</span>
            </div>
            <input
              type="checkbox"
              checked={layers.droneHud}
              onChange={(e) => updateLayer('droneHud', e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900/60 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block text-xs">3D Oblique Angle (45°)</span>
              <span className="text-[10px] text-slate-400 block">Angled drone flyover perspective</span>
            </div>
            <input
              type="checkbox"
              checked={layers.droneTilt3D}
              onChange={(e) => updateLayer('droneTilt3D', e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900 h-4 w-4"
            />
          </label>
        </div>
      </div>

      {/* Information Overlays */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Hazard Intelligence Overlays
        </div>
        <div className="space-y-1.5">
          {[
            { key: 'hazards', label: 'Hazard Markers', icon: MapIcon, desc: 'Potholes, manholes & damage' },
            { key: 'floodRisk', label: 'Flood-Risk Zones', icon: CloudRain, desc: 'Calculated basin polygons' },
            { key: 'rainfall', label: 'Rainfall Radar', icon: CloudRain, desc: 'Live precipitation overlay' },
            { key: 'heatmap', label: 'Hazard Density Heatmap', icon: Flame, desc: 'Report concentration' },
            { key: 'roadConditions', label: 'Road Conditions', icon: Activity, desc: 'Corridor risk rating' },
            { key: 'incidents', label: 'Reported Incidents', icon: Activity, desc: 'Accidents & road blocks' },
          ].map((item) => {
            const isChecked = layers[item.key as keyof LayerSettings] as boolean;
            const Icon = item.icon;
            return (
              <label
                key={item.key}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isChecked ? 'text-sky-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="font-semibold text-slate-200 block text-xs">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    updateLayer(item.key as keyof LayerSettings, e.target.checked)
                  }
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500/20 bg-slate-900 h-4 w-4"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

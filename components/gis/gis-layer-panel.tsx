'use client';

import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  Info,
  Mountain,
  CloudRain,
  AlertTriangle,
  Droplets,
  Building2,
  X,
  Palette,
  Triangle,
  GitBranch,
} from 'lucide-react';
import {
  ContourSettings,
  ElevationColorPalette,
  HydrologySettings,
  MasterGISLayers,
  SlopeSettings,
  TerrainSettings,
  TINSettings,
  WeatherSettings,
} from '@/lib/types/gis';

interface GISLayerPanelProps {
  layers: MasterGISLayers;
  onUpdateLayer: (key: keyof MasterGISLayers, val: boolean) => void;
  terrainSettings: TerrainSettings;
  onUpdateTerrain: (settings: Partial<TerrainSettings>) => void;
  contourSettings: ContourSettings;
  onUpdateContours: (settings: Partial<ContourSettings>) => void;
  tinSettings?: TINSettings;
  onUpdateTIN?: (settings: Partial<TINSettings>) => void;
  slopeSettings: SlopeSettings;
  onUpdateSlope: (settings: Partial<SlopeSettings>) => void;
  weatherSettings: WeatherSettings;
  onUpdateWeather: (settings: Partial<WeatherSettings>) => void;
  hydrologySettings: HydrologySettings;
  onUpdateHydrology: (settings: Partial<HydrologySettings>) => void;
  onClose?: () => void;
}

export function GISLayerPanel({
  layers,
  onUpdateLayer,
  terrainSettings,
  onUpdateTerrain,
  contourSettings,
  onUpdateContours,
  tinSettings,
  onUpdateTIN,
  slopeSettings,
  onUpdateSlope,
  weatherSettings,
  onUpdateWeather,
  hydrologySettings,
  onUpdateHydrology,
  onClose,
}: GISLayerPanelProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    TERRAIN: false,
    WEATHER: false,
    FLOOD: false,
    HYDROLOGY: false,
    INFRASTRUCTURE: false,
  });

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const palettes: Array<{ id: ElevationColorPalette; label: string }> = [
    { id: 'green-yellow-orange', label: 'Green → Yellow → Orange (Ref 1)' },
    { id: 'blue-green', label: 'Blue → Green (Hydro)' },
    { id: 'terrain-elevation', label: 'Terrain Earth Tones' },
    { id: 'grayscale', label: 'Analytical Grayscale' },
    { id: 'rainbow', label: 'Spectral Rainbow' },
  ];

  return (
    <div className="w-84 max-h-[85vh] flex flex-col rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl text-xs overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>GIS Layer Manager</span>
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

      {/* Layer Categories Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* CATEGORY 1: TERRAIN */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleCategory('TERRAIN')}
            className="w-full px-3 py-2 flex items-center justify-between text-left font-semibold text-slate-300 hover:bg-slate-800/40 transition"
          >
            <div className="flex items-center gap-2 text-sky-400">
              <Mountain className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[11px] font-bold">Terrain & Elevation</span>
            </div>
            {collapsedCategories.TERRAIN ? (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {!collapsedCategories.TERRAIN && (
            <div className="p-2.5 pt-0 space-y-2.5 border-t border-slate-800/40 text-slate-300">
              {/* Hypsometric Color Palette Selector (Ref Image 1) */}
              <div className="space-y-1 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Palette className="w-3 h-3 text-sky-400" />
                    Elevation Color Palette:
                  </span>
                </div>
                <select
                  value={terrainSettings.colorPalette || 'green-yellow-orange'}
                  onChange={(e) => {
                    const pal = e.target.value as ElevationColorPalette;
                    onUpdateTerrain({ colorPalette: pal });
                    onUpdateContours({ colorPalette: pal });
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {palettes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3D Terrain & Exaggeration */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-[11px]">3D Digital Terrain (DEM)</span>
                <button
                  onClick={() => onUpdateLayer('terrain3D', !layers.terrain3D)}
                  className={`p-1 rounded transition ${
                    layers.terrain3D ? 'text-sky-400 bg-sky-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.terrain3D ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Filled Elevation Contours (Ref Image 1) */}
              <div className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/40">
                <div>
                  <div className="font-medium text-[11px]">Filled Hypsometric Relief</div>
                  <div className="text-[9px] text-slate-400">Smooth continuous terrain gradient (Zero squares)</div>
                </div>
                <button
                  onClick={() => {
                    const next = !layers.filledContours;
                    onUpdateLayer('filledContours', next);
                    onUpdateContours({ filledContours: next });
                  }}
                  className={`p-1 rounded transition ${
                    layers.filledContours ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.filledContours ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Natural Topographic Contour Lines */}
              <div className="space-y-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[11px]">Topographic Contour Isolines</span>
                    <div className="text-[9px] text-emerald-400">Smooth organic curves (5m resolution)</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !layers.contourLines;
                      onUpdateLayer('contourLines', next);
                      onUpdateContours({ enabled: next });
                    }}
                    className={`p-1 rounded transition ${
                      layers.contourLines ? 'text-sky-400 bg-sky-950/60' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {layers.contourLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {layers.contourLines && (
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <span className="text-[10px] text-slate-400">Interval:</span>
                    <div className="flex gap-1">
                      {[2, 5, 10, 20, 50].map((intv) => (
                        <button
                          key={intv}
                          onClick={() => onUpdateContours({ interval: intv as any })}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition ${
                            contourSettings.interval === intv
                              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {intv}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feature 4: TIN Terrain Model */}
              <div className="space-y-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Triangle className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="font-medium text-[11px]">TIN Terrain Model</span>
                      <div className="text-[9px] text-slate-400">Delaunay Triangular Mesh</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateLayer('tinMesh', !layers.tinMesh)}
                    className={`p-1 rounded transition ${
                      layers.tinMesh ? 'text-amber-400 bg-amber-950/60' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {layers.tinMesh ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {layers.tinMesh && onUpdateTIN && tinSettings && (
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tinSettings.showWireframe}
                        onChange={(e) => onUpdateTIN({ showWireframe: e.target.checked })}
                        className="accent-amber-500 rounded"
                      />
                      <span>Show Triangle Wireframe</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Exaggeration Slider */}
              <div className="space-y-1 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Elevation Exaggeration</span>
                  <span className="text-sky-400 font-mono">{terrainSettings.elevationExaggeration}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={terrainSettings.elevationExaggeration}
                  onChange={(e) =>
                    onUpdateTerrain({ elevationExaggeration: parseFloat(e.target.value) })
                  }
                  className="w-full accent-sky-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Slope Analysis */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Slope & Aspect Analysis</div>
                  <div className="text-[9px] text-slate-400">0–2° Flat to &gt;30° Steep Tiers</div>
                </div>
                <button
                  onClick={() => {
                    const next = !layers.slopeAnalysis;
                    onUpdateLayer('slopeAnalysis', next);
                    onUpdateSlope({ enabled: next });
                  }}
                  className={`p-1 rounded transition ${
                    layers.slopeAnalysis ? 'text-amber-400 bg-amber-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.slopeAnalysis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY 2: HYDROLOGY & CATCHMENT */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleCategory('HYDROLOGY')}
            className="w-full px-3 py-2 flex items-center justify-between text-left font-semibold text-slate-300 hover:bg-slate-800/40 transition"
          >
            <div className="flex items-center gap-2 text-blue-400">
              <Droplets className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[11px] font-bold">Hydrology & Catchment</span>
            </div>
            {collapsedCategories.HYDROLOGY ? (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {!collapsedCategories.HYDROLOGY && (
            <div className="p-2.5 pt-0 space-y-2 border-t border-slate-800/40 text-slate-300">
              {/* Feature 3: Catchment Delineation */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <div>
                    <div className="font-medium text-[11px]">Catchment Delineation (D8)</div>
                    <div className="text-[9px] text-slate-400">Upstream Watershed Divides</div>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateLayer('catchmentDelineation', !layers.catchmentDelineation)}
                  className={`p-1 rounded transition ${
                    layers.catchmentDelineation ? 'text-blue-400 bg-blue-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.catchmentDelineation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Lakes (34 Water Bodies)</div>
                  <div className="text-[9px] text-slate-400">3D Water Level & Storage %</div>
                </div>
                <button
                  onClick={() => {
                    const next = !layers.lakes;
                    onUpdateLayer('lakes', next);
                    onUpdateHydrology({ lakes: next });
                  }}
                  className={`p-1 rounded transition ${
                    layers.lakes ? 'text-blue-400 bg-blue-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.lakes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Primary Rajakaluves (SWD)</div>
                  <div className="text-[9px] text-slate-400">Arterial Stormwater Network & Sinks</div>
                </div>
                <button
                  onClick={() => {
                    const next = !layers.rajakaluves;
                    onUpdateLayer('rajakaluves', next);
                    onUpdateHydrology({ rajakaluves: next });
                  }}
                  className={`p-1 rounded transition ${
                    layers.rajakaluves ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.rajakaluves ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Watersheds & Valleys</div>
                  <div className="text-[9px] text-slate-400">KC, Hebbal & Vrishabhavathi</div>
                </div>
                <button
                  onClick={() => {
                    const next = !layers.watersheds;
                    onUpdateLayer('watersheds', next);
                    onUpdateHydrology({ watershedBoundaries: next });
                  }}
                  className={`p-1 rounded transition ${
                    layers.watersheds ? 'text-indigo-400 bg-indigo-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.watersheds ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY 3: FLOOD INUNDATION & IMPACTS (Ref Image 2) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleCategory('FLOOD')}
            className="w-full px-3 py-2 flex items-center justify-between text-left font-semibold text-slate-300 hover:bg-slate-800/40 transition"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[11px] font-bold">Flood Inundation & Impact</span>
            </div>
            {collapsedCategories.FLOOD ? (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {!collapsedCategories.FLOOD && (
            <div className="p-2.5 pt-0 space-y-2 border-t border-slate-800/40 text-slate-300">
              {/* 3D Flood Basin Inundation Layer */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">3D Flood Basin Inundation Zones</div>
                  <div className="text-[9px] text-cyan-400">Bellandur, Manyata, Silk Board Basins</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('floodRiskZones', !layers.floodRiskZones)}
                  className={`p-1 rounded transition ${
                    layers.floodRiskZones ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.floodRiskZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Flooded Inundation Extent</div>
                  <div className="text-[9px] text-slate-400">Blue Water Surface Polygon</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('floodSimulation', !layers.floodSimulation)}
                  className={`p-1 rounded transition ${
                    layers.floodSimulation ? 'text-blue-400 bg-blue-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.floodSimulation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Flooded Structures (Ref Image 2) */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Flooded Structures (Buildings)</div>
                  <div className="text-[9px] text-slate-400">Highlighted Building Footprints (Ref 2)</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('floodedStructures', !layers.floodedStructures)}
                  className={`p-1 rounded transition ${
                    layers.floodedStructures ? 'text-red-400 bg-red-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.floodedStructures ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Flood-Affected Roads (Ref Image 2) */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Flood-Affected Roads</div>
                  <div className="text-[9px] text-slate-400">Severed / Impassable Corridors (Ref 2)</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('floodAffectedRoads', !layers.floodAffectedRoads)}
                  className={`p-1 rounded transition ${
                    layers.floodAffectedRoads ? 'text-orange-400 bg-orange-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.floodAffectedRoads ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Waterlogging Depth Markers</div>
                  <div className="text-[9px] text-slate-400">Live Measured Road Depths (m)</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('waterlogging', !layers.waterlogging)}
                  className={`p-1 rounded transition ${
                    layers.waterlogging ? 'text-red-400 bg-red-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.waterlogging ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Historical Deluges (2016-2024)</div>
                  <div className="text-[9px] text-slate-400">Documented Cloudburst Footprints</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('historicalFloods', !layers.historicalFloods)}
                  className={`p-1 rounded transition ${
                    layers.historicalFloods ? 'text-purple-400 bg-purple-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.historicalFloods ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY 4: WEATHER */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleCategory('WEATHER')}
            className="w-full px-3 py-2 flex items-center justify-between text-left font-semibold text-slate-300 hover:bg-slate-800/40 transition"
          >
            <div className="flex items-center gap-2 text-cyan-400">
              <CloudRain className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[11px] font-bold">Weather Intelligence</span>
            </div>
            {collapsedCategories.WEATHER ? (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {!collapsedCategories.WEATHER && (
            <div className="p-2.5 pt-0 space-y-2 border-t border-slate-800/40 text-slate-300">
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Weather Radar (RainViewer)</div>
                  <div className="text-[9px] text-slate-400">Doppler Reflectivity Composite</div>
                </div>
                <button
                  onClick={() => {
                    const next = !layers.weatherRadar;
                    onUpdateLayer('weatherRadar', next);
                    onUpdateWeather({ weatherRadar: next });
                  }}
                  className={`p-1 rounded transition ${
                    layers.weatherRadar ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.weatherRadar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30">
                <div>
                  <div className="font-medium text-[11px]">Rainfall Map (Open-Meteo)</div>
                  <div className="text-[9px] text-slate-400">Hourly Precipitation Contours</div>
                </div>
                <button
                  onClick={() => onUpdateLayer('rainfall', !layers.rainfall)}
                  className={`p-1 rounded transition ${
                    layers.rainfall ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {layers.rainfall ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

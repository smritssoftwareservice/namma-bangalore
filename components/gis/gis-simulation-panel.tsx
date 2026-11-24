'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Building,
  Car,
  Users,
  Info,
  X,
  CheckCircle,
} from 'lucide-react';
import { RainfallScenarioPreset, SimulationParameters, SimulationResult } from '@/lib/types/gis';
import { BENGALURU_HOTSPOTS } from '@/lib/gis/flood-data';

interface GISSimulationPanelProps {
  params: SimulationParameters;
  onUpdateParams: (newParams: Partial<SimulationParameters>) => void;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  simulationProgress: number; // 0.0 to 1.0
  result: SimulationResult | null;
  onClose?: () => void;
}

export function GISSimulationPanel({
  params,
  onUpdateParams,
  onRunSimulation,
  onResetSimulation,
  isSimulating,
  onToggleSimulating,
  simulationProgress,
  result,
  onClose,
}: GISSimulationPanelProps) {
  const scenarioOptions: RainfallScenarioPreset[] = [25, 50, 100, 150, 200];

  return (
    <div className="w-88 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl p-4 text-xs space-y-3.5 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm">3D Flood Simulation</div>
            <div className="text-[10px] text-slate-400">SCS-CN Runoff & Topographic Model</div>
          </div>
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

      {/* Target Location Hotspot Selector */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-semibold text-slate-400">
          Target Basin / Corridor:
        </label>
        <select
          value={params.targetLocation.name}
          onChange={(e) => {
            const spot = BENGALURU_HOTSPOTS.find((h) => h.name === e.target.value);
            if (spot) {
              onUpdateParams({
                targetLocation: {
                  name: spot.name,
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                  baseElevationMeters: spot.elevationMeters,
                },
              });
            }
          }}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          {BENGALURU_HOTSPOTS.map((h) => (
            <option key={h.id} value={h.name}>
              {h.name} ({h.riskLevel} Risk)
            </option>
          ))}
        </select>
      </div>

      {/* Rainfall Scenario Presets (25, 50, 100, 150, 200 mm) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-slate-400">
          <span>Simulated Rainfall Scenario:</span>
          <span className="text-sky-400 font-mono font-bold">{params.rainfallScenarioMm} mm</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {scenarioOptions.map((sc) => (
            <button
              key={sc}
              onClick={() => onUpdateParams({ rainfallScenarioMm: sc })}
              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition ${
                params.rainfallScenarioMm === sc
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {sc}mm
            </button>
          ))}
        </div>
      </div>

      {/* Duration Slider */}
      <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Rainfall Duration</span>
          <span className="text-sky-400 font-mono font-bold">{params.rainfallDurationHours} Hours</span>
        </div>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={params.rainfallDurationHours}
          onChange={(e) => onUpdateParams({ rainfallDurationHours: parseInt(e.target.value, 10) })}
          className="w-full accent-sky-400 h-1 bg-slate-800 rounded cursor-pointer"
        />
      </div>

      {/* Water Level Rise Target */}
      <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Water Stage Rise Target</span>
          <span className="text-sky-400 font-mono font-bold">+{params.targetWaterLevelMeters} m</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="3.0"
          step="0.2"
          value={params.targetWaterLevelMeters}
          onChange={(e) => onUpdateParams({ targetWaterLevelMeters: parseFloat(e.target.value) })}
          className="w-full accent-sky-400 h-1 bg-slate-800 rounded cursor-pointer"
        />
      </div>

      {/* Simulation Playback & Trigger Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onRunSimulation}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Compute Scenario
        </button>
        <button
          onClick={onToggleSimulating}
          disabled={!result}
          className={`px-3 py-2 rounded-xl border transition ${
            isSimulating
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white disabled:opacity-40'
          }`}
          title={isSimulating ? 'Pause Playback' : 'Play Animated Rise'}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={onResetSimulation}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
          title="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Animated Timeline Progress Bar */}
      {result && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Inundation Phase</span>
            <span className="text-sky-400">{Math.round(simulationProgress * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.round(simulationProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Impact Assessment Results Card */}
      {result && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Scenario Impact Analysis</span>
            <span className="text-sky-400 font-mono">{result.scenarioMm}mm Storm</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[9px] text-slate-400">Inundation</div>
              <div className="text-xs font-bold text-white font-mono">
                {result.inundationAreaSqKm} <span className="text-[9px] font-normal">km²</span>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[9px] text-slate-400">Roads Cut</div>
              <div className="text-xs font-bold text-red-400 font-mono">
                {result.affectedInfrastructure.roadsSubmergedKm} <span className="text-[9px] font-normal">km</span>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[9px] text-slate-400">Facilities</div>
              <div className="text-xs font-bold text-amber-400 font-mono">
                {result.affectedInfrastructure.criticalFacilitiesCount}
              </div>
            </div>
          </div>

          {result.affectedInfrastructure.submergedRoadNames.length > 0 && (
            <div className="pt-1 text-[10px] text-slate-300">
              <div className="font-semibold text-red-400 flex items-center gap-1 mb-0.5">
                <Car className="w-3 h-3" />
                Submerged Road Corridors:
              </div>
              <div className="space-y-0.5 text-slate-400 pl-4 list-disc">
                {result.affectedInfrastructure.submergedRoadNames.slice(0, 3).map((r, i) => (
                  <div key={i} className="truncate">• {r}</div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-1 border-t border-slate-800/60 text-[9px] text-slate-500 italic">
            ⚠️ {result.modelDisclaimer}
          </div>
        </div>
      )}
    </div>
  );
}


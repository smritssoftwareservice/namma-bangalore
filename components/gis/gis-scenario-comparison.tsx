'use client';

import React, { useState } from 'react';
import {
  Columns2,
  Sliders,
  Layers,
  Building,
  Car,
  AlertTriangle,
  Waves,
  ArrowRight,
  TrendingUp,
  X,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { RainfallScenarioPreset, ScenarioDeltaMetrics, SimulationResult } from '@/lib/types/gis';
import { runFloodSimulation } from '@/lib/gis/simulation-service';
import { analyzeInundatedInfrastructure } from '@/lib/gis/structures-roads-data';

interface GISScenarioComparisonProps {
  baselineScenarioMm?: RainfallScenarioPreset;
  comparisonScenarioMm?: RainfallScenarioPreset;
  centerLocation: {
    name: string;
    latitude: number;
    longitude: number;
    baseElevationMeters: number;
  };
  onClose: () => void;
  onApplyScenarioToMap?: (scenarioMm: RainfallScenarioPreset) => void;
}

export function GISScenarioComparison({
  baselineScenarioMm = 25,
  comparisonScenarioMm = 100,
  centerLocation,
  onClose,
  onApplyScenarioToMap,
}: GISScenarioComparisonProps) {
  const [baseMm, setBaseMm] = useState<RainfallScenarioPreset>(baselineScenarioMm);
  const [compMm, setCompMm] = useState<RainfallScenarioPreset>(comparisonScenarioMm);
  const [durationH, setDurationH] = useState<number>(3);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'split'>('side-by-side');

  // Compute baseline simulation
  const baseSim = runFloodSimulation({
    targetLocation: centerLocation,
    rainfallScenarioMm: baseMm,
    rainfallDurationHours: durationH,
    targetWaterLevelMeters: baseMm === 25 ? 0.3 : baseMm === 50 ? 0.6 : 1.2,
    runoffCoefficient: 0.88,
  });

  const baseInfra = analyzeInundatedInfrastructure(
    baseSim.inundationPolygon,
    baseSim.simulatedWaterLevelMeters,
    centerLocation.latitude,
    centerLocation.longitude
  );

  // Compute comparison simulation
  const compSim = runFloodSimulation({
    targetLocation: centerLocation,
    rainfallScenarioMm: compMm,
    rainfallDurationHours: durationH,
    targetWaterLevelMeters: compMm === 25 ? 0.3 : compMm === 50 ? 0.6 : compMm === 100 ? 1.2 : 2.0,
    runoffCoefficient: 0.88,
  });

  const compInfra = analyzeInundatedInfrastructure(
    compSim.inundationPolygon,
    compSim.simulatedWaterLevelMeters,
    centerLocation.latitude,
    centerLocation.longitude
  );

  // Delta calculations
  const deltaAreaKm2 = Math.round((compSim.inundationAreaSqKm - baseSim.inundationAreaSqKm) * 10) / 10;
  const deltaAreaPct = Math.round((deltaAreaKm2 / (baseSim.inundationAreaSqKm || 1)) * 100);
  const deltaRoadsKm = Math.round((compInfra.totalSubmergedRoadKm - baseInfra.totalSubmergedRoadKm) * 10) / 10;
  const deltaStructures = compInfra.totalAffectedStructures - baseInfra.totalAffectedStructures;
  const deltaRunoffM3 = compSim.totalRunoffVolumeM3 - baseSim.totalRunoffVolumeM3;

  const scenarios: RainfallScenarioPreset[] = [25, 50, 100, 150, 200];

  return (
    <div className="w-[820px] max-w-[95vw] rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-5 text-xs text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Columns2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm">
              Flood Inundation Scenario Comparison (Dual Analysis)
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Reference Location: {centerLocation.name} ({centerLocation.latitude.toFixed(4)}°N,{' '}
              {centerLocation.longitude.toFixed(4)}°E)
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

      {/* Scenario Controls Toolbar */}
      <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        {/* Left: Baseline Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-sky-300">
            <span>Baseline Storm Condition:</span>
            <span className="font-mono">{baseMm} mm</span>
          </div>
          <div className="flex gap-1">
            {scenarios.map((sc) => (
              <button
                key={sc}
                onClick={() => setBaseMm(sc)}
                className={`flex-1 py-1 rounded text-[10px] font-mono transition ${
                  baseMm === sc
                    ? 'bg-sky-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sc}mm
              </button>
            ))}
          </div>
        </div>

        {/* Right: Comparison Scenario Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
            <span>Severe Deluge Scenario:</span>
            <span className="font-mono">{compMm} mm</span>
          </div>
          <div className="flex gap-1">
            {scenarios.map((sc) => (
              <button
                key={sc}
                onClick={() => setCompMm(sc)}
                className={`flex-1 py-1 rounded text-[10px] font-mono transition ${
                  compMm === sc
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sc}mm
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Map Panels (Ref Image 2 Representation) */}
      <div className="grid grid-cols-2 gap-3">
        {/* LEFT PANEL: Baseline Scenario */}
        <div className="rounded-xl border border-sky-500/30 bg-slate-900/80 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
              MAP A: BASELINE ({baseMm}mm)
            </span>
            <span className="text-slate-400 text-[10px]">Water Stage: +{baseSim.simulatedWaterLevelMeters}m</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Flooded Extent:</span>
              <span className="font-mono font-bold text-white">{baseSim.inundationAreaSqKm} km²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Submerged Roads:</span>
              <span className="font-mono font-bold text-white">{baseInfra.totalSubmergedRoadKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flooded Structures:</span>
              <span className="font-mono font-bold text-white">{baseInfra.totalAffectedStructures} buildings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Runoff Volume:</span>
              <span className="font-mono font-bold text-white">{(baseSim.totalRunoffVolumeM3 / 1000).toLocaleString()} m³</span>
            </div>
          </div>

          {onApplyScenarioToMap && (
            <button
              onClick={() => onApplyScenarioToMap(baseMm)}
              className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-semibold transition"
            >
              Apply Baseline to 3D Map
            </button>
          )}
        </div>

        {/* RIGHT PANEL: Alternative Deluge Scenario */}
        <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
              MAP B: SCENARIO ({compMm}mm)
            </span>
            <span className="text-slate-400 text-[10px]">Water Stage: +{compSim.simulatedWaterLevelMeters}m</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Flooded Extent:</span>
              <span className="font-mono font-bold text-amber-300">{compSim.inundationAreaSqKm} km²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Submerged Roads:</span>
              <span className="font-mono font-bold text-amber-300">{compInfra.totalSubmergedRoadKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flooded Structures:</span>
              <span className="font-mono font-bold text-amber-300">{compInfra.totalAffectedStructures} buildings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Runoff Volume:</span>
              <span className="font-mono font-bold text-amber-300">{(compSim.totalRunoffVolumeM3 / 1000).toLocaleString()} m³</span>
            </div>
          </div>

          {onApplyScenarioToMap && (
            <button
              onClick={() => onApplyScenarioToMap(compMm)}
              className="w-full mt-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-semibold transition"
            >
              Apply Scenario to 3D Map
            </button>
          )}
        </div>
      </div>

      {/* Comparative Delta (Δ) Analytics Card */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Delta (Δ) Scenario Divergence Metrics
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400">Δ Inundation Area</div>
            <div className="text-sm font-black text-red-400 font-mono mt-0.5">
              +{deltaAreaKm2} km²
            </div>
            <div className="text-[8px] text-slate-500">+{deltaAreaPct}% expansion</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400">Δ Submerged Roads</div>
            <div className="text-sm font-black text-orange-400 font-mono mt-0.5">
              +{deltaRoadsKm} km
            </div>
            <div className="text-[8px] text-slate-500">Access severed</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400">Δ Flooded Buildings</div>
            <div className="text-sm font-black text-red-400 font-mono mt-0.5">
              +{deltaStructures}
            </div>
            <div className="text-[8px] text-slate-500">Structures impacted</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[9px] text-slate-400">Δ Runoff Surcharge</div>
            <div className="text-sm font-black text-cyan-400 font-mono mt-0.5">
              +{(deltaRunoffM3 / 1000).toLocaleString()} m³
            </div>
            <div className="text-[8px] text-slate-500">Storm drainage surge</div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapContainer } from '@/components/map/map-container';
import { MapLayersPanel, LayerSettings } from '@/components/map/map-layers-panel';
import { MapControls } from '@/components/map/map-controls';
import { HazardPopupCard } from '@/components/map/hazard-popup-card';
import { DEMO_FLOOD_ZONES, DEMO_ROAD_CONDITIONS } from '@/lib/db/demo-data';
import { Hazard } from '@/lib/types/hazard';
import { Layers, ShieldCheck, CheckCircle2, Wrench, AlertTriangle, X } from 'lucide-react';

export default function AdminMapPage() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'UNVERIFIED' | 'WATERLOGGING' | 'MAINTENANCE'>('ALL');
  const [layers, setLayers] = useState<LayerSettings>({
    baseMap: 'drone',
    droneHud: false,
    droneTilt3D: false,
    hazards: true,
    floodRisk: true,
    rainfall: true,
    heatmap: false,
    roadConditions: true,
    incidents: true,
    contourLines5m: false,
  });
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  useEffect(() => {
    async function fetchHazards() {
      try {
        const res = await fetch('/api/hazards');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setHazards(json.data.hazards || []);
          }
        }
      } catch {
        // demo fallback
      }
    }
    fetchHazards();
  }, []);

  const handleVerify = async (hazardId: string) => {
    try {
      const res = await fetch(`/api/hazards/${hazardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.ok) {
        setHazards((prev) =>
          prev.map((h) => (h.id === hazardId ? { ...h, status: 'VERIFIED' } : h))
        );
        if (selectedHazard?.id === hazardId) {
          setSelectedHazard((prev) => (prev ? { ...prev, status: 'VERIFIED' } : null));
        }
      }
    } catch {
      // ignore
    }
  };

  const filteredHazards = hazards.filter((h) => {
    if (filterMode === 'CRITICAL') return h.risk_level === 'CRITICAL';
    if (filterMode === 'UNVERIFIED')
      return h.status === 'REPORTED' || h.status === 'PENDING_VERIFICATION';
    if (filterMode === 'WATERLOGGING')
      return h.type === 'WATERLOGGING' || h.type === 'FLOODED_ROAD';
    if (filterMode === 'MAINTENANCE')
      return h.status === 'ASSIGNED' || h.status === 'IN_PROGRESS';
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 font-sans">
      {/* Top Floating Operational Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between gap-3">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-xl overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: `All (${hazards.length})` },
            { id: 'CRITICAL', label: 'Critical Risk', color: 'text-red-400' },
            { id: 'UNVERIFIED', label: 'Unverified Reports', color: 'text-amber-400' },
            { id: 'WATERLOGGING', label: 'Waterlogging', color: 'text-cyan-400' },
            { id: 'MAINTENANCE', label: 'Field Repairs Active', color: 'text-sky-400' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                filterMode === btn.id
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={btn.color}>{btn.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className="pointer-events-auto p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white shadow-xl flex items-center gap-2 text-xs font-semibold"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">GIS Layers</span>
        </button>
      </div>

      {/* Main Map */}
      <MapContainer
        hazards={filteredHazards}
        floodZones={DEMO_FLOOD_ZONES}
        roadConditions={DEMO_ROAD_CONDITIONS}
        layers={layers}
        selectedHazard={selectedHazard}
        onSelectHazard={(h) => setSelectedHazard(h)}
        initialCenter={[12.9716, 77.5946]}
        initialZoom={13}
        is3D={layers.droneTilt3D}
        onToggle3D={() =>
          setLayers((prev) => ({ ...prev, droneTilt3D: !prev.droneTilt3D }))
        }
        isDroneHudOpen={layers.droneHud}
        onToggleDroneHud={() =>
          setLayers((prev) => ({ ...prev, droneHud: !prev.droneHud }))
        }
      />

      {/* Layers Panel Drawer */}
      {isLayersOpen && (
        <div className="absolute top-16 right-4 z-30 pointer-events-auto">
          <MapLayersPanel
            layers={layers}
            onChange={setLayers}
            onClose={() => setIsLayersOpen(false)}
          />
        </div>
      )}

      {/* Selected Hazard Quick Inspector Card */}
      {selectedHazard && (
        <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:left-4 z-30 pointer-events-auto max-w-sm">
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3 text-xs">
            <button
              onClick={() => setSelectedHazard(null)}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <HazardPopupCard hazard={selectedHazard} />

            {/* Quick Admin Action Toolbar */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              {selectedHazard.status !== 'VERIFIED' && selectedHazard.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleVerify(selectedHazard.id)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verify Report
                </button>
              )}
              <Link
                href={`/hazard/${selectedHazard.id}`}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center border border-slate-700 transition"
              >
                Inspect Full Dossier
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Filter, X, RotateCcw, Check } from 'lucide-react';

export interface FilterState {
  type: string;
  risk_level: string;
  status: string;
  waterlogging: boolean;
  ai_detected: boolean;
  timeRange: 'all' | 'today' | '7days' | '30days';
}

export const INITIAL_FILTERS: FilterState = {
  type: 'ALL',
  risk_level: 'ALL',
  status: 'ALL',
  waterlogging: false,
  ai_detected: false,
  timeRange: 'all',
};

interface MapFiltersDrawerProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
  count: number;
}

export function MapFiltersDrawer({
  filters,
  onChange,
  onClose,
  count,
}: MapFiltersDrawerProps) {
  const update = <K extends keyof FilterState>(key: K, val: FilterState[K]) => {
    onChange({ ...filters, [key]: val });
  };

  const reset = () => {
    onChange(INITIAL_FILTERS);
  };

  return (
    <div className="w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 shadow-2xl text-xs space-y-4 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <Filter className="w-4 h-4 text-sky-400" />
          Filter Hazards ({count})
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={reset}
            className="p-1 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 rounded-lg hover:bg-slate-800"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hazard Type */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Hazard Category
        </label>
        <select
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className="w-full rounded-xl bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
        >
          <option value="ALL">All Hazard Categories</option>
          <option value="POTHOLES">Potholes & Craters</option>
          <option value="MANHOLES">Open & Damaged Manholes</option>
          <option value="WATERLOGGING">Waterlogging & Flooding</option>
          <option value="DRAINS">Drainage & Culvert Problems</option>
          <option value="INCIDENTS">Reported Incidents (Accidents / Blocks)</option>
        </select>
      </div>

      {/* Risk Level */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Risk Severity
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'All Risks' },
            { id: 'CRITICAL', label: 'Critical (81-100)' },
            { id: 'HIGH', label: 'High (61-80)' },
            { id: 'MODERATE', label: 'Moderate (31-60)' },
            { id: 'LOW', label: 'Low (0-30)' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => update('risk_level', r.id)}
              className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] border transition ${
                filters.risk_level === r.id
                  ? 'bg-sky-500/20 text-sky-300 font-bold border-sky-500/40'
                  : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Status */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Workflow Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          className="w-full rounded-xl bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="REPORTED">Reported (New)</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="VERIFIED">Verified by Admin</option>
          <option value="ASSIGNED">Assigned to Field Crew</option>
          <option value="IN_PROGRESS">Repair In Progress</option>
          <option value="RESOLVED">Resolved / Repaired</option>
          <option value="CLOSED">Closed & Verified</option>
        </select>
      </div>

      {/* Time Range */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Report Freshness
        </label>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: '24h' },
            { id: '7days', label: '7d' },
            { id: '30days', label: '30d' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => update('timeRange', t.id as any)}
              className={`py-1.5 rounded-lg text-center text-[11px] border transition ${
                filters.timeRange === t.id
                  ? 'bg-sky-500/20 text-sky-300 font-bold border-sky-500/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Checkbox Toggles */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
          <span className="text-slate-300 font-medium text-xs">Only AI-detected records</span>
          <input
            type="checkbox"
            checked={filters.ai_detected}
            onChange={(e) => update('ai_detected', e.target.checked)}
            className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
          <span className="text-slate-300 font-medium text-xs">Only active waterlogging</span>
          <input
            type="checkbox"
            checked={filters.waterlogging}
            onChange={(e) => update('waterlogging', e.target.checked)}
            className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700"
          />
        </label>
      </div>
    </div>
  );
}

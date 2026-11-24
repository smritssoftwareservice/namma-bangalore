'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Award,
} from 'lucide-react';
import { AdminCharts } from '@/components/admin/admin-charts';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    total: 52,
    critical: 12,
    high: 18,
    moderate: 14,
    low: 8,
    potholes: 21,
    manholes: 9,
    waterlogging: 11,
    drains: 6,
    incidents: 5,
    resolved: 10,
    inProgress: 14,
    pending: 28,
    byArea: [
      { area: 'Whitefield', count: 14 },
      { area: 'Bellandur ORR', count: 12 },
      { area: 'Koramangala', count: 9 },
      { area: 'Silk Board', count: 7 },
      { area: 'Indiranagar', count: 6 },
      { area: 'HSR Layout', count: 4 },
    ],
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Geospatial Intelligence & Trends</h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive hazard hotspot mapping, municipal response efficiency, and rainfall impact modeling.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg. Resolution Turnaround</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">4.2 Hours</div>
          <p className="text-[11px] text-emerald-400 font-medium">
            ↓ 18% improvement vs historical baseline
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>AI Assistive Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">94.8%</div>
          <p className="text-[11px] text-slate-400">Validated against inspector confirmation logs</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Precipitation Vulnerability</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300">High Risk</div>
          <p className="text-[11px] text-slate-400">Bellandur and Sarjapur basin sectors</p>
        </div>
      </div>

      {/* Charts Section */}
      <AdminCharts analytics={analytics} />

      {/* Vulnerable Transit Corridors Table */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          High-Frequency Incident Corridors (Bengaluru Metropolitan Region)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Corridor</th>
                <th className="p-3">Active Hazards</th>
                <th className="p-3">Waterlogging Risk</th>
                <th className="p-3">Primary Factor</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                {
                  road: 'Outer Ring Road (Silk Board to Marathahalli)',
                  hazards: 14,
                  water: 'Critical (44mm)',
                  factor: 'Stormwater culvert capacity limit',
                  status: 'Emergency Action',
                },
                {
                  road: 'Sarjapur Main Road (Rainbow Drive)',
                  hazards: 9,
                  water: 'Critical (38mm)',
                  factor: 'Low-lying lake overflow basin',
                  status: 'Underpass Alert',
                },
                {
                  road: 'Whitefield Main Road / ITPL Corridor',
                  hazards: 11,
                  water: 'High (26mm)',
                  factor: 'Open manholes & deep craters',
                  status: 'Crew Dispatched',
                },
                {
                  road: 'Bannerghatta Road (Jayadeva Junction)',
                  hazards: 6,
                  water: 'Moderate (18mm)',
                  factor: 'Drain grating fracture',
                  status: 'Scheduled',
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-850/40 transition">
                  <td className="p-3 font-semibold text-white">{row.road}</td>
                  <td className="p-3 font-bold text-amber-400">{row.hazards}</td>
                  <td className="p-3 text-cyan-300">{row.water}</td>
                  <td className="p-3 text-slate-400">{row.factor}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

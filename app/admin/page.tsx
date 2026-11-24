'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Flame,
  Droplets,
  Hammer,
  CircleDot,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { AdminCharts } from '@/components/admin/admin-charts';

export default function AdminDashboardPage() {
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
      { area: 'Koramangala', count: 9 },
      { area: 'Bellandur', count: 12 },
      { area: 'Silk Board', count: 7 },
      { area: 'Indiranagar', count: 6 },
      { area: 'HSR Layout', count: 4 },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setAnalytics(json.data);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const kpis = [
    {
      label: 'Total Incidents',
      value: analytics.total,
      sub: 'All recorded hazards',
      color: 'text-white',
      border: 'border-slate-800',
      bg: 'bg-slate-900/60',
    },
    {
      label: 'Critical Risk',
      value: analytics.critical,
      sub: 'Immediate action required',
      color: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
    },
    {
      label: 'High Risk',
      value: analytics.high,
      sub: 'Priority queue',
      color: 'text-orange-400',
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Active Waterlogging',
      value: analytics.waterlogging,
      sub: 'Surface inundation',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Potholes & Craters',
      value: analytics.potholes,
      sub: 'Asphalt erosion',
      color: 'text-yellow-400',
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Open Manholes',
      value: analytics.manholes,
      sub: 'Chamber hazards',
      color: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Pending Review',
      value: analytics.pending,
      sub: 'Unverified citizen reports',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Resolved & Repaired',
      value: analytics.resolved,
      sub: 'Verified repairs',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">GIS Operations Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time urban hazard tracking, spatial clustering, and municipal field crew dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/reports"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition"
          >
            <span>Moderate Reports</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/maintenance"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <span>Field Tasks</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/map"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <span>Operational Map</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 8-Card KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${kpi.border} ${kpi.bg} shadow-lg space-y-1`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {kpi.label}
            </span>
            <span className={`text-2xl sm:text-3xl font-black ${kpi.color} block`}>
              {kpi.value}
            </span>
            <span className="text-[10px] text-slate-500 block">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Interactive Charts Suite */}
      <AdminCharts analytics={analytics} />
    </div>
  );
}

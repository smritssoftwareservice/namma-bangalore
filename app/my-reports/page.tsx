'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Hazard } from '@/lib/types/hazard';
import { getHazardIcon, getRiskColor } from '@/components/map/hazard-icons';
import { DemoBadge } from '@/components/ui/demo-badge';

export default function MyReportsPage() {
  const [reports, setReports] = useState<Hazard[]>([]);
  const [tab, setTab] = useState<'all' | 'pending' | 'verified' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/hazards');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setReports(json.data.hazards || []);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const total = reports.length;
  const pending = reports.filter(
    (r) => r.status === 'REPORTED' || r.status === 'PENDING_VERIFICATION'
  ).length;
  const verified = reports.filter(
    (r) => r.status === 'VERIFIED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  ).length;
  const resolved = reports.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

  const filtered = reports.filter((r) => {
    if (tab === 'pending')
      return r.status === 'REPORTED' || r.status === 'PENDING_VERIFICATION';
    if (tab === 'verified')
      return r.status === 'VERIFIED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS';
    if (tab === 'resolved')
      return r.status === 'RESOLVED' || r.status === 'CLOSED';
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-5xl mx-auto px-4 py-8 font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DemoBadge />
            <span className="text-xs text-slate-400">• Citizen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track validation, municipal inspection, and repair progress for road hazards you reported.
          </p>
        </div>

        <Link
          href="/report"
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Hazard
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setTab('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            tab === 'all'
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Total Reports</span>
          <span className="text-2xl font-black text-white mt-1 block">{total}</span>
        </div>

        <div
          onClick={() => setTab('pending')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            tab === 'pending'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{pending}</span>
        </div>

        <div
          onClick={() => setTab('verified')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            tab === 'verified'
              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Verified & Active</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">{verified}</span>
        </div>

        <div
          onClick={() => setTab('resolved')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            tab === 'resolved'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Resolved / Repaired</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{resolved}</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No reports found in this tab</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Help your community navigate safely by submitting geo-tagged photos of road hazards.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const risk = getRiskColor(item.risk_level, item.status);
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${risk.hex}15`,
                      borderColor: `${risk.hex}50`,
                      color: risk.hex,
                    }}
                  >
                    {getHazardIcon(item.type, 'w-5 h-5')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border"
                        style={{
                          backgroundColor: `${risk.hex}20`,
                          borderColor: `${risk.hex}50`,
                          color: risk.hex,
                        }}
                      >
                        {item.risk_level} • Score {item.risk_score}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500">•</span>
                      <span className="text-[11px] font-medium text-slate-400 capitalize">
                        {item.status.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1 group-hover:text-sky-300 transition">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {item.address}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(item.created_at).toLocaleDateString([], {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/hazard/${item.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <span>View Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

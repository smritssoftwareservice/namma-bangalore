'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Navigation,
  Sparkles,
  CloudRain,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Clock,
  ShieldCheck,
  Share2,
  FileCheck,
  Layers,
} from 'lucide-react';
import { Hazard, HazardStatus } from '@/lib/types/hazard';
import { getHazardIcon, getRiskColor } from '@/components/map/hazard-icons';
import { DemoBadge } from '@/components/ui/demo-badge';

const WORKFLOW_STEPS: { status: HazardStatus; label: string }[] = [
  { status: 'REPORTED', label: 'Reported' },
  { status: 'AI_ANALYZED', label: 'AI Analyzed' },
  { status: 'PENDING_VERIFICATION', label: 'Pending Review' },
  { status: 'VERIFIED', label: 'Verified' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
  { status: 'CLOSED', label: 'Closed' },
];

export default function HazardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [hazard, setHazard] = useState<Hazard | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    async function loadHazard() {
      try {
        const res = await fetch(`/api/hazards/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setHazard(json.data);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadHazard();
  }, [id]);

  const handleCommunityConfirm = async (confirmation: 'STILL_PRESENT' | 'RESOLVED') => {
    if (!hazard || voting || voted) return;
    setVoting(true);

    try {
      const res = await fetch('/api/community/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hazard_id: hazard.id, confirmation }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setVoted(confirmation);
          setHazard((prev) =>
            prev
              ? {
                  ...prev,
                  confirmations_count: json.data.confirmations_count,
                }
              : null
          );
        }
      }
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-slate-400 text-xs">
        Loading hazard intelligence dossier...
      </div>
    );
  }

  if (!hazard) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
        <h2 className="text-lg font-bold text-white">Hazard Record Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          The requested hazard report may have been archived or removed.
        </p>
        <Link
          href="/map"
          className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
        >
          Return to Live Map
        </Link>
      </div>
    );
  }

  const riskColor = getRiskColor(hazard.risk_level, hazard.status);
  const isUnverified =
    hazard.status === 'REPORTED' || hazard.status === 'PENDING_VERIFICATION';

  const currentStepIndex = WORKFLOW_STEPS.findIndex(
    (s) => s.status === hazard.status
  );
  const activeStepIdx = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-4xl mx-auto px-4 py-6 sm:py-8 font-sans space-y-6">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <DemoBadge />
          <Link
            href={`/map?lat=${hazard.latitude}&lng=${hazard.longitude}&focus=${hazard.id}`}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            Get Directions
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 flex-shrink-0"
              style={{
                backgroundColor: `${riskColor.hex}15`,
                borderColor: `${riskColor.hex}50`,
                color: riskColor.hex,
              }}
            >
              {getHazardIcon(hazard.type, 'w-6 h-6')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${riskColor.hex}20`,
                    borderColor: `${riskColor.hex}50`,
                    color: riskColor.hex,
                  }}
                >
                  {hazard.risk_level} RISK
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {hazard.type.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {hazard.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{hazard.address}</span>
              </div>
            </div>
          </div>

          {/* Risk Score Gauge Pill */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Risk Score
            </span>
            <div className="text-3xl font-black text-white">
              {hazard.risk_score}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: riskColor.hex }}
            >
              {hazard.risk_level} Priority
            </span>
          </div>
        </div>

        {/* Verification Status Banner */}
        {isUnverified ? (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <strong>Reported — pending verification.</strong> This incident is an assistive
                citizen report. It is awaiting municipal inspector confirmation.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Verified Hazard:</strong> Validated by municipal GIS inspector. Field task assigned.
            </span>
          </div>
        )}

        {/* Description */}
        {hazard.description && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
            {hazard.description}
          </p>
        )}
      </div>

      {/* Lifecycle Workflow Timeline */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          Hazard Resolution Lifecycle
        </h3>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompleted = idx <= activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            return (
              <div key={step.status} className="flex flex-col items-center text-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    isCurrent
                      ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 leading-tight ${
                    isCurrent
                      ? 'text-sky-300 font-bold'
                      : isCompleted
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Evidence & AI Analysis vs Context & Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: AI Detection & Evidence */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              AI Vision Analysis
            </h3>
            <span className="text-[10px] text-sky-400">YOLO Model Assistive</span>
          </div>

          {hazard.detections && hazard.detections.length > 0 ? (
            <div className="space-y-3">
              {hazard.detections.map((det) => (
                <div
                  key={det.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white capitalize">
                      {det.object_type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                      {Math.round(det.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Model: <span className="font-mono text-slate-300">{det.model_version}</span>
                  </div>
                  {det.bounding_box && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Bounding Box: [{det.bounding_box.map((b) => b.toFixed(2)).join(', ')}]
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              No automated vision detections attached to this report.
            </div>
          )}

          {/* Evidence photo if present */}
          {hazard.evidence && hazard.evidence.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Photo Evidence
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hazard.evidence[0].file_url}
                  alt={hazard.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-factor Risk Breakdown & Weather */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              Risk Engine & Weather
            </h3>
            <span className="text-[10px] text-slate-400">Weighted Model</span>
          </div>

          {hazard.weather && (
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Rainfall</span>
                <span className="text-sm font-bold text-cyan-300">
                  {hazard.weather.rainfall} mm
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Intensity</span>
                <span className="text-xs font-semibold text-slate-200 capitalize">
                  {hazard.weather.rain_intensity.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                <span className="text-xs text-slate-200">{hazard.weather.temperature}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Humidity</span>
                <span className="text-xs text-slate-200">{hazard.weather.humidity}%</span>
              </div>
            </div>
          )}

          {/* Configurable Risk Factor Breakdown Bars */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Risk Factor Contributions
            </span>

            {[
              { label: 'Severity Factor (30%)', pct: 75, color: 'bg-red-500' },
              { label: 'Precipitation Runoff (20%)', pct: 60, color: 'bg-cyan-500' },
              { label: 'Surface Waterlogging (20%)', pct: 85, color: 'bg-blue-500' },
              { label: 'Historical Incident Rate (10%)', pct: 40, color: 'bg-yellow-500' },
              { label: 'Arterial Road Weight (10%)', pct: 80, color: 'bg-purple-500' },
            ].map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>{factor.label}</span>
                  <span className="font-bold">{factor.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${factor.color}`}
                    style={{ width: `${factor.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 43: Before / After Comparison (If Maintenance Record Exists) */}
      {hazard.maintenance && (hazard.maintenance.before_image || hazard.maintenance.after_image) && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Municipal Repair & Resolution Record
            </h3>
            <span className="text-[11px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
              Status: {hazard.maintenance.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1.5">
                Before: Original Hazard
              </span>
              <div className="h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    hazard.maintenance.before_image ||
                    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
                  }
                  alt="Before Repair"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* After Photo */}
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                After: Completed Municipal Repair
              </span>
              <div className="h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    hazard.maintenance.after_image ||
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600'
                  }
                  alt="After Repair"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div>
              <strong>Assigned Crew: </strong>
              {hazard.maintenance.assigned_worker_name || 'BBMP Emergency Road Crew #4'}
            </div>
            {hazard.maintenance.notes && (
              <div>
                <strong>Field Notes: </strong>
                {hazard.maintenance.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Community Verification Widget (Section 32) */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
              Community Verification Poll
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {hazard.confirmations_count?.still_present || 0} confirm present •{' '}
            {hazard.confirmations_count?.resolved || 0} confirm resolved
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Have you traveled past this location recently? Help other citizens keep hazard freshness up
          to date.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => handleCommunityConfirm('STILL_PRESENT')}
            disabled={voting || voted !== null}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              voted === 'STILL_PRESENT'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 hover:border-amber-500/40 text-slate-200'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
            Yes, Still Present ({hazard.confirmations_count?.still_present || 0})
          </button>

          <button
            onClick={() => handleCommunityConfirm('RESOLVED')}
            disabled={voting || voted !== null}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              voted === 'RESOLVED'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-slate-200'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5 text-emerald-400" />
            No, Resolved / Repaired ({hazard.confirmations_count?.resolved || 0})
          </button>
        </div>
      </div>
    </div>
  );
}

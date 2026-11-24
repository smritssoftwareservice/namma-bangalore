'use client';

import React from 'react';
import Link from 'next/link';
import {
  Navigation,
  ExternalLink,
  CloudRain,
  Sparkles,
  Droplets,
  Calendar,
  AlertCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { Hazard } from '@/lib/types/hazard';
import { getRiskColor, getHazardIcon } from '@/components/map/hazard-icons';

interface HazardPopupCardProps {
  hazard: Hazard;
  onGetDirections?: (hazard: Hazard) => void;
  onViewEvidence?: (hazard: Hazard) => void;
}

export function HazardPopupCard({
  hazard,
  onGetDirections,
  onViewEvidence,
}: HazardPopupCardProps) {
  const riskColor = getRiskColor(hazard.risk_level, hazard.status);
  const isUnverified = hazard.status === 'REPORTED' || hazard.status === 'PENDING_VERIFICATION';

  const aiDetection = hazard.detections && hazard.detections.length > 0 ? hazard.detections[0] : null;

  return (
    <div className="w-72 sm:w-80 text-slate-100 p-0.5 space-y-3 font-sans">
      {/* Header with Type & Risk badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${riskColor.hex}20`,
              borderColor: `${riskColor.hex}50`,
              color: riskColor.hex,
            }}
          >
            {getHazardIcon(hazard.type, 'w-4 h-4')}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white leading-snug">
              {hazard.type.replace(/_/g, ' ')}
            </h4>
            <div className="text-[11px] text-slate-400 line-clamp-1">{hazard.address}</div>
          </div>
        </div>

        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border"
          style={{
            backgroundColor: `${riskColor.hex}25`,
            borderColor: `${riskColor.hex}50`,
            color: riskColor.hex,
          }}
        >
          {hazard.risk_level} RISK
        </div>
      </div>

      {/* Unverified notification banner if applicable */}
      {isUnverified ? (
        <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span>Reported — pending verification</span>
        </div>
      ) : (
        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Verified Incident Report</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Risk Score</span>
          <span className="text-sm font-black text-white">{hazard.risk_score} / 100</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Status</span>
          <span className="text-xs font-semibold text-slate-200 capitalize">
            {hazard.status.toLowerCase().replace(/_/g, ' ')}
          </span>
        </div>

        {aiDetection && (
          <div>
            <span className="text-[10px] text-slate-400 block uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" /> AI Confidence
            </span>
            <span className="text-xs font-bold text-sky-300">
              {Math.round(aiDetection.confidence * 100)}%
            </span>
          </div>
        )}

        {hazard.weather && (
          <div>
            <span className="text-[10px] text-slate-400 block uppercase flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-cyan-400" /> Weather
            </span>
            <span className="text-xs font-semibold text-cyan-200">
              {hazard.weather.rainfall > 0 ? `${hazard.weather.rainfall}mm rain` : 'Clear conditions'}
            </span>
          </div>
        )}

        <div className="col-span-2 flex items-center justify-between text-[10px] bg-slate-900/80 px-2 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 font-mono">
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>4K UAV Ortho</span>
          </span>
          <span>{hazard.latitude.toFixed(4)}°N, {hazard.longitude.toFixed(4)}°E</span>
        </div>

        <div className="col-span-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(hazard.created_at).toLocaleDateString([], {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          {hazard.is_demo && <span className="text-amber-400 font-semibold">DEMO RECORD</span>}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link
          href={`/hazard/${hazard.id}`}
          className="w-full py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          View Details
        </Link>

        <button
          onClick={() => onGetDirections?.(hazard)}
          className="w-full py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-600/30"
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </button>
      </div>
    </div>
  );
}

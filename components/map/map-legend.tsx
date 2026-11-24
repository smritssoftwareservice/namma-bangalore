'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs text-xs">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-1.5 font-bold text-slate-200 uppercase tracking-wider text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          Map Legend
        </div>
        <button className="text-slate-400 hover:text-white">
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/30"></span>
              <span className="text-slate-300">Critical Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-500/30"></span>
              <span className="text-slate-300">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/30"></span>
              <span className="text-slate-300">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
              <span className="text-slate-300">Low / Resolved</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
            Marker status and risk are computed from citizen reports, AI vision analysis, and rainfall
            models. Unverified reports require confirmation.
          </p>
        </div>
      )}
    </div>
  );
}

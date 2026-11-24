'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export function DemoBadge({ showDisclaimer = false }: { showDisclaimer?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 tracking-wide uppercase">
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        Demo Data
      </span>
      {showDisclaimer && (
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Assistive platform — not an official emergency dispatch service.
        </span>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useAuth } from '@/components/context/auth-context';
import { User, Mail, Shield, CheckCircle2, Award, Calendar } from 'lucide-react';
import { DemoBadge } from '@/components/ui/demo-badge';

export default function ProfilePage() {
  const { user, role, switchRole } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-3xl mx-auto px-4 py-8 font-sans space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DemoBadge />
            <span className="text-xs text-slate-400">• User Persona</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Profile & Credentials
          </h1>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-sky-500/40 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user.email}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {role}</span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Switch Operating Persona for Testing
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'USER', label: 'Citizen Reporter' },
              { id: 'ADMIN', label: 'GIS Administrator' },
              { id: 'FIELD_WORKER', label: 'Field Repair Crew' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => switchRole(r.id as any)}
                className={`p-3 rounded-xl text-left border text-xs font-semibold transition ${
                  role === r.id
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

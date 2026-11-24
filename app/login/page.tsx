'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, User, Key, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/components/context/auth-context';
import { UserRole } from '@/lib/types/hazard';
import { DemoBadge } from '@/components/ui/demo-badge';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = (selectedRole: UserRole) => {
    switchRole(selectedRole);
    if (selectedRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/map');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/25">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FLOODGUARD AI</h1>
          <p className="text-xs text-slate-400">
            Sign in to your municipal GIS operations or citizen reporter account.
          </p>
          <DemoBadge />
        </div>

        {/* 1-Click Persona Shortcuts */}
        <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Instant Demo Sign-In
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              {
                role: 'ADMIN',
                title: 'Municipal Administrator (Dr. Priya Nair)',
                desc: 'Full GIS operations, verification & risk calibration',
              },
              {
                role: 'USER',
                title: 'Citizen Reporter (Vikram Sharma)',
                desc: 'Submit hazards, view map & track reports',
              },
              {
                role: 'FIELD_WORKER',
                title: 'Emergency Field Worker (Ramesh Kumar)',
                desc: 'View repair dispatches & upload resolution photos',
              },
            ].map((p) => (
              <button
                key={p.role}
                type="button"
                onClick={() => handleDemoLogin(p.role as UserRole)}
                className="p-2.5 rounded-xl text-left border border-slate-800 hover:border-sky-500/60 bg-slate-900/80 hover:bg-slate-850 transition group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-200 group-hover:text-sky-300">
                    {p.title}
                  </div>
                  <div className="text-[10px] text-slate-500">{p.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDemoLogin('USER');
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition mt-2"
          >
            Sign In with Email
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link href="/signup" className="text-sky-400 font-semibold hover:underline">
            Register as Citizen
          </Link>
        </div>
      </div>
    </div>
  );
}

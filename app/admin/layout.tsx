'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map as MapIcon,
  FileText,
  Wrench,
  BarChart3,
  Users,
  Settings,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/components/context/auth-context';
import { DemoBadge } from '@/components/ui/demo-badge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, user } = useAuth();

  const navItems = [
    { href: '/admin', label: 'GIS Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/map', label: 'Operational Map', icon: MapIcon },
    { href: '/admin/reports', label: 'Report Moderation', icon: FileText },
    { href: '/admin/maintenance', label: 'Field Repairs', icon: Wrench },
    { href: '/admin/analytics', label: 'Spatial Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'User Roles', icon: Users },
    { href: '/admin/settings', label: 'Risk Calibration', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 font-sans">
      {/* Admin subheader */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/map"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Return to Citizen Live Map"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-sky-400" />
                  Municipal GIS Command Center
                </span>
                <DemoBadge />
              </div>
              <span className="text-[10px] text-slate-400">
                Logged in as <strong className="text-slate-200">{user.name}</strong> ({role})
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}

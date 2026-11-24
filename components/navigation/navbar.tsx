'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  MapPin,
  PlusCircle,
  Bell,
  User,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Mountain,
} from 'lucide-react';
import { useAuth } from '@/components/context/auth-context';
import { useNotifications } from '@/components/context/notification-context';
import { DemoBadge } from '@/components/ui/demo-badge';
import { UserRole } from '@/lib/types/hazard';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/map', label: 'Live Map', icon: MapPin },
    { href: '/3d-gis', label: 'Apple 3D Map & GIS', icon: Mountain, isNew3D: true },
    { href: '/report', label: 'Report Hazard', icon: PlusCircle, highlight: true },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/my-reports', label: 'My Reports', icon: CheckCircle2 },
    { href: '/admin', label: 'Admin GIS', icon: ShieldAlert, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top micro-banner: Ticker & Demo Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 border-b border-slate-800/60 px-4 py-1.5 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <DemoBadge />
          <span className="hidden md:inline text-slate-500">|</span>
          <div className="hidden sm:flex items-center gap-3 font-medium tracking-wide">
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Critical: 18
            </span>
            <span className="text-orange-400">High: 37</span>
            <span className="text-cyan-400">Waterlogging: 21</span>
            <span className="text-yellow-400">Potholes: 42</span>
          </div>
        </div>
        <div className="text-slate-400 hidden lg:block italic text-[11px]">
          &ldquo;See the danger before it becomes an accident.&rdquo;
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              FLOODGUARD <span className="text-sky-400">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
              Hazard Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                    : link.highlight
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
                {link.isNew3D && (
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-mono font-bold uppercase">
                    3D
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons: Notification Center & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowRoleMenu(false);
              }}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Hazard Alert Center
                  </span>
                  <span className="text-[11px] text-sky-400">{unreadCount} new alerts</span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No current notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-2.5 text-xs rounded-lg transition cursor-pointer hover:bg-slate-800/60 ${
                          !n.read ? 'bg-sky-950/40 border-l-2 border-sky-400' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher (User / Admin / Field Worker) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifs(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition"
              title="Switch demo persona"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  role === 'ADMIN'
                    ? 'bg-purple-400'
                    : role === 'FIELD_WORKER'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="hidden sm:inline font-semibold capitalize">{role.toLowerCase()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active Persona
                </div>
                {(
                  [
                    { key: 'USER', label: 'Citizen Reporter', desc: 'Explore map & report hazards' },
                    { key: 'ADMIN', label: 'GIS Administrator', desc: 'Verify, assign & risk control' },
                    { key: 'FIELD_WORKER', label: 'Field Repair Worker', desc: 'Repair tasks & before/after' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      switchRole(r.key as UserRole);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition mb-1 ${
                      role === r.key
                        ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{r.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

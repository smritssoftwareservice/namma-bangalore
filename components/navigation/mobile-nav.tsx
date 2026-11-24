'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, PlusCircle, Bell, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/context/auth-context';

export function MobileNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const items = [
    { href: '/map', label: 'Live Map', icon: MapPin },
    { href: '/report', label: 'Report', icon: PlusCircle, isCenter: true },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/my-reports', label: 'My Reports', icon: CheckCircle2 },
    { href: '/admin', label: 'Admin', icon: ShieldAlert },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/40 border-2 border-slate-950 hover:scale-105 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-sky-400 mt-0.5">Report</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition ${
              isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  MapPin,
  PlusCircle,
  Sparkles,
  CloudRain,
  Navigation,
  CheckCircle2,
  Users,
  Wrench,
  Activity,
  ArrowRight,
  Flame,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Plane,
  Radio,
  Crosshair,
  Camera,
  Mountain,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/demo-badge';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'potholes' | 'flood'>('all');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl">
            <DemoBadge />
            <span className="text-slate-500">•</span>
            <span className="text-sky-400 font-medium">GIS Hazard Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            FLOODGUARD <span className="text-sky-400">AI</span>
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-sky-200/90 tracking-wide italic">
            &ldquo;See the danger before it becomes an accident.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An AI-powered geospatial platform for detecting, reporting and prioritizing road hazards,
            waterlogging and flood-related risks before daily commuters encounter them.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/3d-gis"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm tracking-wide shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2 hover:scale-[1.03] transition border border-sky-400/40"
            >
              <Mountain className="w-4 h-4 text-sky-200" />
              <span>LAUNCH 3D FLOOD GIS PLATFORM</span>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[9px] font-mono uppercase">
                3D CESIUM
              </span>
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-sm tracking-wide border border-slate-700 shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              2D ROAD MAP
            </Link>

            <Link
              href="/report"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-sm tracking-wide border border-slate-700 shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              REPORT HAZARD
            </Link>
          </div>

          {/* Real-time Ticker stats */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 border-t border-slate-800/80 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>
                Critical: <strong className="text-white">18</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>
                High Risk: <strong className="text-white">37</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>
                Waterlogging: <strong className="text-white">21</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span>
                Potholes: <strong className="text-white">42</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                Resolved: <strong className="text-white">10</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Section 65: Visually Impressive Interactive Map Preview */}
        {/* Section: 4K Drone Captured Orthophoto Live Preview */}
        <div className="mt-12 max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 via-slate-800 to-slate-950 shadow-2xl relative">
          <div className="rounded-[22px] overflow-hidden bg-slate-950 border border-emerald-500/30 relative h-[440px] sm:h-[520px]">
            {/* 4K Drone Orthophoto Background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: "url('/images/drone-orthophoto-preview.jpg')" }}
            >
              {/* Drone Camera Vignette & Tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
            </div>

            {/* Tactical Drone HUD Corner Brackets */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400 pointer-events-none z-20" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400 pointer-events-none z-20" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400 pointer-events-none z-20" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400 pointer-events-none z-20" />

            {/* Top Drone Telemetry Bar */}
            <div className="absolute top-4 left-14 right-14 z-20 flex items-center justify-between pointer-events-none font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">UAV-01 // 4K LIVE ORTHOMOSAIC</span>
                <span className="hidden sm:inline text-slate-500">|</span>
                <span className="hidden sm:inline text-slate-300 text-[11px]">RES: 0.12m/px GSD</span>
              </div>

              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs text-slate-300 shadow-xl">
                <span className="text-emerald-400 font-bold">ALT: 180m AGL</span>
                <span className="text-slate-600">|</span>
                <span>PITCH: 0° NADIR</span>
              </div>
            </div>

            {/* Drone Vision Center Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-60">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 border border-emerald-400/40 rounded-full" />
                <div className="absolute w-24 h-px bg-emerald-400/30" />
                <div className="absolute h-24 w-px bg-emerald-400/30" />
              </div>
            </div>

            {/* AI Computer Vision Hazard Detection Bounding Boxes */}
            {/* Target 1: Severe Waterlogging Corridor */}
            <div className="absolute top-[28%] left-[22%] sm:left-[30%] z-20 pointer-events-none font-mono">
              <div className="p-2 rounded-xl border-2 border-dashed border-cyan-400 bg-cyan-500/20 backdrop-blur-sm shadow-xl shadow-cyan-500/20 animate-pulse">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>[AI DETECT: FLASH FLOOD RUNOFF 94%]</span>
                </div>
                <div className="text-[9px] text-cyan-200 mt-0.5">
                  EST. WATER DEPTH: 45cm | SECTOR A-4
                </div>
              </div>
            </div>

            {/* Target 2: Open Manhole Lock */}
            <div className="absolute top-[52%] left-[48%] sm:left-[55%] z-20 pointer-events-none font-mono">
              <div className="p-2 rounded-xl border-2 border-red-500 bg-red-950/40 backdrop-blur-sm shadow-xl shadow-red-500/30">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 whitespace-nowrap">
                  <Crosshair className="w-3 h-3 text-red-400 animate-spin" />
                  <span>[TARGET LOCK: OPEN MANHOLE 98%]</span>
                </div>
                <div className="text-[9px] text-red-300 mt-0.5">
                  CRITICAL RISK 96/100 | DIA: 0.9m
                </div>
              </div>
            </div>

            {/* Interactive Drone Dossier Card Overlay */}
            <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-88 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 shadow-2xl text-xs space-y-2.5 z-30 font-sans">
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                    4K DRONE ORTHO
                  </span>
                  <span className="text-[10px] text-slate-400">12.9716°N, 77.5946°E</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-black text-[10px] border border-red-500/40 font-mono">
                  CRITICAL 96/100
                </span>
              </div>

              <div>
                <h4 className="font-black text-white text-sm">Hope Farm Junction Drainage Breach</h4>
                <p className="text-slate-400 text-[11px]">Sub-meter drone orthomosaic survey with AI anomaly detection</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 uppercase block text-[9px]">Drone Sensor</span>
                  <span className="font-bold text-emerald-400">4K Multispectral</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase block text-[9px]">Runoff Precipitation</span>
                  <span className="font-bold text-cyan-400">Heavy 28.4 mm/h</span>
                </div>
              </div>

              <Link
                href="/map"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Launch Live 4K Drone Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-sky-400 mb-2">
            Automated Geospatial Pipeline
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white">How FloodGuard AI Works</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            From instant mobile capture to prioritized municipal resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '1',
              title: 'Detect',
              desc: 'Commuter or inspection vehicle captures hazard photo evidence.',
              icon: Sparkles,
            },
            {
              step: '2',
              title: 'Geo-Tag',
              desc: 'Precise GPS coordinates are stamped with reverse geocoded landmark indices.',
              icon: MapPin,
            },
            {
              step: '3',
              title: 'Analyze',
              desc: 'Server-side YOLO vision model classifies type and severity rating.',
              icon: Activity,
            },
            {
              step: '4',
              title: 'Prioritize',
              desc: 'Multi-factor engine calculates a 0-100 risk score factoring live rainfall.',
              icon: Flame,
            },
            {
              step: '5',
              title: 'Resolve',
              desc: 'Field repair teams receive dispatch coordinates and upload after-repair verification.',
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-sky-500/40 transition relative group"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black text-xs mb-3">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-sky-400 mb-2">
            Comprehensive GIS Platform
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white">Platform Capabilities</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Built with modern web standards, PostGIS geospatial queries, and assistive AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'AI Hazard Detection',
              desc: 'Classifies potholes, open manholes, drainage faults, and water accumulation.',
              icon: Sparkles,
            },
            {
              title: 'Interactive Hazard Map',
              desc: 'Full-screen MapLibre GL JS engine with clustering and viewport-based queries.',
              icon: MapPin,
            },
            {
              title: 'Geo-Tagged Reports',
              desc: 'Instant GPS capture, draggable map pins, and address reverse geocoding.',
              icon: Navigation,
            },
            {
              title: 'Rainfall Intelligence',
              desc: 'Real-time precipitation models showing live surface water buildup correlation.',
              icon: CloudRain,
            },
            {
              title: 'Flood Risk Mapping',
              desc: 'Polygon basemaps highlighting low-lying lake overflow and underpass zones.',
              icon: ShieldAlert,
            },
            {
              title: 'Route Hazard Analysis',
              desc: 'Buffers transit corridors to alert drivers to impending potholes & water blocks.',
              icon: Activity,
            },
            {
              title: 'Community Reporting',
              desc: 'Citizen verification polls confirming whether hazards are still present.',
              icon: Users,
            },
            {
              title: 'Maintenance Tracking',
              desc: 'Field worker dispatch workflow with before-and-after photo resolution audits.',
              icon: Wrench,
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="p-2 rounded-xl bg-slate-800 text-sky-400 w-fit mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-800 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-300">FLOODGUARD AI</span>
        </div>
        <p className="max-w-md mx-auto">
          Assistive geospatial hazard intelligence platform. Not an official emergency dispatch
          service. Demonstration dataset represents simulated Bengaluru road conditions.
        </p>
        <div className="text-[11px] text-slate-600">
          © 2026 FloodGuard AI • All demo records clearly marked.
        </div>
      </footer>
    </div>
  );
}

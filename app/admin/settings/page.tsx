'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Sliders, CheckCircle2, RotateCcw, ShieldCheck, Sparkles, CloudRain, Loader2 } from 'lucide-react';
import { RiskWeights } from '@/lib/types/hazard';
import { DEFAULT_RISK_WEIGHTS } from '@/lib/risk/risk-engine';

export default function AdminSettingsPage() {
  const [weights, setWeights] = useState<RiskWeights>({ ...DEFAULT_RISK_WEIGHTS });
  const [demoMode, setDemoMode] = useState(true);
  const [requireVerification, setRequireVerification] = useState(true);
  const [aiProvider, setAiProvider] = useState('VisionAIProvider (Fallback to DemoAIProvider)');
  const [weatherProvider, setWeatherProvider] = useState('Open-Meteo GIS Provider');
  const [alertRadius, setAlertRadius] = useState(1500);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setWeights(json.data.weights || DEFAULT_RISK_WEIGHTS);
            setDemoMode(json.data.demo_mode ?? true);
            setRequireVerification(json.data.require_admin_verification ?? true);
          }
        }
      } catch {
        // demo fallback
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights,
          demo_mode: demoMode,
          require_admin_verification: requireVerification,
          ai_provider: aiProvider,
          weather_provider: weatherProvider,
          auto_alert_radius_meters: alertRadius,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWeights({ ...DEFAULT_RISK_WEIGHTS });
  };

  const totalWeight = Math.round(
    (weights.hazardSeverity +
      weights.rainfall +
      weights.waterlogging +
      weights.historicalReports +
      weights.roadImportance +
      weights.reportFrequency) *
      100
  );

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Risk Engine Calibration & Platform Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 20 & 64: Configure multi-factor risk scoring coefficients and assistive external AI /
            weather abstractions.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Calibration Weights Saved Live!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Weights Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Multi-Factor Risk Engine Coefficients
              </h2>
              <span className="text-[11px] text-slate-400">
                Sum of active weights: <strong className="text-white">{totalWeight}%</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Severity Weight */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Hazard Severity Weight</span>
                <span className="font-bold text-sky-400">
                  {Math.round(weights.hazardSeverity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.hazardSeverity}
                onChange={(e) =>
                  setWeights({ ...weights, hazardSeverity: parseFloat(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Direct damage and structural opening hazard rating
              </span>
            </div>

            {/* Rainfall Weight */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Rainfall Runoff Weight</span>
                <span className="font-bold text-cyan-400">
                  {Math.round(weights.rainfall * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.rainfall}
                onChange={(e) =>
                  setWeights({ ...weights, rainfall: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Meteorological precipitation and hourly run-off model
              </span>
            </div>

            {/* Waterlogging Weight */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Surface Waterlogging Weight</span>
                <span className="font-bold text-blue-400">
                  {Math.round(weights.waterlogging * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.waterlogging}
                onChange={(e) =>
                  setWeights({ ...weights, waterlogging: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Depth of standing water across roadway cross-section
              </span>
            </div>

            {/* Historical Reports Weight */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Historical Recurrence Weight</span>
                <span className="font-bold text-yellow-400">
                  {Math.round(weights.historicalReports * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.historicalReports}
                onChange={(e) =>
                  setWeights({ ...weights, historicalReports: parseFloat(e.target.value) })
                }
                className="w-full accent-yellow-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Repeat report history at the exact coordinate zone
              </span>
            </div>

            {/* Road Importance Weight */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Arterial Road Weight</span>
                <span className="font-bold text-purple-400">
                  {Math.round(weights.roadImportance * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.roadImportance}
                onChange={(e) =>
                  setWeights({ ...weights, roadImportance: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Higher weight for Outer Ring Road, flyovers and corridors
              </span>
            </div>

            {/* Report Frequency Weight */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Report Frequency (24h)</span>
                <span className="font-bold text-pink-400">
                  {Math.round(weights.reportFrequency * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.reportFrequency}
                onChange={(e) =>
                  setWeights({ ...weights, reportFrequency: parseFloat(e.target.value) })
                }
                className="w-full accent-pink-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Citizen report velocity within the last 24 hours
              </span>
            </div>
          </div>
        </div>

        {/* Operational & API Provider Config */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
          <h2 className="font-bold text-sm text-white">Platform Providers & Policies</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                AI Vision Provider Abstraction
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="VisionAIProvider (Fallback to DemoAIProvider)">
                  Cloud Vision AI (with automatic YOLO Demo fallback)
                </option>
                <option value="DemoAIProvider">
                  DemoAIProvider (Offline deterministic simulated YOLO)
                </option>
                <option value="YOLOv8CustomEndpoint">
                  Custom On-Prem YOLOv8/v11 TensorRT Service
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Weather Intelligence Provider
              </label>
              <select
                value={weatherProvider}
                onChange={(e) => setWeatherProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Open-Meteo GIS Provider">
                  Open-Meteo High-Resolution GIS API (Free Public API)
                </option>
                <option value="Demo Weather Simulation">
                  Demo Weather Simulation Provider
                </option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
              <div>
                <span className="font-bold text-slate-200 block text-xs">
                  Require Inspector Verification Before Official Marking
                </span>
                <span className="text-[10px] text-slate-500">
                  Citizen reports remain &ldquo;Pending Verification&rdquo; until authorized.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireVerification}
                onChange={(e) => setRequireVerification(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
              <div>
                <span className="font-bold text-slate-200 block text-xs">
                  Active DEMO_MODE Flag
                </span>
                <span className="text-[10px] text-slate-500">
                  Enables simulation fallbacks and Bengaluru demonstration dataset.
                </span>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 transition"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Configuration...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save & Apply Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}

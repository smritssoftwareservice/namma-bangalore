'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Upload,
  ExternalLink,
  Navigation,
  Camera,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Hazard, MaintenanceTask } from '@/lib/types/hazard';

export default function AdminMaintenancePage() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [afterImage, setAfterImage] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hazards');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const list: Hazard[] = json.data.hazards || [];
          // Prioritize hazards with maintenance or assigned/in_progress/resolved
          setHazards(list);
          const firstWithMaint = list.find((h) => h.maintenance || h.status === 'ASSIGNED');
          if (firstWithMaint) setSelectedHazard(firstWithMaint);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Worker uploads after image and marks complete
  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHazard) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/maintenance/${selectedHazard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          after_image:
            afterImage ||
            'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
          notes: repairNotes || 'Asphalt cold patch laid, leveled with mechanical roller, barrier removed.',
        }),
      });

      if (res.ok) {
        loadData();
        setAfterImage('');
        setRepairNotes('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Admin verifies completion
  const handleVerifyResolution = async (hazardId: string) => {
    try {
      const res = await fetch(`/api/maintenance/${hazardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.ok) {
        loadData();
      }
    } catch {
      // ignore
    }
  };

  const tasks = hazards.filter(
    (h) => h.maintenance || ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(h.status)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Field Repair & Resolution Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch repair units, document before-and-after resolution evidence, and certify municipal repairs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
        >
          Refresh Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task List */}
        <div className="space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Active Maintenance Tasks ({tasks.length})</span>
            <span className="text-sky-400 font-bold">Field Queue</span>
          </h2>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No tasks currently assigned.</div>
            ) : (
              tasks.map((t) => {
                const isSelected = selectedHazard?.id === t.id;
                const isDone = t.status === 'RESOLVED' || t.status === 'CLOSED';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedHazard(t)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/50 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white line-clamp-1">{t.title}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      {t.address}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span>{t.maintenance?.assigned_worker_name || 'BBMP Crew Assigned'}</span>
                      <span className="text-sky-400 font-semibold">Inspect ➔</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Inspection, Before/After & Resolution Sign-off */}
        <div className="lg:col-span-2 space-y-4">
          {selectedHazard ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                      Task ID: {selectedHazard.id}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedHazard.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-1">{selectedHazard.title}</h2>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedHazard.address}</span>
                  </div>
                </div>

                <Link
                  href={`/map?lat=${selectedHazard.latitude}&lng=${selectedHazard.longitude}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 w-fit"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  Navigation Route
                </Link>
              </div>

              {/* Before / After Evidence Comparison Grid (Section 43) */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Section 43: Before & After Evidence Audit
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-red-400 mb-1">
                      <span>BEFORE: Original Hazard</span>
                      <span className="text-[10px] text-slate-500">Citizen Reported</span>
                    </div>
                    <div className="h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          selectedHazard.evidence?.[0]?.file_url ||
                          selectedHazard.maintenance?.before_image ||
                          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
                        }
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* After */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-1">
                      <span>AFTER: Completed Repair</span>
                      <span className="text-[10px] text-slate-500">
                        {selectedHazard.maintenance?.status === 'COMPLETED' ||
                        selectedHazard.status === 'RESOLVED'
                          ? 'Work Finished'
                          : 'Pending Field Photo'}
                      </span>
                    </div>
                    <div className="h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                      {selectedHazard.maintenance?.after_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={selectedHazard.maintenance.after_image}
                          alt="After Repair"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center">
                          <Camera className="w-6 h-6 text-slate-600 mb-1" />
                          <span>Awaiting crew completion photo upload.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Worker Completion Form */}
              {selectedHazard.status !== 'RESOLVED' && selectedHazard.status !== 'CLOSED' ? (
                <form
                  onSubmit={handleCompleteTask}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-sky-400" />
                      Field Crew Task Completion Sign-Off
                    </span>
                    <span className="text-[10px] text-slate-400">Worker Interface</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      After-Repair Photo URL (or paste image link)
                    </label>
                    <input
                      type="text"
                      value={afterImage}
                      onChange={(e) => setAfterImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Completion Notes & Work Summary
                    </label>
                    <textarea
                      rows={2}
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      placeholder="e.g. Cleared 2 tons debris, sealed asphalt with vibrating roller."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Mark Repair Complete & Upload Evidence
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Repair Completed & Certified
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedHazard.maintenance?.notes || 'Road surface successfully restored.'}
                    </p>
                  </div>

                  {selectedHazard.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleVerifyResolution(selectedHazard.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Sign-Off / Close
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
              Select a maintenance task on the left to inspect evidence and sign-off.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

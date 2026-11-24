'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Wrench,
  Sparkles,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Hazard, HazardStatus, RiskLevel } from '@/lib/types/hazard';
import { getRiskColor, getHazardIcon } from '@/components/map/hazard-icons';

export default function AdminReportsPage() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Assign modal
  const [assignHazard, setAssignHazard] = useState<Hazard | null>(null);
  const [workerName, setWorkerName] = useState('BBMP Road Maintenance Unit #4');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Change Risk modal
  const [riskHazard, setRiskHazard] = useState<Hazard | null>(null);
  const [newRiskScore, setNewRiskScore] = useState(75);
  const [newRiskLevel, setNewRiskLevel] = useState<RiskLevel>('HIGH');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hazards');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHazards(json.data.hazards || []);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (hazardId: string, status: HazardStatus) => {
    try {
      const res = await fetch(`/api/hazards/${hazardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setHazards((prev) =>
          prev.map((h) => (h.id === hazardId ? { ...h, status } : h))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignHazard) return;
    setAssigning(true);

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hazard_id: assignHazard.id,
          assigned_to: 'worker-01',
          notes: `${workerName}: ${assignNotes}`,
        }),
      });

      if (res.ok) {
        setHazards((prev) =>
          prev.map((h) =>
            h.id === assignHazard.id ? { ...h, status: 'ASSIGNED' } : h
          )
        );
        setAssignHazard(null);
        setAssignNotes('');
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskHazard) return;

    try {
      const res = await fetch(`/api/hazards/${riskHazard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_score: newRiskScore,
          risk_level: newRiskLevel,
        }),
      });

      if (res.ok) {
        setHazards((prev) =>
          prev.map((h) =>
            h.id === riskHazard.id
              ? { ...h, risk_score: newRiskScore, risk_level: newRiskLevel }
              : h
          )
        );
        setRiskHazard(null);
      }
    } catch {
      // ignore
    }
  };

  const filtered = hazards.filter((h) => {
    const matchesSearch =
      !search ||
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || h.risk_level === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Hazard Report Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review citizen incident reports, verify authenticity, calibrate risk ratings, and dispatch
            repair crews.
          </p>
        </div>

        <button
          onClick={loadReports}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold text-xs transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, title or hazard..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported (Pending)</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned to Crew</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical (81-100)</option>
            <option value="HIGH">High (61-80)</option>
            <option value="MODERATE">Moderate (31-60)</option>
            <option value="LOW">Low (0-30)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Hazard & Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Risk Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Vision</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading reports...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No matching reports found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const risk = getRiskColor(item.risk_level, item.status);
                  const ai =
                    item.detections && item.detections.length > 0 ? item.detections[0] : null;

                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0"
                            style={{
                              backgroundColor: `${risk.hex}15`,
                              borderColor: `${risk.hex}40`,
                              color: risk.hex,
                            }}
                          >
                            {getHazardIcon(item.type, 'w-4 h-4')}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.type.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="line-clamp-1 text-slate-300">{item.address}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => {
                            setRiskHazard(item);
                            setNewRiskScore(item.risk_score);
                            setNewRiskLevel(item.risk_level);
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border hover:scale-105 transition"
                          style={{
                            backgroundColor: `${risk.hex}20`,
                            borderColor: `${risk.hex}40`,
                            color: risk.hex,
                          }}
                          title="Click to override risk score"
                        >
                          {item.risk_level} ({item.risk_score})
                        </button>
                      </td>

                      <td className="p-4">
                        <span className="capitalize font-semibold text-slate-200">
                          {item.status.toLowerCase().replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-4">
                        {ai ? (
                          <div className="flex items-center gap-1 text-sky-400 font-semibold text-[11px]">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{Math.round(ai.confidence * 100)}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            href={`/hazard/${item.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="View Full Dossier"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                          </Link>

                          {/* Verify Action */}
                          {item.status !== 'VERIFIED' && item.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'VERIFIED')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Verify
                            </button>
                          )}

                          {/* Assign Action */}
                          {item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
                            <button
                              onClick={() => setAssignHazard(item)}
                              className="px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 text-sky-300 font-bold text-[10px] flex items-center gap-1 transition"
                            >
                              <Wrench className="w-3 h-3" />
                              Assign
                            </button>
                          )}

                          {/* Resolve Action */}
                          {item.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-800 text-slate-300 hover:text-white font-bold text-[10px] transition"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Field Worker Modal */}
      {assignHazard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Assign Field Repair Crew</h3>
            <p className="text-xs text-slate-400">
              Dispatch municipal crew to resolve: <strong>{assignHazard.title}</strong>
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assigned Maintenance Crew
                </label>
                <select
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="BBMP Road Maintenance Unit #4">
                    BBMP Road Maintenance Unit #4 (Asphalt Roller)
                  </option>
                  <option value="BWSSB Stormwater Drainage Team">
                    BWSSB Stormwater Drainage Jetting Team
                  </option>
                  <option value="Traffic Emergency Rapid Response">
                    Traffic Emergency Rapid Response Team
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dispatch Notes</label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Bring 40-ton ductile iron manhole cover and fast curing epoxy."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignHazard(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Risk Rating Modal */}
      {riskHazard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Override Hazard Risk Score</h3>
            <p className="text-xs text-slate-400">
              Manual administrator calibration for: <strong>{riskHazard.title}</strong>
            </p>

            <form onSubmit={handleRiskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Risk Score: {newRiskScore}/100
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newRiskScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNewRiskScore(val);
                    if (val >= 81) setNewRiskLevel('CRITICAL');
                    else if (val >= 61) setNewRiskLevel('HIGH');
                    else if (val >= 31) setNewRiskLevel('MODERATE');
                    else setNewRiskLevel('LOW');
                  }}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Risk Level</label>
                <select
                  value={newRiskLevel}
                  onChange={(e) => setNewRiskLevel(e.target.value as RiskLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="CRITICAL">CRITICAL (81-100)</option>
                  <option value="HIGH">HIGH (61-80)</option>
                  <option value="MODERATE">MODERATE (31-60)</option>
                  <option value="LOW">LOW (0-30)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRiskHazard(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Calibrated Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

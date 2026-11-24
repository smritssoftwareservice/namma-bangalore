'use client';

import React, { useState } from 'react';
import {
  Bell,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useNotifications } from '@/components/context/notification-context';
import { DemoBadge } from '@/components/ui/demo-badge';

interface SavedArea {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  triggers: {
    critical: boolean;
    waterlogging: boolean;
    manholes: boolean;
    roadblock: boolean;
    floodRisk: boolean;
  };
}

const DEFAULT_AREAS: SavedArea[] = [
  {
    id: 'area-01',
    name: 'Home (Whitefield)',
    locationName: 'Hope Farm Junction, Whitefield, Bengaluru',
    latitude: 12.9839,
    longitude: 77.7511,
    radiusKm: 3.5,
    triggers: {
      critical: true,
      waterlogging: true,
      manholes: true,
      roadblock: true,
      floodRisk: true,
    },
  },
  {
    id: 'area-02',
    name: 'Work Office (EcoSpace ORR)',
    locationName: 'Bellandur Outer Ring Road, Bengaluru',
    latitude: 12.9265,
    longitude: 77.6848,
    radiusKm: 2.0,
    triggers: {
      critical: true,
      waterlogging: true,
      manholes: true,
      roadblock: false,
      floodRisk: true,
    },
  },
];

export default function AlertsPage() {
  const { notifications, markAsRead, refreshNotifications } = useNotifications();
  const [areas, setAreas] = useState<SavedArea[]>(DEFAULT_AREAS);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Area form
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('Koramangala 4th Block, Bengaluru');
  const [newRadius, setNewRadius] = useState(2);

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEntry: SavedArea = {
      id: `area-${Date.now()}`,
      name: newName,
      locationName: newLoc,
      latitude: 12.9348,
      longitude: 77.6251,
      radiusKm: newRadius,
      triggers: {
        critical: true,
        waterlogging: true,
        manholes: true,
        roadblock: true,
        floodRisk: true,
      },
    };

    setAreas([...areas, newEntry]);
    setShowAddModal(false);
    setNewName('');
  };

  const handleDeleteArea = (id: string) => {
    setAreas(areas.filter((a) => a.id !== id));
  };

  const handleToggleTrigger = (areaId: string, triggerKey: keyof SavedArea['triggers']) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? {
              ...a,
              triggers: {
                ...a.triggers,
                [triggerKey]: !a.triggers[triggerKey],
              },
            }
          : a
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-5xl mx-auto px-4 py-8 font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DemoBadge />
            <span className="text-xs text-slate-400">• Notification & Proximity Alert Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hazard Subscriptions & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Subscribe to geographic perimeters around your home, work, or transit routes to receive
            instant safety notifications.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Monitored Area
        </button>
      </div>

      {/* Grid: Monitored Areas vs Notification Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitored Locations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Saved Monitored Areas ({areas.length})
            </h2>
          </div>

          <div className="space-y-3">
            {areas.map((area) => (
              <div
                key={area.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">{area.name}</h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {area.locationName}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteArea(area.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Delete Area"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Monitoring Perimeter</span>
                  <span className="font-bold text-sky-400">{area.radiusKm} km radius</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Notification Trigger Conditions
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { key: 'critical', label: 'Critical Hazards (81-100)' },
                      { key: 'waterlogging', label: 'Active Waterlogging' },
                      { key: 'manholes', label: 'Open / Damaged Manholes' },
                      { key: 'roadblock', label: 'Road Blocks & Accidents' },
                      { key: 'floodRisk', label: 'Flood Zone Overflow' },
                    ].map((trig) => {
                      const isChecked = area.triggers[trig.key as keyof SavedArea['triggers']];
                      return (
                        <button
                          key={trig.key}
                          onClick={() =>
                            handleToggleTrigger(area.id, trig.key as keyof SavedArea['triggers'])
                          }
                          className={`p-1.5 rounded-lg text-left border transition ${
                            isChecked
                              ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {isChecked ? '☑' : '☐'} {trig.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Notification Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              Proximity Alert Dispatch Feed
            </h2>
            <span className="text-xs text-sky-400">Real-time alerts</span>
          </div>

          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
                No active alerts in your monitoring zones.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    !n.read
                      ? 'bg-sky-950/40 border-sky-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          !n.read ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <span className="font-bold text-xs text-slate-100">{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 pl-4 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Monitored Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Add Monitored Geographic Area</h3>
            <form onSubmit={handleAddArea} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Area Label / Friendly Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. College Campus / Sarjapur Home"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reference Landmark / Road
                </label>
                <input
                  type="text"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Radius: {newRadius} km
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={newRadius}
                  onChange={(e) => setNewRadius(parseFloat(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

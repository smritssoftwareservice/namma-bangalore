'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';

interface AdminChartsProps {
  analytics: {
    total: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
    potholes: number;
    manholes: number;
    waterlogging: number;
    drains: number;
    incidents: number;
    resolved: number;
    inProgress: number;
    pending: number;
    byArea: { area: string; count: number }[];
  };
}

const RISK_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981'];

export function AdminCharts({ analytics }: AdminChartsProps) {
  // 1. Hazard Type Data
  const typeData = [
    { name: 'Potholes', count: analytics.potholes, fill: '#f59e0b' },
    { name: 'Waterlogging', count: analytics.waterlogging, fill: '#06b6d4' },
    { name: 'Manholes', count: analytics.manholes, fill: '#ef4444' },
    { name: 'Drains', count: analytics.drains, fill: '#3b82f6' },
    { name: 'Incidents', count: analytics.incidents, fill: '#ec4899' },
  ];

  // 2. Risk Distribution Data
  const riskData = [
    { name: 'Critical (81-100)', value: analytics.critical, color: '#ef4444' },
    { name: 'High (61-80)', value: analytics.high, color: '#f97316' },
    { name: 'Moderate (31-60)', value: analytics.moderate, color: '#eab308' },
    { name: 'Low (0-30)', value: analytics.low, color: '#10b981' },
  ];

  // 3. Trend data over past 7 days (Simulated realistic GIS daily logs)
  const trendData = [
    { day: 'Mon', reports: 12, rainfall: 4.5, resolved: 8 },
    { day: 'Tue', reports: 19, rainfall: 18.2, resolved: 11 },
    { day: 'Wed', reports: 28, rainfall: 35.0, resolved: 14 },
    { day: 'Thu', reports: 34, rainfall: 42.4, resolved: 18 },
    { day: 'Fri', reports: 25, rainfall: 22.0, resolved: 21 },
    { day: 'Sat', reports: 18, rainfall: 12.5, resolved: 15 },
    { day: 'Sun', reports: 15, rainfall: 6.0, resolved: 12 },
  ];

  // 4. Resolution status
  const resolutionData = [
    { name: 'Pending Review', count: analytics.pending, fill: '#f59e0b' },
    { name: 'In Progress / Assigned', count: analytics.inProgress, fill: '#38bdf8' },
    { name: 'Resolved & Verified', count: analytics.resolved, fill: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Chart 1: Reports by Hazard Type */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Reports by Hazard Category
          </h3>
          <span className="text-[10px] text-slate-400">Total: {analytics.total}</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Risk Severity Distribution */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Risk Severity Distribution (0 - 100)
          </h3>
          <span className="text-[10px] text-red-400 font-bold">
            {analytics.critical} Critical Incidents
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Reports vs Rainfall vs Resolutions Trend */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Rainfall Runoff vs Hazard Spike Correlation
          </h3>
          <span className="text-[10px] text-cyan-400 font-medium">Precipitation Analysis</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="reports"
                name="Hazards Reported"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorReports)"
              />
              <Area
                type="monotone"
                dataKey="rainfall"
                name="Rainfall (mm)"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#colorRain)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Hazards by Bengaluru Area */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Geographic Density by Sector
          </h3>
          <span className="text-[10px] text-slate-400">Top High-Density Corridors</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={analytics.byArea}
              margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis dataKey="area" type="category" stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#38bdf8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

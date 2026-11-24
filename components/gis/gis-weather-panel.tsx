'use client';

import React from 'react';
import {
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Calendar,
  X,
  Radio,
  Clock,
} from 'lucide-react';
import { LiveWeatherData, WeatherSettings, WeatherTimeSlice } from '@/lib/types/gis';

interface GISWeatherPanelProps {
  weatherData: LiveWeatherData | null;
  weatherSettings: WeatherSettings;
  onUpdateWeatherSettings: (settings: Partial<WeatherSettings>) => void;
  onClose?: () => void;
}

export function GISWeatherPanel({
  weatherData,
  weatherSettings,
  onUpdateWeatherSettings,
  onClose,
}: GISWeatherPanelProps) {
  if (!weatherData) return null;

  const timeSlices: Array<{ id: WeatherTimeSlice; label: string }> = [
    { id: 'prev-24h', label: '-24h' },
    { id: 'prev-6h', label: '-6h' },
    { id: 'prev-1h', label: '-1h' },
    { id: 'current', label: 'Live' },
    { id: 'forecast-6h', label: '+6h' },
    { id: 'forecast-12h', label: '+12h' },
    { id: 'forecast-24h', label: '+24h' },
  ];

  return (
    <div className="w-88 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl p-4 text-xs space-y-3.5 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm">Weather Intelligence</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {weatherData.dataSource}
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Time Slice Selector */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Observation / Forecast Horizon:
          </span>
          <span className="text-cyan-400 font-mono font-bold">{weatherSettings.timeSlice}</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {timeSlices.map((ts) => (
            <button
              key={ts.id}
              onClick={() => onUpdateWeatherSettings({ timeSlice: ts.id })}
              className={`py-1 rounded-lg text-[9px] font-mono font-bold transition ${
                weatherSettings.timeSlice === ts.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            Precipitation
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {weatherData.precipitationMm} <span className="text-xs text-slate-400 font-normal">mm</span>
          </div>
          <div className="text-[9px] text-cyan-400 truncate mt-0.5">
            {weatherData.weatherDescription}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            Temperature
          </div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {weatherData.temperatureC}° <span className="text-xs text-slate-400 font-normal">C</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            Humidity: {weatherData.relativeHumidity}%
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            Wind Velocity
          </div>
          <div className="text-base font-bold text-white font-mono mt-1">
            {weatherData.windSpeedKmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            Bearing {weatherData.windDirectionDeg}° (SW)
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            Cloud Cover
          </div>
          <div className="text-base font-bold text-white font-mono mt-1">
            {weatherData.cloudCoverPct}%
          </div>
          <div className="text-[9px] text-purple-400 mt-0.5 font-medium">Overcast Canopy</div>
        </div>
      </div>

      {/* Hourly Rainfall Forecast Chart (Next 8 Hours) */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-slate-400">
          Hourly Rainfall Projection (mm)
        </div>
        <div className="flex items-end gap-1 h-16 pt-2 bg-slate-900/40 p-2 rounded-xl border border-slate-800/80">
          {weatherData.hourlyForecast.slice(0, 8).map((hf, i) => {
            const heightPct = Math.min(100, Math.max(15, (hf.rainMm / 20) * 100));
            const timeHour = new Date(hf.time).getHours();
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[8px] text-cyan-300 font-mono font-semibold">
                  {hf.rainMm > 0 ? `${hf.rainMm}` : '0'}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 rounded-t"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[8px] text-slate-500 font-mono">
                  {timeHour}:00
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Rainfall Forecast Snippets */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-slate-400">
          7-Day Weather Forecast
        </div>
        <div className="grid grid-cols-4 gap-1">
          {weatherData.dailyForecast.slice(0, 4).map((df, i) => (
            <div
              key={i}
              className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-center"
            >
              <div className="text-[9px] text-slate-400 font-semibold">
                {new Date(df.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-[11px] font-bold text-white font-mono mt-0.5">
                {df.precipitationSumMm}mm
              </div>
              <div className="text-[8px] text-cyan-400 font-medium">
                {df.rainProbabilityMax}% rain
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


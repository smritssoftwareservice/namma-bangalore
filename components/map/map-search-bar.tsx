'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { BENGALURU_LANDMARKS, GeocodeResult, defaultGeocodingProvider } from '@/lib/geocoding/geocoding-service';

interface MapSearchBarProps {
  onSelectLocation: (lat: number, lng: number, label: string) => void;
  onApplyAISearch?: (intent: {
    area?: string;
    hazardType?: string;
    minRisk?: string;
    waterlogging?: boolean;
  }) => void;
}

export function MapSearchBar({ onSelectLocation, onApplyAISearch }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAIQuery, setIsAIQuery] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Check if query looks like a natural language query
    const nlWords = ['show', 'find', 'near', 'critical', 'waterlogging', 'hours', 'reported', 'risk'];
    const looksLikeNL = nlWords.some((w) => query.toLowerCase().includes(w));
    setIsAIQuery(looksLikeNL);

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await defaultGeocodingProvider.search(query);
        setSuggestions(res);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GeocodeResult) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelectLocation(item.latitude, item.longitude, item.name);
  };

  const executeAISearch = () => {
    if (!onApplyAISearch) return;
    const q = query.toLowerCase();

    const intent: {
      area?: string;
      hazardType?: string;
      minRisk?: string;
      waterlogging?: boolean;
    } = {};

    // Detect area
    for (const lm of BENGALURU_LANDMARKS) {
      if (q.includes(lm.name.toLowerCase())) {
        intent.area = lm.name;
        onSelectLocation(lm.latitude, lm.longitude, lm.name);
        break;
      }
    }

    // Detect hazard
    if (q.includes('waterlogging') || q.includes('flood')) {
      intent.hazardType = 'WATERLOGGING';
      intent.waterlogging = true;
    } else if (q.includes('manhole')) {
      intent.hazardType = 'MANHOLES';
    } else if (q.includes('pothole')) {
      intent.hazardType = 'POTHOLES';
    }

    // Detect risk
    if (q.includes('critical')) {
      intent.minRisk = 'CRITICAL';
    } else if (q.includes('high')) {
      intent.minRisk = 'HIGH';
    }

    onApplyAISearch(intent);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          {isAIQuery ? (
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (isAIQuery) executeAISearch();
              else if (suggestions.length > 0) handleSelect(suggestions[0]);
            }
          }}
          placeholder="Search Bengaluru, address, landmark or AI prompt..."
          className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-100 text-xs shadow-2xl focus:outline-none transition"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isAIQuery ? (
            <button
              onClick={executeAISearch}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-[10px] tracking-wide flex items-center gap-1 shadow-md hover:scale-105 transition"
            >
              <Sparkles className="w-3 h-3" />
              AI Filter
            </button>
          ) : (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
              ↵ Enter
            </span>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-4 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Searching spatial index...
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching locations found in Bengaluru bounds.
            </div>
          )}

          {!loading &&
            suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-start gap-2.5 transition group"
              >
                <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-sky-500/20 text-slate-400 group-hover:text-sky-400 transition mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-xs">{item.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {item.display_name}
                  </div>
                </div>
              </button>
            ))}

          {isAIQuery && (
            <div className="border-t border-slate-800 mt-1 pt-2 px-2 pb-1">
              <button
                onClick={executeAISearch}
                className="w-full text-left p-2 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-between hover:bg-sky-900/40 transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Execute Natural Language Query: &ldquo;{query}&rdquo;</span>
                </div>
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Compass,
  Eye,
  RotateCw,
  Sun,
  Moon,
  CloudSun,
  Plane,
  Play,
  Pause,
  FastForward,
  Camera,
  Layers,
  Sparkles,
  Building2,
  Building,
  Navigation,
  Check,
  ChevronDown,
  X,
  Maximize2,
  AlertTriangle,
  Waves,
  MapPin,
  Sliders,
  Droplets,
  Share2,
} from 'lucide-react';
import {
  CityMapDisplayMode,
  Detailed3DBuilding,
  ElevatedInfrastructure3D,
  FlyoverPath,
  LandmarkSearchItem,
  LightingSettings,
  QualityProfileSettings,
  RenderingQualityProfile,
} from '@/lib/types/photorealistic-city';
import {
  BENGALURU_FLYOVER_PATHS,
  BENGALURU_LANDMARK_SEARCH_INDEX,
  RENDERING_PROFILES,
} from '@/lib/gis/photorealistic-city-data';

interface AppleMapsControlsProps {
  currentMode: CityMapDisplayMode;
  onSelectMode: (mode: CityMapDisplayMode) => void;
  qualityProfile: QualityProfileSettings;
  onSelectQualityProfile: (profile: RenderingQualityProfile) => void;
  lightingSettings: LightingSettings;
  onUpdateLighting: (settings: Partial<LightingSettings>) => void;
  isFlyoverActive: boolean;
  onToggleFlyover: (active: boolean) => void;
  currentFlyoverPath: FlyoverPath;
  onSelectFlyoverPath: (path: FlyoverPath) => void;
  flyoverWaypointIndex: number;
  flyoverSpeed: number;
  onChangeFlyoverSpeed: (speed: number) => void;
  onFlyoverPlayPause: () => void;
  isFlyoverPaused: boolean;
  isOrbiting: boolean;
  onToggleOrbit: () => void;
  selectedBuilding: Detailed3DBuilding | null;
  onCloseBuilding: () => void;
  selectedInfra: ElevatedInfrastructure3D | null;
  onCloseInfra: () => void;
  onSelectLandmark: (item: LandmarkSearchItem) => void;
  onResetNorth: () => void;
  onToggle3DView: () => void;
  is3DTilted: boolean;
  onStreetLevelView: () => void;
  onCaptureScreenshot: () => void;
  onSimulateAtBuilding?: (lat: number, lng: number, baseElev: number) => void;
}

export function AppleMapsControls({
  currentMode,
  onSelectMode,
  qualityProfile,
  onSelectQualityProfile,
  lightingSettings,
  onUpdateLighting,
  isFlyoverActive,
  onToggleFlyover,
  currentFlyoverPath,
  onSelectFlyoverPath,
  flyoverWaypointIndex,
  flyoverSpeed,
  onChangeFlyoverSpeed,
  onFlyoverPlayPause,
  isFlyoverPaused,
  isOrbiting,
  onToggleOrbit,
  selectedBuilding,
  onCloseBuilding,
  selectedInfra,
  onCloseInfra,
  onSelectLandmark,
  onResetNorth,
  onToggle3DView,
  is3DTilted,
  onStreetLevelView,
  onCaptureScreenshot,
  onSimulateAtBuilding,
}: AppleMapsControlsProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Floating drawers
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isLightingOpen, setIsLightingOpen] = useState(false);
  const [isQualityOpen, setIsQualityOpen] = useState(false);

  // Filter search results
  const searchResults = searchQuery.trim()
    ? BENGALURU_LANDMARK_SEARCH_INDEX.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ward.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayModes: Array<{ id: CityMapDisplayMode; label: string; icon: string; category: string }> = [
    { id: 'photorealistic-3d', label: '3D Photorealistic', icon: '🏙️', category: 'City' },
    { id: 'night-3d', label: 'Night Skyline', icon: '🌃', category: 'City' },
    { id: 'hybrid', label: '3D Hybrid', icon: '🗺️', category: 'General' },
    { id: 'satellite', label: 'Satellite Imagery', icon: '🛰️', category: 'General' },
    { id: 'terrain', label: 'Topographic Contours', icon: '⛰️', category: 'Terrain' },
    { id: 'raised-relief', label: 'Raised-Relief 3D', icon: '🏔️', category: 'Terrain' },
    { id: 'gis-analysis', label: 'Catchment & TIN', icon: '📐', category: 'GIS' },
    { id: 'flood-simulation', label: 'Flood Inundation', icon: '🌊', category: 'Hazard' },
    { id: 'weather-intel', label: 'Live Weather Radar', icon: '🌦️', category: 'Weather' },
    { id: '2d-standard', label: '2D Road Map', icon: '🚗', category: 'General' },
  ];

  return (
    <>
      {/* 1. TOP FLOATING APPLE MAPS SEARCH BAR & MODE SWITCHER */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 flex items-center gap-2 pointer-events-none">
        {/* Search Bar Widget */}
        <div ref={searchRef} className="relative flex-1 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 shadow-2xl rounded-2xl px-3.5 py-2 text-xs transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search Bengaluru landmarks, tech parks, lakes, coordinates..."
              className="bg-transparent border-none outline-none text-white placeholder-slate-400 w-full text-xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="hidden sm:inline text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              3D
            </span>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar p-1 z-50">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectLandmark(item);
                    setIsSearchOpen(false);
                    setSearchQuery(item.name);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-2.5 text-xs group"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 text-sky-400 group-hover:bg-sky-500/20 group-hover:text-sky-300 transition">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 ml-2">
                        {item.elevationMeters}m MSL
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Switcher Pill */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setIsModeMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 hover:border-slate-600 shadow-2xl rounded-2xl px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <span>{displayModes.find((m) => m.id === currentMode)?.icon || '🏙️'}</span>
            <span className="hidden md:inline">
              {displayModes.find((m) => m.id === currentMode)?.label || '3D City'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isModeMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select 3D Display Mode
              </div>
              <div className="space-y-0.5">
                {displayModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onSelectMode(mode.id);
                      setIsModeMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                      currentMode === mode.id
                        ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </span>
                    {currentMode === mode.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. RIGHT FLOATING VERTICAL ACTION PALETTE (APPLE MAPS STYLE) */}
      <div className="absolute top-20 right-4 z-40 flex flex-col gap-2">
        {/* Compass Button */}
        <button
          onClick={onResetNorth}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition group"
          title="Reset Heading to True North"
        >
          <Compass className="w-5 h-5 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* 3D / 2D Perspective Toggle */}
        <button
          onClick={onToggle3DView}
          className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center justify-center font-bold text-xs transition ${
            is3DTilted
              ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sky-500/20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={is3DTilted ? 'Switch to Top-Down 2D' : 'Switch to 45° 3D Isometric'}
        >
          {is3DTilted ? '3D' : '2D'}
        </button>

        {/* Street-Level Perspective */}
        <button
          onClick={onStreetLevelView}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Street-Level Camera View"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Orbit Mode */}
        <button
          onClick={onToggleOrbit}
          className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center justify-center transition ${
            isOrbiting
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-spin-slow'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={isOrbiting ? 'Stop Camera Orbit' : 'Orbit Around Location'}
        >
          <RotateCw className="w-4 h-4 text-amber-400" />
        </button>

        {/* Cinematic Flyover Mode */}
        <button
          onClick={() => onToggleFlyover(!isFlyoverActive)}
          className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center justify-center transition ${
            isFlyoverActive
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30 ring-2 ring-indigo-400/50'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Cinematic 3D City Flyover"
        >
          <Plane className="w-4 h-4 text-indigo-400" />
        </button>

        {/* Day / Night Lighting Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsLightingOpen((p) => !p)}
            className={`w-10 h-10 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center justify-center transition ${
              isLightingOpen
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Day / Night Lighting & Sunlight"
          >
            {lightingSettings.isNight ? (
              <Moon className="w-4 h-4 text-indigo-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Lighting Controls Popover */}
          {isLightingOpen && (
            <div className="absolute right-12 top-0 w-72 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs text-slate-200 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Solar Lighting & Atmosphere
                </span>
                <button
                  onClick={() => setIsLightingOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Time of Day Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Simulated Time</span>
                  <span className="font-mono text-white font-bold">
                    {String(Math.floor(lightingSettings.timeOfDayHours)).padStart(2, '0')}:
                    {String(Math.floor((lightingSettings.timeOfDayHours % 1) * 60)).padStart(2, '0')} IST
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.25"
                  value={lightingSettings.timeOfDayHours}
                  onChange={(e) =>
                    onUpdateLighting({
                      timeOfDayHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { id: 'dawn', label: 'Dawn', time: 6.0, icon: '🌅' },
                  { id: 'noon', label: 'Noon', time: 12.0, icon: '☀️' },
                  { id: 'sunset', label: 'Sunset', time: 18.0, icon: '🌇' },
                  { id: 'night', label: 'Night', time: 22.0, icon: '🌙' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      onUpdateLighting({
                        timeOfDayHours: p.time,
                        preset: p.id as any,
                      })
                    }
                    className={`py-1.5 rounded-xl border text-[10px] font-medium transition ${
                      Math.abs(lightingSettings.timeOfDayHours - p.time) < 1
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div>{p.icon}</div>
                    <div>{p.label}</div>
                  </button>
                ))}
              </div>

              {/* Dynamic Sun Position & Shadows */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Sun Elevation:</span>
                  <span className="font-mono text-white">{lightingSettings.sunElevationDeg}°</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sun Azimuth:</span>
                  <span className="font-mono text-white">{lightingSettings.sunAzimuthDeg}°</span>
                </div>
                <label className="flex items-center justify-between text-slate-300 cursor-pointer pt-1">
                  <span>Cast 3D Shadows</span>
                  <input
                    type="checkbox"
                    checked={lightingSettings.enableShadows}
                    onChange={(e) => onUpdateLighting({ enableShadows: e.target.checked })}
                    className="accent-amber-400 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Graphics Quality Settings (8K / 4K / High / Low) */}
        <div className="relative">
          <button
            onClick={() => setIsQualityOpen((p) => !p)}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Rendering Pipeline & 8K Settings"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
          </button>

          {isQualityOpen && (
            <div className="absolute right-12 top-0 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-xs z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Rendering Fidelity
                </span>
                <button
                  onClick={() => setIsQualityOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as RenderingQualityProfile[]).map((profKey) => {
                  const prof = RENDERING_PROFILES[profKey];
                  const isSelected = qualityProfile.id === profKey;
                  return (
                    <button
                      key={profKey}
                      onClick={() => {
                        onSelectQualityProfile(profKey);
                        setIsQualityOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition ${
                        isSelected
                          ? 'bg-purple-600/20 border border-purple-500/50 text-white font-bold'
                          : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{prof.label}</span>
                        {profKey === 'ULTRA' && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500 text-slate-950 font-black text-[9px]">
                            8K READY
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">{prof.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* High-Resolution Screenshot Export */}
        <button
          onClick={onCaptureScreenshot}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Export High-Res 4K/8K Canvas Snapshot"
        >
          <Camera className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* 3. CINEMATIC 3D CITY FLYOVER PLAYER (BOTTOM FLOATING) */}
      {isFlyoverActive && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/40 shadow-2xl rounded-3xl p-3.5 space-y-2.5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                  <Plane className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>{currentFlyoverPath.title}</span>
                    <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-700/50">
                      Waypoint {flyoverWaypointIndex + 1}/{currentFlyoverPath.waypoints.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{currentFlyoverPath.subtitle}</div>
                </div>
              </div>

              {/* Close Flyover */}
              <button
                onClick={() => onToggleFlyover(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Waypoint Description */}
            <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-semibold mr-1.5">
                {currentFlyoverPath.waypoints[flyoverWaypointIndex]?.name}:
              </span>
              {currentFlyoverPath.waypoints[flyoverWaypointIndex]?.description}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs">
              {/* Play / Pause */}
              <button
                onClick={onFlyoverPlayPause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
              >
                {isFlyoverPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                )}
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChangeFlyoverSpeed(spd)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      flyoverSpeed === spd
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Path Switcher Dropdown */}
              <select
                value={currentFlyoverPath.id}
                onChange={(e) => {
                  const path = BENGALURU_FLYOVER_PATHS.find((p) => p.id === e.target.value);
                  if (path) onSelectFlyoverPath(path);
                }}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2 py-1 text-xs outline-none"
              >
                {BENGALURU_FLYOVER_PATHS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 4. SELECTED BUILDING INSPECTION CARD (FLOATING APPLE MAPS STYLE) */}
      {selectedBuilding && (
        <div className="absolute bottom-20 left-4 z-40 w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl rounded-3xl p-4 text-xs text-slate-200 space-y-3 pointer-events-auto">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 uppercase tracking-wide">
                {selectedBuilding.category}
              </span>
              <h3 className="font-bold text-sm text-white mt-1 leading-snug">
                {selectedBuilding.name}
              </h3>
              <p className="text-[11px] text-slate-400">{selectedBuilding.wardName}</p>
            </div>
            <button onClick={onCloseBuilding} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Building Height</div>
              <div className="text-sm font-bold text-white font-mono">
                {selectedBuilding.heightMeters}m
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  ({selectedBuilding.floorCount}F)
                </span>
              </div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Ground Elevation</div>
              <div className="text-sm font-bold text-white font-mono">
                {selectedBuilding.groundElevationM}m MSL
              </div>
            </div>
          </div>

          {/* Architecture & Flood Exposure */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Footprint Area:</span>
              <span className="font-mono text-white">
                {selectedBuilding.footprintAreaSqM.toLocaleString()} m²
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rooftop Type:</span>
              <span className="text-white capitalize">
                {selectedBuilding.roofType.replace('-', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Flood Exposure:</span>
              <span
                className={`font-semibold ${
                  selectedBuilding.floodExposure.includes('Severe')
                    ? 'text-red-400'
                    : selectedBuilding.floodExposure === 'High'
                    ? 'text-orange-400'
                    : 'text-emerald-400'
                }`}
              >
                {selectedBuilding.floodExposure}
              </span>
            </div>
            {selectedBuilding.isSubmerged && (
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Simulated Inundation Depth: {selectedBuilding.estimatedFloodDepthM}m</span>
              </div>
            )}
          </div>

          {/* Architectural Notes */}
          {selectedBuilding.architecturalDetails && (
            <p className="text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80 leading-relaxed">
              {selectedBuilding.architecturalDetails}
            </p>
          )}

          {/* Action Button */}
          {onSimulateAtBuilding && (
            <button
              onClick={() =>
                onSimulateAtBuilding(
                  selectedBuilding.center[0],
                  selectedBuilding.center[1],
                  selectedBuilding.groundElevationM
                )
              }
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5" />
              Simulate Flood Deluge Here
            </button>
          )}
        </div>
      )}

      {/* 5. SELECTED ELEVATED INFRASTRUCTURE INSPECTION CARD */}
      {selectedInfra && (
        <div className="absolute bottom-20 left-4 z-40 w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl rounded-3xl p-4 text-xs text-slate-200 space-y-3 pointer-events-auto">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wide">
                {selectedInfra.type}
              </span>
              <h3 className="font-bold text-sm text-white mt-1 leading-snug">
                {selectedInfra.name}
              </h3>
            </div>
            <button onClick={onCloseInfra} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Clearance Height</div>
              <div className="text-sm font-bold text-white font-mono">
                +{selectedInfra.clearanceHeightMeters}m
              </div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Deck Width</div>
              <div className="text-sm font-bold text-white font-mono">
                {selectedInfra.deckWidthMeters}m
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
            {selectedInfra.structuralDescription}
          </p>
        </div>
      )}
    </>
  );
}

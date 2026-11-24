'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapContainer,
} from '@/components/map/map-container';
import { MapSearchBar } from '@/components/map/map-search-bar';
import { MapControls } from '@/components/map/map-controls';
import { MapLayersPanel, LayerSettings } from '@/components/map/map-layers-panel';
import {
  MapFiltersDrawer,
  FilterState,
  INITIAL_FILTERS,
} from '@/components/map/map-filters-drawer';
import { HazardPopupCard } from '@/components/map/hazard-popup-card';
import { RoutePanel } from '@/components/map/route-panel';
import { DistanceMeasureTool } from '@/components/map/distance-measure-tool';
import { MapLegend } from '@/components/map/map-legend';
import { AreaSummarySheet, AreaSummaryData } from '@/components/map/area-summary-sheet';
import { DemoBadge } from '@/components/ui/demo-badge';
import {
  FloodRiskZone,
  Hazard,
  RoadConditionSegment,
  RouteHazardAnalysis,
} from '@/lib/types/hazard';
import {
  DEMO_FLOOD_ZONES,
  DEMO_ROAD_CONDITIONS,
} from '@/lib/db/demo-data';
import {
  Search,
  Crosshair,
  Compass,
  Maximize2,
  RefreshCw,
  Sparkles,
  Layers,
  Filter,
  Navigation,
  ChevronUp,
  ChevronDown,
  X,
  Mountain,
} from 'lucide-react';

export default function MapPage() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [floodZones, setFloodZones] = useState<FloodRiskZone[]>(DEMO_FLOOD_ZONES);
  const [roadConditions, setRoadConditions] = useState<RoadConditionSegment[]>(DEMO_ROAD_CONDITIONS);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

  // Panels and tools state
  const [layers, setLayers] = useState<LayerSettings>({
    baseMap: 'drone',
    droneHud: false,
    droneTilt3D: false,
    hazards: true,
    floodRisk: true,
    rainfall: false,
    heatmap: false,
    roadConditions: true,
    incidents: true,
    contourLines5m: false,
  });

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [isMeasureMode, setIsMeasureMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Near me & Geolocation
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearMeRadius, setNearMeRadius] = useState<number>(2000); // meters
  const [nearMeOpen, setNearMeOpen] = useState(false);

  // Map Bounds & Search This Area
  const [currentBounds, setCurrentBounds] = useState<[number, number, number, number] | null>(null);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Route Analysis
  const [routeAnalysis, setRouteAnalysis] = useState<RouteHazardAnalysis | null>(null);

  // Distance Measurement
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistanceKm, setMeasureDistanceKm] = useState<number>(0);

  // Area Summary modal
  const [areaSummary, setAreaSummary] = useState<AreaSummaryData | null>(null);

  // Mobile drawer collapse state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Fetch hazards with current filters and bounds
  const fetchHazards = useCallback(
    async (boundsParam?: [number, number, number, number]) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (boundsParam) {
          queryParams.set('bounds', boundsParam.join(','));
        }
        if (filters.type && filters.type !== 'ALL') {
          queryParams.set('type', filters.type);
        }
        if (filters.risk_level && filters.risk_level !== 'ALL') {
          queryParams.set('risk_level', filters.risk_level);
        }
        if (filters.status && filters.status !== 'ALL') {
          queryParams.set('status', filters.status);
        }
        if (filters.waterlogging) {
          queryParams.set('waterlogging', 'true');
        }
        if (filters.ai_detected) {
          queryParams.set('ai_detected', 'true');
        }

        const res = await fetch(`/api/hazards?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setHazards(json.data.hazards || []);
          }
        }
      } catch {
        // demo fallback
      } finally {
        setLoading(false);
        setShowSearchAreaBtn(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchHazards();
  }, [fetchHazards]);

  // Handle Bounds Change
  const handleBoundsChange = (bounds: [number, number, number, number]) => {
    setCurrentBounds(bounds);
    setShowSearchAreaBtn(true);
  };

  // Location search select
  const handleSelectLocation = (lat: number, lng: number, label: string) => {
    // Generate area summary for the searched landmark
    const nearby = hazards.filter(
      (h) => Math.hypot(h.latitude - lat, h.longitude - lng) < 0.03
    );

    const critical = nearby.filter((h) => h.risk_level === 'CRITICAL').length;
    const high = nearby.filter((h) => h.risk_level === 'HIGH').length;
    const moderate = nearby.filter((h) => h.risk_level === 'MODERATE').length;
    const waterlogging = nearby.filter(
      (h) => h.type === 'WATERLOGGING' || h.type === 'FLOODED_ROAD'
    ).length;
    const potholes = nearby.filter(
      (h) => h.type === 'POTHOLE' || h.type === 'LARGE_POTHOLE'
    ).length;
    const manholes = nearby.filter(
      (h) => h.type === 'OPEN_MANHOLE' || h.type === 'DAMAGED_MANHOLE'
    ).length;

    setAreaSummary({
      name: label,
      total: nearby.length,
      critical,
      high,
      moderate,
      waterlogging,
      potholes,
      manholes,
      latitude: lat,
      longitude: lng,
    });
  };

  // AI Natural Language Search intent application
  const handleApplyAISearch = (intent: {
    area?: string;
    hazardType?: string;
    minRisk?: string;
    waterlogging?: boolean;
  }) => {
    setFilters((prev) => ({
      ...prev,
      type: intent.hazardType || prev.type,
      risk_level: intent.minRisk || prev.risk_level,
      waterlogging: intent.waterlogging !== undefined ? intent.waterlogging : prev.waterlogging,
    }));
  };

  // Locate User (Near Me)
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation([lat, lng]);
          fetchNearbyHazards(lat, lng, nearMeRadius);
        },
        () => {
          // Fallback to central Bengaluru coordinates
          const defaultLat = 12.9716;
          const defaultLng = 77.5946;
          setUserLocation([defaultLat, defaultLng]);
          fetchNearbyHazards(defaultLat, defaultLng, nearMeRadius);
        }
      );
    } else {
      const defaultLat = 12.9716;
      const defaultLng = 77.5946;
      setUserLocation([defaultLat, defaultLng]);
      fetchNearbyHazards(defaultLat, defaultLng, nearMeRadius);
    }
  };

  const fetchNearbyHazards = async (lat: number, lng: number, radius: number) => {
    try {
      const res = await fetch(`/api/hazards/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHazards(json.data.hazards);
          setNearMeOpen(true);
        }
      }
    } catch {
      // ignore
    }
  };

  // Route calculation callback
  const handleCalculateRoute = async (
    from: [number, number],
    to: [number, number]
  ): Promise<RouteHazardAnalysis | null> => {
    try {
      const res = await fetch(
        `/api/routes/hazards?fromLat=${from[0]}&fromLng=${from[1]}&toLat=${to[0]}&toLng=${to[1]}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRouteAnalysis(json.data);
          return json.data;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Directions to a specific hazard
  const handleGetDirectionsToHazard = (hazard: Hazard) => {
    const origin: [number, number] = userLocation || [12.9784, 77.6408]; // Indiranagar fallback
    setIsRouteOpen(true);
    handleCalculateRoute(origin, [hazard.latitude, hazard.longitude]);
  };

  const activeFilterCount =
    (filters.type !== 'ALL' ? 1 : 0) +
    (filters.risk_level !== 'ALL' ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.waterlogging ? 1 : 0) +
    (filters.ai_detected ? 1 : 0);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950 font-sans">
      {/* Top Floating Bar: Search, AI NL Search & Search This Area */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="pointer-events-auto w-full sm:w-auto">
          <MapSearchBar
            onSelectLocation={handleSelectLocation}
            onApplyAISearch={handleApplyAISearch}
          />
        </div>

        {/* "Search this area" floating button */}
        {showSearchAreaBtn && currentBounds && (
          <button
            onClick={() => fetchHazards(currentBounds)}
            className="pointer-events-auto px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 transition hover:scale-105"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Search this area
          </button>
        )}

        {/* Mode Switcher: Apple 3D Live Map vs 2D Tactical + 5m Contours */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/3d-gis"
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-sky-400/40 transition hover:scale-105"
            title="Switch to Apple-inspired 3D City Experience"
          >
            <span>🍎 Live Apple 3D Map</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-mono">8K 3D</span>
          </Link>

          <button
            onClick={() =>
              setLayers((prev) => ({
                ...prev,
                contourLines5m: !prev.contourLines5m,
              }))
            }
            className={`px-3 py-2 rounded-2xl border text-xs font-semibold shadow-xl flex items-center gap-1.5 transition ${
              layers.contourLines5m
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Toggle 5-Meter Topographic Contours"
          >
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>5m Contours {layers.contourLines5m ? '[ON]' : '[OFF]'}</span>
          </button>
        </div>

        {/* Near Me Radius Selector Quick Badge */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-2xl shadow-xl text-xs">
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 text-sky-400 font-bold hover:text-sky-300 transition"
          >
            <Crosshair className="w-4 h-4" />
            <span>Near Me</span>
          </button>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1">
            {[500, 1000, 2000, 5000].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setNearMeRadius(r);
                  if (userLocation) fetchNearbyHazards(userLocation[0], userLocation[1], r);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                  nearMeRadius === r
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <MapContainer
        hazards={hazards}
        floodZones={floodZones}
        roadConditions={roadConditions}
        layers={layers}
        selectedHazard={selectedHazard}
        onSelectHazard={(h) => setSelectedHazard(h)}
        onBoundsChange={handleBoundsChange}
        routeAnalysis={routeAnalysis}
        userLocation={userLocation}
        isMeasureMode={isMeasureMode}
        onMeasurePointsChange={(pts, dist) => {
          setMeasurePoints(pts);
          setMeasureDistanceKm(dist);
        }}
        initialCenter={[12.9716, 77.5946]}
        initialZoom={13}
        is3D={layers.droneTilt3D}
        onToggle3D={() =>
          setLayers((prev) => ({ ...prev, droneTilt3D: !prev.droneTilt3D }))
        }
        isDroneHudOpen={layers.droneHud}
        onToggleDroneHud={() =>
          setLayers((prev) => ({ ...prev, droneHud: !prev.droneHud }))
        }
      />

      {/* Right Map Controls Column */}
      <div className="absolute right-4 top-24 z-20">
        <MapControls
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onLocate={handleLocateMe}
          onResetNorth={() => {}}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isLayersOpen={isLayersOpen}
          onToggleLayers={() => {
            setIsLayersOpen(!isLayersOpen);
            setIsFiltersOpen(false);
            setIsRouteOpen(false);
          }}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={() => {
            setIsFiltersOpen(!isFiltersOpen);
            setIsLayersOpen(false);
            setIsRouteOpen(false);
          }}
          isMeasureMode={isMeasureMode}
          onToggleMeasure={() => setIsMeasureMode(!isMeasureMode)}
          isRouteMode={isRouteOpen}
          onToggleRoute={() => {
            setIsRouteOpen(!isRouteOpen);
            setIsLayersOpen(false);
            setIsFiltersOpen(false);
          }}
          activeFilterCount={activeFilterCount}
          is3D={layers.droneTilt3D}
          onToggle3D={() =>
            setLayers((prev) => ({ ...prev, droneTilt3D: !prev.droneTilt3D }))
          }
          isDroneHudOpen={layers.droneHud}
          onToggleDroneHud={() =>
            setLayers((prev) => ({ ...prev, droneHud: !prev.droneHud }))
          }
        />
      </div>

      {/* Floating Panels Container (Left / Floating) */}
      <div className="absolute left-4 top-20 z-20 space-y-3 pointer-events-auto">
        {isLayersOpen && (
          <MapLayersPanel
            layers={layers}
            onChange={setLayers}
            onClose={() => setIsLayersOpen(false)}
          />
        )}

        {isFiltersOpen && (
          <MapFiltersDrawer
            filters={filters}
            onChange={setFilters}
            onClose={() => setIsFiltersOpen(false)}
            count={hazards.length}
          />
        )}

        {isRouteOpen && (
          <RoutePanel
            onClose={() => {
              setIsRouteOpen(false);
              setRouteAnalysis(null);
            }}
            onCalculateRoute={handleCalculateRoute}
            onSelectRouteHazard={(h) => setSelectedHazard(h)}
          />
        )}

        {isMeasureMode && (
          <DistanceMeasureTool
            points={measurePoints}
            totalDistanceKm={measureDistanceKm}
            onClear={() => {
              setMeasurePoints([]);
              setMeasureDistanceKm(0);
            }}
            onFinish={() => setIsMeasureMode(false)}
          />
        )}

        {areaSummary && (
          <AreaSummarySheet
            data={areaSummary}
            onClose={() => setAreaSummary(null)}
            onViewArea={() => {
              setAreaSummary(null);
            }}
          />
        )}
      </div>

      {/* Selected Hazard Popup modal on bottom-left for desktop / bottom sheet for mobile */}
      {selectedHazard && (
        <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:left-4 z-30 pointer-events-auto">
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl">
            <button
              onClick={() => setSelectedHazard(null)}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <HazardPopupCard
              hazard={selectedHazard}
              onGetDirections={handleGetDirectionsToHazard}
            />
          </div>
        </div>
      )}

      {/* Bottom Right: Map Legend */}
      <div className="absolute bottom-6 right-4 z-20 pointer-events-auto hidden sm:block">
        <MapLegend />
      </div>

      {/* Bottom Center: Visible hazards count pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>
          Showing <strong className="text-white">{hazards.length}</strong> hazards in viewport
        </span>
      </div>
    </div>
  );
}

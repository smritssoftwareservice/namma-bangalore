'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker, Popup, GeoJSONSource } from 'maplibre-gl';
import {
  FloodRiskZone,
  Hazard,
  RoadConditionSegment,
  RouteHazardAnalysis,
} from '@/lib/types/hazard';
import { BaseMapStyle, LayerSettings } from './map-layers-panel';
import { getRiskColor } from './hazard-icons';
import { haversineDistanceMeters } from '@/lib/routing/routing-service';
import { DroneHudOverlay } from './drone-hud-overlay';
import { generateContoursGeoJSON } from '@/lib/gis/dem-data';

interface MapContainerProps {
  hazards: Hazard[];
  floodZones: FloodRiskZone[];
  roadConditions: RoadConditionSegment[];
  layers: LayerSettings;
  onSelectHazard: (hazard: Hazard) => void;
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  routeAnalysis?: RouteHazardAnalysis | null;
  userLocation?: [number, number] | null; // [lat, lng]
  isMeasureMode?: boolean;
  onMeasurePointsChange?: (points: [number, number][], distanceKm: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  initialCenter?: [number, number]; // [lat, lng]
  initialZoom?: number;
  selectedHazard?: Hazard | null;
  onToggle3D?: () => void;
  is3D?: boolean;
  onToggleDroneHud?: () => void;
  isDroneHudOpen?: boolean;
}

// 4K High-Resolution Drone Orthophoto Aerial Style (Sub-meter orthomosaic)
const DRONE_ORTHO_STYLE: any = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN',
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-world-imagery',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-contrast': 0.12,
        'raster-saturation': 0.18,
        'raster-fade-duration': 200,
      },
    },
  ],
};

// Drone Hybrid: 4K Aerial Orthophoto + Tactical Road & Boundary Overlays
const DRONE_HYBRID_STYLE: any = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-world-imagery',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-contrast': 0.12,
        'raster-saturation': 0.18,
      },
    },
    {
      id: 'esri-labels-layer',
      type: 'raster',
      source: 'esri-labels',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-opacity': 0.85,
      },
    },
  ],
};

const BASE_MAP_STYLES: Record<BaseMapStyle, any> = {
  drone: DRONE_ORTHO_STYLE,
  satellite: DRONE_HYBRID_STYLE,
  contour5m: DRONE_ORTHO_STYLE,
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  default: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  terrain: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};

// Fallback style if external vector styles have CORS issues
const FALLBACK_OSM_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function MapContainer({
  hazards,
  floodZones,
  roadConditions,
  layers,
  onSelectHazard,
  onBoundsChange,
  routeAnalysis,
  userLocation,
  isMeasureMode = false,
  onMeasurePointsChange,
  onMapClick,
  initialCenter = [12.9716, 77.5946], // Bengaluru center
  initialZoom = 13,
  selectedHazard,
  onToggle3D,
  is3D: propIs3D,
  onToggleDroneHud,
  isDroneHudOpen: propIsDroneHudOpen,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const measurePointsRef = useRef<[number, number][]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(0); // increment on each style load

  // Drone Telemetry State
  const [zoom, setZoom] = useState(initialZoom);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [droneHudVisible, setDroneHudVisible] = useState(propIsDroneHudOpen ?? true);

  // Sync external HUD prop
  useEffect(() => {
    if (propIsDroneHudOpen !== undefined) {
      setDroneHudVisible(propIsDroneHudOpen);
    }
  }, [propIsDroneHudOpen]);

  // Handle 3D tilt toggle
  const handleToggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const currentPitch = mapRef.current.getPitch();
    const targetPitch = currentPitch > 20 ? 0 : 45;
    mapRef.current.easeTo({
      pitch: targetPitch,
      bearing: targetPitch > 20 ? 15 : 0,
      duration: 700,
    });
    if (onToggle3D) onToggle3D();
  }, [onToggle3D]);

  // Sync external 3D tilt prop
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const targetPitch = layers.droneTilt3D || propIs3D ? 45 : 0;
    const currentPitch = mapRef.current.getPitch();
    if (Math.abs(currentPitch - targetPitch) > 5) {
      mapRef.current.easeTo({
        pitch: targetPitch,
        bearing: targetPitch > 20 ? 15 : 0,
        duration: 700,
      });
    }
  }, [layers.droneTilt3D, propIs3D, mapLoaded]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const baseStyle = BASE_MAP_STYLES[layers.baseMap] || BASE_MAP_STYLES.drone;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: baseStyle,
      center: [initialCenter[1], initialCenter[0]], // [lng, lat]
      zoom: initialZoom,
      maxZoom: 19.5,
      minZoom: 8,
      pitchWithRotate: true,
      maxPitch: 65,
    });

    // Fallback if custom vector style fails
    map.on('error', (e: { error?: { message?: string } }) => {
      if (e.error?.message?.includes('style') || e.error?.message?.includes('403')) {
        map.setStyle(FALLBACK_OSM_STYLE as any);
      }
    });

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
      triggerBoundsUpdate();
    });

    map.on('style.load', () => {
      setStyleLoaded((prev) => prev + 1);
    });

    map.on('move', () => {
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
    });

    map.on('zoom', () => {
      setZoom(map.getZoom());
    });

    map.on('pitch', () => {
      setPitch(map.getPitch());
    });

    map.on('rotate', () => {
      setBearing(map.getBearing());
    });

    map.on('moveend', () => {
      triggerBoundsUpdate();
    });

    // Map click handling
    map.on('click', (e: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = e.lngLat;
      if (isMeasureMode) {
        handleMeasureClick(lat, lng);
      } else if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update base map style dynamically
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const styleSpec = BASE_MAP_STYLES[layers.baseMap] || BASE_MAP_STYLES.drone;
    mapRef.current.setStyle(styleSpec);
  }, [layers.baseMap, mapLoaded]);

  // Handle measurement clicks
  const handleMeasureClick = (lat: number, lng: number) => {
    const pts = [...measurePointsRef.current, [lat, lng] as [number, number]];
    measurePointsRef.current = pts;

    let dist = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      dist += haversineDistanceMeters(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    }
    const distKm = dist / 1000;

    if (onMeasurePointsChange) {
      onMeasurePointsChange(pts, distKm);
    }

    renderMeasureLine(pts);
  };

  const renderMeasureLine = (pts: [number, number][]) => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: pts.map((p) => [p[1], p[0]]),
      },
    };

    if (map.getSource('measure-line-source')) {
      (map.getSource('measure-line-source') as GeoJSONSource).setData(geojson);
    } else {
      map.addSource('measure-line-source', {
        type: 'geojson',
        data: geojson,
      });
      map.addLayer({
        id: 'measure-line-layer',
        type: 'line',
        source: 'measure-line-source',
        paint: {
          'line-color': '#10b981',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });
    }
  };

  // Reset measure line if mode turned off
  useEffect(() => {
    if (!isMeasureMode) {
      measurePointsRef.current = [];
      const map = mapRef.current;
      if (map && map.getLayer('measure-line-layer')) {
        map.removeLayer('measure-line-layer');
        map.removeSource('measure-line-source');
      }
    }
  }, [isMeasureMode]);

  const triggerBoundsUpdate = () => {
    if (!mapRef.current || !onBoundsChange) return;
    const bounds = mapRef.current.getBounds();
    onBoundsChange([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]);
  };

  // Fly-to animation when selected hazard changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedHazard) return;
    mapRef.current.flyTo({
      center: [selectedHazard.longitude, selectedHazard.latitude],
      zoom: 17.5,
      pitch: 42,
      duration: 1200,
    });
  }, [selectedHazard, mapLoaded]);

  // Render User Location Dot
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></span>
        <span class="relative w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-xl"></span>
      `;

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation[1], userLocation[0]])
        .addTo(mapRef.current);
    }
  }, [userLocation, mapLoaded]);

  // Render Custom Hazard Markers (Optimized for high-contrast visibility on 4K drone photography)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Remove previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!layers.hazards) return;

    hazards.forEach((hazard) => {
      const risk = getRiskColor(hazard.risk_level, hazard.status);
      const isCritical = hazard.risk_level === 'CRITICAL' && hazard.status !== 'RESOLVED';
      const isSelected = selectedHazard?.id === hazard.id;

      const el = document.createElement('div');
      el.className = `cursor-pointer transition-transform duration-200 hover:scale-125 z-10 flex flex-col items-center group`;

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${
            isCritical
              ? `<span class="absolute w-9 h-9 rounded-full bg-red-500/60 animate-ping"></span>`
              : isSelected
              ? `<span class="absolute w-9 h-9 rounded-full bg-emerald-400/60 animate-ping"></span>`
              : ''
          }
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-2xl border-2 transition-all ${
            isSelected ? 'ring-4 ring-emerald-400/80 scale-110' : ''
          }" style="background: #020617; border-color: ${risk.hex}; box-shadow: 0 0 12px ${risk.hex}80;">
            <span style="color: ${risk.hex}; font-size: 13px; font-weight: 900; font-family: monospace;">
              ${hazard.type.charAt(0)}
            </span>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45" style="background: ${risk.hex};"></div>
        </div>
        <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded-lg bg-slate-950/95 border border-slate-700 text-[10px] text-white font-mono whitespace-nowrap pointer-events-none shadow-2xl flex items-center gap-1.5 z-30">
          <span class="w-1.5 h-1.5 rounded-full" style="background: ${risk.hex};"></span>
          <span>${hazard.type.replace(/_/g, ' ')} (${hazard.risk_score})</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectHazard(hazard);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hazard.longitude, hazard.latitude])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [hazards, layers.hazards, mapLoaded, selectedHazard, onSelectHazard]);

  // Render Flood Risk Polygons & Road Conditions & Heatmap
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // 1. Flood Zones GeoJSON
    const floodGeoJson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: floodZones.map((fz) => ({
        type: 'Feature',
        properties: {
          id: fz.id,
          name: fz.name,
          risk: fz.risk_level,
          reports: fz.recent_reports_count,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [fz.polygon_coordinates],
        },
      })),
    };

    if (map.getSource('flood-zones-source')) {
      (map.getSource('flood-zones-source') as GeoJSONSource).setData(floodGeoJson);
    } else {
      map.addSource('flood-zones-source', {
        type: 'geojson',
        data: floodGeoJson,
      });

      map.addLayer({
        id: 'flood-zones-fill',
        type: 'fill',
        source: 'flood-zones-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'risk'],
            'CRITICAL',
            '#ef4444',
            'HIGH',
            '#f97316',
            'MODERATE',
            '#00f0ff',
            '#10b981',
          ],
          'fill-opacity': 0.32,
        },
      });

      map.addLayer({
        id: 'flood-zones-outline',
        type: 'line',
        source: 'flood-zones-source',
        paint: {
          'line-color': [
            'match',
            ['get', 'risk'],
            'CRITICAL',
            '#ff0055',
            'HIGH',
            '#ff8800',
            'MODERATE',
            '#00f0ff',
            '#00ff9d',
          ],
          'line-width': 2.5,
          'line-dasharray': [3, 2],
        },
      });
    }

    if (map.getLayer('flood-zones-fill')) {
      map.setLayoutProperty(
        'flood-zones-fill',
        'visibility',
        layers.floodRisk ? 'visible' : 'none'
      );
      map.setLayoutProperty(
        'flood-zones-outline',
        'visibility',
        layers.floodRisk ? 'visible' : 'none'
      );
    }

    // 1b. 5-Meter Topographic Contours (Razor-sharp DEM isolines every 5m)
    const showContours =
      layers.contourLines5m ||
      layers.baseMap === 'contour5m' ||
      layers.baseMap === 'terrain';

    if (!map.getSource('contours-5m-source')) {
      const contourData = generateContoursGeoJSON(undefined, 5);
      map.addSource('contours-5m-source', {
        type: 'geojson',
        data: contourData as any,
      });

      // Minor contour lines (every 5m)
      map.addLayer({
        id: 'contours-5m-minor',
        type: 'line',
        source: 'contours-5m-source',
        filter: ['!=', ['get', 'isMajor'], true],
        paint: {
          'line-color': '#10b981', // Crisp emerald green
          'line-width': 1.4,
          'line-opacity': 0.85,
        },
      });

      // Major contour lines (every 25m)
      map.addLayer({
        id: 'contours-5m-major',
        type: 'line',
        source: 'contours-5m-source',
        filter: ['==', ['get', 'isMajor'], true],
        paint: {
          'line-color': '#f59e0b', // High-contrast amber
          'line-width': 2.4,
          'line-opacity': 0.95,
        },
      });

      // Contour elevation labels (haloed for crystal clear reading)
      map.addLayer({
        id: 'contours-5m-labels',
        type: 'symbol',
        source: 'contours-5m-source',
        filter: ['==', ['get', 'isMajor'], true],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['concat', ['get', 'elevation'], ' m'],
          'text-size': 11,
          'text-letter-spacing': 0.05,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#064e3b',
          'text-halo-width': 2.5,
        },
        minzoom: 12,
      });
    }

    if (map.getLayer('contours-5m-minor')) {
      const vis = showContours ? 'visible' : 'none';
      map.setLayoutProperty('contours-5m-minor', 'visibility', vis);
      map.setLayoutProperty('contours-5m-major', 'visibility', vis);
      map.setLayoutProperty('contours-5m-labels', 'visibility', vis);
    }

    // 2. Road Conditions GeoJSON
    const roadGeoJson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: roadConditions.map((rc) => ({
        type: 'Feature',
        properties: {
          id: rc.id,
          name: rc.road_name,
          condition: rc.condition,
        },
        geometry: {
          type: 'LineString',
          coordinates: rc.path_coordinates,
        },
      })),
    };

    if (map.getSource('road-conditions-source')) {
      (map.getSource('road-conditions-source') as GeoJSONSource).setData(roadGeoJson);
    } else {
      map.addSource('road-conditions-source', {
        type: 'geojson',
        data: roadGeoJson,
      });

      map.addLayer({
        id: 'road-conditions-line',
        type: 'line',
        source: 'road-conditions-source',
        paint: {
          'line-color': [
            'match',
            ['get', 'condition'],
            'CRITICAL',
            '#ff1155',
            'HAZARD',
            '#ff9900',
            'CAUTION',
            '#eab308',
            '#00ff9d',
          ],
          'line-width': 4.5,
          'line-opacity': 0.9,
        },
      });
    }

    if (map.getLayer('road-conditions-line')) {
      map.setLayoutProperty(
        'road-conditions-line',
        'visibility',
        layers.roadConditions ? 'visible' : 'none'
      );
    }

    // 3. Heatmap Layer
    const hazardPointsGeoJson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: hazards.map((h) => ({
        type: 'Feature',
        properties: {
          weight: h.risk_score / 100,
        },
        geometry: {
          type: 'Point',
          coordinates: [h.longitude, h.latitude],
        },
      })),
    };

    if (map.getSource('heatmap-source')) {
      (map.getSource('heatmap-source') as GeoJSONSource).setData(hazardPointsGeoJson);
    } else {
      map.addSource('heatmap-source', {
        type: 'geojson',
        data: hazardPointsGeoJson,
      });

      map.addLayer({
        id: 'hazard-heatmap',
        type: 'heatmap',
        source: 'heatmap-source',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1.8,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 240, 255, 0)',
            0.2,
            'rgba(0, 240, 255, 0.6)',
            0.4,
            'rgb(0, 255, 150)',
            0.6,
            'rgb(255, 230, 0)',
            0.8,
            'rgb(255, 120, 0)',
            1,
            'rgb(255, 20, 80)',
          ],
          'heatmap-radius': 35,
          'heatmap-opacity': 0.75,
        },
      });
    }

    if (map.getLayer('hazard-heatmap')) {
      map.setLayoutProperty(
        'hazard-heatmap',
        'visibility',
        layers.heatmap ? 'visible' : 'none'
      );
    }
  }, [floodZones, roadConditions, hazards, layers, mapLoaded, styleLoaded]);

  // Render Navigation Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (routeAnalysis && routeAnalysis.route_geometry.length > 0) {
      const routeGeoJson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeAnalysis.route_geometry,
        },
      };

      if (map.getSource('route-source')) {
        (map.getSource('route-source') as GeoJSONSource).setData(routeGeoJson);
      } else {
        map.addSource('route-source', {
          type: 'geojson',
          data: routeGeoJson,
        });

        map.addLayer({
          id: 'route-line-casing',
          type: 'line',
          source: 'route-source',
          paint: {
            'line-color': '#0284c7',
            'line-width': 8,
            'line-opacity': 0.6,
          },
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-source',
          paint: {
            'line-color': '#00f0ff',
            'line-width': 4.5,
          },
        });
      }

      // Fit map bounds to route
      const coords = routeAnalysis.route_geometry;
      let minLng = coords[0][0],
        maxLng = coords[0][0];
      let minLat = coords[0][1],
        maxLat = coords[0][1];

      coords.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });

      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 1000 }
      );
    } else {
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getLayer('route-line-casing')) map.removeLayer('route-line-casing');
      if (map.getSource('route-source')) map.removeSource('route-source');
    }
  }, [routeAnalysis, mapLoaded, styleLoaded]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950">
      {/* 4K Drone Orthophoto Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Drone Reconnaissance Telemetry HUD */}
      <DroneHudOverlay
        zoom={zoom}
        pitch={pitch}
        bearing={bearing}
        center={center}
        selectedHazard={selectedHazard}
        isVisible={droneHudVisible && (layers.droneHud ?? true)}
        onToggleVisible={() => setDroneHudVisible((prev) => !prev)}
        onToggle3D={handleToggle3D}
        is3D={pitch > 20}
      />
    </div>
  );
}

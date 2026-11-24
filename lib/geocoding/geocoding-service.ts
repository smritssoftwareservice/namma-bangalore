// FLOODGUARD AI - Geocoding Provider Abstraction
export interface GeocodeResult {
  id: string;
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
  type: 'neighborhood' | 'landmark' | 'road' | 'city' | 'coordinates';
}

export interface GeocodingProvider {
  search(query: string): Promise<GeocodeResult[]>;
  reverse(lat: number, lng: number): Promise<string>;
}

// Curated geospatial index for Bengaluru key areas and transit nodes
export const BENGALURU_LANDMARKS: GeocodeResult[] = [
  {
    id: 'blr-whitefield',
    name: 'Whitefield',
    display_name: 'Whitefield, Bengaluru, Karnataka, India',
    latitude: 12.9698,
    longitude: 77.7499,
    type: 'neighborhood',
  },
  {
    id: 'blr-koramangala',
    name: 'Koramangala',
    display_name: 'Koramangala, Bengaluru, Karnataka, India',
    latitude: 12.9352,
    longitude: 77.6245,
    type: 'neighborhood',
  },
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar',
    display_name: 'Indiranagar 100 Feet Rd, Bengaluru, Karnataka, India',
    latitude: 12.9784,
    longitude: 77.6408,
    type: 'neighborhood',
  },
  {
    id: 'blr-mg-road',
    name: 'MG Road',
    display_name: 'Mahatma Gandhi Road, Bengaluru Central, Karnataka, India',
    latitude: 12.9756,
    longitude: 77.6066,
    type: 'road',
  },
  {
    id: 'blr-electronic-city',
    name: 'Electronic City',
    display_name: 'Electronic City Phase 1 & 2, Hosur Rd, Bengaluru, Karnataka',
    latitude: 12.8399,
    longitude: 77.677,
    type: 'neighborhood',
  },
  {
    id: 'blr-bellandur',
    name: 'Bellandur',
    display_name: 'Bellandur Outer Ring Road, Bengaluru, Karnataka',
    latitude: 12.9304,
    longitude: 77.6784,
    type: 'neighborhood',
  },
  {
    id: 'blr-silk-board',
    name: 'Central Silk Board',
    display_name: 'Silk Board Junction, Hosur Rd / ORR, Bengaluru, Karnataka',
    latitude: 12.9174,
    longitude: 77.6238,
    type: 'landmark',
  },
  {
    id: 'blr-marathahalli',
    name: 'Marathahalli',
    display_name: 'Marathahalli Bridge & Multiplex, Bengaluru, Karnataka',
    latitude: 12.9569,
    longitude: 77.7011,
    type: 'neighborhood',
  },
  {
    id: 'blr-hsr-layout',
    name: 'HSR Layout',
    display_name: 'HSR Layout Sectors 1-7, Bengaluru, Karnataka',
    latitude: 12.9121,
    longitude: 77.6446,
    type: 'neighborhood',
  },
  {
    id: 'blr-hebbal',
    name: 'Hebbal',
    display_name: 'Hebbal Flyover / Outer Ring Road, Bengaluru, Karnataka',
    latitude: 13.0358,
    longitude: 77.597,
    type: 'neighborhood',
  },
  {
    id: 'blr-outer-ring-road',
    name: 'Outer Ring Road (ORR)',
    display_name: 'Outer Ring Road (Sarjapur to Marathahalli), Bengaluru',
    latitude: 12.9345,
    longitude: 77.6892,
    type: 'road',
  },
  {
    id: 'blr-jayanagar',
    name: 'Jayanagar',
    display_name: 'Jayanagar 4th Block, Bengaluru, Karnataka',
    latitude: 12.9308,
    longitude: 77.5838,
    type: 'neighborhood',
  },
];

export class HybridGeocodingProvider implements GeocodingProvider {
  async search(query: string): Promise<GeocodeResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Check coordinate pattern (e.g. 12.9716, 77.5946)
    const coordMatch = q.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      return [
        {
          id: `coord-${lat}-${lng}`,
          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          display_name: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          latitude: lat,
          longitude: lng,
          type: 'coordinates',
        },
      ];
    }

    // Fast local lookup
    const localMatches = BENGALURU_LANDMARKS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.display_name.toLowerCase().includes(q)
    );

    if (localMatches.length > 0) {
      return localMatches;
    }

    // Try OpenStreetMap Nominatim for general queries
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query + ', Bengaluru'
      )}&format=json&limit=5`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'FloodGuardAI-Geocoding/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item, idx) => ({
            id: `nom-${item.osm_id || idx}`,
            name: item.name || item.display_name.split(',')[0],
            display_name: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            type: 'neighborhood' as const,
          }));
        }
      }
    } catch {
      // ignore network errors and fallback
    }

    return localMatches;
  }

  async reverse(lat: number, lng: number): Promise<string> {
    // Find closest local landmark
    let closest = BENGALURU_LANDMARKS[0];
    let minDiff = Infinity;
    for (const lm of BENGALURU_LANDMARKS) {
      const diff = Math.hypot(lm.latitude - lat, lm.longitude - lng);
      if (diff < minDiff) {
        minDiff = diff;
        closest = lm;
      }
    }

    if (minDiff < 0.03) {
      return `Near ${closest.name}, Bengaluru`;
    }

    return `Bengaluru (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}

export const defaultGeocodingProvider = new HybridGeocodingProvider();

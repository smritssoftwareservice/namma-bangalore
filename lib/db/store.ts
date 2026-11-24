// FLOODGUARD AI - Unified Database & Data Store Adapter
import { DEMO_FLOOD_ZONES, DEMO_HAZARDS, DEMO_NOTIFICATIONS, DEMO_ROAD_CONDITIONS } from './demo-data';
import {
  CommunityConfirmation,
  FloodRiskZone,
  Hazard,
  MaintenanceTask,
  RoadConditionSegment,
  UserNotification,
} from '@/lib/types/hazard';
import { haversineDistanceMeters } from '@/lib/routing/routing-service';

class FloodGuardStore {
  private hazards: Map<string, Hazard> = new Map();
  private floodZones: FloodRiskZone[] = [...DEMO_FLOOD_ZONES];
  private roadConditions: RoadConditionSegment[] = [...DEMO_ROAD_CONDITIONS];
  private notifications: UserNotification[] = [...DEMO_NOTIFICATIONS];
  private confirmations: CommunityConfirmation[] = [];

  constructor() {
    // Seed initial demo hazards
    for (const h of DEMO_HAZARDS) {
      this.hazards.set(h.id, { ...h });
    }
  }

  // Hazards queries
  async getHazards(options?: {
    bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
    type?: string;
    risk_level?: string;
    status?: string;
    search?: string;
    ai_detected?: boolean;
    waterlogging?: boolean;
  }): Promise<Hazard[]> {
    let list = Array.from(this.hazards.values());

    // 1. Bounds filtering (Map viewport)
    if (options?.bounds && options.bounds.length === 4) {
      const [minLng, minLat, maxLng, maxLat] = options.bounds;
      list = list.filter(
        (h) =>
          h.longitude >= minLng &&
          h.longitude <= maxLng &&
          h.latitude >= minLat &&
          h.latitude <= maxLat
      );
    }

    // 2. Type filter
    if (options?.type && options.type !== 'ALL') {
      const targetType = options.type.toUpperCase();
      if (targetType === 'POTHOLES') {
        list = list.filter((h) => h.type === 'POTHOLE' || h.type === 'LARGE_POTHOLE');
      } else if (targetType === 'MANHOLES') {
        list = list.filter((h) => h.type === 'OPEN_MANHOLE' || h.type === 'DAMAGED_MANHOLE');
      } else if (targetType === 'DRAINS') {
        list = list.filter((h) => h.type.includes('DRAIN'));
      } else if (targetType === 'WATERLOGGING') {
        list = list.filter((h) => h.type === 'WATERLOGGING' || h.type === 'FLOODED_ROAD');
      } else if (targetType === 'INCIDENTS') {
        list = list.filter((h) =>
          ['ACCIDENT_REPORTED', 'ROAD_BLOCKED', 'VEHICLE_STRANDED'].includes(h.type)
        );
      } else {
        list = list.filter((h) => h.type === targetType);
      }
    }

    // 3. Risk level filter
    if (options?.risk_level && options.risk_level !== 'ALL') {
      list = list.filter((h) => h.risk_level === options.risk_level);
    }

    // 4. Status filter
    if (options?.status && options.status !== 'ALL') {
      list = list.filter((h) => h.status === options.status);
    }

    // 5. Waterlogging filter
    if (options?.waterlogging) {
      list = list.filter((h) => h.type === 'WATERLOGGING' || h.type === 'FLOODED_ROAD');
    }

    // 6. AI detected filter
    if (options?.ai_detected) {
      list = list.filter((h) => h.detections && h.detections.length > 0);
    }

    // 7. Search text query
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.type.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getHazardById(id: string): Promise<Hazard | null> {
    return this.hazards.get(id) || null;
  }

  async createHazard(data: Partial<Hazard>): Promise<Hazard> {
    const id = data.id || `haz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newHazard: Hazard = {
      id,
      type: data.type || 'POTHOLE',
      title: data.title || 'Reported Road Hazard',
      description: data.description || '',
      latitude: data.latitude || 12.9716,
      longitude: data.longitude || 77.5946,
      address: data.address || 'Bengaluru, Karnataka',
      severity: data.severity || 'MODERATE',
      risk_score: data.risk_score || 50,
      risk_level: data.risk_level || 'MODERATE',
      status: data.status || 'REPORTED',
      reporter_name: data.reporter_name || 'Citizen Reporter',
      created_at: now,
      updated_at: now,
      is_demo: true,
      detections: data.detections || [],
      evidence: data.evidence || [],
      weather: data.weather,
      risk_breakdown: data.risk_breakdown,
      confirmations_count: { still_present: 1, resolved: 0 },
    };

    this.hazards.set(id, newHazard);

    // Auto-create notification for high or critical risk
    if (newHazard.risk_level === 'CRITICAL' || newHazard.risk_level === 'HIGH') {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: 'user-01',
        title: `New ${newHazard.risk_level} Hazard Reported`,
        message: `${newHazard.title} near ${newHazard.address}. Assistive alert generated.`,
        type: 'ALERT',
        hazard_id: id,
        read: false,
        created_at: now,
      });
    }

    return newHazard;
  }

  async updateHazard(id: string, updates: Partial<Hazard>): Promise<Hazard | null> {
    const existing = this.hazards.get(id);
    if (!existing) return null;

    const updated: Hazard = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.hazards.set(id, updated);
    return updated;
  }

  async getNearbyHazards(
    lat: number,
    lng: number,
    radiusMeters: number,
    sortBy: 'distance' | 'risk' | 'recency' = 'distance'
  ): Promise<Hazard[]> {
    const list = Array.from(this.hazards.values()).map((h) => {
      const distance_meters = Math.round(haversineDistanceMeters(lat, lng, h.latitude, h.longitude));
      return { ...h, distance_meters };
    });

    const nearby = list.filter((h) => (h.distance_meters || 0) <= radiusMeters);

    if (sortBy === 'distance') {
      nearby.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));
    } else if (sortBy === 'risk') {
      nearby.sort((a, b) => b.risk_score - a.risk_score);
    } else {
      nearby.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return nearby;
  }

  async getFloodZones(): Promise<FloodRiskZone[]> {
    return this.floodZones;
  }

  async getRoadConditions(): Promise<RoadConditionSegment[]> {
    return this.roadConditions;
  }

  async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
    const tasks: MaintenanceTask[] = [];
    for (const h of this.hazards.values()) {
      if (h.maintenance) {
        tasks.push(h.maintenance);
      }
    }
    return tasks;
  }

  async updateMaintenanceTask(
    hazardId: string,
    updates: Partial<MaintenanceTask>
  ): Promise<MaintenanceTask | null> {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return null;

    const existingTask = hazard.maintenance || {
      id: `maint-${Date.now()}`,
      hazard_id: hazardId,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    const updatedTask: MaintenanceTask = {
      ...existingTask,
      ...updates,
    };

    hazard.maintenance = updatedTask;

    // Sync hazard status
    if (updatedTask.status === 'COMPLETED') {
      hazard.status = 'RESOLVED';
      hazard.risk_score = Math.min(hazard.risk_score, 18);
      hazard.risk_level = 'LOW';
    } else if (updatedTask.status === 'IN_PROGRESS') {
      hazard.status = 'IN_PROGRESS';
    } else if (updatedTask.status === 'ASSIGNED') {
      hazard.status = 'ASSIGNED';
    } else if (updatedTask.status === 'VERIFIED') {
      hazard.status = 'CLOSED';
    }

    this.hazards.set(hazardId, hazard);
    return updatedTask;
  }

  async addConfirmation(hazardId: string, confirmation: 'STILL_PRESENT' | 'RESOLVED'): Promise<Hazard | null> {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return null;

    if (!hazard.confirmations_count) {
      hazard.confirmations_count = { still_present: 0, resolved: 0 };
    }

    if (confirmation === 'STILL_PRESENT') {
      hazard.confirmations_count.still_present++;
    } else {
      hazard.confirmations_count.resolved++;
    }

    this.confirmations.push({
      id: `conf-${Date.now()}`,
      hazard_id: hazardId,
      confirmation,
      created_at: new Date().toISOString(),
    });

    return hazard;
  }

  async getNotifications(userId?: string): Promise<UserNotification[]> {
    if (!userId) return this.notifications;
    return this.notifications.filter((n) => n.user_id === userId || n.user_id === 'user-01');
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  async getAnalytics() {
    const all = Array.from(this.hazards.values());
    const total = all.length;
    const critical = all.filter((h) => h.risk_level === 'CRITICAL').length;
    const high = all.filter((h) => h.risk_level === 'HIGH').length;
    const moderate = all.filter((h) => h.risk_level === 'MODERATE').length;
    const low = all.filter((h) => h.risk_level === 'LOW').length;

    const potholes = all.filter((h) => h.type === 'POTHOLE' || h.type === 'LARGE_POTHOLE').length;
    const manholes = all.filter((h) => h.type === 'OPEN_MANHOLE' || h.type === 'DAMAGED_MANHOLE').length;
    const waterlogging = all.filter((h) => h.type === 'WATERLOGGING' || h.type === 'FLOODED_ROAD').length;
    const drains = all.filter((h) => h.type.includes('DRAIN')).length;
    const incidents = all.filter((h) => ['ACCIDENT_REPORTED', 'ROAD_BLOCKED', 'VEHICLE_STRANDED'].includes(h.type)).length;

    const resolved = all.filter((h) => h.status === 'RESOLVED' || h.status === 'CLOSED').length;
    const inProgress = all.filter((h) => h.status === 'IN_PROGRESS' || h.status === 'ASSIGNED').length;
    const pending = all.filter((h) => h.status === 'REPORTED' || h.status === 'PENDING_VERIFICATION').length;

    // Group by area
    const areaMap: Record<string, number> = {
      Whitefield: 0,
      Koramangala: 0,
      Bellandur: 0,
      Indiranagar: 0,
      'HSR Layout': 0,
      'Central Silk Board': 0,
      Hebbal: 0,
      'Electronic City': 0,
    };

    for (const h of all) {
      for (const area of Object.keys(areaMap)) {
        if (h.address.includes(area)) {
          areaMap[area]++;
          break;
        }
      }
    }

    const byArea = Object.entries(areaMap).map(([area, count]) => ({ area, count }));

    return {
      total,
      critical,
      high,
      moderate,
      low,
      potholes,
      manholes,
      waterlogging,
      drains,
      incidents,
      resolved,
      inProgress,
      pending,
      byArea,
    };
  }
}

// Global singleton instance
const globalForStore = globalThis as unknown as { floodGuardStore: FloodGuardStore };
export const floodGuardStore = globalForStore.floodGuardStore || new FloodGuardStore();
if (process.env.NODE_ENV !== 'production') globalForStore.floodGuardStore = floodGuardStore;

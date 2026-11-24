// FLOODGUARD AI - Type Definitions

export type HazardType =
  | 'POTHOLE'
  | 'LARGE_POTHOLE'
  | 'OPEN_MANHOLE'
  | 'DAMAGED_MANHOLE'
  | 'BROKEN_DRAIN'
  | 'BLOCKED_DRAIN'
  | 'OVERFLOWING_DRAIN'
  | 'WATERLOGGING'
  | 'FLOODED_ROAD'
  | 'ROAD_CRACK'
  | 'ROAD_DAMAGE'
  | 'ROAD_DEPRESSION'
  | 'ACCIDENT_REPORTED'
  | 'ROAD_BLOCKED'
  | 'VEHICLE_STRANDED'
  | 'OTHER';

export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type HazardStatus =
  | 'REPORTED'
  | 'AI_ANALYZED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type UserRole = 'USER' | 'ADMIN' | 'FIELD_WORKER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface HazardDetection {
  id: string;
  hazard_id: string;
  object_type: string;
  confidence: number;
  bounding_box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] (normalized 0-1)
  model_version: string;
  created_at: string;
}

export interface HazardEvidence {
  id: string;
  hazard_id: string;
  file_url: string;
  file_type: 'IMAGE' | 'VIDEO';
  uploaded_by?: string;
  created_at: string;
}

export interface WeatherData {
  id?: string;
  latitude: number;
  longitude: number;
  rainfall: number; // mm
  rain_intensity: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'VERY_HEAVY';
  temperature: number; // °C
  humidity: number; // %
  timestamp: string;
  is_demo?: boolean;
}

export interface RiskScoreBreakdown {
  hazard_score: number; // 0 - 100
  rainfall_score: number;
  waterlogging_score: number;
  history_score: number;
  traffic_score: number;
  report_frequency_score: number;
  final_score: number; // 0 - 100
  risk_level: RiskLevel;
}

export interface RiskWeights {
  hazardSeverity: number; // default 0.30
  rainfall: number; // default 0.20
  waterlogging: number; // default 0.20
  historicalReports: number; // default 0.10
  roadImportance: number; // default 0.10
  reportFrequency: number; // default 0.10
}

export interface MaintenanceTask {
  id: string;
  hazard_id: string;
  assigned_to?: string;
  assigned_worker_name?: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  before_image?: string;
  after_image?: string;
  notes?: string;
  assigned_at?: string;
  completed_at?: string;
  verified_at?: string;
  created_at: string;
}

export interface CommunityConfirmation {
  id: string;
  hazard_id: string;
  user_id?: string;
  confirmation: 'STILL_PRESENT' | 'RESOLVED';
  created_at: string;
}

export interface Hazard {
  id: string;
  type: HazardType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  severity: SeverityLevel;
  risk_score: number;
  risk_level: RiskLevel;
  status: HazardStatus;
  created_by?: string;
  reporter_name?: string;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
  
  // Relations
  detections?: HazardDetection[];
  evidence?: HazardEvidence[];
  weather?: WeatherData;
  risk_breakdown?: RiskScoreBreakdown;
  maintenance?: MaintenanceTask;
  confirmations_count?: {
    still_present: number;
    resolved: number;
  };
  distance_meters?: number;
}

export interface FloodRiskZone {
  id: string;
  name: string;
  area_name: string;
  risk_level: RiskLevel;
  recent_reports_count: number;
  rainfall_mm: number;
  last_updated: string;
  polygon_coordinates: [number, number][]; // [lng, lat]
}

export interface RoadConditionSegment {
  id: string;
  road_name: string;
  condition: 'NORMAL' | 'CAUTION' | 'HAZARD' | 'CRITICAL';
  hazard_count: number;
  pothole_count: number;
  waterlogging_count: number;
  manhole_count: number;
  risk_level: RiskLevel;
  path_coordinates: [number, number][]; // [lng, lat]
}

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  created_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'VERIFICATION' | 'STATUS_CHANGE' | 'MAINTENANCE';
  hazard_id?: string;
  read: boolean;
  created_at: string;
}

export interface RouteHazardAnalysis {
  distance_km: number;
  duration_minutes: number;
  hazards_count: number;
  breakdown: {
    potholes: number;
    waterlogging: number;
    open_manholes: number;
    road_blocks: number;
    accidents: number;
    other: number;
  };
  hazards_along_route: Hazard[];
  route_geometry: [number, number][]; // [lng, lat]
}

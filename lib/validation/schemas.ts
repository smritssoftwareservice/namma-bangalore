// FLOODGUARD AI - Zod Validation Schemas
import { z } from 'zod';

export const HazardTypeEnum = z.enum([
  'POTHOLE',
  'LARGE_POTHOLE',
  'OPEN_MANHOLE',
  'DAMAGED_MANHOLE',
  'BROKEN_DRAIN',
  'BLOCKED_DRAIN',
  'OVERFLOWING_DRAIN',
  'WATERLOGGING',
  'FLOODED_ROAD',
  'ROAD_CRACK',
  'ROAD_DAMAGE',
  'ROAD_DEPRESSION',
  'ACCIDENT_REPORTED',
  'ROAD_BLOCKED',
  'VEHICLE_STRANDED',
  'OTHER',
]);

export const SeverityLevelEnum = z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);
export const RiskLevelEnum = z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);

export const HazardStatusEnum = z.enum([
  'REPORTED',
  'AI_ANALYZED',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
]);

export const reportHazardSchema = z.object({
  type: HazardTypeEnum,
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().max(1000).optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().default(''),
  severity: SeverityLevelEnum.default('MODERATE'),
  file_url: z.string().url().or(z.string().startsWith('data:image/')).optional(),
  file_type: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  ai_confidence: z.number().min(0).max(1).optional(),
  waterlogging_detected: z.boolean().optional().default(false),
});

export const updateHazardSchema = z.object({
  status: HazardStatusEnum.optional(),
  severity: SeverityLevelEnum.optional(),
  risk_score: z.number().min(0).max(100).optional(),
  risk_level: RiskLevelEnum.optional(),
  notes: z.string().optional(),
});

export const createMaintenanceTaskSchema = z.object({
  hazard_id: z.string().uuid(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
});

export const updateMaintenanceTaskSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']),
  after_image: z.string().optional(),
  notes: z.string().optional(),
});

export const communityConfirmationSchema = z.object({
  hazard_id: z.string(),
  confirmation: z.enum(['STILL_PRESENT', 'RESOLVED']),
});

export const adminSettingsSchema = z.object({
  weights: z.object({
    hazardSeverity: z.number().min(0).max(1),
    rainfall: z.number().min(0).max(1),
    waterlogging: z.number().min(0).max(1),
    historicalReports: z.number().min(0).max(1),
    roadImportance: z.number().min(0).max(1),
    reportFrequency: z.number().min(0).max(1),
  }),
  demo_mode: z.boolean(),
  require_admin_verification: z.boolean(),
});

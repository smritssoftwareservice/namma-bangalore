// FLOODGUARD AI - Risk Calculation Engine
import { HazardType, RiskLevel, RiskScoreBreakdown, RiskWeights, SeverityLevel } from '@/lib/types/hazard';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  hazardSeverity: 0.30,
  rainfall: 0.20,
  waterlogging: 0.20,
  historicalReports: 0.10,
  roadImportance: 0.10,
  reportFrequency: 0.10,
};

export interface RiskCalculationInput {
  hazardType: HazardType;
  severity: SeverityLevel;
  rainfall_mm: number;
  waterlogging_detected: boolean;
  historical_reports_count: number;
  is_major_arterial_road?: boolean;
  reports_last_24h?: number;
  customWeights?: Partial<RiskWeights>;
}

/**
 * Maps hazard severity level to base score (0-100)
 */
export function getSeverityBaseScore(severity: SeverityLevel, hazardType: HazardType): number {
  let score = 50;
  switch (severity) {
    case 'CRITICAL': score = 95; break;
    case 'HIGH': score = 75; break;
    case 'MODERATE': score = 50; break;
    case 'LOW': score = 25; break;
  }

  // Type specific multiplier/modifiers
  if (hazardType === 'OPEN_MANHOLE' || hazardType === 'FLOODED_ROAD' || hazardType === 'ACCIDENT_REPORTED') {
    score = Math.min(100, score + 10);
  } else if (hazardType === 'ROAD_CRACK') {
    score = Math.max(15, score - 10);
  }

  return score;
}

/**
 * Maps rainfall in mm to score (0-100)
 * 0mm: 0
 * 1-15mm (Light): 25
 * 16-35mm (Moderate): 55
 * 36-65mm (Heavy): 80
 * >65mm (Very heavy / Torrential): 100
 */
export function getRainfallScore(rainfall_mm: number): number {
  if (rainfall_mm <= 0) return 0;
  if (rainfall_mm <= 15) return Math.min(30, rainfall_mm * 2);
  if (rainfall_mm <= 35) return 30 + ((rainfall_mm - 15) / 20) * 35; // 30 - 65
  if (rainfall_mm <= 65) return 65 + ((rainfall_mm - 35) / 30) * 25; // 65 - 90
  return 100;
}

/**
 * Calculates risk level tag based on 0-100 score:
 * 0 - 30: LOW
 * 31 - 60: MODERATE
 * 61 - 80: HIGH
 * 81 - 100: CRITICAL
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 81) return 'CRITICAL';
  if (score >= 61) return 'HIGH';
  if (score >= 31) return 'MODERATE';
  return 'LOW';
}

/**
 * Core risk calculation function
 */
export function calculateRiskScore(input: RiskCalculationInput): RiskScoreBreakdown {
  const weights: RiskWeights = {
    ...DEFAULT_RISK_WEIGHTS,
    ...(input.customWeights || {}),
  };

  // 1. Hazard severity score (0 - 100)
  const hazard_score = getSeverityBaseScore(input.severity, input.hazardType);

  // 2. Rainfall score (0 - 100)
  const rainfall_score = getRainfallScore(input.rainfall_mm);

  // 3. Waterlogging score (0 - 100)
  const isFloodType = input.hazardType === 'WATERLOGGING' || input.hazardType === 'FLOODED_ROAD';
  const waterlogging_score = input.waterlogging_detected || isFloodType ? (input.severity === 'CRITICAL' ? 100 : 85) : 0;

  // 4. Historical reports score (0 - 100)
  const history_score = Math.min(100, (input.historical_reports_count || 0) * 15);

  // 5. Road importance score (0 - 100)
  const traffic_score = input.is_major_arterial_road ? 85 : 40;

  // 6. Report frequency score (last 24h)
  const report_frequency_score = Math.min(100, (input.reports_last_24h || 1) * 20);

  // Weighted total
  const raw_final =
    hazard_score * weights.hazardSeverity +
    rainfall_score * weights.rainfall +
    waterlogging_score * weights.waterlogging +
    history_score * weights.historicalReports +
    traffic_score * weights.roadImportance +
    report_frequency_score * weights.reportFrequency;

  const final_score = Math.min(100, Math.max(0, Math.round(raw_final)));
  const risk_level = getRiskLevel(final_score);

  return {
    hazard_score,
    rainfall_score,
    waterlogging_score,
    history_score,
    traffic_score,
    report_frequency_score,
    final_score,
    risk_level,
  };
}

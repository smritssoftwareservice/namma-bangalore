'use client';

import React from 'react';
import {
  AlertTriangle,
  CircleDot,
  Droplets,
  Waves,
  Hammer,
  Ban,
  Car,
  AlertOctagon,
  FileQuestion,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { HazardType, RiskLevel, HazardStatus } from '@/lib/types/hazard';

export function getRiskColor(riskLevel: RiskLevel, status?: HazardStatus): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      hex: '#10b981',
    };
  }

  switch (riskLevel) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/40',
        hex: '#ef4444',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        border: 'border-orange-500/40',
        hex: '#f97316',
      };
    case 'MODERATE':
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/40',
        hex: '#eab308',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        hex: '#10b981',
      };
  }
}

export function getHazardIcon(type: HazardType, className = 'w-4 h-4') {
  switch (type) {
    case 'POTHOLE':
    case 'LARGE_POTHOLE':
    case 'ROAD_DAMAGE':
    case 'ROAD_DEPRESSION':
    case 'ROAD_CRACK':
      return <Hammer className={className} />;
    case 'OPEN_MANHOLE':
    case 'DAMAGED_MANHOLE':
      return <CircleDot className={className} />;
    case 'WATERLOGGING':
    case 'BROKEN_DRAIN':
    case 'BLOCKED_DRAIN':
    case 'OVERFLOWING_DRAIN':
      return <Droplets className={className} />;
    case 'FLOODED_ROAD':
      return <Waves className={className} />;
    case 'ACCIDENT_REPORTED':
      return <AlertTriangle className={className} />;
    case 'ROAD_BLOCKED':
      return <Ban className={className} />;
    case 'VEHICLE_STRANDED':
      return <Car className={className} />;
    case 'OTHER':
    default:
      return <AlertOctagon className={className} />;
  }
}

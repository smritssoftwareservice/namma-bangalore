// FLOODGUARD AI - Reports Route
import { NextRequest } from 'next/server';
import { POST as createHazardPost } from '@/app/api/hazards/route';

export async function POST(request: NextRequest) {
  // Direct delegation to hazard creation pipeline
  return createHazardPost(request);
}

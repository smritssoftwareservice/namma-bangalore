// FLOODGUARD AI - Analytics Route
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';

export async function GET() {
  try {
    const analytics = await floodGuardStore.getAnalytics();
    return successResponse(analytics);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

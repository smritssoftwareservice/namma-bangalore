// FLOODGUARD AI - User Notifications Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-01';

    const notifs = await floodGuardStore.getNotifications(userId);
    return successResponse(notifs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return errorResponse('Missing notification id', 'BAD_REQUEST', 400);
    }

    const ok = await floodGuardStore.markNotificationRead(id);
    return successResponse({ read: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update notification';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

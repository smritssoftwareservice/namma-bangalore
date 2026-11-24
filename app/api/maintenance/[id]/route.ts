// FLOODGUARD AI - Single Maintenance Task Update
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';
import { updateMaintenanceTaskSchema } from '@/lib/validation/schemas';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateMaintenanceTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, parsed.error.flatten());
    }

    const { status, after_image, notes } = parsed.data;

    const updates: Record<string, unknown> = {
      status,
      notes,
    };

    if (after_image) {
      updates.after_image = after_image;
    }

    if (status === 'COMPLETED') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'VERIFIED') {
      updates.verified_at = new Date().toISOString();
    }

    const task = await floodGuardStore.updateMaintenanceTask(id, updates);
    if (!task) {
      return errorResponse('Maintenance task not found', 'NOT_FOUND', 404);
    }

    return successResponse(task);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update maintenance task';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

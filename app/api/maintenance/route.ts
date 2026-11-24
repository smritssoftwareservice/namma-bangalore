// FLOODGUARD AI - Maintenance Tasks Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';
import { createMaintenanceTaskSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const tasks = await floodGuardStore.getMaintenanceTasks();
    return successResponse(tasks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMaintenanceTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, parsed.error.flatten());
    }

    const { hazard_id, assigned_to, notes } = parsed.data;

    const task = await floodGuardStore.updateMaintenanceTask(hazard_id, {
      status: 'ASSIGNED',
      assigned_to: assigned_to || 'worker-01',
      assigned_worker_name: 'Municipal Road Crew #4',
      notes,
      assigned_at: new Date().toISOString(),
    });

    if (!task) {
      return errorResponse('Hazard not found to assign task', 'NOT_FOUND', 404);
    }

    return successResponse(task, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create task';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

// FLOODGUARD AI - Single Hazard Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';
import { updateHazardSchema } from '@/lib/validation/schemas';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const hazard = await floodGuardStore.getHazardById(id);

    if (!hazard) {
      return errorResponse('Hazard not found', 'NOT_FOUND', 404);
    }

    return successResponse(hazard);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching hazard';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateHazardSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, parsed.error.flatten());
    }

    const updated = await floodGuardStore.updateHazard(id, parsed.data);
    if (!updated) {
      return errorResponse('Hazard not found', 'NOT_FOUND', 404);
    }

    return successResponse(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating hazard';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

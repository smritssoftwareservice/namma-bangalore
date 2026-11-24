// FLOODGUARD AI - Community Verification Route
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { floodGuardStore } from '@/lib/db/store';
import { communityConfirmationSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = communityConfirmationSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, parsed.error.flatten());
    }

    const { hazard_id, confirmation } = parsed.data;
    const updated = await floodGuardStore.addConfirmation(hazard_id, confirmation);

    if (!updated) {
      return errorResponse('Hazard not found', 'NOT_FOUND', 404);
    }

    return successResponse({
      hazard_id,
      confirmation,
      confirmations_count: updated.confirmations_count,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Community confirmation failed';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

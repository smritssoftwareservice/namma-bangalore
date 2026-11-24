// FLOODGUARD AI - Server-side AI Image Vision Analysis
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { getAIProvider } from '@/lib/ai/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageUrl, fileName, fileSize } = body;

    if (!imageBase64 && !imageUrl && !fileName) {
      return errorResponse('No image data, URL or file metadata provided', 'BAD_REQUEST', 400);
    }

    const provider = getAIProvider();
    const result = await provider.analyzeImage({
      base64: imageBase64,
      url: imageUrl,
      fileName,
      fileSize,
    });

    return successResponse(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI Vision analysis failed';
    return errorResponse(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

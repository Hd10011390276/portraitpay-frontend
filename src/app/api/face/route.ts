
/**
 * GET /api/face — Face API status check
 * POST /api/face — Register a face embedding for a user
 *
 * STUB: This is a placeholder route for future face recognition implementation.
 * Actual face embedding extraction and storage will be implemented later.
 */

import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";


export const runtime = "nodejs";

/**
 * GET /api/face
 *
 * Returns the current status of the face recognition service.
 * This is a stub endpoint - actual face recognition is not yet implemented.
 */
export async function GET(request: NextRequest) {
  try {
    // Stub: Return service status
    return NextResponse.json({
      success: true,
      data: {
        status: "available",
        provider: "stub", // Will be "face-api" or "aliyun" when implemented
        message: "Face recognition service is available (stub mode)",
        version: "1.0.0",
      },
    });
  } catch (error) {
    console.error("[GET /api/face]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/face
 *
 * Body:
 *   { userId: string }          — User ID to associate the face with
 *   { descriptor: number[] }   — Face embedding vector (128 or 512 dimensions)
 *   { imageData?: string }     — Optional base64 image for server-side extraction
 *
 * Response:
 *   { success: true, data: { faceId: string, userId: string, registeredAt: string } }
 *
 * STUB: This endpoint accepts and stores mock data. Actual face embedding
 * extraction and verification will be implemented with face-api.js or Aliyun.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, descriptor, imageData } = body as {
      userId?: string;
      descriptor?: number[];
      imageData?: string;
    };

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!descriptor && !imageData) {
      return NextResponse.json(
        { success: false, error: "Either 'descriptor' (number[]) or 'imageData' (base64) is required" },
        { status: 400 }
      );
    }

    // STUB: In production, this would:
    // 1. Extract face embedding from imageData if descriptor not provided
    // 2. Validate the embedding vector dimensions
    // 3. Store the embedding in the database associated with userId
    // 4. Return the registered face record

    const stubFaceId = `face_${crypto.randomUUID()}`;
    const registeredAt = new Date().toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          faceId: stubFaceId,
          userId,
          registeredAt,
          message: "Face registered successfully (stub mode)",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/face]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

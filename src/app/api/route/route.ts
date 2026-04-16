/**
 * GET  /api/route - Health check for portrait usage request API
 * POST /api/route - Submit a portrait usage authorization request
 *
 * Body: { portraitId, requesterEmail, intendedUse, usageDuration, royalties }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const UsageRequestSchema = z.object({
  portraitId: z.string().min(1, "Portrait ID is required"),
  requesterEmail: z.string().email("Valid email is required"),
  requesterName: z.string().min(1, "Requester name is required").optional(),
  intendedUse: z.string().min(1, "Intended use description is required"),
  usageDuration: z.string().min(1, "Usage duration is required").optional(),
  royalties: z.number().positive("Royalties must be positive").optional(),
  message: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Portrait Usage Request API is operational",
    endpoints: {
      GET: "Health check",
      POST: "Submit portrait usage authorization request",
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = UsageRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { portraitId, requesterEmail, requesterName, intendedUse, usageDuration, royalties, message } = parsed.data;

    // Verify portrait exists
    const portrait = await prisma.portrait.findUnique({
      where: { id: portraitId },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true },
        },
      },
    });

    if (!portrait) {
      return NextResponse.json(
        { success: false, error: "Portrait not found" },
        { status: 404 }
      );
    }

    // Create usage request as ContactSubmission
    const usageRequest = await prisma.contactSubmission.create({
      data: {
        type: "ENTERPRISE",
        name: requesterName ?? requesterEmail,
        email: requesterEmail,
        subject: `Portrait Usage Request - ${portrait.title}`,
        message: `Portrait ID: ${portraitId}\nIntended Use: ${intendedUse}\nUsage Duration: ${usageDuration ?? "Not specified"}\nRoyalties: ${royalties ?? "To be discussed"}\n\nAdditional Message:\n${message ?? "N/A"}`,
        intendedUse,
        enterpriseName: portrait.owner.displayName ?? "Unknown",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usage request submitted successfully",
        data: {
          requestId: usageRequest.id,
          portraitId,
          submittedAt: usageRequest.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/route]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

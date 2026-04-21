/**
 * /api/v1/admin/api-keys/[id] - AI Platform API Key Operations
 *
 * GET    - Get a single AI platform API key (admin only)
 * DELETE - Revoke an AI platform API key (admin only)
 * PATCH  - Update an AI platform API key (suspend/reactivate) (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { revokeAiPlatformApiKey, suspendAiPlatformApiKey, reactivateAiPlatformApiKey } from "@/lib/ai-platform-api-keys";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/v1/admin/api-keys/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const apiKey = await prisma.aiPlatformApiKey.findUnique({ where: { id } });
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        platformName: apiKey.platformName,
        keyPrefix: apiKey.keyPrefix,
        status: apiKey.status,
        scopes: apiKey.scopes,
        rateLimitPerMinute: apiKey.rateLimitPerMinute,
        lastUsedAt: apiKey.lastUsedAt,
        requestCount: apiKey.requestCount.toString(),
        expiresAt: apiKey.expiresAt,
        note: apiKey.note,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
        displayKey: `${apiKey.keyPrefix}...${apiKey.keyHash.slice(-6)}`,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/admin/api-keys/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/admin/api-keys/[id] - Suspend or reactivate
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === "suspend") {
      const success = await suspendAiPlatformApiKey(id);
      if (!success) {
        return NextResponse.json({ success: false, error: "API key not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "API key suspended" });
    }

    if (action === "reactivate") {
      const success = await reactivateAiPlatformApiKey(id);
      if (!success) {
        return NextResponse.json({ success: false, error: "API key not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "API key reactivated" });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Use 'suspend' or 'reactivate'" }, { status: 400 });
  } catch (error) {
    console.error("[PATCH /api/v1/admin/api-keys/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/api-keys/[id] - Revoke
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const success = await revokeAiPlatformApiKey(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "API key revoked successfully" });
  } catch (error) {
    console.error("[DELETE /api/v1/admin/api-keys/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

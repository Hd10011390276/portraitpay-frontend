/**
 * /api/portraits/[id]/licensing - AI Licensing Settings for a Portrait
 *
 * GET  - Get AI licensing settings for a portrait
 * PATCH - Update AI licensing settings for a portrait
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const UpdateLicensingSchema = z.object({
  allowAiLicensing: z.boolean().nullable().optional(),
  aiLicenseFee: z.string().nullable().optional(), // decimal as string
  aiLicenseScopes: z.array(z.string()).optional(),
  aiProhibitedScopes: z.array(z.string()).optional(),
  aiTerritorialScope: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/portraits/[id]/licensing
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let portrait: Record<string, unknown> | null = null;
    try {
      portrait = await prisma.portrait.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          ownerId: true,
          allowAiLicensing: true,
          aiLicenseFee: true,
          aiLicenseScopes: true,
          aiProhibitedScopes: true,
          aiTerritorialScope: true,
        },
      });
    } catch {
      // AI fields may not exist in DB yet (unmigrated) — treat as nulls
      portrait = await prisma.portrait.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, ownerId: true },
      });
      if (portrait) {
        portrait.allowAiLicensing = null;
        portrait.aiLicenseFee = null;
        portrait.aiLicenseScopes = [];
        portrait.aiProhibitedScopes = [];
        portrait.aiTerritorialScope = "global";
      }
    }

    if (!portrait) {
      return NextResponse.json({ success: false, error: "Portrait not found" }, { status: 404 });
    }

    // Get user's default settings for reference
    const userSettings = await prisma.portraitSettings.findUnique({
      where: { userId: portrait.ownerId as string },
    });

    return NextResponse.json({
      success: true,
      data: {
        portraitId: portrait.id,
        allowAiLicensing: portrait.allowAiLicensing as boolean | null,
        aiLicenseFee: portrait.aiLicenseFee ? String(portrait.aiLicenseFee) : null,
        aiLicenseScopes: (portrait.aiLicenseScopes as string[]) ?? [],
        aiProhibitedScopes: (portrait.aiProhibitedScopes as string[]) ?? [],
        aiTerritorialScope: (portrait.aiTerritorialScope as string) ?? "global",
        // Include defaults for reference
        defaults: {
          allowLicensing: userSettings?.allowLicensing ?? true,
          defaultLicenseFee: userSettings?.defaultLicenseFee?.toString() ?? "0",
          allowedScopes: userSettings?.allowedScopes ?? [],
          prohibitedContent: userSettings?.prohibitedContent ?? [],
          defaultTerritorialScope: userSettings?.defaultTerritorialScope ?? "global",
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/portraits/[id]/licensing]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/portraits/[id]/licensing
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = UpdateLicensingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check ownership
    const portrait = await prisma.portrait.findUnique({
      where: { id, deletedAt: null },
      select: { ownerId: true },
    });

    if (!portrait) {
      return NextResponse.json({ success: false, error: "Portrait not found" }, { status: 404 });
    }

    if (portrait.ownerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const data: Record<string, unknown> = {};

    if (parsed.data.allowAiLicensing !== undefined) {
      data.allowAiLicensing = parsed.data.allowAiLicensing;
    }

    if (parsed.data.aiLicenseFee !== undefined) {
      if (parsed.data.aiLicenseFee === null) {
        data.aiLicenseFee = null;
      } else {
        const fee = parseFloat(parsed.data.aiLicenseFee);
        if (isNaN(fee) || fee < 0) {
          return NextResponse.json({ success: false, error: "Invalid license fee" }, { status: 400 });
        }
        data.aiLicenseFee = fee;
      }
    }

    if (parsed.data.aiLicenseScopes !== undefined) {
      const validScopes = ["FILM", "ANIMATION", "ADVERTISING", "GAMING", "PRINT", "MERCHANDISE", "SOCIAL_MEDIA", "EDUCATION", "NEWS"];
      const invalid = parsed.data.aiLicenseScopes.filter((s) => !validScopes.includes(s));
      if (invalid.length > 0) {
        return NextResponse.json({ success: false, error: `Invalid scopes: ${invalid.join(", ")}` }, { status: 400 });
      }
      data.aiLicenseScopes = parsed.data.aiLicenseScopes;
    }

    if (parsed.data.aiProhibitedScopes !== undefined) {
      const validScopes = ["ADULT", "POLITICAL", "VIOLENCE", "HATE", "FRAUD", "WEAPONS", "ILLEGAL"];
      const invalid = parsed.data.aiProhibitedScopes.filter((s) => !validScopes.includes(s));
      if (invalid.length > 0) {
        return NextResponse.json({ success: false, error: `Invalid prohibited scopes: ${invalid.join(", ")}` }, { status: 400 });
      }
      data.aiProhibitedScopes = parsed.data.aiProhibitedScopes;
    }

    if (parsed.data.aiTerritorialScope !== undefined) {
      const validScopes = ["global", "china", "asia", "europe", "americas"];
      if (!validScopes.includes(parsed.data.aiTerritorialScope)) {
        return NextResponse.json({ success: false, error: `Invalid territorial scope` }, { status: 400 });
      }
      data.aiTerritorialScope = parsed.data.aiTerritorialScope;
    }

    const updated = await prisma.portrait.update({
      where: { id },
      data,
      select: {
        id: true,
        allowAiLicensing: true,
        aiLicenseFee: true,
        aiLicenseScopes: true,
        aiProhibitedScopes: true,
        aiTerritorialScope: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/portraits/[id]/licensing]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

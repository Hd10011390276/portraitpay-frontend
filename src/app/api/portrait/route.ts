/**
 * GET /api/portrait - List current user's portraits
 * POST /api/portrait - Create/register a new portrait
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";

const CreatePortraitSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1).max(50).default("general"),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

    const where: Record<string, unknown> = {
      ownerId: session.user.id,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (category) where.category = category;

    const [portraits, total] = await Promise.all([
      prisma.portrait.findMany({
        where,
        include: {
          owner: {
            select: { id: true, displayName: true, walletAddress: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.portrait.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: portraits,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/portrait]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = CreatePortraitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, category, tags, isPublic } = parsed.data;

    const portrait = await prisma.portrait.create({
      data: {
        title,
        description,
        category,
        tags,
        isPublic,
        ownerId: session.user.id,
        status: "DRAFT",
        faceEmbedding: [],
      },
    });

    return NextResponse.json(
      { success: true, data: portrait },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/portrait]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

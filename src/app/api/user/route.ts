/**
 * GET /api/user     — Get current user profile
 * PATCH /api/user   — Update current user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";


// Schema for updating user profile
const UpdateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
});

// Fields to exclude from response
const SENSITIVE_FIELDS = ["passwordHash", "otpCode", "otpExpires"];

// Basic user info to return (excludes sensitive fields)
const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  phone: true,
  role: true,
  kycStatus: true,
  displayName: true,
  bio: true,
  walletAddress: true,
  stripeCustomerId: true,
  name: true,
  image: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: USER_PUBLIC_SELECT,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("[GET /api/user]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // If phone is being updated, check for uniqueness
    if (parsed.data.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: {
          phone: parsed.data.phone,
          NOT: { id: session.user.id },
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: USER_PUBLIC_SELECT,
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("[PATCH /api/user]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

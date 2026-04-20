/**
 * POST /api/auth/verify-email — Verify email with token
 * Body: { token }
 *
 * Validates the token from the verification email and sets emailVerified on the user.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = VerifyEmailSchema.parse(body);
    const { token } = validatedData;

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: "Invalid verification token." },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { success: false, error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // If already verified, delete token and return success
    if (user.emailVerified) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { success: true, message: "Email already verified." },
        { status: 200 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

    console.log(`[VERIFY_EMAIL] Email verified for user: ${user.id}`);

    return NextResponse.json(
      { success: true, message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues?.[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }
    console.error("[VERIFY_EMAIL] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

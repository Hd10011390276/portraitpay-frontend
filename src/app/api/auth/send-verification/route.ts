/**
 * POST /api/auth/send-verification — Resend email verification link
 * Body: { email }
 *
 * Generates a new verification token and sends verification email.
 * Non-blocking — does not reveal whether email exists.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildVerificationEmailHtml } from "@/lib/email/templates/verification";
export const dynamic = "force-dynamic";

const SendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Verification token expiry: 24 hours
const VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = SendVerificationSchema.parse(body);
    const { email } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[SEND_VERIFICATION] No user found for: ${email}`);
      return NextResponse.json(
        { success: true, message: "Verification email sent if account exists." },
        { status: 200 }
      );
    }

    // If already verified, no need to send again
    if (user.emailVerified) {
      return NextResponse.json(
        { success: true, message: "Email already verified." },
        { status: 200 }
      );
    }

    // Generate verification token
    const verifyToken = randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS);

    // Store token in VerificationToken model (used by NextAuth but also for our own verification)
    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: verifyToken } },
      create: {
        identifier: email,
        token: verifyToken,
        expires: verifyExpires,
      },
      update: {
        token: verifyToken,
        expires: verifyExpires,
      },
    });

    // Build verify URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;

    // Build email
    const { subject, html, text } = buildVerificationEmailHtml({
      name: user.name ?? email.split("@")[0],
      email,
      verifyUrl,
    });

    try {
      await sendEmail({ to: email, subject, html, text });
      console.log(`[SEND_VERIFICATION] Verification email sent to: ${email}`);
    } catch (emailError) {
      console.error("[SEND_VERIFICATION] Failed to send email:", emailError);
      // Still return success to prevent enumeration
    }

    return NextResponse.json(
      { success: true, message: "Verification email sent if account exists." },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues?.[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }
    console.error("[SEND_VERIFICATION] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/auth/schemas";
import { signTokenPair } from "@/lib/auth/jwt";
import { setTokenCookies } from "@/lib/auth/session";
import { sendWelcomeEmail, sendEmail } from "@/lib/email";
import { buildVerificationEmailHtml } from "@/lib/email/templates/verification";
export const dynamic = "force-dynamic";

type UserRole = string;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "表单验证失败",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, name, role, phone, allowLicensing, allowedScopes, prohibitedContent } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "该邮箱已注册" },
        { status: 409 }
      );
    }

    // If phone provided, check uniqueness
    if (phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: "该手机号已被使用" },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        name,
        passwordHash: hashedPassword,
        role: role as UserRole,
        walletAddress: null, // User binds their own wallet on-demand, not at registration
        portraitSettings: {
          create: {
            allowLicensing: allowLicensing ?? true,
            allowedScopes: allowedScopes ?? [],
            prohibitedContent: prohibitedContent ?? [],
          },
        },
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Send welcome email (non-blocking — don't fail registration if email throws)
    try {
      console.log("[REGISTER] Attempting to send welcome email to:", user.email);
      await sendWelcomeEmail({ email: user.email, name: user.name ?? user.email.split("@")[0], role: user.role });
      console.log("[REGISTER] Welcome email sent successfully for:", user.email);
    } catch (emailError) {
      console.error("[REGISTER] Welcome email failed:", emailError);
    }

    // Send email verification email (non-blocking)
    try {
      const verifyToken = randomBytes(32).toString("hex");
      const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.verificationToken.upsert({
        where: { identifier_token: { identifier: user.email, token: verifyToken } },
        create: { identifier: user.email, token: verifyToken, expires: verifyExpires },
        update: { token: verifyToken, expires: verifyExpires },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://portraitpayai.com";
      const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;

      const { subject, html, text } = buildVerificationEmailHtml({
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        verifyUrl,
      });

      await sendEmail({ to: user.email, subject, html, text });
      console.log("[REGISTER] Verification email sent to:", user.email);
    } catch (emailError) {
      console.error("[REGISTER] Verification email failed:", emailError);
    }

    const tokens = signTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieOptions =
      "httpOnly; sameSite=lax; path=/; max-age=86400; secure";

    const response = NextResponse.json(
      {
        success: true,
        message: "注册成功",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
      { status: 201 }
    );

    response.cookies.set(
      setTokenCookies(tokens.accessToken, tokens.refreshToken).accessTokenCookie,
      tokens.accessToken,
      { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 15, secure: process.env.NODE_ENV === "production" }
    );
    response.cookies.set(
      setTokenCookies(tokens.accessToken, tokens.refreshToken).refreshTokenCookie,
      tokens.refreshToken,
      { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7, secure: process.env.NODE_ENV === "production" }
    );

    return response;
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    const message = error instanceof Error ? error.message : String(error);
    console.error("[REGISTER_ERROR] Details:", message);
    return NextResponse.json(
      { success: false, message: "服务器错误，请稍后重试", debug: message },
      { status: 500 }
    );
  }
}

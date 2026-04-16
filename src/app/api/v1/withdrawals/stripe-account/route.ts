export const dynamic = "force-dynamic";

/**
 * GET  /api/v1/withdrawals/stripe-account - Get user's Stripe account status
 * POST /api/v1/withdrawals/stripe-account - Create/refresh Stripe account onboarding link
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { stripeCustomerId: true, email: true, displayName: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // If user doesn't have Stripe account yet, return empty status
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: {
          hasStripeAccount: false,
          stripeAccountId: null,
          accountStatus: null,
          payoutsEnabled: false,
        },
      });
    }

    // Retrieve Stripe account details to check status
    let accountStatus: string | null = null;
    let payoutsEnabled = false;
    let bankAccountConnected = false;

    try {
      const stripeClient = getStripe();
      const account = await stripeClient.accounts.retrieve(user.stripeCustomerId);
      accountStatus = account.details_submitted ? "verified" : "pending_verification";
      payoutsEnabled = account.payouts_enabled ?? false;
      bankAccountConnected = (account.external_accounts?.data?.length ?? 0) > 0;
    } catch (err) {
      // Account might not exist on Stripe anymore
      accountStatus = "not_found";
    }

    return NextResponse.json({
      success: true,
      data: {
        hasStripeAccount: true,
        stripeAccountId: user.stripeCustomerId,
        accountStatus,
        payoutsEnabled,
        bankAccountConnected,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/withdrawals/stripe-account]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { stripeCustomerId: true, email: true, displayName: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json(
        { success: false, error: "用户邮箱未设置，请先完善个人信息" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { returnUrl } = body as { returnUrl?: string };
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const finalReturnUrl = returnUrl ?? `${baseUrl}/withdraw`;

    let stripeAccountId = user.stripeCustomerId;

    // Create a new Stripe Express account if user doesn't have one
    if (!stripeAccountId) {
      const stripeClient = getStripe();
      const account = await stripeClient.accounts.create({
        type: "express",
        email: user.email,
        metadata: { userId: session.userId },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: user.displayName ?? user.email,
        },
      });

      stripeAccountId = account.id;

      // Save the Stripe account ID to user
      await prisma.user.update({
        where: { id: session.userId },
        data: { stripeCustomerId: stripeAccountId },
      });
    }

    // Create account link for onboarding/KYC
    const stripeClient = getStripe();
    const accountLink = await stripeClient.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${finalReturnUrl}?stripe_refresh=true`,
      return_url: finalReturnUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      data: {
        stripeAccountId,
        onboardingUrl: accountLink.url,
        expiresAt: new Date(accountLink.expires_at * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("[POST /api/v1/withdrawals/stripe-account]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

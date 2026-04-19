
/**
 * GET /api/v1/kyc/status
 * 查询当前用户 KYC 状态（本地处理版）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        kycStatus: true,
        kycLevel: true,
        kycVerifiedAt: true,
        kycExpiredAt: true,
        kycProviderRef: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 检查是否过期
    let status = user.kycStatus;
    if (status === "APPROVED" && user.kycExpiredAt && new Date(user.kycExpiredAt) < new Date()) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { kycStatus: "EXPIRED" },
      });
      status = "EXPIRED";
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        level: user.kycLevel,
        verifiedAt: user.kycVerifiedAt,
        expiredAt: user.kycExpiredAt,
        provider: user.kycProviderRef?.startsWith("local_") ? "local" : user.kycProviderRef,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get KYC status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

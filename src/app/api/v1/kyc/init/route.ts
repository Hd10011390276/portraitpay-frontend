
/**
 * POST /api/v1/kyc/init
 *
 * 本地 KYC 初始化：
 * - 检查用户当前 KYC 状态
 * - 返回前端需要做什么（上传/比对/完成）
 *
 * 不再跳转到任何第三方云平台
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const level = body.level ?? 2;

    if (![1, 2, 3].includes(level)) {
      return NextResponse.json(
        { success: false, error: "Invalid KYC level. Must be 1, 2, or 3." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { kycStatus: true, kycLevel: true, kycExpiredAt: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 已认证且未过期
    const isExpired = user.kycExpiredAt ? new Date(user.kycExpiredAt) < new Date() : false;
    if (user.kycStatus === "APPROVED" && !isExpired) {
      return NextResponse.json({
        success: true,
        data: {
          status: "APPROVED",
          level: user.kycLevel,
          expiredAt: user.kycExpiredAt,
          nextAction: null,
        },
      });
    }

    // 可以开始认证
    return NextResponse.json({
      success: true,
      data: {
        status: user.kycStatus,
        level: user.kycLevel ?? level,
        expiredAt: user.kycExpiredAt,
        nextAction: "upload", // 前端：引导用户上传照片做本地比对
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "KYC init failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

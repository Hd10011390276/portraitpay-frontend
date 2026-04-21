/**
 * GET /api/v1/admin/celebrity-applications
 * 获取所有艺人申请列表（管理员）
 *
 * Query: ?page=1&limit=20&status=PENDING|REVIEWING|APPROVED|REJECTED|all
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    if (user?.role !== "ADMIN" && user?.role !== "VERIFIER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
    const statusFilter = searchParams.get("status") ?? "all";
    const skip = (page - 1) * limit;

    const where = statusFilter !== "all" ? { status: statusFilter } : {};

    const [applications, total] = await Promise.all([
      prisma.celebrityIntake.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.celebrityIntake.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("[/api/v1/admin/celebrity-applications GET]", err);
    return NextResponse.json({ success: false, error: "获取失败" }, { status: 500 });
  }
}

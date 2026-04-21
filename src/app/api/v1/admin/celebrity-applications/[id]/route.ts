/**
 * PATCH /api/v1/admin/celebrity-applications/[id]
 * 管理员审核艺人申请
 *
 * Body: { decision: "REVIEWING" | "APPROVED" | "REJECTED", reason?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";



export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const body = await req.json();
    const { decision, reason } = body;

    if (!decision || !["REVIEWING", "APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "decision (REVIEWING | APPROVED | REJECTED) is required" },
        { status: 400 }
      );
    }

    const intake = await prisma.celebrityIntake.findUnique({ where: { id } });
    if (!intake) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    await prisma.celebrityIntake.update({
      where: { id },
      data: {
        status: decision,
        reviewerId: session.userId,
        reviewedAt: new Date(),
        rejectionReason: decision === "REJECTED" ? (reason ?? null) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: `Application ${decision.toLowerCase()}` },
    });
  } catch (err) {
    console.error("[/api/v1/admin/celebrity-applications/[id] PATCH]", err);
    return NextResponse.json({ success: false, error: "审核失败" }, { status: 500 });
  }
}

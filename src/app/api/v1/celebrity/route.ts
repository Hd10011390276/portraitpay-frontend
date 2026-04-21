/**
 * POST   /api/v1/celebrity           — 提交艺人申请
 * GET    /api/v1/celebrity           — 查询申请状态（当前用户）
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";

const CelebrityIntakeSchema = z.object({
  name: z.string().min(1, "姓名为必填项").max(100),
  email: z.string().email("邮箱格式不正确"),
  contactPhone: z.string().max(30).optional(),
  stageName: z.string().min(1, "艺名为必填项").max(200),
  category: z.string().min(1, "请选择艺人类型").max(50),
  socialMedia: z.string().max(1000).optional(),
  agency: z.string().max(200).optional(),
  message: z.string().max(5000).optional(),
});

// ─── POST — 提交艺人申请 ─────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = CelebrityIntakeSchema.parse(body);

    const existing = await prisma.celebrityIntake.findFirst({
      where: {
        email: data.email,
        status: { in: ["PENDING", "REVIEWING"] },
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该邮箱已有待审核的申请，请等待审核结果" },
        { status: 409 }
      );
    }

    const intake = await prisma.celebrityIntake.create({
      data: {
        name: data.name,
        email: data.email,
        contactPhone: data.contactPhone ?? null,
        stageName: data.stageName,
        category: data.category,
        socialMedia: data.socialMedia ?? null,
        agency: data.agency ?? null,
        message: data.message ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: intake.id,
        message: "申请已提交，我们会在 3-5 个工作日内完成审核",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues?.[0]?.message ?? "数据格式不正确";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }
    console.error("[/api/v1/celebrity POST]", err);
    return NextResponse.json({ success: false, error: "服务器内部错误" }, { status: 500 });
  }
}

// ─── GET — 查询当前用户的申请状态 ──────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const intake = await prisma.celebrityIntake.findFirst({
      where: { email: session.email ?? "" },
      orderBy: { createdAt: "desc" },
    });

    if (!intake) {
      return NextResponse.json({ success: false, error: "未找到申请记录" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: intake });
  } catch (err) {
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 });
  }
}

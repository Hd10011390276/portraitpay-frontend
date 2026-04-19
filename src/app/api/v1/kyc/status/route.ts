
/**
 * GET /api/v1/kyc/status
 * 查询当前用户 KYC 状态
 */
import { NextRequest, NextResponse } from "next/server";
import { kycService } from "@/lib/kyc/service";
import { getSession, getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";


export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = await kycService.getStatus(session.userId);

    return NextResponse.json({ success: true, data: status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get KYC status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionFromRequest } from "@/lib/auth/session";
export const dynamic = "force-dynamic";


export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "未登录" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { user: session },
  });
}

/**
 * Request-level auth context — stores the current request's token
 * so that getSession() (used everywhere) can pick it up without
 * each call site needing to change.
 *
 * Usage in API routes:
 *   import { getSession } from "@/lib/auth/session";
 *   const session = await getSession(request); // passes request for Bearer token
 */

import { verifyToken, type JwtPayload } from "./jwt";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "./session";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Module-level store (per-request in serverless — safe because each
// Lambda invocation runs in a single-threaded context)
let _requestToken: string | null = null;

export function setRequestToken(req: Request): void {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    _requestToken = authHeader.slice(7);
    return;
  }
  const cookieHeader = req.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:pp_access_token|accessToken)=([^;]+)/);
  _requestToken = match ? match[1] : null;
}

export function clearRequestToken(): void {
  _requestToken = null;
}

/**
 * Get session from a NextRequest — supports Bearer token + cookie.
 * Call this from API routes (pass the NextRequest).
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  // Priority 1: Authorization header Bearer token
  const authHeader = request.headers.get("Authorization");
  let token: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  // Priority 2: cookies
  if (!token) {
    token =
      request.cookies.get("pp_access_token")?.value ||
      request.cookies.get("accessToken")?.value ||
      null;
  }

  if (!token) return null;

  const payload: JwtPayload | null = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, image: true },
  });

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  };
}

/**
 * Default getSession — no request param, reads from cookies only.
 * For API routes with Bearer tokens, use getSessionFromRequest(request) instead.
 */
export async function getSessionFallback(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("pp_access_token")?.value ||
    cookieStore.get("accessToken")?.value ||
    null;

  if (!token) return null;

  const payload: JwtPayload | null = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, image: true },
  });

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  };
}

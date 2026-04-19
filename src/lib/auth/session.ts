import type { NextRequest } from "next/server";
import { getSessionFromRequest as _getSessionFromRequest, getSessionFallback } from "./request-context";
import type { SessionUser } from "./request-context";

const ACCESS_TOKEN_COOKIE = "pp_access_token";
const REFRESH_TOKEN_COOKIE = "pp_refresh_token";

export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

/**
 * Default getSession() — cookie-only fallback (for page components/server components).
 * For API routes that need Bearer token support, import getSessionFromRequest instead.
 */
export async function getSession(): Promise<SessionUser | null> {
  return getSessionFallback();
}

/**
 * Get session from a NextRequest — supports both Authorization Bearer token
 * and cookie-based auth. Use this in API route handlers.
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  return _getSessionFromRequest(request);
}

export function setTokenCookies(
  accessToken: string,
  refreshToken: string
): {
  accessToken: string;
  refreshToken: string;
  accessTokenCookie: string;
  refreshTokenCookie: string;
} {
  return {
    accessToken,
    refreshToken,
    accessTokenCookie: ACCESS_TOKEN_COOKIE,
    refreshTokenCookie: REFRESH_TOKEN_COOKIE,
  };
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Session protection proxy (Next.js 16+).
 * Performs optimistic redirect for unauthenticated users.
 * Always validate session server-side for protected actions.
 */
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/w/:path*",
    "/admin",
    "/profile",
    "/billing",
    "/bots",
    "/channels",
    "/ai-models",
    "/prompts",
    "/jira",
    "/logs",
  ],
};

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "ash_session";

/**
 * A quick first check before protected pages render: no session cookie means not signed in,
 * so go straight to /login instead of flashing the page.
 *
 * This only checks that the cookie exists. Whether the session is still valid, and whether
 * the role may open /admin, is checked by <RequireAuth> (via /auth/me) and by the API itself.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};

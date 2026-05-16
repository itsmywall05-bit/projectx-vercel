import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Only protect the main app routes, not the login screen, API, or static assets
  const path = req.nextUrl.pathname;
  if (
    path.startsWith("/login") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if they have the authentication cookie
  const authCookie = req.cookies.get("projectx-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    // If not logged in, redirect to login page
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
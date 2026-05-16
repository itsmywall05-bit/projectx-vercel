import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const authCookie = req.cookies.get("projectx-auth");
  const isAuthenticated = authCookie && authCookie.value === "authenticated";

  // If trying to access login page while already authenticated, redirect to app
  if (path.startsWith("/login")) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/overview", req.url));
    }
    return NextResponse.next();
  }

  // Allow API and static assets
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
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
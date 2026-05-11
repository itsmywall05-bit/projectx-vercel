import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    const auth = req.cookies.get("projectx-auth");
    const isLoginPage = req.nextUrl.pathname === "/login";
    const isApiAuth = req.nextUrl.pathname === "/api/auth";

    // Allow login page and auth API without auth
    if (isLoginPage || isApiAuth) {
        // If already authenticated and on login page, redirect to trade-log
        if (auth && isLoginPage) {
            return NextResponse.redirect(new URL("/trade-log", req.url));
        }
        return NextResponse.next();
    }

    // Protect all other routes
    if (!auth) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

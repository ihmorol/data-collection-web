import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_API_ROUTES = ["/api/auth/"];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin/"];
const USER_API_ROUTES = ["/api/responses"];

function getSessionFromRequest(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = getSessionFromRequest(request);

    // Auth API routes — always open
    if (AUTH_API_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.next();
    }

    // Static and asset routes — pass through
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/memes") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // Public routes (login, register) — redirect to gallery if already authed
    if (PUBLIC_ROUTES.includes(pathname)) {
        if (session) {
            const redirectUrl =
                session.role === "admin" ? "/admin" : "/gallery";
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    // Admin routes — require admin session
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (session.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden — admin access required" },
                { status: 403 }
            );
        }
        return NextResponse.next();
    }

    // Admin API routes — require admin session
    if (ADMIN_API_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
    }

    // User API routes — require any valid session
    if (USER_API_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.next();
    }

    // All other routes — require auth
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|memes/).*)"],
};

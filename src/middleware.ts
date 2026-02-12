import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_API_PREFIX = "/api/auth/";
const USER_ROUTES = ["/gallery", "/meme"];
const ADMIN_ROUTE_PREFIX = "/admin";
const ADMIN_API_PREFIX = "/api/admin/";
const USER_API_PREFIX = "/api/responses";

function getSessionFromRequest(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = getSessionFromRequest(request);

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/memes") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    if (pathname.startsWith(AUTH_API_PREFIX)) {
        return NextResponse.next();
    }

    if (PUBLIC_ROUTES.includes(pathname)) {
        if (session) {
            const redirectUrl =
                session.role === "admin" ? "/admin" : "/gallery";
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith(ADMIN_API_PREFIX)) {
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
    }

    if (pathname.startsWith(USER_API_PREFIX)) {
        if (!session || session.role !== "user") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.next();
    }

    if (pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (session.role !== "admin") {
            return new NextResponse("Forbidden", {
                status: 403,
                headers: { "content-type": "text/plain; charset=utf-8" },
            });
        }
        return NextResponse.next();
    }

    if (USER_ROUTES.some((route) => pathname.startsWith(route))) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (session.role !== "user") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|memes/).*)"],
};

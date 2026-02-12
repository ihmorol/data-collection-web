import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type SessionPayload = {
    userId: number;
    role: "user" | "admin";
    exp?: number;
};

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_API_PREFIX = "/api/auth/";
const USER_ROUTES = ["/gallery", "/meme"];
const ADMIN_ROUTE_PREFIX = "/admin";
const ADMIN_API_PREFIX = "/api/admin/";
const USER_API_PREFIX = "/api/responses";

const encoder = new TextEncoder();

function base64UrlToBytes(input: string): Uint8Array {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    const output = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) {
        output[i] = decoded.charCodeAt(i);
    }
    return output;
}

function decodePayload(part: string): SessionPayload | null {
    try {
        const json = new TextDecoder().decode(base64UrlToBytes(part));
        const parsed = JSON.parse(json) as SessionPayload;
        if (
            !parsed ||
            typeof parsed.userId !== "number" ||
            (parsed.role !== "user" && parsed.role !== "admin")
        ) {
            return null;
        }
        if (typeof parsed.exp === "number") {
            const nowSeconds = Math.floor(Date.now() / 1000);
            if (parsed.exp < nowSeconds) return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    const signatureBytes = Uint8Array.from(base64UrlToBytes(signature));

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        encoder.encode(data)
    );
    if (!valid) return null;

    return decodePayload(payload);
}

async function getSessionFromRequest(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await getSessionFromRequest(request);

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
            const redirectUrl = session.role === "admin" ? "/admin" : "/gallery";
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
            const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>403 Forbidden</title></head>
<body style="background:#0B0118;color:#fff;font-family:Inter,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;">
<main style="text-align:center;padding:24px;border:1px solid #252530;border-radius:12px;background:rgba(22,16,33,.8)">
<h1 style="margin:0 0 8px;font-size:28px;">403</h1>
<p style="margin:0 0 16px;color:#cbd5e1;">You do not have admin access.</p>
<a href="/gallery" style="color:#A78BFA;text-decoration:none;font-weight:600;">Back to Gallery</a>
</main></body></html>`;
            return new NextResponse(html, {
                status: 403,
                headers: { "content-type": "text/html; charset=utf-8" },
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

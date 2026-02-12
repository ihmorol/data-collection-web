import { NextRequest, NextResponse } from "next/server";

function getAllowedOrigins(): Set<string> {
    const raw = process.env.ALLOWED_ORIGINS ?? "";
    const values = raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    return new Set(values);
}

function resolveRequestOrigin(request: NextRequest): string {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost ?? request.headers.get("host") ?? request.nextUrl.host;
    const protocol =
        forwardedProto ??
        request.nextUrl.protocol.replace(":", "") ??
        (process.env.NODE_ENV === "production" ? "https" : "http");

    return `${protocol}://${host}`;
}

function forbiddenResponse() {
    return NextResponse.json(
        {
            success: false,
            code: "CSRF_BLOCKED",
            error: "Forbidden",
        },
        { status: 403 }
    );
}

export function validateCsrfOrigin(request: NextRequest): NextResponse | null {
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite === "cross-site") {
        return forbiddenResponse();
    }

    const origin = request.headers.get("origin");
    if (!origin) return null;

    const allowedOrigins = getAllowedOrigins();
    allowedOrigins.add(resolveRequestOrigin(request));

    if (!allowedOrigins.has(origin)) {
        return forbiddenResponse();
    }

    return null;
}

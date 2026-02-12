import { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const FALLBACK_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;
const fallbackAttempts = new Map<string, { count: number; resetAt: number }>();

type RateLimitResult = {
    limited: boolean;
    retryAfterSeconds: number;
};

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp;

    const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
    return `unknown:${userAgent}`;
}

function parseNumericResult(payload: unknown): number | null {
    if (
        payload &&
        typeof payload === "object" &&
        "result" in payload &&
        typeof (payload as { result: unknown }).result === "number"
    ) {
        return (payload as { result: number }).result;
    }
    return null;
}

function runFallback(ip: string): RateLimitResult {
    const now = Date.now();
    for (const [key, value] of fallbackAttempts.entries()) {
        if (value.resetAt <= now) {
            fallbackAttempts.delete(key);
        }
    }

    const existing = fallbackAttempts.get(ip);

    if (!existing || existing.resetAt <= now) {
        fallbackAttempts.set(ip, {
            count: 1,
            resetAt: now + FALLBACK_WINDOW_MS,
        });
        return { limited: false, retryAfterSeconds: 0 };
    }

    if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
        return {
            limited: true,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil((existing.resetAt - now) / 1000)
            ),
        };
    }

    existing.count += 1;
    fallbackAttempts.set(ip, existing);
    return { limited: false, retryAfterSeconds: 0 };
}

async function callUpstash(
    url: string,
    token: string,
    command: string
): Promise<number | null> {
    const response = await fetch(`${url}/${command}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as unknown;
    return parseNumericResult(payload);
}

async function runUpstash(ip: string): Promise<RateLimitResult | null> {
    const baseUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!baseUrl || !token) return null;

    const sanitizedUrl = baseUrl.replace(/\/+$/, "");
    const key = encodeURIComponent(`login:${ip}`);

    try {
        const count = await callUpstash(sanitizedUrl, token, `incr/${key}`);
        if (count === null) return null;

        if (count === 1) {
            await callUpstash(
                sanitizedUrl,
                token,
                `expire/${key}/${RATE_LIMIT_WINDOW_SECONDS}`
            );
        }

        if (count <= RATE_LIMIT_MAX_ATTEMPTS) {
            return { limited: false, retryAfterSeconds: 0 };
        }

        const ttl =
            (await callUpstash(sanitizedUrl, token, `ttl/${key}`)) ??
            RATE_LIMIT_WINDOW_SECONDS;
        return {
            limited: true,
            retryAfterSeconds: Math.max(1, ttl),
        };
    } catch {
        return null;
    }
}

export async function checkLoginRateLimit(
    request: NextRequest
): Promise<RateLimitResult> {
    const ip = getClientIp(request);
    const upstashResult = await runUpstash(ip);
    if (upstashResult) return upstashResult;
    return runFallback(ip);
}

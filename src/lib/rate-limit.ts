import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const FALLBACK_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;
const fallbackAttempts = new Map<string, { count: number; resetAt: number }>();

type RateLimitResult = {
    limited: boolean;
    retryAfterSeconds: number;
};

type ConsumeLoginAttempt = (ipHash: string) => Promise<RateLimitResult | null>;

type RateLimitOverrides = {
    consumeAttempt?: ConsumeLoginAttempt;
    fallback?: (ip: string) => RateLimitResult;
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

function getIpHashSecret(): string {
    const explicitSecret = process.env.RATE_LIMIT_HASH_SECRET?.trim();
    if (explicitSecret) return explicitSecret;

    const sessionSecret = process.env.SESSION_SECRET?.trim();
    if (sessionSecret) return sessionSecret;

    return "memeconsole-dev-rate-limit-secret";
}

function hashIp(ip: string): string {
    const hash = createHash("sha256");
    hash.update(getIpHashSecret());
    hash.update(":");
    hash.update(ip);
    return hash.digest("hex");
}

function parseDbRateLimitResult(payload: unknown): RateLimitResult | null {
    const row =
        Array.isArray(payload) && payload.length > 0 ? payload[0] : payload;
    if (!row || typeof row !== "object") return null;

    const limited = (row as { limited?: unknown }).limited;
    const retryAfterSeconds = (row as { retry_after_seconds?: unknown })
        .retry_after_seconds;
    if (typeof limited !== "boolean") return null;
    if (typeof retryAfterSeconds !== "number") return null;
    if (!Number.isFinite(retryAfterSeconds)) return null;

    return {
        limited,
        retryAfterSeconds: Math.max(0, Math.floor(retryAfterSeconds)),
    };
}

async function consumeLoginAttempt(ipHash: string): Promise<RateLimitResult | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("consume_login_attempt", {
        p_ip_hash: ipHash,
        p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
        p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
    });

    if (error) {
        console.error("rate-limit-db-error", error.message);
        return null;
    }

    return parseDbRateLimitResult(data);
}

async function runDatabaseLimit(
    ip: string,
    consumeAttempt: ConsumeLoginAttempt
): Promise<RateLimitResult | null> {
    const ipHash = hashIp(ip);
    try {
        return await consumeAttempt(ipHash);
    } catch {
        return null;
    }
}

export function resetRateLimitFallbackForTests(): void {
    fallbackAttempts.clear();
}

function runLocalFallback(ip: string): RateLimitResult {
    return runFallback(ip);
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

export async function checkLoginRateLimit(
    request: NextRequest,
    overrides?: RateLimitOverrides
): Promise<RateLimitResult> {
    const ip = getClientIp(request);
    const consumeAttempt = overrides?.consumeAttempt ?? consumeLoginAttempt;
    const fallback = overrides?.fallback ?? runLocalFallback;

    const databaseResult = await runDatabaseLimit(ip, consumeAttempt);
    if (databaseResult) return databaseResult;

    return fallback(ip);
}

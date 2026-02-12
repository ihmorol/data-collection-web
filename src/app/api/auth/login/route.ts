import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createSession, verifyPassword } from "@/lib/auth";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }
    return "unknown";
}

function checkRateLimit(ip: string): { limited: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const existing = loginAttempts.get(ip);

    if (!existing || existing.resetAt <= now) {
        loginAttempts.set(ip, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS,
        });
        return { limited: false, retryAfterSeconds: 0 };
    }

    if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
        return {
            limited: true,
            retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
    }

    existing.count += 1;
    loginAttempts.set(ip, existing);
    return { limited: false, retryAfterSeconds: 0 };
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    const rate = checkRateLimit(ip);
    if (rate.limited) {
        return NextResponse.json(
            { error: "Too Many Requests" },
            {
                status: 429,
                headers: { "Retry-After": String(rate.retryAfterSeconds) },
            }
        );
    }

    try {
        const body = await request.json();
        const { username, password, rememberMe } = body;
        const normalizedUsername =
            typeof username === "string" ? username.trim() : "";
        const normalizedPassword =
            typeof password === "string" ? password : "";

        if (!normalizedUsername || !normalizedPassword) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        if (
            normalizedUsername === process.env.ADMIN_USERNAME &&
            normalizedPassword === process.env.ADMIN_PASSWORD
        ) {
            const response = NextResponse.json({
                success: true,
                role: "admin",
            });
            createSession(response, 0, "admin", !!rememberMe);
            return response;
        }

        const supabase = createServerSupabaseClient();
        const { data: user, error } = await supabase
            .from("annotators")
            .select("id, password_hash")
            .eq("username", normalizedUsername)
            .maybeSingle();

        if (error) {
            return NextResponse.json(
                { error: "Login failed. Please try again." },
                { status: 500 }
            );
        }

        if (!user?.password_hash) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        const passwordValid = await verifyPassword(
            normalizedPassword,
            user.password_hash
        );
        if (!passwordValid) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            success: true,
            role: "user",
        });
        createSession(response, user.id, "user", !!rememberMe);
        return response;
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

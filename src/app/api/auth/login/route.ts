import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createSession, verifyPassword } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";
import { checkLoginRateLimit } from "@/lib/rate-limit";

function jsonError(status: number, code: string, error: string) {
    return NextResponse.json(
        {
            success: false,
            code,
            error,
        },
        { status }
    );
}

export async function POST(request: NextRequest) {
    const csrfError = validateCsrfOrigin(request);
    if (csrfError) return csrfError;

    const rate = await checkLoginRateLimit(request);
    if (rate.limited) {
        return NextResponse.json(
            {
                success: false,
                code: "RATE_LIMITED",
                error: "Too Many Requests",
            },
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
            return jsonError(
                400,
                "VALIDATION_ERROR",
                "Username and password are required"
            );
        }

        const supabase = createServerSupabaseClient();
        const { data: admin, error: adminError } = await supabase
            .from("admins")
            .select("id, password_hash, is_active")
            .eq("username", normalizedUsername)
            .maybeSingle();

        if (adminError && adminError.code !== "42P01") {
            return jsonError(
                500,
                "LOGIN_FAILED",
                "Login failed. Please try again."
            );
        }

        if (admin?.is_active && admin.password_hash) {
            const adminPasswordValid = await verifyPassword(
                normalizedPassword,
                admin.password_hash
            );
            if (adminPasswordValid) {
                const response = NextResponse.json({
                    success: true,
                    role: "admin",
                });
                createSession(response, admin.id, "admin", !!rememberMe);
                return response;
            }
        }

        const { data: user, error } = await supabase
            .from("annotators")
            .select("id, password_hash")
            .eq("username", normalizedUsername)
            .maybeSingle();

        if (error) {
            return jsonError(
                500,
                "LOGIN_FAILED",
                "Login failed. Please try again."
            );
        }
        if (!user?.password_hash) {
            return jsonError(
                401,
                "INVALID_CREDENTIALS",
                "Invalid username or password"
            );
        }
        const passwordValid = await verifyPassword(
            normalizedPassword,
            user.password_hash
        );
        if (!passwordValid) {
            return jsonError(
                401,
                "INVALID_CREDENTIALS",
                "Invalid username or password"
            );
        }

        const response = NextResponse.json({
            success: true,
            role: "user",
        });
        createSession(response, user.id, "user", !!rememberMe);
        return response;
    } catch {
        return jsonError(400, "INVALID_REQUEST", "Invalid request body");
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

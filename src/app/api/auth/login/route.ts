import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, rememberMe } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Check admin credentials first
        if (
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            const response = NextResponse.json({
                success: true,
                role: "admin",
            });
            setSessionCookie(response, 0, "admin", !!rememberMe);
            return response;
        }

        // Check database for regular user
        const supabase = createServerSupabaseClient();
        const { data: user } = await supabase
            .from("annotators")
            .select("id, password_hash")
            .eq("username", username)
            .single();

        if (!user) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        const passwordValid = await verifyPassword(password, user.password_hash);
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
        setSessionCookie(response, user.id, "user", !!rememberMe);
        return response;
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

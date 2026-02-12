import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get("u");
    const normalizedUsername = username?.trim() ?? "";

    if (!normalizedUsername || normalizedUsername.length < 3) {
        return NextResponse.json(
            { error: "Username must be at least 3 characters" },
            { status: 400 }
        );
    }

    const supabase = createServerSupabaseClient();
    const [{ data: annotator, error: annotatorError }, { data: admin, error: adminError }] =
        await Promise.all([
            supabase
                .from("annotators")
                .select("id")
                .eq("username", normalizedUsername)
                .maybeSingle(),
            supabase
                .from("admins")
                .select("id")
                .eq("username", normalizedUsername)
                .maybeSingle(),
        ]);

    if (annotatorError || (adminError && adminError.code !== "42P01")) {
        return NextResponse.json(
            { error: "Unable to check username availability" },
            { status: 500 }
        );
    }

    return NextResponse.json({ available: !annotator && !admin });
}

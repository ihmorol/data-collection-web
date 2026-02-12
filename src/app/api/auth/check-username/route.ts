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
    const { data, error } = await supabase
        .from("annotators")
        .select("id")
        .eq("username", normalizedUsername)
        .maybeSingle();

    if (error) {
        return NextResponse.json(
            { error: "Unable to check username availability" },
            { status: 500 }
        );
    }

    return NextResponse.json({ available: !data });
}

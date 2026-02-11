import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get("u");

    if (!username || username.trim().length < 3) {
        return NextResponse.json(
            { error: "Username must be at least 3 characters" },
            { status: 400 }
        );
    }

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
        .from("annotators")
        .select("id")
        .eq("username", username.trim())
        .single();

    return NextResponse.json({ available: !data });
}

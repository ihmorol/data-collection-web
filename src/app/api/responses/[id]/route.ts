import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== "user") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const displayOrder = Number(id);
    if (!Number.isInteger(displayOrder) || displayOrder <= 0) {
        return NextResponse.json({ error: "Invalid meme ID" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: meme, error: memeError } = await supabase
        .from("meme_bank")
        .select("id, image_name, caption, display_order")
        .eq("display_order", displayOrder)
        .maybeSingle();

    if (memeError) {
        return NextResponse.json({ error: "Failed to fetch meme" }, { status: 500 });
    }
    if (!meme) {
        return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    const [
        { data: existingReview, error: reviewError },
        { count: totalMemes, error: totalError },
        { count: userCompletedCount, error: completedError },
    ] = await Promise.all([
        supabase
            .from("meme_reviews")
            .select(
                "perception, is_offensive, contains_vulgarity, primary_target, moderation_decision"
            )
            .eq("meme_id", meme.id)
            .eq("annotator_id", session.userId)
            .maybeSingle(),
        supabase.from("meme_bank").select("*", { count: "exact", head: true }),
        supabase
            .from("meme_reviews")
            .select("*", { count: "exact", head: true })
            .eq("annotator_id", session.userId),
    ]);

    if (reviewError || totalError || completedError) {
        return NextResponse.json(
            { error: "Failed to fetch review details" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        meme,
        existingReview: existingReview ?? null,
        totalMemes: totalMemes ?? 0,
        userCompletedCount: userCompletedCount ?? 0,
    });
}

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
    const displayOrder = parseInt(id, 10);
    if (isNaN(displayOrder)) {
        return NextResponse.json(
            { error: "Invalid meme ID" },
            { status: 400 }
        );
    }

    const supabase = createServerSupabaseClient();

    // Fetch meme by display_order
    const { data: meme } = await supabase
        .from("meme_bank")
        .select("id, image_name, caption, display_order")
        .eq("display_order", displayOrder)
        .single();

    if (!meme) {
        return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    // Fetch existing review for this meme by current user
    const { data: existingReview } = await supabase
        .from("meme_reviews")
        .select(
            "perception, is_offensive, contains_vulgarity, primary_target, moderation_decision"
        )
        .eq("meme_id", meme.id)
        .eq("annotator_id", session.userId)
        .single();

    // Get total memes and user's completed count
    const { count: totalMemes } = await supabase
        .from("meme_bank")
        .select("*", { count: "exact", head: true });

    const { count: userCompletedCount } = await supabase
        .from("meme_reviews")
        .select("*", { count: "exact", head: true })
        .eq("annotator_id", session.userId);

    return NextResponse.json({
        meme,
        existingReview: existingReview || null,
        totalMemes: totalMemes || 0,
        userCompletedCount: userCompletedCount || 0,
    });
}

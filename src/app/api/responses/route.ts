import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "user") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Fetch all memes with review status for current user
    const { data: memes, error: memesError } = await supabase
        .from("meme_bank")
        .select("id, image_name, caption, display_order")
        .order("display_order", { ascending: true });

    if (memesError) {
        return NextResponse.json({ error: "Failed to fetch memes" }, { status: 500 });
    }

    // Fetch user's completed reviews
    const { data: reviews } = await supabase
        .from("meme_reviews")
        .select("meme_id")
        .eq("annotator_id", session.userId);

    const reviewedMemeIds = new Set(reviews?.map((r) => r.meme_id) || []);
    const completedCount = reviewedMemeIds.size;
    const totalCount = memes?.length || 0;

    const memesWithStatus = memes?.map((meme) => ({
        ...meme,
        reviewed: reviewedMemeIds.has(meme.id),
    }));

    const firstIncomplete = memesWithStatus?.find((m) => !m.reviewed);

    return NextResponse.json({
        memes: memesWithStatus,
        completedCount,
        totalCount,
        firstIncompleteOrder: firstIncomplete?.display_order || null,
    });
}

const VALID_PERCEPTION = [
    "Very Negative", "Negative", "Neutral", "Positive", "Very Positive",
];
const VALID_OFFENSIVE = [
    "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree",
];
const VALID_TARGET = [
    "None/General", "Political Figure", "Religious Group", "Gender/Identity", "Individual",
];
const VALID_MODERATION = ["Keep", "Flag/Filter", "Remove"];

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "user") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            meme_id,
            perception,
            is_offensive,
            contains_vulgarity,
            primary_target,
            moderation_decision,
        } = body;

        // Validate
        const errors: Record<string, string> = {};
        if (!meme_id) errors.meme_id = "Required";
        if (!VALID_PERCEPTION.includes(perception))
            errors.perception = "Invalid value";
        if (!VALID_OFFENSIVE.includes(is_offensive))
            errors.is_offensive = "Invalid value";
        if (typeof contains_vulgarity !== "boolean")
            errors.contains_vulgarity = "Must be true or false";
        if (!VALID_TARGET.includes(primary_target))
            errors.primary_target = "Invalid value";
        if (!VALID_MODERATION.includes(moderation_decision))
            errors.moderation_decision = "Invalid value";

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        // Verify meme exists
        const { data: meme } = await supabase
            .from("meme_bank")
            .select("id")
            .eq("id", meme_id)
            .single();

        if (!meme) {
            return NextResponse.json({ error: "Meme not found" }, { status: 404 });
        }

        // UPSERT review
        const { data: review, error } = await supabase
            .from("meme_reviews")
            .upsert(
                {
                    annotator_id: session.userId,
                    meme_id,
                    perception,
                    is_offensive,
                    contains_vulgarity,
                    primary_target,
                    moderation_decision,
                },
                { onConflict: "annotator_id,meme_id" }
            )
            .select()
            .single();

        if (error) {
            console.error("Review submission error:", error);
            return NextResponse.json(
                { error: "Failed to save review" },
                { status: 500 }
            );
        }

        return NextResponse.json({ review }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

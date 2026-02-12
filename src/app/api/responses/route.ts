import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";

const VALID_PERCEPTION = [
    "Very Negative",
    "Negative",
    "Neutral",
    "Positive",
    "Very Positive",
] as const;
const VALID_OFFENSIVE = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
] as const;
const VALID_TARGET = [
    "None/General",
    "Political Figure",
    "Religious Group",
    "Gender/Identity",
    "Individual",
] as const;
const VALID_MODERATION = ["Keep", "Flag/Filter", "Remove"] as const;

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "user") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const [{ data: annotator, error: annotatorError }, { data: memes, error: memesError }, { data: reviews, error: reviewsError }] =
        await Promise.all([
            supabase
                .from("annotators")
                .select("username")
                .eq("id", session.userId)
                .maybeSingle(),
            supabase
                .from("meme_bank")
                .select("id, image_name, caption, display_order")
                .order("display_order", { ascending: true }),
            supabase
                .from("meme_reviews")
                .select("meme_id")
                .eq("annotator_id", session.userId),
        ]);

    if (annotatorError) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
    if (memesError) {
        return NextResponse.json({ error: "Failed to fetch memes" }, { status: 500 });
    }
    if (reviewsError) {
        return NextResponse.json(
            { error: "Failed to fetch review progress" },
            { status: 500 }
        );
    }

    const reviewedMemeIds = new Set(reviews?.map((row) => row.meme_id) ?? []);
    const memesWithStatus = (memes ?? []).map((meme) => ({
        ...meme,
        reviewed: reviewedMemeIds.has(meme.id),
    }));
    const firstIncomplete = memesWithStatus.find((meme) => !meme.reviewed);

    return NextResponse.json({
        memes: memesWithStatus,
        completedCount: reviewedMemeIds.size,
        totalCount: memesWithStatus.length,
        firstIncompleteOrder: firstIncomplete?.display_order ?? null,
        username: annotator?.username ?? "",
    });
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "user") {
        return NextResponse.json(
            { success: false, code: "UNAUTHORIZED", error: "Unauthorized" },
            { status: 401 }
        );
    }

    const csrfError = validateCsrfOrigin(request);
    if (csrfError) return csrfError;

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

        const memeId = Number(meme_id);
        const errors: Record<string, string> = {};

        if (!Number.isInteger(memeId) || memeId <= 0) {
            errors.meme_id = "Must be a valid meme id";
        }
        if (!VALID_PERCEPTION.includes(perception)) {
            errors.perception = "Invalid value";
        }
        if (!VALID_OFFENSIVE.includes(is_offensive)) {
            errors.is_offensive = "Invalid value";
        }
        if (typeof contains_vulgarity !== "boolean") {
            errors.contains_vulgarity = "Must be true or false";
        }
        if (!VALID_TARGET.includes(primary_target)) {
            errors.primary_target = "Invalid value";
        }
        if (!VALID_MODERATION.includes(moderation_decision)) {
            errors.moderation_decision = "Invalid value";
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                { success: false, code: "VALIDATION_ERROR", errors },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();

        const { data: meme, error: memeError } = await supabase
            .from("meme_bank")
            .select("id")
            .eq("id", memeId)
            .maybeSingle();

        if (memeError) {
            return NextResponse.json(
                {
                    success: false,
                    code: "MEME_FETCH_FAILED",
                    error: "Failed to fetch meme",
                },
                { status: 500 }
            );
        }
        if (!meme) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", error: "Meme not found" },
                { status: 404 }
            );
        }

        const { data: existingReview, error: existingReviewError } = await supabase
            .from("meme_reviews")
            .select("id")
            .eq("annotator_id", session.userId)
            .eq("meme_id", memeId)
            .maybeSingle();

        if (existingReviewError) {
            return NextResponse.json(
                {
                    success: false,
                    code: "REVIEW_LOOKUP_FAILED",
                    error: "Failed to check existing review",
                },
                { status: 500 }
            );
        }

        const { data: review, error: upsertError } = await supabase
            .from("meme_reviews")
            .upsert(
                {
                    annotator_id: session.userId,
                    meme_id: memeId,
                    perception,
                    is_offensive,
                    contains_vulgarity,
                    primary_target,
                    moderation_decision,
                },
                { onConflict: "annotator_id,meme_id" }
            )
            .select(
                "id, annotator_id, meme_id, perception, is_offensive, contains_vulgarity, primary_target, moderation_decision, created_at"
            )
            .single();

        if (upsertError) {
            return NextResponse.json(
                {
                    success: false,
                    code: "REVIEW_SAVE_FAILED",
                    error: "Failed to save review",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, review },
            { status: existingReview ? 200 : 201 }
        );
    } catch {
        return NextResponse.json(
            { success: false, code: "INVALID_REQUEST", error: "Invalid request body" },
            { status: 400 }
        );
    }
}

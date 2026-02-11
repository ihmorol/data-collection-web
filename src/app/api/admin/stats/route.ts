import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
    const supabase = createServerSupabaseClient();

    const [usersResult, reviewsResult, activeResult] = await Promise.all([
        supabase
            .from("annotators")
            .select("*", { count: "exact", head: true }),
        supabase
            .from("meme_reviews")
            .select("*", { count: "exact", head: true }),
        supabase
            .from("meme_reviews")
            .select("annotator_id")
            .limit(1000),
    ]);

    const totalUsers = usersResult.count || 0;
    const totalReviews = reviewsResult.count || 0;

    const uniqueAnnotators = new Set(
        activeResult.data?.map((r) => r.annotator_id) || []
    );
    const activeAnnotators = uniqueAnnotators.size;

    const completionRate =
        totalUsers > 0
            ? Math.round((totalReviews / (totalUsers * 500)) * 1000) / 10
            : 0;

    return NextResponse.json({
        totalUsers,
        totalReviews,
        activeAnnotators,
        completionRate,
    });
}

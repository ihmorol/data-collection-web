import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

async function countActiveAnnotators() {
    const supabase = createServerSupabaseClient();
    const seen = new Set<number>();
    const pageSize = 1000;
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from("meme_reviews")
            .select("annotator_id")
            .order("id", { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        for (const row of data) {
            if (typeof row.annotator_id === "number") {
                seen.add(row.annotator_id);
            }
        }

        if (data.length < pageSize) break;
        from += pageSize;
    }

    return seen.size;
}

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();
    const [{ count: totalUsers, error: usersError }, { count: totalReviews, error: reviewsError }] =
        await Promise.all([
            supabase.from("annotators").select("*", { count: "exact", head: true }),
            supabase.from("meme_reviews").select("*", { count: "exact", head: true }),
        ]);

    if (usersError || reviewsError) {
        return NextResponse.json(
            { error: "Failed to fetch admin stats" },
            { status: 500 }
        );
    }

    let activeAnnotators = 0;
    try {
        activeAnnotators = await countActiveAnnotators();
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch active annotators" },
            { status: 500 }
        );
    }

    const users = totalUsers ?? 0;
    const reviews = totalReviews ?? 0;
    const completionRate =
        users > 0 ? Number(((reviews / (users * 500)) * 100).toFixed(1)) : 0;

    return NextResponse.json({
        totalUsers: users,
        totalReviews: reviews,
        activeAnnotators,
        completionRate,
    });
}

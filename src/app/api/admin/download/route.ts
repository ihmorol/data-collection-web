import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = request.nextUrl.searchParams.get("type");

    if (!type || !["users", "reviews"].includes(type)) {
        return NextResponse.json(
            { error: "Invalid type. Must be 'users' or 'reviews'" },
            { status: 400 }
        );
    }

    const supabase = createServerSupabaseClient();

    if (type === "users") {
        const { data, error } = await supabase
            .from("annotators")
            .select(
                "id, username, age, political_outlook, religious_perspective, internet_literacy, dark_humor_tolerance, created_at"
            )
            .order("id", { ascending: true });

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch user data" },
                { status: 500 }
            );
        }

        const headers = [
            "id",
            "username",
            "age",
            "political_outlook",
            "religious_perspective",
            "internet_literacy",
            "dark_humor_tolerance",
            "created_at",
        ];
        const csv = [
            headers.join(","),
            ...(data || []).map((row) =>
                headers
                    .map((h) => {
                        const val = row[h as keyof typeof row];
                        const str = val === null ? "" : String(val);
                        return str.includes(",") ? `"${str}"` : str;
                    })
                    .join(",")
            ),
        ].join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=user_details.csv",
            },
        });
    }

    // type === "reviews"
    const { data, error } = await supabase
        .from("meme_reviews")
        .select(
            `id, annotator_id, meme_id, perception, is_offensive, contains_vulgarity, primary_target, moderation_decision, created_at,
      annotators!inner(username),
      meme_bank!inner(image_name, display_order)`
        )
        .order("id", { ascending: true });

    if (error) {
        // Fallback: fetch without join if relationship isn't set up
        const { data: reviewsOnly, error: reviewsError } = await supabase
            .from("meme_reviews")
            .select("*")
            .order("id", { ascending: true });

        if (reviewsError) {
            return NextResponse.json(
                { error: "Failed to fetch review data" },
                { status: 500 }
            );
        }

        const headers = [
            "id",
            "annotator_id",
            "meme_id",
            "perception",
            "is_offensive",
            "contains_vulgarity",
            "primary_target",
            "moderation_decision",
            "created_at",
        ];
        const csv = [
            headers.join(","),
            ...(reviewsOnly || []).map((row) =>
                headers
                    .map((h) => {
                        const val = row[h as keyof typeof row];
                        const str = val === null ? "" : String(val);
                        return str.includes(",") ? `"${str}"` : str;
                    })
                    .join(",")
            ),
        ].join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=meme_reviews.csv",
            },
        });
    }

    const headers = [
        "id",
        "username",
        "image_name",
        "display_order",
        "perception",
        "is_offensive",
        "contains_vulgarity",
        "primary_target",
        "moderation_decision",
        "created_at",
    ];
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const csv = [
        headers.join(","),
        ...(data || []).map((row: any) => {
            const flat = {
                id: row.id,
                username: row.annotators?.username || "",
                image_name: row.meme_bank?.image_name || "",
                display_order: row.meme_bank?.display_order || "",
                perception: row.perception,
                is_offensive: row.is_offensive,
                contains_vulgarity: row.contains_vulgarity,
                primary_target: row.primary_target,
                moderation_decision: row.moderation_decision,
                created_at: row.created_at,
            };
            return headers
                .map((h) => {
                    const val = flat[h as keyof typeof flat];
                    const str = val === null ? "" : String(val);
                    return str.includes(",") ? `"${str}"` : str;
                })
                .join(",");
        }),
    ].join("\n");
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=meme_reviews.csv",
        },
    });
}

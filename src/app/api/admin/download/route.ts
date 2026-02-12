import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

type CsvValue = string | number | boolean | null | undefined;
type JoinedRow = {
    id: number;
    perception: string;
    is_offensive: string;
    contains_vulgarity: boolean;
    primary_target: string;
    moderation_decision: string;
    created_at: string;
    annotators?: { username: string } | { username: string }[] | null;
    meme_bank?:
        | { image_name: string; display_order: number }
        | { image_name: string; display_order: number }[]
        | null;
};

function escapeCsv(value: CsvValue): string {
    if (value === null || value === undefined) return "";
    const text = String(value);
    if (/["\n,]/.test(text)) {
        return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
}

function toCsvRows<T extends Record<string, CsvValue>>(
    headers: string[],
    rows: T[]
): string {
    const lines = rows.map((row) =>
        headers.map((header) => escapeCsv(row[header])).join(",")
    );
    return [headers.join(","), ...lines].join("\n");
}

function getJoinedValue<T>(value: T | T[] | null | undefined): T | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
}

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = request.nextUrl.searchParams.get("type");
    if (type !== "users" && type !== "reviews") {
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
        const csv = toCsvRows(headers, data ?? []);

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=user_details.csv",
            },
        });
    }

    const { data, error } = await supabase
        .from("meme_reviews")
        .select(
            `
            id,
            perception,
            is_offensive,
            contains_vulgarity,
            primary_target,
            moderation_decision,
            created_at,
            annotators:annotator_id(username),
            meme_bank:meme_id(image_name, display_order)
            `
        )
        .order("id", { ascending: true });

    if (error) {
        return NextResponse.json(
            { error: "Failed to fetch review data" },
            { status: 500 }
        );
    }

    const rows = ((data ?? []) as JoinedRow[]).map((row) => {
        const annotator = getJoinedValue(row.annotators);
        const meme = getJoinedValue(row.meme_bank);

        return {
        id: row.id,
            username: annotator?.username ?? "",
            image_name: meme?.image_name ?? "",
            display_order: meme?.display_order ?? "",
        perception: row.perception,
        is_offensive: row.is_offensive,
        contains_vulgarity: row.contains_vulgarity,
        primary_target: row.primary_target,
        moderation_decision: row.moderation_decision,
        created_at: row.created_at,
        };
    });

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
    const csv = toCsvRows(headers, rows);

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=meme_reviews.csv",
        },
    });
}

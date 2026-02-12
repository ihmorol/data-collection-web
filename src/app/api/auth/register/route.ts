import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createSession, hashPassword } from "@/lib/auth";

const VALID_POLITICAL = [
    "Progressive",
    "Moderate",
    "Conservative",
    "Apolitical",
];
const VALID_RELIGIOUS = [
    "Not Religious",
    "Moderately Religious",
    "Very Religious",
];
const VALID_LITERACY = ["Casual User", "Meme Savvy", "Chronically Online"];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            username,
            password,
            age,
            political_outlook,
            religious_perspective,
            internet_literacy,
            dark_humor_tolerance,
        } = body;
        const normalizedUsername =
            typeof username === "string" ? username.trim() : "";

        const errors: Record<string, string> = {};

        if (!normalizedUsername || normalizedUsername.length < 3)
            errors.username = "Username must be at least 3 characters";

        if (!password || typeof password !== "string" || password.length < 6)
            errors.password = "Password must be at least 6 characters";

        const ageNum = Number(age);
        if (
            age === undefined ||
            !Number.isInteger(ageNum) ||
            ageNum < 13 ||
            ageNum > 100
        )
            errors.age = "Age must be an integer between 13 and 100";

        if (!VALID_POLITICAL.includes(political_outlook))
            errors.political_outlook = `Must be one of: ${VALID_POLITICAL.join(", ")}`;

        if (!VALID_RELIGIOUS.includes(religious_perspective))
            errors.religious_perspective = `Must be one of: ${VALID_RELIGIOUS.join(", ")}`;

        if (!VALID_LITERACY.includes(internet_literacy))
            errors.internet_literacy = `Must be one of: ${VALID_LITERACY.join(", ")}`;

        const dht = Number(dark_humor_tolerance);
        if (
            dark_humor_tolerance === undefined ||
            !Number.isInteger(dht) ||
            dht < 1 ||
            dht > 10
        )
            errors.dark_humor_tolerance = "Must be an integer between 1 and 10";

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        const { data: existing, error: existingError } = await supabase
            .from("annotators")
            .select("id")
            .eq("username", normalizedUsername)
            .maybeSingle();

        if (existingError) {
            return NextResponse.json(
                { errors: { general: "Unable to validate username right now" } },
                { status: 500 }
            );
        }

        if (existing) {
            return NextResponse.json(
                { errors: { username: "Username is already taken" } },
                { status: 409 }
            );
        }

        const password_hash = await hashPassword(password);
        const { data: user, error } = await supabase
            .from("annotators")
            .insert({
                username: normalizedUsername,
                password_hash,
                age: ageNum,
                political_outlook,
                religious_perspective,
                internet_literacy,
                dark_humor_tolerance: dht,
            })
            .select("id")
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { errors: { username: "Username is already taken" } },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { errors: { general: "Registration failed. Please try again." } },
                { status: 500 }
            );
        }

        const response = NextResponse.json(
            { success: true, userId: user.id },
            { status: 201 }
        );
        createSession(response, user.id, "user");
        return response;
    } catch {
        return NextResponse.json(
            { errors: { general: "Invalid request body" } },
            { status: 400 }
        );
    }
}

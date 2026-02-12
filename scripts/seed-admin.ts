import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/auth";

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getAdminCredentials() {
    const username =
        process.env.ADMIN_BOOTSTRAP_USERNAME ?? process.env.ADMIN_USERNAME;
    const password =
        process.env.ADMIN_BOOTSTRAP_PASSWORD ?? process.env.ADMIN_PASSWORD;

    if (!username || username.trim().length < 3) {
        throw new Error(
            "Missing or invalid ADMIN_BOOTSTRAP_USERNAME (or ADMIN_USERNAME fallback)"
        );
    }
    if (!password || password.length < 10) {
        throw new Error(
            "Missing or invalid ADMIN_BOOTSTRAP_PASSWORD (or ADMIN_PASSWORD fallback). Use at least 10 chars."
        );
    }

    return {
        username: username.trim(),
        password,
    };
}

async function main() {
    const supabase = createClient(
        getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        getEnv("SUPABASE_SERVICE_ROLE_KEY"),
        {
            auth: { persistSession: false, autoRefreshToken: false },
        }
    );

    const { username, password } = getAdminCredentials();
    const passwordHash = await hashPassword(password);

    const { error } = await supabase.from("admins").upsert(
        {
            username,
            password_hash: passwordHash,
            is_active: true,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "username" }
    );

    if (error) {
        throw new Error(`Failed to seed admin: ${error.message}`);
    }

    console.log(`Admin user '${username}' seeded successfully`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Admin seed failed");
    process.exitCode = 1;
});

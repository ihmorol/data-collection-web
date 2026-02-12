import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/auth";
import { getAdminCredentialsFromEnv } from "../src/lib/admin-credentials";

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

async function main() {
    const supabase = createClient(
        getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        getEnv("SUPABASE_SERVICE_ROLE_KEY"),
        {
            auth: { persistSession: false, autoRefreshToken: false },
        }
    );

    const { username, password } = getAdminCredentialsFromEnv(process.env);
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

import { access } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

async function assertImageExists(imageName: string): Promise<boolean> {
    try {
        const imagePath = path.join(process.cwd(), "public", "memes", imageName);
        await access(imagePath);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    const supabase = createClient(
        getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        getEnv("SUPABASE_SERVICE_ROLE_KEY"),
        { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: memes, error } = await supabase
        .from("meme_bank")
        .select("image_name, display_order")
        .order("display_order", { ascending: true });

    if (error) throw new Error(`Failed to load meme_bank rows: ${error.message}`);
    if (!memes) throw new Error("No rows returned from meme_bank");

    const issues: string[] = [];
    if (memes.length !== 500) {
        issues.push(`Expected 500 rows, got ${memes.length}`);
    }

    for (let i = 0; i < memes.length; i += 1) {
        const expectedOrder = i + 1;
        if (memes[i].display_order !== expectedOrder) {
            issues.push(
                `display_order mismatch at index ${i}: expected ${expectedOrder}, got ${memes[i].display_order}`
            );
            break;
        }
    }

    for (const row of memes) {
        const exists = await assertImageExists(row.image_name);
        if (!exists) {
            issues.push(`Missing image file for image_name: ${row.image_name}`);
            if (issues.length > 10) break;
        }
    }

    if (issues.length > 0) {
        console.error("Seed verification failed:");
        for (const issue of issues) console.error(`- ${issue}`);
        process.exitCode = 1;
        return;
    }

    console.log("Seed verification passed:");
    console.log("- meme_bank count = 500");
    console.log("- display_order is contiguous (1..500)");
    console.log("- every image_name exists under public/memes");
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Verification failed");
    process.exitCode = 1;
});

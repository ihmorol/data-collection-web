import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type MemeRecord = {
    image_name: string;
    caption: string;
    ground_truth_label: string;
    display_order: number;
};

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function parseCsv(content: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let i = 0;
    let inQuotes = false;

    while (i < content.length) {
        const char = content[i];

        if (char === '"') {
            if (inQuotes && content[i + 1] === '"') {
                cell += '"';
                i += 2;
                continue;
            }
            inQuotes = !inQuotes;
            i += 1;
            continue;
        }

        if (!inQuotes && char === ",") {
            row.push(cell);
            cell = "";
            i += 1;
            continue;
        }

        if (!inQuotes && (char === "\n" || char === "\r")) {
            if (char === "\r" && content[i + 1] === "\n") {
                i += 1;
            }
            row.push(cell);
            if (row.length > 1 || row[0] !== "") {
                rows.push(row);
            }
            row = [];
            cell = "";
            i += 1;
            continue;
        }

        cell += char;
        i += 1;
    }

    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function toObjects(rows: string[][]): Record<string, string>[] {
    if (!rows.length) return [];
    const [header, ...body] = rows;

    return body.map((row) => {
        const entry: Record<string, string> = {};
        for (let i = 0; i < header.length; i += 1) {
            entry[header[i]] = row[i] ?? "";
        }
        return entry;
    });
}

async function readCsv(filePath: string): Promise<Record<string, string>[]> {
    const content = await readFile(filePath, "utf8");
    return toObjects(parseCsv(content));
}

async function buildSeedRecords(): Promise<MemeRecord[]> {
    const datasetDir = path.join(process.cwd(), "Stratified_Dataset");
    const files = ["training.csv", "validation.csv", "testing.csv"];

    const seen = new Set<string>();
    const records: MemeRecord[] = [];

    for (const file of files) {
        const rows = await readCsv(path.join(datasetDir, file));
        for (const row of rows) {
            const imageName = (row.image_name ?? "").trim();
            if (!imageName || seen.has(imageName)) continue;

            seen.add(imageName);
            records.push({
                image_name: imageName,
                caption: row.Captions ?? "",
                ground_truth_label: row.Label ?? "",
                display_order: records.length + 1,
            });
        }
    }

    return records;
}

async function seedMemeBank(records: MemeRecord[]): Promise<void> {
    const supabase = createClient(
        getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        getEnv("SUPABASE_SERVICE_ROLE_KEY"),
        {
            auth: { persistSession: false, autoRefreshToken: false },
        }
    );

    const chunkSize = 100;
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const { error } = await supabase
            .from("meme_bank")
            .upsert(chunk, { onConflict: "image_name" });

        if (error) {
            throw new Error(`Seed upsert failed at chunk ${i / chunkSize + 1}: ${error.message}`);
        }
    }
}

async function main() {
    const records = await buildSeedRecords();
    await seedMemeBank(records);
    console.log(`Seeded ${records.length} memes successfully`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exitCode = 1;
});

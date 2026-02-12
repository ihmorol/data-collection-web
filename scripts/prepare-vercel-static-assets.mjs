import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const memesPublicDir = path.join(rootDir, "public", "memes");
const memesSourceDir = path.join(rootDir, "Stratified_Dataset", "Img");

async function statIfExists(targetPath) {
    try {
        return await fs.lstat(targetPath);
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return null;
        }
        throw error;
    }
}

async function ensureSourceDirectory() {
    const sourceStats = await statIfExists(memesSourceDir);
    if (!sourceStats || !sourceStats.isDirectory()) {
        throw new Error(`Missing meme source directory: ${memesSourceDir}`);
    }
}

async function materializePublicMemesDirectory() {
    const publicStats = await statIfExists(memesPublicDir);

    if (publicStats?.isDirectory()) {
        return;
    }

    if (publicStats) {
        await fs.rm(memesPublicDir, { recursive: true, force: true });
    }

    await fs.mkdir(path.dirname(memesPublicDir), { recursive: true });
    await fs.cp(memesSourceDir, memesPublicDir, { recursive: true });
}

async function main() {
    if (process.env.VERCEL !== "1") {
        return;
    }

    await ensureSourceDirectory();
    await materializePublicMemesDirectory();
    console.log("Prepared static meme assets for Vercel build.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

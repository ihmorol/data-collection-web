"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MemeCard from "@/components/MemeCard";
import NavBar from "@/components/NavBar";
import ProgressBar from "@/components/ProgressBar";
import Skeleton from "@/components/ui/Skeleton";

type MemeItem = {
    id: number;
    image_name: string;
    caption: string;
    display_order: number;
    reviewed: boolean;
};

type GalleryPayload = {
    memes: MemeItem[];
    completedCount: number;
    totalCount: number;
    firstIncompleteOrder: number | null;
    username: string;
};

export default function GalleryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [payload, setPayload] = useState<GalleryPayload | null>(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch("/api/responses");
                const data = (await response.json()) as GalleryPayload | { error: string };
                if (!active) return;

                if (!response.ok || !("memes" in data)) {
                    setError("Failed to load gallery data");
                    return;
                }

                setPayload(data);
            } catch {
                if (active) setError("Failed to load gallery data");
            } finally {
                if (active) setLoading(false);
            }
        };

        void load();
        return () => {
            active = false;
        };
    }, []);

    const isAllDone = useMemo(() => {
        if (!payload) return false;
        return payload.totalCount > 0 && payload.completedCount >= payload.totalCount;
    }, [payload]);

    return (
        <div className="min-h-screen bg-background-dark pb-8">
            <NavBar
                variant="user"
                username={payload?.username ?? ""}
                currentPage="Gallery"
            />

            <main className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
                <section className="glass-card mb-6 space-y-4 p-5 sm:p-6">
                    {loading || !payload ? (
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-3 w-full rounded-full" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    ) : (
                        <>
                            <ProgressBar
                                completed={payload.completedCount}
                                total={payload.totalCount}
                            />
                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-400">
                                    {isAllDone
                                        ? "All memes reviewed."
                                        : "Continue from your first incomplete meme."}
                                </p>
                                <button
                                    type="button"
                                    disabled={isAllDone || payload.firstIncompleteOrder === null}
                                    onClick={() => {
                                        if (payload.firstIncompleteOrder) {
                                            router.push(`/meme/${payload.firstIncompleteOrder}`);
                                        }
                                    }}
                                    className="glow-button h-11 w-full rounded-[var(--radius-md)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {isAllDone ? "All Done!" : "Continue →"}
                                </button>
                            </div>
                        </>
                    )}
                </section>

                {error && (
                    <div className="mb-6 rounded-[var(--radius-md)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                        {error}
                    </div>
                )}

                <section
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5"
                    aria-label="Meme grid"
                >
                    {loading || !payload
                        ? Array.from({ length: 10 }).map((_, index) => (
                            <Skeleton key={index} className="aspect-square w-full" />
                        ))
                        : payload.memes.map((meme) => (
                            <MemeCard
                                key={meme.id}
                                id={meme.id}
                                imageName={meme.image_name}
                                displayOrder={meme.display_order}
                                reviewed={meme.reviewed}
                                onClick={() => router.push(`/meme/${meme.display_order}`)}
                            />
                        ))}
                </section>
            </main>
        </div>
    );
}

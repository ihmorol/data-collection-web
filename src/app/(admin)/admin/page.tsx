"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import Skeleton from "@/components/ui/Skeleton";

type StatsPayload = {
    totalUsers: number;
    totalReviews: number;
    activeAnnotators: number;
    completionRate: number;
};

function useAnimatedValue(target: number) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        let frameId = 0;
        if (prefersReducedMotion) {
            frameId = requestAnimationFrame(() => setValue(target));
            return () => cancelAnimationFrame(frameId);
        }

        const start = performance.now();
        const duration = 700;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(target * progress);
            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [target]);

    return value;
}

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState<StatsPayload | null>(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch("/api/admin/stats");
                const data = (await response.json()) as StatsPayload | { error: string };
                if (!active) return;

                if (!response.ok || !("totalUsers" in data)) {
                    setError(response.status === 403 ? "forbidden" : "Failed to load stats");
                    return;
                }
                setStats(data);
            } catch {
                if (active) setError("Failed to load stats");
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, []);

    const animatedUsers = useAnimatedValue(stats?.totalUsers ?? 0);
    const animatedReviews = useAnimatedValue(stats?.totalReviews ?? 0);
    const animatedActive = useAnimatedValue(stats?.activeAnnotators ?? 0);
    const animatedCompletion = useAnimatedValue(stats?.completionRate ?? 0);

    const completionPercent = useMemo(
        () => Math.min(100, stats?.completionRate ?? 0),
        [stats?.completionRate]
    );

    const download = (type: "users" | "reviews") => {
        window.location.href = `/api/admin/download?type=${type}`;
    };

    if (error === "forbidden") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark p-4">
                <div className="glass-card max-w-md space-y-3 p-6 text-center">
                    <h1 className="font-display text-2xl font-bold text-white">403</h1>
                    <p className="text-sm text-slate-300">
                        You do not have admin access for this page.
                    </p>
                    <Link
                        href="/gallery"
                        className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border-dark px-4 text-sm font-semibold text-slate-100"
                    >
                        Back to Gallery
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark pb-10">
            <NavBar variant="admin" currentPage="Dashboard" />

            <main className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
                <header className="mb-6">
                    <h1 className="font-display text-2xl font-bold text-white">
                        Admin Management Console
                    </h1>
                    <p className="text-sm text-slate-400">
                        Overview of meme data collection and annotation progress.
                    </p>
                </header>

                {error && error !== "forbidden" ? (
                    <div className="mb-5 rounded-[var(--radius-md)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                        {error}
                    </div>
                ) : null}

                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {loading || !stats ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-36 w-full" />
                        ))
                    ) : (
                        <>
                            <article className="glass-card p-5">
                                <p className="text-sm text-slate-400">Total Users</p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                    {Math.round(animatedUsers)}
                                </p>
                            </article>
                            <article className="glass-card p-5">
                                <p className="text-sm text-slate-400">Total Reviews</p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                    {Math.round(animatedReviews)}
                                </p>
                            </article>
                            <article className="glass-card p-5">
                                <p className="text-sm text-slate-400">Active Annotators</p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                    {Math.round(animatedActive)}
                                </p>
                            </article>
                            <article className="glass-card p-5">
                                <p className="text-sm text-slate-400">Completion Rate</p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                    {animatedCompletion.toFixed(1)}%
                                </p>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border-dark">
                                    <div
                                        className="progress-gradient h-full rounded-full transition-[width] duration-500"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                            </article>
                        </>
                    )}
                </section>

                <section className="glass-card space-y-4 p-5">
                    <div>
                        <h2 className="font-display text-xl font-semibold text-white">
                            Export Data for Research
                        </h2>
                        <p className="text-sm text-slate-400">
                            Download clean CSV exports of annotator profiles and meme reviews.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <article className="rounded-[var(--radius-md)] border border-border-dark bg-card-dark p-4">
                            <h3 className="text-base font-semibold text-white">User Details</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                All annotator profile fields excluding password hashes.
                            </p>
                            <button
                                type="button"
                                onClick={() => download("users")}
                                className="mt-4 h-11 rounded-[var(--radius-md)] border border-border-dark px-4 text-sm font-semibold text-slate-100 hover:border-primary/45"
                            >
                                Download User Details CSV
                            </button>
                        </article>

                        <article className="rounded-[var(--radius-md)] border border-border-dark bg-card-dark p-4">
                            <h3 className="text-base font-semibold text-white">Meme Reviews</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Includes username, meme image, display order, and review responses.
                            </p>
                            <button
                                type="button"
                                onClick={() => download("reviews")}
                                className="mt-4 h-11 rounded-[var(--radius-md)] border border-border-dark px-4 text-sm font-semibold text-slate-100 hover:border-primary/45"
                            >
                                Download Meme Reviews CSV
                            </button>
                        </article>
                    </div>
                </section>
            </main>
        </div>
    );
}

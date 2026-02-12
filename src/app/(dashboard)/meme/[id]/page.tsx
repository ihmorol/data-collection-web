"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import SurveyForm, { SurveyAnswers } from "@/components/SurveyForm";
import Skeleton from "@/components/ui/Skeleton";

type MemePayload = {
    meme: {
        id: number;
        image_name: string;
        caption: string;
        display_order: number;
    };
    existingReview: SurveyAnswers | null;
    totalMemes: number;
    userCompletedCount: number;
};

const DEFAULT_ANSWERS: SurveyAnswers = {
    perception: "",
    is_offensive: "",
    contains_vulgarity: null,
    primary_target: "",
    moderation_decision: "",
};

export default function MemePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const displayOrder = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");
    const [payload, setPayload] = useState<MemePayload | null>(null);
    const [answers, setAnswers] = useState<SurveyAnswers>(DEFAULT_ANSWERS);
    const [isComplete, setIsComplete] = useState(false);

    const loadMeme = useCallback(async () => {
        if (!Number.isInteger(displayOrder) || displayOrder <= 0) {
            setError("Invalid meme id");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/responses/${displayOrder}`);
            const data = (await response.json()) as MemePayload | { error: string };
            if (!response.ok || !("meme" in data)) {
                setError("Failed to load meme");
                return;
            }
            setPayload(data);
            setAnswers(data.existingReview ?? DEFAULT_ANSWERS);
        } catch {
            setError("Failed to load meme");
        } finally {
            setLoading(false);
        }
    }, [displayOrder]);

    useEffect(() => {
        void loadMeme();
    }, [loadMeme]);

    const goPrevious = useCallback(() => {
        if (!payload || payload.meme.display_order <= 1) return;
        router.push(`/meme/${payload.meme.display_order - 1}`);
    }, [payload, router]);

    const submitAndNext = useCallback(async () => {
        if (!payload || !isComplete || submitLoading) return;

        setSubmitLoading(true);
        setError("");
        try {
            const response = await fetch("/api/responses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meme_id: payload.meme.id,
                    ...answers,
                }),
            });
            if (!response.ok) {
                setError("Failed to submit review");
                return;
            }

            const isLast = payload.meme.display_order >= payload.totalMemes;
            router.push(isLast ? "/gallery" : `/meme/${payload.meme.display_order + 1}`);
        } catch {
            setError("Failed to submit review");
        } finally {
            setSubmitLoading(false);
        }
    }, [answers, isComplete, payload, router, submitLoading]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!payload) return;
            const activeTag = (document.activeElement?.tagName ?? "").toLowerCase();
            if (activeTag === "input" || activeTag === "textarea") return;

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrevious();
                return;
            }
            if (event.key === "ArrowRight" && isComplete && !submitLoading) {
                event.preventDefault();
                void submitAndNext();
                return;
            }
            if (/^[1-5]$/.test(event.key)) {
                const section = document.getElementById(`question-${event.key}`);
                if (!section) return;
                event.preventDefault();
                section.scrollIntoView({ behavior: "smooth", block: "center" });
                const firstButton = section.querySelector("button");
                if (firstButton instanceof HTMLElement) firstButton.focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [goPrevious, isComplete, payload, submitAndNext, submitLoading]);

    const rightBadge = useMemo(() => {
        if (!payload) return "";
        return `Meme ${payload.meme.display_order} / ${payload.totalMemes}`;
    }, [payload]);

    const isFirst = payload ? payload.meme.display_order <= 1 : true;
    const isLast = payload ? payload.meme.display_order >= payload.totalMemes : false;

    return (
        <div className="min-h-screen bg-background-dark pb-24">
            <NavBar variant="user" currentPage="Gallery" rightBadge={rightBadge} />

            <main className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
                {error ? (
                    <div className="mb-5 rounded-[var(--radius-md)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                        {error}
                    </div>
                ) : null}

                {loading || !payload ? (
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Skeleton className="h-[420px] w-full" />
                        <Skeleton className="h-[520px] w-full" />
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        <section className="lg:sticky lg:top-24 lg:self-start">
                            <div className="rounded-[var(--radius-lg)] border border-primary/35 bg-card-dark p-3 shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                                <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-border-dark">
                                    <Image
                                        src={`/memes/${encodeURIComponent(payload.meme.image_name)}`}
                                        alt={`Meme ${payload.meme.display_order}`}
                                        width={900}
                                        height={900}
                                        className="max-h-[60vh] w-full object-contain"
                                        priority
                                        unoptimized
                                    />
                                </div>
                            </div>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary-light">
                                Transcription (Bangla)
                            </p>
                            <p lang="bn" className="mt-2 rounded-[var(--radius-md)] border border-border-dark bg-card-dark p-3 font-bangla text-base text-slate-100">
                                {payload.meme.caption}
                            </p>
                        </section>

                        <section className="rounded-[var(--radius-lg)] border border-border-dark bg-card-dark p-4 sm:p-5">
                            <div className="mb-4">
                                <h1 className="font-display text-xl font-bold text-white">
                                    Annotation Task
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Complete all 5 questions to continue.
                                </p>
                            </div>
                            <div className="max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                                <SurveyForm
                                    initialAnswers={payload.existingReview}
                                    disabled={submitLoading}
                                    onChange={(nextAnswers, complete) => {
                                        setAnswers(nextAnswers);
                                        setIsComplete(complete);
                                    }}
                                />
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border-dark bg-surface-dark/90 p-3 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-1 sm:px-3">
                    <button
                        type="button"
                        onClick={goPrevious}
                        disabled={loading || isFirst || submitLoading}
                        className="h-11 min-w-11 flex-1 rounded-[var(--radius-md)] border border-border-dark px-4 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        ← PREVIOUS
                    </button>
                    <button
                        type="button"
                        onClick={() => void submitAndNext()}
                        disabled={loading || !isComplete || submitLoading}
                        className="glow-button h-11 min-w-11 flex-[1.3] rounded-[var(--radius-md)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitLoading
                            ? "Submitting..."
                            : isLast
                                ? "SUBMIT & FINISH"
                                : "SUBMIT & NEXT →"}
                    </button>
                </div>
            </footer>
        </div>
    );
}

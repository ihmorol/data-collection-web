"use client";

import { useMemo } from "react";

type ProgressBarProps = {
    completed: number;
    total: number;
};

export default function ProgressBar({ completed, total }: ProgressBarProps) {
    const safeTotal = Math.max(total, 1);
    const percentage = useMemo(
        () => Math.min(100, (completed / safeTotal) * 100),
        [completed, safeTotal]
    );

    return (
        <div className="space-y-3">
            <div className="flex items-end justify-between gap-3">
                <p className="text-sm text-slate-300">
                    {completed} of {total} memes annotated
                </p>
                <p className="text-sm font-semibold text-primary-light">
                    {percentage.toFixed(1)}% complete
                </p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-border-dark">
                <div
                    className="progress-gradient h-full rounded-full [transform-origin:left] motion-safe:animate-[grow_700ms_ease-out]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <style jsx>{`
                @keyframes grow {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
            `}</style>
        </div>
    );
}

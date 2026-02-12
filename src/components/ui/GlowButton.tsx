"use client";

import { ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    fullWidth?: boolean;
}

export default function GlowButton({
    children,
    loading,
    fullWidth,
    disabled,
    className = "",
    ...props
}: GlowButtonProps) {
    const isDisabled = Boolean(disabled || loading);

    return (
        <button
            disabled={isDisabled}
            aria-busy={loading}
            className={`glow-button inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-md)]
        text-white font-semibold text-base
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50 cursor-not-allowed !transform-none !shadow-none" : ""}
        ${className}`}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}

"use client";

import { useId } from "react";

interface SegmentedPillsProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export default function SegmentedPills({
    label,
    options,
    value,
    onChange,
    error,
    disabled = false,
}: SegmentedPillsProps) {
    const groupId = useId();

    const handleArrow = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + options.length) % options.length;
        onChange(options[nextIndex]);
    };

    return (
        <div className="space-y-2">
            <label id={groupId} className="block text-sm font-medium text-slate-300">
                {label}
            </label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={groupId}>
                {options.map((option, index) => (
                    <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={value === option}
                        aria-disabled={disabled}
                        disabled={disabled}
                        onClick={() => onChange(option)}
                        onKeyDown={(event) => handleArrow(event, index)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
              ${value === option
                                ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                                : "bg-transparent text-slate-400 border-border-dark hover:border-primary/50 hover:text-slate-200"
                            }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {error && <p className="text-sm text-error mt-1">{error}</p>}
        </div>
    );
}

"use client";

import { useId } from "react";

export type RadioOption = {
    value: string;
    label: string;
    icon?: string;
};

type RadioCardsProps = {
    name: string;
    label?: string;
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    layout?: "horizontal" | "grid";
    variant?: "card" | "pill";
    error?: string;
    disabled?: boolean;
};

export default function RadioCards({
    name,
    label,
    options,
    value,
    onChange,
    layout = "horizontal",
    variant = "card",
    error,
    disabled = false,
}: RadioCardsProps) {
    const groupId = useId();

    const handleArrow = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (
            event.key !== "ArrowRight" &&
            event.key !== "ArrowLeft" &&
            event.key !== "ArrowUp" &&
            event.key !== "ArrowDown"
        ) {
            return;
        }
        event.preventDefault();
        const direction =
            event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = (index + direction + options.length) % options.length;
        onChange(options[nextIndex].value);
    };

    const layoutClass =
        layout === "grid"
            ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
            : "flex flex-wrap gap-2";

    return (
        <fieldset className="space-y-2" disabled={disabled}>
            {label && (
                <legend id={groupId} className="text-sm font-semibold text-slate-200">
                    {label}
                </legend>
            )}
            <div
                className={layoutClass}
                role="radiogroup"
                aria-labelledby={label ? groupId : undefined}
                aria-label={label ? undefined : name}
            >
                {options.map((option, index) => {
                    const selected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={option.label}
                            onKeyDown={(event) => handleArrow(event, index)}
                            onClick={() => onChange(option.value)}
                            disabled={disabled}
                            className={`min-h-11 rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-all ${
                                variant === "pill" ? "uppercase tracking-wide" : ""
                            } ${
                                selected
                                    ? "border-primary bg-primary/25 text-white"
                                    : "border-border-dark bg-card-dark text-slate-300 hover:border-primary/45"
                            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                            <span className="inline-flex items-center gap-2">
                                {option.icon ? (
                                    <span className="material-icons text-base">{option.icon}</span>
                                ) : null}
                                <span>{option.label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            {error ? <p className="text-sm text-error">{error}</p> : null}
        </fieldset>
    );
}

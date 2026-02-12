"use client";

interface AgeInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    error?: string;
    disabled?: boolean;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export default function AgeInput({
    value,
    onChange,
    min = 13,
    max = 100,
    error,
    disabled = false,
}: AgeInputProps) {
    const atMin = value <= min;
    const atMax = value >= max;

    const onInputChange = (rawValue: string) => {
        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed)) return;
        onChange(clamp(Math.round(parsed), min, max));
    };

    return (
        <div className="space-y-2">
            <label
                htmlFor="age"
                className="block text-sm font-medium text-slate-300"
            >
                Age
            </label>
            <div className="flex items-stretch gap-2">
                <button
                    type="button"
                    disabled={disabled || atMin}
                    aria-label="Decrease age"
                    onClick={() => onChange(clamp(value - 1, min, max))}
                    className="h-11 min-w-11 rounded-[var(--radius-md)] border border-border-dark bg-surface-dark text-white hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    -
                </button>
                <input
                    id="age"
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onInputChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-[var(--radius-md)] bg-surface-dark border text-white placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all
          ${error ? "border-error" : "border-border-dark"}`}
                />
                <button
                    type="button"
                    disabled={disabled || atMax}
                    aria-label="Increase age"
                    onClick={() => onChange(clamp(value + 1, min, max))}
                    className="h-11 min-w-11 rounded-[var(--radius-md)] border border-border-dark bg-surface-dark text-white hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    +
                </button>
            </div>
            {error && <p className="text-sm text-error mt-1">{error}</p>}
        </div>
    );
}

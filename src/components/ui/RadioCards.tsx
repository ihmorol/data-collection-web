"use client";

interface RadioCardsProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    columns?: 1 | 2 | 3 | 5;
    error?: string;
}

export default function RadioCards({
    label,
    options,
    value,
    onChange,
    columns = 1,
    error,
}: RadioCardsProps) {
    const gridClass = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        5: "grid-cols-5",
    }[columns];

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
                {label}
            </label>
            <div className={`grid ${gridClass} gap-2`}>
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200 border text-center
              ${value === option
                                ? "bg-primary/20 text-primary border-primary shadow-[0_0_8px_rgba(124,58,237,0.2)]"
                                : "bg-surface-dark text-slate-400 border-border-dark hover:border-primary/40 hover:text-slate-200"
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {error && <p className="text-sm text-error mt-1">{error}</p>}
        </div>
    );
}

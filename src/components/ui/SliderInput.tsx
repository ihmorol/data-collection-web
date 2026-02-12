"use client";

interface SliderInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    leftLabel?: string;
    rightLabel?: string;
    error?: string;
    disabled?: boolean;
}

export default function SliderInput({
    label,
    value,
    onChange,
    min = 1,
    max = 10,
    leftLabel,
    rightLabel,
    error,
    disabled = false,
}: SliderInputProps) {
    const percentage = ((value - min) / (max - min)) * 100;
    const middle = Math.round((min + max) / 2);
    const ticks = [min, middle, max];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">{label}</label>
                <span className="text-lg font-bold text-primary tabular-nums">
                    {value}
                </span>
            </div>
            <div className="relative pt-8">
                <div
                    className="absolute top-0 -translate-x-1/2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white"
                    style={{ left: `${percentage}%` }}
                >
                    {value}
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={1}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(Math.round(Number(e.target.value)))}
                    className="slider w-full h-2 rounded-full appearance-none cursor-pointer bg-border-dark"
                    style={{
                        background: `linear-gradient(90deg, #7C3AED ${percentage}%, #252530 ${percentage}%)`,
                    }}
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    {ticks.map((tick) => (
                        <span key={tick} className="relative flex w-8 -translate-x-1/2 flex-col items-center">
                            <span className="mb-1 h-1.5 w-1.5 rounded-full bg-slate-500/80" />
                            <span>{tick}</span>
                        </span>
                    ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>{leftLabel ?? "Low"}</span>
                    <span>{rightLabel ?? "High"}</span>
                </div>
            </div>
            {error && <p className="text-sm text-error mt-1">{error}</p>}
            <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: box-shadow 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 16px rgba(124, 58, 237, 0.7);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}

"use client";

import Image from "next/image";

type MemeCardProps = {
    id: number;
    imageName: string;
    displayOrder: number;
    reviewed: boolean;
    onClick: () => void;
};

export default function MemeCard({
    id,
    imageName,
    displayOrder,
    reviewed,
    onClick,
}: MemeCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group w-full text-left"
            aria-label={`Open meme #${String(displayOrder).padStart(3, "0")}`}
        >
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-border-dark bg-card-dark shadow-sm transition-all duration-200 group-hover:-translate-y-2 group-hover:shadow-xl">
                <Image
                    src={`/memes/${encodeURIComponent(imageName)}`}
                    alt={`Meme ${displayOrder}`}
                    width={320}
                    height={320}
                    className="aspect-square h-auto w-full object-cover"
                    loading="lazy"
                    unoptimized
                />
                <span className="absolute right-2 top-2 inline-flex items-center rounded-full border border-border-dark bg-surface-dark/90 px-2 py-1 text-xs font-semibold text-white">
                    <span className="material-icons text-base leading-none">
                        {reviewed ? "check_circle" : "radio_button_unchecked"}
                    </span>
                </span>
            </div>
            <div className="mt-2 text-sm font-medium text-slate-300">
                #{String(displayOrder).padStart(3, "0")}
            </div>
            <div className="sr-only">Meme ID {id}</div>
        </button>
    );
}

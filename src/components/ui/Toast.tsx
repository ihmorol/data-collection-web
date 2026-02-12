"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
};

type ToastListener = (toast: ToastItem) => void;

const listeners = new Set<ToastListener>();

export function showToast(
    message: string,
    type: ToastType = "info",
    duration = 3000
) {
    const toast: ToastItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        message,
        type,
        duration,
    };
    for (const listener of listeners) listener(toast);
}

function subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function ToastEntry({
    toast,
    onRemove,
}: {
    toast: ToastItem;
    onRemove: (id: string) => void;
}) {
    const colors = {
        success: "bg-success/90 border-success/50",
        error: "bg-error/90 border-error/50",
        info: "bg-primary/90 border-primary/50",
    };
    const icons = {
        success: "check_circle",
        error: "error",
        info: "info",
    };

    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [onRemove, toast.duration, toast.id]);

    return (
        <div
            className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm text-white shadow-lg transition-all duration-300 motion-reduce:transition-none ${colors[toast.type]}`}
        >
            <span className="material-icons text-lg">{icons[toast.type]}</span>
            <span className="font-medium">{toast.message}</span>
            <button
                type="button"
                onClick={() => onRemove(toast.id)}
                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:text-white"
                aria-label="Close notification"
            >
                <span className="material-icons text-base">close</span>
            </button>
        </div>
    );
}

export default function ToastViewport() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => subscribe((toast) => setToasts((prev) => [...prev, toast])), []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(94vw,420px)] flex-col gap-2 sm:right-6 sm:top-6">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastEntry toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}

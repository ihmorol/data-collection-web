"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export default function Toast({
    message,
    type = "info",
    duration = 4000,
    onClose,
}: ToastProps) {
    const [visible, setVisible] = useState(false);

    const close = useCallback(() => {
        setVisible(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(close, duration);
        return () => clearTimeout(timer);
    }, [duration, close]);

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

    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius-md)]
        border backdrop-blur-md text-white shadow-lg
        transition-all duration-300
        ${colors[type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        >
            <span className="material-icons text-xl">{icons[type]}</span>
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={close}
                className="ml-2 text-white/60 hover:text-white transition-colors"
            >
                <span className="material-icons text-lg">close</span>
            </button>
        </div>
    );
}

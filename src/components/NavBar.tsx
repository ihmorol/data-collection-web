"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type NavBarProps = {
    variant: "user" | "admin";
    username?: string;
    currentPage?: string;
    rightBadge?: string;
};

type NavLink = {
    href: string;
    label: string;
};

export default function NavBar({
    variant,
    username = "",
    currentPage,
    rightBadge,
}: NavBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const links = useMemo<NavLink[]>(
        () =>
            variant === "admin"
                ? [{ href: "/admin", label: "Dashboard" }]
                : [{ href: "/gallery", label: "Gallery" }],
        [variant]
    );

    const doLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            router.replace("/login");
            router.refresh();
        }
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border-dark/80 bg-surface-dark/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-5">
                    <Link href={variant === "admin" ? "/admin" : "/gallery"} className="flex items-center gap-2">
                        <span className="material-icons text-primary">bolt</span>
                        <span className="font-display text-lg font-bold text-white">
                            MemeConsole
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-4 md:flex">
                        {links.map((link) => {
                            const active =
                                currentPage === link.label ||
                                pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${
                                        active
                                            ? "border-b-2 border-primary pb-0.5 text-white"
                                            : "text-slate-300 hover:text-white"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {rightBadge && (
                        <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-light">
                            {rightBadge}
                        </span>
                    )}
                    <span className="rounded-full border border-border-dark bg-card-dark px-3 py-1 text-xs font-semibold text-slate-200">
                        {variant === "admin" ? "Admin" : username || "Annotator"}
                    </span>
                    <button
                        type="button"
                        onClick={doLogout}
                        disabled={loggingOut}
                        className="h-11 min-w-11 rounded-[var(--radius-md)] border border-border-dark px-3 text-sm font-medium text-slate-200 hover:border-primary/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loggingOut ? "..." : "Logout"}
                    </button>
                </div>

                <button
                    type="button"
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-border-dark text-slate-200 md:hidden"
                >
                    <span className="material-icons">menu</span>
                </button>
            </div>

            {menuOpen && (
                <div className="border-t border-border-dark bg-surface-dark/95 px-4 py-3 md:hidden">
                    <div className="mb-2 text-xs font-semibold text-slate-400">
                        {variant === "admin" ? "Admin" : username || "Annotator"}
                    </div>
                    <div className="flex flex-col gap-2">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="h-11 rounded-[var(--radius-md)] border border-border-dark px-3 py-2 text-sm text-slate-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={doLogout}
                            disabled={loggingOut}
                            className="h-11 rounded-[var(--radius-md)] border border-border-dark px-3 text-left text-sm text-slate-200 disabled:opacity-60"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}

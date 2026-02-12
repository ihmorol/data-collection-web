"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GlowButton from "@/components/ui/GlowButton";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = username.trim().length > 0 && password.length > 0;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        setError("");
        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                    rememberMe,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError("Invalid username or password");
                return;
            }

            router.push(data.role === "admin" ? "/admin" : "/gallery");
        } catch {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background-dark px-4 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.28),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.2),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,0.16),transparent_45%)]" />

            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="glass-card w-full space-y-5 rounded-[var(--radius-xl)] p-6 sm:p-8"
                >
                    <div className="space-y-2 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30 text-primary-light">
                            <span className="material-icons">dashboard</span>
                        </div>
                        <h1 className="font-display text-2xl font-extrabold text-white">
                            MemeConsole
                        </h1>
                        <p className="text-sm text-slate-400">
                            Access the meme data collection and research suite
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="login-username"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <span className="material-icons pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                person
                            </span>
                            <input
                                id="login-username"
                                autoFocus
                                type="text"
                                value={username}
                                disabled={loading}
                                onChange={(event) => setUsername(event.target.value)}
                                className="w-full rounded-[var(--radius-md)] border border-border-dark bg-surface-dark py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="login-password"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <span className="material-icons pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                lock
                            </span>
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                disabled={loading}
                                onChange={(event) => setPassword(event.target.value)}
                                className={`w-full rounded-[var(--radius-md)] border bg-surface-dark py-3 pl-11 pr-11 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${error ? "border-error" : "border-border-dark"}`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={loading}
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="material-icons text-xl">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        {error && <p className="text-sm text-error">{error}</p>}
                    </div>

                    <label className="flex h-11 items-center gap-2 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            disabled={loading}
                            onChange={(event) => setRememberMe(event.target.checked)}
                            className="h-4 w-4 accent-primary"
                        />
                        Remember this device
                    </label>

                    <GlowButton type="submit" fullWidth loading={loading} disabled={!canSubmit}>
                        Sign In →
                    </GlowButton>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="h-px flex-1 bg-border-dark" />
                        <span>OR</span>
                        <div className="h-px flex-1 bg-border-dark" />
                    </div>

                    <p className="text-center text-sm text-slate-400">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary transition-colors hover:text-primary-light"
                        >
                            Register now
                        </Link>
                    </p>
                </form>

                <footer className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                    <span>Privacy Policy</span>
                    <span>·</span>
                    <span>Terms of Service</span>
                    <span>·</span>
                    <span>Support</span>
                </footer>
            </main>
        </div>
    );
}

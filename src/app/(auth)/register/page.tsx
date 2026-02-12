"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AgeInput from "@/components/ui/AgeInput";
import GlowButton from "@/components/ui/GlowButton";
import SegmentedPills from "@/components/ui/SegmentedPills";
import SliderInput from "@/components/ui/SliderInput";
import { showToast } from "@/components/ui/Toast";

const POLITICAL_OPTIONS = [
    "Progressive",
    "Moderate",
    "Conservative",
    "Apolitical",
];
const RELIGIOUS_OPTIONS = [
    "Not Religious",
    "Moderately Religious",
    "Very Religious",
];
const LITERACY_OPTIONS = ["Casual User", "Meme Savvy", "Chronically Online"];
const ERROR_FIELD_ORDER = [
    "username",
    "password",
    "age",
    "political_outlook",
    "religious_perspective",
    "internet_literacy",
    "dark_humor_tolerance",
] as const;

type UsernameStatus = "idle" | "checking" | "available" | "taken";

function focusFirstError(errors: Record<string, string>) {
    const first = ERROR_FIELD_ORDER.find((key) => errors[key]);
    if (!first) return;
    const element = document.getElementById(`field-${first}`);
    if (!element) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState(18);
    const [politicalOutlook, setPoliticalOutlook] = useState("");
    const [religiousPerspective, setReligiousPerspective] = useState("");
    const [internetLiteracy, setInternetLiteracy] = useState("");
    const [darkHumorTolerance, setDarkHumorTolerance] = useState(5);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const trimmedUsername = username.trim();

    useEffect(() => {
        if (trimmedUsername.length < 3) {
            setUsernameStatus("idle");
            return;
        }

        let active = true;
        setUsernameStatus("checking");
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/auth/check-username?u=${encodeURIComponent(trimmedUsername)}`
                );
                const data = await response.json();
                if (!active) return;
                setUsernameStatus(data.available ? "available" : "taken");
            } catch {
                if (active) setUsernameStatus("idle");
            }
        }, 500);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [trimmedUsername]);

    const isFormValid = useMemo(() => {
        const fieldsPresent =
            trimmedUsername.length >= 3 &&
            password.length >= 6 &&
            Number.isInteger(age) &&
            age >= 13 &&
            age <= 100 &&
            Boolean(politicalOutlook) &&
            Boolean(religiousPerspective) &&
            Boolean(internetLiteracy) &&
            darkHumorTolerance >= 1 &&
            darkHumorTolerance <= 10;

        const usernameOk =
            trimmedUsername.length < 3 ||
            usernameStatus === "available" ||
            usernameStatus === "idle";

        return fieldsPresent && usernameOk;
    }, [
        age,
        darkHumorTolerance,
        internetLiteracy,
        password.length,
        politicalOutlook,
        religiousPerspective,
        trimmedUsername.length,
        usernameStatus,
    ]);

    const validateClient = (): Record<string, string> => {
        const nextErrors: Record<string, string> = {};

        if (trimmedUsername.length < 3) {
            nextErrors.username = "Username must be at least 3 characters";
        } else if (usernameStatus === "taken") {
            nextErrors.username = "Username is already taken";
        }

        if (password.length < 6) {
            nextErrors.password = "Password must be at least 6 characters";
        }
        if (!Number.isInteger(age) || age < 13 || age > 100) {
            nextErrors.age = "Age must be between 13 and 100";
        }
        if (!POLITICAL_OPTIONS.includes(politicalOutlook)) {
            nextErrors.political_outlook = "Please select a political outlook";
        }
        if (!RELIGIOUS_OPTIONS.includes(religiousPerspective)) {
            nextErrors.religious_perspective =
                "Please select a religious perspective";
        }
        if (!LITERACY_OPTIONS.includes(internetLiteracy)) {
            nextErrors.internet_literacy = "Please select internet literacy";
        }
        if (darkHumorTolerance < 1 || darkHumorTolerance > 10) {
            nextErrors.dark_humor_tolerance = "Value must be between 1 and 10";
        }

        return nextErrors;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const clientErrors = validateClient();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            focusFirstError(clientErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: trimmedUsername,
                    password,
                    age,
                    political_outlook: politicalOutlook,
                    religious_perspective: religiousPerspective,
                    internet_literacy: internetLiteracy,
                    dark_humor_tolerance: darkHumorTolerance,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                const apiErrors: Record<string, string> =
                    data?.errors ?? { general: "Registration failed. Please try again." };
                setErrors(apiErrors);
                focusFirstError(apiErrors);
                return;
            }

            showToast(`Welcome, ${trimmedUsername}!`, "success");
            setTimeout(() => router.push("/gallery"), 900);
        } catch {
            setErrors({ general: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background-dark">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.25),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.18),transparent_50%)]" />
            <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 right-8 h-72 w-72 rounded-full bg-primary-light/15 blur-3xl" />

            <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6">
                <header className="mb-8 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-white">
                        MemeConsole
                    </span>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >
                        Login
                    </Link>
                </header>

                <main className="mx-auto w-full max-w-2xl">
                    <form onSubmit={handleSubmit} className="glass-card space-y-6 p-5 sm:p-8">
                        <div className="space-y-1">
                            <h1 className="font-display text-2xl font-bold text-white">
                                Create your annotator account
                            </h1>
                            <p className="text-sm text-slate-400">
                                Fill in credentials and your profile preferences.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-base font-semibold text-slate-100">
                                Credentials
                            </h2>

                            <div className="space-y-2">
                                <label
                                    htmlFor="field-username"
                                    className="block text-sm font-medium text-slate-300"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        id="field-username"
                                        type="text"
                                        value={username}
                                        disabled={loading}
                                        onChange={(event) => {
                                            setUsername(event.target.value);
                                            setErrors((prev) => ({ ...prev, username: "" }));
                                        }}
                                        className={`w-full rounded-[var(--radius-md)] border bg-surface-dark px-4 py-3 pr-28 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.username ? "border-error" : "border-border-dark"}`}
                                        placeholder="Choose a username"
                                    />
                                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold">
                                        {usernameStatus === "checking" && (
                                            <span className="text-slate-400">CHECKING</span>
                                        )}
                                        {usernameStatus === "available" && (
                                            <span className="text-success">✓ AVAILABLE</span>
                                        )}
                                        {usernameStatus === "taken" && (
                                            <span className="text-error">✗ TAKEN</span>
                                        )}
                                    </div>
                                </div>
                                {errors.username && (
                                    <p className="text-sm text-error">{errors.username}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="field-password"
                                    className="block text-sm font-medium text-slate-300"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="field-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        disabled={loading}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setErrors((prev) => ({ ...prev, password: "" }));
                                        }}
                                        className={`w-full rounded-[var(--radius-md)] border bg-surface-dark px-4 py-3 pr-11 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.password ? "border-error" : "border-border-dark"}`}
                                        placeholder="Minimum 6 characters"
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
                                <p className="text-xs text-slate-500">Use at least 6 characters.</p>
                                {errors.password && (
                                    <p className="text-sm text-error">{errors.password}</p>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-base font-semibold text-slate-100">About You</h2>

                            <div id="field-age" tabIndex={-1}>
                                <AgeInput
                                    value={age}
                                    onChange={(next) => {
                                        setAge(next);
                                        setErrors((prev) => ({ ...prev, age: "" }));
                                    }}
                                    disabled={loading}
                                    error={errors.age}
                                />
                            </div>

                            <div id="field-political_outlook" tabIndex={-1}>
                                <SegmentedPills
                                    label="Political Outlook"
                                    options={POLITICAL_OPTIONS}
                                    value={politicalOutlook}
                                    onChange={(next) => {
                                        setPoliticalOutlook(next);
                                        setErrors((prev) => ({ ...prev, political_outlook: "" }));
                                    }}
                                    disabled={loading}
                                    error={errors.political_outlook}
                                />
                            </div>

                            <div id="field-religious_perspective" tabIndex={-1}>
                                <SegmentedPills
                                    label="Religious Perspective"
                                    options={RELIGIOUS_OPTIONS}
                                    value={religiousPerspective}
                                    onChange={(next) => {
                                        setReligiousPerspective(next);
                                        setErrors((prev) => ({
                                            ...prev,
                                            religious_perspective: "",
                                        }));
                                    }}
                                    disabled={loading}
                                    error={errors.religious_perspective}
                                />
                            </div>

                            <div id="field-internet_literacy" tabIndex={-1}>
                                <SegmentedPills
                                    label="Internet Literacy"
                                    options={LITERACY_OPTIONS}
                                    value={internetLiteracy}
                                    onChange={(next) => {
                                        setInternetLiteracy(next);
                                        setErrors((prev) => ({ ...prev, internet_literacy: "" }));
                                    }}
                                    disabled={loading}
                                    error={errors.internet_literacy}
                                />
                            </div>

                            <div id="field-dark_humor_tolerance" tabIndex={-1}>
                                <SliderInput
                                    label="Dark Humor Tolerance"
                                    value={darkHumorTolerance}
                                    onChange={(next) => {
                                        setDarkHumorTolerance(next);
                                        setErrors((prev) => ({
                                            ...prev,
                                            dark_humor_tolerance: "",
                                        }));
                                    }}
                                    leftLabel="SAFE FOR WORK"
                                    rightLabel="EDGE OF THE ABYSS"
                                    disabled={loading}
                                    error={errors.dark_humor_tolerance}
                                />
                            </div>
                        </section>

                        {errors.general && (
                            <p className="rounded-[var(--radius-md)] border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
                                {errors.general}
                            </p>
                        )}

                        <GlowButton
                            type="submit"
                            fullWidth
                            loading={loading}
                            disabled={!isFormValid || usernameStatus === "checking"}
                        >
                            Register as Annotator →
                        </GlowButton>

                        <p className="text-center text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-primary transition-colors hover:text-primary-light"
                            >
                                Log in
                            </Link>
                        </p>
                    </form>
                </main>

                <footer className="mt-8 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} MemeConsole
                </footer>
            </div>
        </div>
    );
}

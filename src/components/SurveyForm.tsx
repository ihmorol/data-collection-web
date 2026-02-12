"use client";

import { useEffect, useState } from "react";
import RadioCards from "@/components/ui/RadioCards";

export type SurveyAnswers = {
    perception: string;
    is_offensive: string;
    contains_vulgarity: boolean | null;
    primary_target: string;
    moderation_decision: string;
};

type SurveyFormProps = {
    initialAnswers?: Partial<SurveyAnswers> | null;
    disabled?: boolean;
    onChange: (answers: SurveyAnswers, isComplete: boolean) => void;
};

const PERCEPTION_OPTIONS = [
    { value: "Very Negative", label: "Very Negative", icon: "sentiment_very_dissatisfied" },
    { value: "Negative", label: "Negative", icon: "sentiment_dissatisfied" },
    { value: "Neutral", label: "Neutral", icon: "sentiment_neutral" },
    { value: "Positive", label: "Positive", icon: "sentiment_satisfied" },
    { value: "Very Positive", label: "Very Positive", icon: "sentiment_very_satisfied" },
];

const OFFENSIVE_OPTIONS = [
    { value: "Strongly Disagree", label: "Strongly Disagree" },
    { value: "Disagree", label: "Disagree" },
    { value: "Neutral", label: "Neutral" },
    { value: "Agree", label: "Agree" },
    { value: "Strongly Agree", label: "Strongly Agree" },
];

const VULGARITY_OPTIONS = [
    { value: "true", label: "Yes", icon: "report" },
    { value: "false", label: "No", icon: "check_circle" },
];

const TARGET_OPTIONS = [
    { value: "None/General", label: "None/General", icon: "public" },
    { value: "Political Figure", label: "Political Figure", icon: "account_balance" },
    { value: "Religious Group", label: "Religious Group", icon: "self_improvement" },
    { value: "Gender/Identity", label: "Gender/Identity", icon: "diversity_3" },
    { value: "Individual", label: "Individual", icon: "person" },
];

const MODERATION_OPTIONS = ["Keep", "Flag/Filter", "Remove"] as const;

function normalizeAnswers(input?: Partial<SurveyAnswers> | null): SurveyAnswers {
    return {
        perception: input?.perception ?? "",
        is_offensive: input?.is_offensive ?? "",
        contains_vulgarity:
            typeof input?.contains_vulgarity === "boolean"
                ? input.contains_vulgarity
                : null,
        primary_target: input?.primary_target ?? "",
        moderation_decision: input?.moderation_decision ?? "",
    };
}

function isComplete(answers: SurveyAnswers): boolean {
    return (
        Boolean(answers.perception) &&
        Boolean(answers.is_offensive) &&
        typeof answers.contains_vulgarity === "boolean" &&
        Boolean(answers.primary_target) &&
        Boolean(answers.moderation_decision)
    );
}

export default function SurveyForm({
    initialAnswers,
    disabled = false,
    onChange,
}: SurveyFormProps) {
    const [answers, setAnswers] = useState<SurveyAnswers>(() =>
        normalizeAnswers(initialAnswers)
    );

    useEffect(() => {
        setAnswers(normalizeAnswers(initialAnswers));
    }, [initialAnswers]);

    useEffect(() => {
        onChange(answers, isComplete(answers));
    }, [answers, onChange]);

    return (
        <div className="space-y-5">
            <section id="question-1" className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                    1. How do you perceive this meme?
                </h3>
                <RadioCards
                    name="perception"
                    options={PERCEPTION_OPTIONS}
                    value={answers.perception}
                    onChange={(next) =>
                        setAnswers((prev) => ({ ...prev, perception: next }))
                    }
                    layout="horizontal"
                    disabled={disabled}
                />
            </section>

            <hr className="border-border-dark" />

            <section id="question-2" className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                    2. Is this meme offensive to any group?
                </h3>
                <RadioCards
                    name="is_offensive"
                    options={OFFENSIVE_OPTIONS}
                    value={answers.is_offensive}
                    onChange={(next) =>
                        setAnswers((prev) => ({ ...prev, is_offensive: next }))
                    }
                    layout="horizontal"
                    variant="pill"
                    disabled={disabled}
                />
            </section>

            <hr className="border-border-dark" />

            <section id="question-3" className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                    3. Contains vulgarity?
                </h3>
                <RadioCards
                    name="contains_vulgarity"
                    options={VULGARITY_OPTIONS}
                    value={
                        typeof answers.contains_vulgarity === "boolean"
                            ? String(answers.contains_vulgarity)
                            : ""
                    }
                    onChange={(next) =>
                        setAnswers((prev) => ({
                            ...prev,
                            contains_vulgarity: next === "true",
                        }))
                    }
                    layout="horizontal"
                    disabled={disabled}
                />
            </section>

            <hr className="border-border-dark" />

            <section id="question-4" className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                    4. Primary target (if any)
                </h3>
                <RadioCards
                    name="primary_target"
                    options={TARGET_OPTIONS}
                    value={answers.primary_target}
                    onChange={(next) =>
                        setAnswers((prev) => ({ ...prev, primary_target: next }))
                    }
                    layout="grid"
                    disabled={disabled}
                />
            </section>

            <hr className="border-border-dark" />

            <section id="question-5" className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">
                    5. Should this be removed from a general feed?
                </h3>
                <div className="grid grid-cols-1 gap-2 rounded-[var(--radius-md)] border border-dashed border-primary/40 bg-primary/5 p-2 sm:grid-cols-3">
                    {MODERATION_OPTIONS.map((option) => {
                        const selected = answers.moderation_decision === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    setAnswers((prev) => ({
                                        ...prev,
                                        moderation_decision: option,
                                    }))
                                }
                                className={`min-h-11 rounded-[var(--radius-md)] border px-3 py-2 text-sm font-semibold transition-colors ${
                                    selected
                                        ? "border-primary bg-primary text-white"
                                        : "border-border-dark bg-card-dark text-slate-200 hover:border-primary/45"
                                } ${disabled ? "opacity-60" : ""}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

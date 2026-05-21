"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ExerciseContent, Step } from "@/lib/exercises";
import { DifficultyBadge } from "@/components/DifficultyBadge";

type ExerciseInfo = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  order: number;
  tags: string;
};

type NavExercise = {
  id: string;
  slug: string;
  order: number;
  title: string;
};

export function ExerciseClient({
  exercise,
  content,
  isAdmin,
  isCompleted: initialCompleted,
  completedAt,
  prevExercise,
  nextExercise,
}: {
  exercise: ExerciseInfo;
  content: ExerciseContent;
  isAdmin: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  prevExercise: NavExercise | null;
  nextExercise: NavExercise | null;
}) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [marking, setMarking] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [completionTime, setCompletionTime] = useState(completedAt);

  async function handleToggleComplete() {
    setMarking(true);
    if (isCompleted) {
      const res = await fetch(`/api/completions?exerciseId=${exercise.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsCompleted(false);
        setCompletionTime(null);
        router.refresh();
      }
    } else {
      const res = await fetch("/api/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsCompleted(true);
        setCompletionTime(data.completedAt);
        setShowNotes(false);
        router.refresh();
      }
    }
    setMarking(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={isAdmin ? "/admin/exercises" : "/dashboard"} className="hover:text-slate-300 transition">
          {isAdmin ? "Admin Exercises" : "Exercises"}
        </Link>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-400">{exercise.title}</span>
      </div>

      {/* Exercise Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                Exercise {exercise.order}
              </span>
              <DifficultyBadge difficulty={exercise.difficulty} />
              <span className="text-xs text-slate-500">{content.estimatedTime}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{exercise.title}</h1>
            <p className="text-slate-400">{exercise.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {exercise.tags.split(",").map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Completion status */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Completed</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Completion action */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          {isAdmin ? (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
              Admin preview mode is enabled. Completion tracking and notes are hidden on preview pages.
            </div>
          ) : isCompleted ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Completed on{" "}
                {completionTime
                  ? new Date(completionTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </div>
              <button
                onClick={handleToggleComplete}
                disabled={marking}
                className="text-sm text-slate-500 hover:text-red-400 transition"
              >
                Mark as incomplete
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your experience (optional)..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleComplete}
                  disabled={marking}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {marking ? "Saving..." : "Mark as Complete"}
                </button>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-sm text-slate-500 hover:text-slate-300 transition"
                >
                  {showNotes ? "Hide notes" : "Add notes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Overview</h2>
        <p className="text-slate-300 leading-relaxed">{content.overview}</p>
      </div>

      {/* Two column: objectives + prerequisites */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            What you will learn
          </h3>
          <ul className="space-y-2">
            {content.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Prerequisites
          </h3>
          <ul className="space-y-2">
            {content.prerequisites.map((pre, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {pre}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tools */}
      {content.tools.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tools & Concepts
          </h2>
          <div className="grid gap-3">
            {content.tools.map((tool, i) => (
              <div key={i} className="flex gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white text-sm">{tool.name}</p>
                    {tool.docUrl && (
                      <a
                        href={tool.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-0.5 transition"
                      >
                        docs
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Step-by-Step Instructions
        </h2>
        <div className="space-y-3">
          {content.steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              isActive={activeStep === i}
              onToggle={() => setActiveStep(activeStep === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* AI Tips */}
      <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI-Assisted Learning Tips
        </h2>
        <div className="space-y-3">
          {content.aiTips.map((tip, i) => (
            <div key={i} className="flex gap-3 p-3 bg-violet-500/5 rounded-xl border border-violet-500/10">
              <div className="w-6 h-6 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.298.059-.597.138-.893l.497-2.084A7 7 0 1012 14z" />
                </svg>
              </div>
              <p className="text-sm text-violet-200">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Testing Guide
        </h2>
        <p className="text-slate-300 leading-relaxed">{content.testingGuide}</p>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Next Steps
        </h2>
        <p className="text-slate-300">{content.nextSteps}</p>
      </div>

      {/* Mark Complete + Navigation */}
      <div className="border-t border-slate-800 pt-6 flex items-center justify-between gap-4">
        <div>
          {prevExercise && (
            <Link
              href={`/dashboard/exercises/${prevExercise.slug}`}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Exercise {prevExercise.order}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && !isCompleted && (
            <button
              onClick={handleToggleComplete}
              disabled={marking}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {marking ? "Saving..." : "Mark as Complete"}
            </button>
          )}
        </div>

        <div>
          {nextExercise && (
            <Link
              href={`/dashboard/exercises/${nextExercise.slug}`}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
            >
              <span className="hidden sm:inline">Exercise {nextExercise.order}</span>
              <span className="sm:hidden">Next</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  index,
  isActive,
  onToggle,
}: {
  step: Step;
  index: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isActive ? "border-orange-500/40 bg-slate-900" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition ${isActive ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"}`}>
          {index + 1}
        </div>
        <span className={`flex-1 text-base font-medium transition ${isActive ? "text-white" : "text-slate-300"}`}>
          {step.title}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${isActive ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isActive && (
        <div className="px-4 pb-5 space-y-4 border-t border-slate-800">
          <div className="pt-4 text-slate-300 text-base leading-8 whitespace-pre-line">
            <RenderMarkdown text={step.content} />
          </div>

          {step.code && (
            <div className="relative">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-700 rounded-t-lg px-4 py-2">
                <span className="text-xs text-slate-500 font-mono">{step.codeLanguage || "code"}</span>
                <CopyButton text={step.code} />
              </div>
              <pre className="bg-slate-950 border border-slate-700 border-t-0 rounded-b-lg p-4 overflow-x-auto">
                <code className="text-sm text-slate-300 font-mono">{step.code}</code>
              </pre>
            </div>
          )}

          {step.tip && (
            <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-base leading-7 text-blue-300">{step.tip}</p>
            </div>
          )}

          {step.warning && (
            <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-base leading-7 text-amber-300">{step.warning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RenderMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="px-1.5 py-0.5 bg-slate-800 text-orange-300 rounded text-xs font-mono border border-slate-700">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

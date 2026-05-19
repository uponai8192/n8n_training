import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import Link from "next/link";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const [exercises, completions] = await Promise.all([
    prisma.exercise.findMany({ orderBy: { order: "asc" } }),
    prisma.exerciseCompletion.findMany({
      where: { userId: session.user.id },
      include: { exercise: true },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const completedIds = new Set(completions.map((c) => c.exerciseId));
  const completionPercent = Math.round((completions.length / exercises.length) * 100);

  const byDifficulty = {
    BEGINNER: exercises.filter((e) => e.difficulty === "BEGINNER"),
    INTERMEDIATE: exercises.filter((e) => e.difficulty === "INTERMEDIATE"),
    ADVANCED: exercises.filter((e) => e.difficulty === "ADVANCED"),
    EXPERT: exercises.filter((e) => e.difficulty === "EXPERT"),
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Progress</h1>
          <p className="text-slate-400 mt-1">Track your exercise completion journey.</p>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{completions.length}</p>
            <p className="text-xs text-slate-500 mt-1">Completed</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-300">{exercises.length - completions.length}</p>
            <p className="text-xs text-slate-500 mt-1">Remaining</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{completionPercent}%</p>
            <p className="text-xs text-slate-500 mt-1">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Overall Progress</span>
            <span className="text-sm font-bold text-white">{completions.length}/{exercises.length}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                completionPercent === 100
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-orange-500 to-orange-400"
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* By difficulty breakdown */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {Object.entries(byDifficulty).map(([difficulty, exList]) => {
            const done = exList.filter((e) => completedIds.has(e.id)).length;
            const pct = exList.length > 0 ? Math.round((done / exList.length) * 100) : 0;
            return (
              <div key={difficulty} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <DifficultyBadge difficulty={difficulty} />
                  <span className="text-sm font-bold text-white">{done}/{exList.length}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent completions */}
        {completions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recently Completed</h2>
            <div className="space-y-3">
              {completions.slice(0, 10).map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/exercises/${c.exercise.slug}`}
                  className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300 truncate">{c.exercise.title}</p>
                    <p className="text-xs text-slate-600">
                      Completed {new Date(c.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    {c.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.notes}</p>}
                  </div>
                  <DifficultyBadge difficulty={c.exercise.difficulty} />
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {completions.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <svg className="w-10 h-10 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 mb-4">No exercises completed yet.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
            >
              Start an exercise
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

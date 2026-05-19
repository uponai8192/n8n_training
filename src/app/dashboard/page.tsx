import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  const exercises = await prisma.exercise.findMany({
    orderBy: { order: "asc" },
  });

  const completions = isAdmin
    ? []
    : await prisma.exerciseCompletion.findMany({
        where: { userId: session.user.id },
      });

  const completedIds = new Set(completions.map((c) => c.exerciseId));
  const completionPercent = Math.round((completions.length / exercises.length) * 100);

  const groupedByDifficulty = {
    BEGINNER: exercises.filter((e) => e.difficulty === "BEGINNER"),
    INTERMEDIATE: exercises.filter((e) => e.difficulty === "INTERMEDIATE"),
    ADVANCED: exercises.filter((e) => e.difficulty === "ADVANCED"),
    EXPERT: exercises.filter((e) => e.difficulty === "EXPERT"),
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isAdmin ? "Course Preview" : `Welcome back, ${session.user.name.split(" ")[0]}`}
          </h1>
          <p className="text-slate-400 mt-1">
            {isAdmin
              ? "Browse the partner course experience as an admin. Exercise pages open in preview mode."
              : "Work through the exercises at your own pace — complete them in any order."}
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-orange-400">Overall Progress</p>
              <p className="text-3xl font-bold text-white mt-1">
                {completions.length} / {exercises.length}
              </p>
              <p className="text-slate-400 text-sm mt-0.5">exercises completed</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-orange-400">{completionPercent}%</div>
              {completionPercent === 100 && (
                <p className="text-sm text-emerald-400 font-medium mt-1">All done! 🎉</p>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Exercises by difficulty */}
        {Object.entries(groupedByDifficulty).map(([difficulty, exList]) => {
          if (exList.length === 0) return null;
          const doneCount = exList.filter((e) => completedIds.has(e.id)).length;
          return (
            <div key={difficulty} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <DifficultyBadge difficulty={difficulty} />
                <span className="text-sm text-slate-500">{doneCount}/{exList.length} completed</span>
              </div>

              <div className="grid gap-3">
                {exList.map((exercise) => {
                  const isCompleted = completedIds.has(exercise.id);
                  return (
                    <Link
                      key={exercise.id}
                      href={`/dashboard/exercises/${exercise.slug}`}
                      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? "bg-slate-900/50 border-emerald-500/20 hover:border-emerald-500/40"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Status icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-500/15 border border-emerald-500/30"
                            : "bg-slate-800 border border-slate-700 group-hover:bg-slate-700 transition"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold text-slate-500">{exercise.order}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`font-semibold truncate ${isCompleted ? "text-slate-300" : "text-white"}`}>
                            {exercise.title}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{exercise.description}</p>
                      </div>

                      {/* Tags */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        {exercise.tags.split(",").slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>

                      {/* Arrow */}
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

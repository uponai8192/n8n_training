import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import Link from "next/link";

export default async function AdminExercisesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const exercises = await prisma.exercise.findMany({
    include: {
      _count: { select: { completions: true } },
    },
    orderBy: { order: "asc" },
  });

  const totalPartners = await prisma.user.count({ where: { role: "PARTNER" } });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Exercises</h1>
          <p className="text-slate-400 mt-1">
            {exercises.length} exercises across the platform
          </p>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise) => {
            const completionRate =
              totalPartners > 0
                ? Math.round((exercise._count.completions / totalPartners) * 100)
                : 0;
            return (
              <div
                key={exercise.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-400">{exercise.order}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-white">{exercise.title}</h3>
                          <DifficultyBadge difficulty={exercise.difficulty} />
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-1">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exercise.tags.split(",").map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-500 rounded border border-slate-700">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-white">{completionRate}%</p>
                        <p className="text-xs text-slate-500">
                          {exercise._count.completions}/{totalPartners} partners
                        </p>
                      </div>
                    </div>
                    {totalPartners > 0 && (
                      <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 rounded-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-300">
            <strong className="text-blue-200">Note:</strong> Exercise content is managed through the seed script.
            To update exercises, edit <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">prisma/seed.cjs</code> and re-run{" "}
            <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">node prisma/seed.cjs</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

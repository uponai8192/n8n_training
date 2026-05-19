import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [partners, exercises, invites] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER" },
      include: {
        completions: {
          include: { exercise: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exercise.findMany({ orderBy: { order: "asc" } }),
    prisma.invite.findMany({ where: { used: false }, orderBy: { createdAt: "desc" } }),
  ]);

  const totalExercises = exercises.length;
  const totalCompletions = await prisma.exerciseCompletion.count();
  const avgCompletion =
    partners.length > 0
      ? Math.round(
          (partners.reduce((sum, p) => sum + p.completions.length, 0) /
            partners.length /
            totalExercises) *
            100
        )
      : 0;

  const partnersWithStats = partners.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    createdAt: p.createdAt,
    completedCount: p.completions.length,
    completionPercent: Math.round((p.completions.length / totalExercises) * 100),
  }));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Monitor partner progress and manage the platform.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Partners",
              value: partners.length,
              icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              color: "text-blue-400",
            },
            {
              label: "Exercises",
              value: totalExercises,
              icon: (
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              color: "text-orange-400",
            },
            {
              label: "Total Completions",
              value: totalCompletions,
              icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: "text-emerald-400",
            },
            {
              label: "Avg Completion",
              value: `${avgCompletion}%`,
              icon: (
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              color: "text-purple-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 mb-8">
          <Link
            href="/admin/invites"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Partner
          </Link>
          <Link
            href="/admin/partners"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View All Partners
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Partner progress */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Partner Progress</h2>
              <Link href="/admin/partners" className="text-sm text-orange-400 hover:text-orange-300 transition">
                View all
              </Link>
            </div>

            {partnersWithStats.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">No partners yet.</p>
                <Link
                  href="/admin/invites"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 font-medium transition"
                >
                  Invite your first partner
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {partnersWithStats.slice(0, 5).map((partner) => (
                  <div key={partner.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-400">
                            {partner.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{partner.name}</p>
                          <p className="text-xs text-slate-500">{partner.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{partner.completionPercent}%</p>
                        <p className="text-xs text-slate-500">
                          {partner.completedCount}/{totalExercises}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 rounded-full"
                        style={{ width: `${partner.completionPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exercise overview */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Exercises</h2>
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-xs font-bold text-slate-600 w-5 text-right flex-shrink-0">{exercise.order}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">{exercise.title.replace(/Exercise \d+: /, "")}</p>
                  </div>
                  <DifficultyBadge difficulty={exercise.difficulty} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

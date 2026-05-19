import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { PartnersClient } from "./PartnersClient";

export default async function PartnersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [partners, exercises] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER" },
      include: {
        completions: {
          include: {
            exercise: {
              select: { id: true, title: true, difficulty: true, order: true, slug: true },
            },
          },
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exercise.findMany({ orderBy: { order: "asc" } }),
  ]);

  const totalExercises = exercises.length;

  const partnersData = partners.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    createdAt: p.createdAt.toISOString(),
    completedCount: p.completions.length,
    totalExercises,
    completionPercent: Math.round((p.completions.length / totalExercises) * 100),
    completions: p.completions.map((c) => ({
      exerciseId: c.exerciseId,
      exerciseTitle: c.exercise.title,
      exerciseDifficulty: c.exercise.difficulty,
      exerciseOrder: c.exercise.order,
      exerciseSlug: c.exercise.slug,
      completedAt: c.completedAt.toISOString(),
    })),
    incompleteExercises: exercises
      .filter((e) => !p.completions.some((c) => c.exerciseId === e.id))
      .map((e) => ({ id: e.id, title: e.title, slug: e.slug, order: e.order, difficulty: e.difficulty })),
  }));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <PartnersClient partners={partnersData} />
    </div>
  );
}

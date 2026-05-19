import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseExerciseContent } from "@/lib/exercises";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ExerciseClient } from "./ExerciseClient";

export const dynamic = "force-dynamic";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) notFound();

  const completion = await prisma.exerciseCompletion.findUnique({
    where: {
      userId_exerciseId: {
        userId: session.user.id,
        exerciseId: exercise.id,
      },
    },
  });

  const allExercises = await prisma.exercise.findMany({
    select: { id: true, slug: true, order: true, title: true },
    orderBy: { order: "asc" },
  });

  const currentIndex = allExercises.findIndex((e) => e.id === exercise.id);
  const prevExercise = currentIndex > 0 ? allExercises[currentIndex - 1] : null;
  const nextExercise = currentIndex < allExercises.length - 1 ? allExercises[currentIndex + 1] : null;

  const content = parseExerciseContent(exercise.content);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <ExerciseClient
        exercise={{
          id: exercise.id,
          slug: exercise.slug,
          title: exercise.title,
          description: exercise.description,
          difficulty: exercise.difficulty,
          order: exercise.order,
          tags: exercise.tags,
        }}
        content={content}
        isCompleted={!!completion}
        completedAt={completion?.completedAt?.toISOString() || null}
        prevExercise={prevExercise}
        nextExercise={nextExercise}
      />
    </div>
  );
}

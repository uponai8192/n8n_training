import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    include: {
      completions: {
        include: {
          exercise: {
            select: { id: true, title: true, difficulty: true, order: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalExercises = await prisma.exercise.count();

  const partnersWithStats = partners.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    createdAt: p.createdAt,
    completedCount: p.completions.length,
    totalExercises,
    completionPercent: Math.round((p.completions.length / totalExercises) * 100),
    completions: p.completions.map((c) => ({
      exerciseId: c.exerciseId,
      exerciseTitle: c.exercise.title,
      exerciseDifficulty: c.exercise.difficulty,
      exerciseOrder: c.exercise.order,
      completedAt: c.completedAt,
    })),
  }));

  return NextResponse.json(partnersWithStats);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

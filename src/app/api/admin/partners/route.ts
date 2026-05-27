import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
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

  const usersWithStats = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    completedCount: user.completions.length,
    totalExercises,
    completionPercent: Math.round((user.completions.length / totalExercises) * 100),
    completions: user.completions.map((c) => ({
      exerciseId: c.exerciseId,
      exerciseTitle: c.exercise.title,
      exerciseDifficulty: c.exercise.difficulty,
      exerciseOrder: c.exercise.order,
      completedAt: c.completedAt,
    })),
  }));

  return NextResponse.json(usersWithStats);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, role } = await req.json();
  const normalizedRole = typeof role === "string" ? role.trim().toUpperCase() : "";

  if (!id || !normalizedRole) {
    return NextResponse.json({ error: "ID and role are required." }, { status: 400 });
  }

  if (!["ADMIN", "PARTNER"].includes(normalizedRole)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (session.user.id === id && normalizedRole !== "ADMIN") {
    return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role: normalizedRole },
    select: { id: true, role: true },
  });

  return NextResponse.json({ success: true, user: updatedUser });
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

  if (session.user.id === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

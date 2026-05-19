import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { exerciseId, notes } = await req.json();

  if (!exerciseId) {
    return NextResponse.json({ error: "Exercise ID is required" }, { status: 400 });
  }

  const completion = await prisma.exerciseCompletion.upsert({
    where: {
      userId_exerciseId: {
        userId: session.user.id,
        exerciseId,
      },
    },
    create: {
      userId: session.user.id,
      exerciseId,
      notes: notes || "",
    },
    update: {
      notes: notes || "",
      completedAt: new Date(),
    },
  });

  return NextResponse.json(completion);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");

  if (!exerciseId) {
    return NextResponse.json({ error: "Exercise ID is required" }, { status: 400 });
  }

  await prisma.exerciseCompletion.deleteMany({
    where: {
      userId: session.user.id,
      exerciseId,
    },
  });

  return NextResponse.json({ success: true });
}

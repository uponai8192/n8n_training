import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false });
  }

  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite || invite.used || new Date() > invite.expiresAt) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, email: invite.email });
}

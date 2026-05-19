import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, token } = await req.json();

    if (!name || !email || !token) {
      return NextResponse.json({ error: "Name, email and invite token are required." }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.used || new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Invalid or expired invite token." }, { status: 400 });
    }

    if (invite.email && invite.email !== email.toLowerCase()) {
      return NextResponse.json({ error: "Email does not match the invite." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        role: "PARTNER",
      },
    });

    await prisma.invite.update({ where: { token }, data: { used: true } });

    // Generate a short-lived magic token for immediate auto-login
    const magicToken = crypto.randomBytes(32).toString("hex");
    await prisma.magicLink.create({
      data: {
        email: email.toLowerCase(),
        token: magicToken,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    return NextResponse.json({ success: true, magicToken });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

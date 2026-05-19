import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, token } = await req.json();

    if (!name || !email || !password || !token) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Validate invite token
    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.used || new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Invalid or expired invite token." }, { status: 400 });
    }

    // Check email matches invite (if invite has specific email)
    if (invite.email && invite.email !== email.toLowerCase()) {
      return NextResponse.json({ error: "Email does not match the invite." }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "PARTNER",
      },
    });

    // Mark invite as used
    await prisma.invite.update({
      where: { token },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

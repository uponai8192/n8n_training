import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { assertMagicLinkEmailConfig } from "@/lib/runtime-config";

async function sendInviteEmail(email: string, url: string) {
  assertMagicLinkEmailConfig();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n📨 Invite Link for ${email}:\n   ${url}\n`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@uponai.com",
    to: email,
    subject: "You're invited — N8N + UponAI",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f172a; color: #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: #f97316; border-radius: 12px; margin-bottom: 16px;">
            <span style="font-size: 28px;">⚡</span>
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">N8N + UponAI</h1>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 14px;">Exercise Platform</p>
        </div>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          You’ve been invited to join the platform. Use the button below to create your account. This invite expires in <strong style="color: #fff;">7 days</strong>.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background: #f97316; color: #fff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Accept Invite
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
          If you weren’t expecting this invite, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (result.error) {
    throw new Error(`Resend failed to send invite: ${result.error.message}`);
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.invite.create({
    data: {
      email: email.toLowerCase(),
      token,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const inviteUrl = `${baseUrl}/register?token=${invite.token}`;
  await sendInviteEmail(invite.email, inviteUrl);

  return NextResponse.json(invite);
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

  await prisma.invite.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

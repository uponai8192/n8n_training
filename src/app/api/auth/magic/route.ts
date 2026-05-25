import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  RuntimeConfigError,
  assertProductionDatabaseConfig,
  assertMagicLinkEmailConfig,
  getAppBaseUrl,
  isProduction,
} from "@/lib/runtime-config";
import crypto from "crypto";

async function sendMagicLinkEmail(email: string, url: string) {
  assertMagicLinkEmailConfig();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n🔗 Magic Link for ${email}:\n   ${url}\n`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@uponai.com",
    to: email,
    subject: "Your sign-in link — N8N + UponAI",
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
          Click the button below to sign in. This link expires in <strong style="color: #fff;">15 minutes</strong> and can only be used once.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background: #f97316; color: #fff; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px;">
            Sign in to Platform
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
          If you didn't request this link, you can safely ignore this email. Links expire automatically.
        </p>
      </div>
    `,
  });

  if (result.error) {
    throw new Error(`Resend failed to send magic link: ${result.error.message}`);
  }
}

export async function POST(req: Request) {
  try {
    assertProductionDatabaseConfig();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Ask your admin for an invite." },
        { status: 404 }
      );
    }

    // Invalidate any existing unused links for this email
    await prisma.magicLink.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.magicLink.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const baseUrl = getAppBaseUrl(req);
    const magicUrl = `${baseUrl}/auth/magic?token=${token}`;

    await sendMagicLinkEmail(normalizedEmail, magicUrl);

    const isDev = !isProduction();
    return NextResponse.json({
      success: true,
      // Return the link in dev mode so you can click it without email setup
      devLink: isDev ? magicUrl : undefined,
    });
  } catch (error) {
    if (error instanceof RuntimeConfigError) {
      console.error("Magic link configuration error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("Magic link error:", error);
    return NextResponse.json({ error: "Failed to send magic link." }, { status: 500 });
  }
}

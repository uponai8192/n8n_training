export class RuntimeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigError";
  }
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function getDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) return dbUrl;

  if (isProduction()) {
    throw new RuntimeConfigError(
      "Missing DATABASE_URL in production. Configure your Vercel project to use a real database."
    );
  }

  return "file:./dev.db";
}

export function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXTAUTH_URL;
  if (configuredUrl) return configuredUrl;

  return new URL(request.url).origin;
}

export function assertMagicLinkEmailConfig() {
  if (process.env.RESEND_API_KEY) return;

  if (isProduction()) {
    throw new RuntimeConfigError(
      "Magic link email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel."
    );
  }
}

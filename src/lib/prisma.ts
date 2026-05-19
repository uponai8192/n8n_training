import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./runtime-config";

function createPrismaClient(): PrismaClient {
  const dbUrl = getDatabaseUrl();

  // Turso / libSQL (production on Vercel)
  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  // Local SQLite file (development)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const path = require("path") as typeof import("path");
  const resolvedPath = dbUrl.replace("file:", "").replace("./", "");
  const absolutePath = resolvedPath.startsWith("/")
    ? resolvedPath
    : path.join(process.cwd(), resolvedPath);
  const adapter = new PrismaBetterSqlite3({ url: `file:${absolutePath}` });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

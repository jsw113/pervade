import { PrismaClient } from "@prisma/client";

const ACTIVE_NEON_URL = "postgresql://neondb_owner:npg_YHmgIAzS0b6L@ep-royal-rain-auhkp6ue-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

let rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || ACTIVE_NEON_URL;
// If Vercel env contains the old quota-exceeded database, automatically route to the active working database
if (rawUrl.includes("ep-blue-smoke") || !rawUrl.startsWith("postgres")) {
  rawUrl = ACTIVE_NEON_URL;
}

const DB_URL = rawUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: DB_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

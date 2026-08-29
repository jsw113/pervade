import { PrismaClient } from "@prisma/client";

function getCleanDatabaseUrl(): string | undefined {
  const defaultLiveUrl =
    "postgresql://neondb_owner:npg_zJSsy0OTRh7Y@ep-blue-smoke-au8vfowl.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

  let rawUrl =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    defaultLiveUrl;

  // Auto-route legacy quota-exceeded DB to the new active Neon DB
  if (rawUrl.includes("still-poetry") || !rawUrl) {
    rawUrl = defaultLiveUrl;
  }

  try {
    // Robust URL parsing & Direct Postgres Connection
    const parsed = new URL(rawUrl);
    parsed.hostname = parsed.hostname.replace("-pooler", "");
    parsed.searchParams.delete("channel_binding");
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
    }
    const cleaned = parsed.toString();
    process.env.DATABASE_URL = cleaned;
    return cleaned;
  } catch (e) {
    process.env.DATABASE_URL = defaultLiveUrl;
    return defaultLiveUrl;
  }
}

const cleanedUrl = getCleanDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: cleanedUrl
      ? {
          db: {
            url: cleanedUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

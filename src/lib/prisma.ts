import { PrismaClient } from "@prisma/client";

function getCleanDatabaseUrl(): string | undefined {
  const rawUrl =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED;

  if (!rawUrl) return undefined;

  try {
    // Robust URL parsing
    const parsed = new URL(rawUrl);
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
    return rawUrl;
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

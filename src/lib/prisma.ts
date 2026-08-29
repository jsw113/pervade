import { PrismaClient } from "@prisma/client";

function getCleanDatabaseUrl(): string | undefined {
  let url =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED;

  if (!url) return undefined;

  // Fix: Strip channel_binding=require which is unsupported by Prisma's Rust query engine
  let cleaned = url
    .replace(/[?&]channel_binding=require/g, "")
    .replace(/\?&/g, "?")
    .replace(/\?$/g, "");

  if (cleaned.startsWith("postgres://") || cleaned.startsWith("postgresql://")) {
    if (!cleaned.includes("sslmode=")) {
      cleaned += (cleaned.includes("?") ? "&" : "?") + "sslmode=require";
    }
    if (!cleaned.includes("connect_timeout=")) {
      cleaned += "&connect_timeout=30";
    }
    if (!cleaned.includes("pool_timeout=")) {
      cleaned += "&pool_timeout=30";
    }
  }

  // Update process.env so Prisma schema also sees the cleaned string
  process.env.DATABASE_URL = cleaned;
  return cleaned;
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

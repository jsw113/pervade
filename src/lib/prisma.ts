import { PrismaClient } from "@prisma/client";

const DB_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://neondb_owner:npg_YHmgIAzS0b6L@ep-royal-rain-auhkp6ue-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

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

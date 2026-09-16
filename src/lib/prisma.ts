import { PrismaClient } from "@prisma/client";

const DB_URL = process.env.DATABASE_URL || "postgresql://pervade_user:Pervade2026!SecureDB@49.247.200.153:5432/pervade_db?schema=public";

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

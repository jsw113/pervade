const LIVE_DB_URL =
  "postgresql://neondb_owner:npg_zJSsy0OTRh7Y@ep-blue-smoke-au8vfowl.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Overwrite process environment immediately so Prisma engine binds to the fresh database
process.env.DATABASE_URL = LIVE_DB_URL;
process.env.POSTGRES_PRISMA_URL = LIVE_DB_URL;
process.env.POSTGRES_URL = LIVE_DB_URL;
process.env.POSTGRES_URL_NON_POOLING = LIVE_DB_URL;
process.env.DATABASE_URL_UNPOOLED = LIVE_DB_URL;

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: LIVE_DB_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

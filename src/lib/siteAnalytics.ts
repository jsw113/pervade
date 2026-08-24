import { prisma } from "@/lib/prisma";

let tableEnsured = false;

export async function ensureSiteLogTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteLog" (
        "id" TEXT PRIMARY KEY,
        "path" TEXT NOT NULL,
        "referrer" TEXT,
        "device" TEXT NOT NULL DEFAULT 'Desktop',
        "browser" TEXT NOT NULL DEFAULT 'Chrome',
        "ip" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SiteLog_createdAt_idx" ON "SiteLog"("createdAt");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SiteLog_path_idx" ON "SiteLog"("path");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SiteLog_referrer_idx" ON "SiteLog"("referrer");
    `);
    tableEnsured = true;
  } catch (e) {
    // If DDL fails due to permissions, continue gracefully
    console.error("ensureSiteLogTable notice:", e);
  }
}

export async function getSafeAnalyticsSummary() {
  await ensureSiteLogTable();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [totalPageViews, todayPageViews, recentLogs] = await Promise.all([
      prisma.siteLog.count().catch(() => 0),
      prisma.siteLog.count({
        where: { createdAt: { gte: startOfToday } }
      }).catch(() => 0),
      prisma.siteLog.findMany({
        where: { createdAt: { gte: startOf7DaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 1000
      }).catch(() => [])
    ]);

    const todayLogs = recentLogs.filter(l => new Date(l.createdAt) >= startOfToday);
    const todayUniqueVisitors = new Set(todayLogs.map(l => l.ip)).size;
    const totalUniqueVisitors = new Set(recentLogs.map(l => l.ip)).size;

    return {
      totalPageViews,
      todayPageViews,
      todayUniqueVisitors,
      totalUniqueVisitors,
      todayLogs,
      recentLogs,
      isAvailable: true
    };
  } catch (error) {
    console.error("getSafeAnalyticsSummary fallback:", error);
    return {
      totalPageViews: 0,
      todayPageViews: 0,
      todayUniqueVisitors: 0,
      totalUniqueVisitors: 0,
      todayLogs: [],
      recentLogs: [],
      isAvailable: false
    };
  }
}

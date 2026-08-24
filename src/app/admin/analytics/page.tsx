import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Eye, 
  Clock, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  Activity,
  Calendar
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Total & Today stats
  const totalPageViews = await prisma.siteLog.count();
  const todayPageViews = await prisma.siteLog.count({
    where: { createdAt: { gte: startOfToday } }
  });

  // Recent 7 days logs
  const recentLogs = await prisma.siteLog.findMany({
    where: { createdAt: { gte: startOf7DaysAgo } },
    orderBy: { createdAt: "desc" },
    take: 1000
  });

  // Today's Unique Visitors (distinct IP count)
  const todayLogs = recentLogs.filter(l => new Date(l.createdAt) >= startOfToday);
  const todayUniqueVisitors = new Set(todayLogs.map(l => l.ip)).size;
  const totalUniqueVisitors = new Set(recentLogs.map(l => l.ip)).size;

  // 2. Hourly Distribution (Today)
  const hourlyCounts = Array(24).fill(0);
  todayLogs.forEach(log => {
    const hour = new Date(log.createdAt).getHours();
    hourlyCounts[hour]++;
  });
  const maxHourlyCount = Math.max(...hourlyCounts, 1);

  // 3. Top Visited Pages
  const pathMap: Record<string, number> = {};
  recentLogs.forEach(l => {
    pathMap[l.path] = (pathMap[l.path] || 0) + 1;
  });
  const topPaths = Object.entries(pathMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // 4. Inbound Channels (Referrers)
  const referrerMap: Record<string, number> = {};
  recentLogs.forEach(l => {
    const ref = l.referrer || "Direct (직접 접속)";
    referrerMap[ref] = (referrerMap[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // 5. Device Breakdown
  let mobileCount = 0;
  let desktopCount = 0;
  recentLogs.forEach(l => {
    if (l.device === "Mobile" || l.device === "Tablet") mobileCount++;
    else desktopCount++;
  });
  const totalDevices = (mobileCount + desktopCount) || 1;
  const mobilePercent = Math.round((mobileCount / totalDevices) * 100);
  const desktopPercent = 100 - mobilePercent;

  // 6. Browser Breakdown
  const browserMap: Record<string, number> = {};
  recentLogs.forEach(l => {
    browserMap[l.browser] = (browserMap[l.browser] || 0) + 1;
  });
  const topBrowsers = Object.entries(browserMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 7. Recent 30 Live Access Stream
  const liveStream = recentLogs.slice(0, 30);

  // 8. Policy configs for GA4 / Naver Analytics
  const policies = await prisma.policy.findMany();
  const ga4Id = policies.find(p => p.key === "GA4_TRACKING_ID")?.value || "";
  const naverId = policies.find(p => p.key === "NAVER_ANALYTICS_ID")?.value || "";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[11px] font-extrabold rounded-full">
              REAL-TIME WEB ANALYTICS
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              실시간 수집중
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-1">접속 로그 & 트래픽 분석</h2>
          <p className="text-xs text-zinc-500 mt-1">
            방문자 유입 경로, 인기 페이지, 디바이스 및 실시간 접속 기록을 통합 분석합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>새로고침</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>쇼핑몰 열기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold">오늘의 순 방문자 (UV)</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950">{todayUniqueVisitors.toLocaleString()}명</p>
          <div className="text-[11px] text-zinc-400 font-medium">
            최근 7일 순 방문자: <strong className="text-zinc-700">{totalUniqueVisitors.toLocaleString()}명</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold">오늘의 페이지뷰 (PV)</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950">{todayPageViews.toLocaleString()}회</p>
          <div className="text-[11px] text-zinc-400 font-medium">
            누적 총 페이지뷰: <strong className="text-zinc-700">{totalPageViews.toLocaleString()}회</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold">모바일 접속 비중</span>
            <Smartphone className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-zinc-950">{mobilePercent}%</p>
          <div className="text-[11px] text-zinc-400 font-medium">
            데스크톱: <strong className="text-zinc-700">{desktopPercent}%</strong> (모바일 최적화)
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold">주요 유입 1순위 채널</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-zinc-950 truncate">
            {topReferrers[0] ? topReferrers[0][0] : "Direct (직접 접속)"}
          </p>
          <div className="text-[11px] text-zinc-400 font-medium">
            유입 비중: <strong className="text-amber-600">{topReferrers[0] ? Math.round((topReferrers[0][1] / (recentLogs.length || 1)) * 100) : 100}%</strong>
          </div>
        </div>
      </div>

      {/* Hourly Traffic Chart (Today) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              오늘 시간대별 방문자 추이 (0시 ~ 23시)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">하루 중 고객이 가장 많이 방문하는 피크 타임을 분석합니다.</p>
          </div>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
            오늘 총 {todayLogs.length}건
          </span>
        </div>

        <div className="pt-6 pb-2">
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-40 border-b pb-2">
            {hourlyCounts.map((count, hour) => {
              const heightPercent = Math.max(8, Math.round((count / maxHourlyCount) * 100));
              return (
                <div key={hour} className="flex flex-col items-center gap-1 group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none transition-opacity z-10 whitespace-nowrap">
                    {hour}시: {count}회
                  </div>
                  <div 
                    className={`w-full rounded-t transition-all ${
                      count > 0 ? "bg-purple-600 hover:bg-purple-500" : "bg-zinc-100"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] text-zinc-400 font-bold">{hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Pages & Inbound Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Top Visited Pages */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              인기 페이지 TOP 10
            </h3>
            <span className="text-[11px] text-zinc-400 font-bold">조회수 기준</span>
          </div>

          <div className="space-y-3">
            {topPaths.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">아직 기록된 페이지 로그가 없습니다.</p>
            ) : (
              topPaths.map(([path, count], idx) => {
                const percent = Math.round((count / (recentLogs.length || 1)) * 100);
                return (
                  <div key={path} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-zinc-800 truncate flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          idx === 0 ? "bg-amber-400 text-zinc-950" : idx === 1 ? "bg-zinc-200 text-zinc-800" : idx === 2 ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {idx + 1}
                        </span>
                        <code className="text-[11px] font-mono bg-zinc-50 px-1.5 py-0.5 rounded border text-zinc-700">
                          {path === "/" ? "홈페이지 (메인)" : path}
                        </code>
                      </span>
                      <span className="text-zinc-600 font-extrabold">{count.toLocaleString()}회 ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Inbound Referrers */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              유입 경로 & 마케팅 채널
            </h3>
            <span className="text-[11px] text-zinc-400 font-bold">방문 출처</span>
          </div>

          <div className="space-y-3">
            {topReferrers.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">아직 수집된 유입 경로가 없습니다.</p>
            ) : (
              topReferrers.map(([ref, count], idx) => {
                const percent = Math.round((count / (recentLogs.length || 1)) * 100);
                return (
                  <div key={ref} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-zinc-800 truncate flex items-center gap-2">
                        <span className="text-xs">{ref.includes("Naver") ? "🟢" : ref.includes("Instagram") ? "🟣" : ref.includes("Kakao") ? "🟡" : ref.includes("Google") ? "🔵" : "🔗"}</span>
                        <span>{ref}</span>
                      </span>
                      <span className="text-zinc-600 font-extrabold">{count.toLocaleString()}회 ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Real-time Access Stream Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              실시간 접속자 실시간 로그 피드 (Recent 30)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">쇼핑몰에 접속한 고객의 방문 페이지와 브라우저 기록</p>
          </div>
          <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
            실시간 수집중
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-zinc-400 font-bold bg-zinc-50/50">
                <th className="py-2.5 px-3">접속 일시</th>
                <th className="py-2.5 px-3">방문 페이지</th>
                <th className="py-2.5 px-3">유입 채널</th>
                <th className="py-2.5 px-3">디바이스 / 브라우저</th>
                <th className="py-2.5 px-3">접속 IP (익명화)</th>
              </tr>
            </thead>
            <tbody className="divide-y text-zinc-700 font-medium">
              {liveStream.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    아직 수집된 실시간 접속 로그가 없습니다. 쇼핑몰 방문 시 자동으로 기록됩니다.
                  </td>
                </tr>
              ) : (
                liveStream.map((log) => {
                  const logDate = new Date(log.createdAt);
                  const formattedTime = `${logDate.getMonth() + 1}/${logDate.getDate()} ${String(logDate.getHours()).padStart(2, "0")}:${String(logDate.getMinutes()).padStart(2, "0")}:${String(logDate.getSeconds()).padStart(2, "0")}`;
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                        {formattedTime}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-zinc-950 max-w-[200px] truncate">
                        <Link href={log.path} target="_blank" className="hover:underline flex items-center gap-1 text-blue-600">
                          {log.path}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 max-w-[180px] truncate">
                        {log.referrer || "Direct"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mr-1.5 ${
                          log.device === "Mobile" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {log.device}
                        </span>
                        <span className="text-zinc-500 text-[11px]">{log.browser}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                        {log.ip || "127.0.***"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

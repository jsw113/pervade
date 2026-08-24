import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSiteLogTable } from "@/lib/siteAnalytics";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = (body.path || "/").slice(0, 200);
    const rawReferrer = (body.referrer || "").slice(0, 500);
    const device = (body.device || "Desktop").slice(0, 50);
    const browser = (body.browser || "Chrome").slice(0, 50);

    // Normalize referrer
    let referrer = "Direct (직접 접속)";
    if (rawReferrer) {
      if (rawReferrer.includes("naver.com") || rawReferrer.includes("search.naver.com")) {
        referrer = "Naver (네이버 검색/포털)";
      } else if (rawReferrer.includes("instagram.com")) {
        referrer = "Instagram (인스타그램)";
      } else if (rawReferrer.includes("kakao.com") || rawReferrer.includes("talk.kakao.com")) {
        referrer = "KakaoTalk (카카오톡/다음)";
      } else if (rawReferrer.includes("google.com") || rawReferrer.includes("google.co.kr")) {
        referrer = "Google (구글 검색)";
      } else if (rawReferrer.includes("youtube.com")) {
        referrer = "YouTube (유튜브)";
      } else if (rawReferrer.includes("facebook.com")) {
        referrer = "Facebook (페이스북)";
      } else if (rawReferrer.includes("pervade.co.kr")) {
        referrer = "Internal (사이트 내부 탐색)";
      } else {
        try {
          const url = new URL(rawReferrer);
          referrer = url.hostname;
        } catch {
          referrer = rawReferrer.slice(0, 100);
        }
      }
    }

    // Get anonymized client IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = (request.headers.get("user-agent") || "").slice(0, 250);

    // Don't log admin backoffice page views as customer traffic
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    await ensureSiteLogTable().catch(() => {});

    await prisma.siteLog.create({
      data: {
        path,
        referrer,
        device,
        browser,
        ip: ip ? ip.replace(/\.\d+$/, ".***") : "Anonymous",
        userAgent,
      }
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics log error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

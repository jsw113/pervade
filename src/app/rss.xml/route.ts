import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pervade.co.kr";

  try {
    const [guides, posts] = await Promise.all([
      prisma.guidePost.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    const escapeXml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const guideItems = guides
      .map((g) => {
        return `
    <item>
      <title>${escapeXml(g.title)}</title>
      <link>${baseUrl}/guide/${g.id}</link>
      <guid isPermaLink="true">${baseUrl}/guide/${g.id}</guid>
      <description>${escapeXml(g.summary || g.content.substring(0, 200))}</description>
      <category>${escapeXml(g.category || "사용가이드")}</category>
      <pubDate>${new Date(g.createdAt).toUTCString()}</pubDate>
    </item>`;
      })
      .join("");

    const postItems = posts
      .map((p) => {
        const link = p.type === "ABOUT" ? `${baseUrl}/about` : `${baseUrl}/journal/${p.id}`;
        return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(p.content.substring(0, 200))}</description>
      <category>${escapeXml(p.type === "ABOUT" ? "브랜드스토리" : "저널")}</category>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
    </item>`;
      })
      .join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PERVADE | 프리미엄 라이프스타일 &amp; 홈케어 저널</title>
    <link>${baseUrl}</link>
    <description>퍼베이드(PERVADE)의 브랜드 스토리, 공간별 클리닝 가이드 및 라이프스타일 큐레이션</description>
    <language>ko-KR</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${guideItems}
    ${postItems}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}

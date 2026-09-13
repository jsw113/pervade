import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPostsTable } from "@/components/admin/AdminPostsTable";
import { sortPinnableContents } from "@/lib/contentSort";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const resolved = await searchParams;
  const rawType = resolved?.type?.toUpperCase();
  const validTypes = ["ABOUT", "JOURNAL", "NOTICE", "GUIDE"];
  const activeType = validTypes.includes(rawType || "") ? (rawType as string) : "ABOUT";

  // Fetch counts
  const [aboutCount, journalCount, noticeCount, guideCount] = await Promise.all([
    prisma.post.count({ where: { type: "ABOUT" } }),
    prisma.post.count({ where: { type: "JOURNAL" } }),
    prisma.post.count({ where: { type: "NOTICE" } }),
    prisma.guidePost.count(),
  ]);

  let posts: any[] = [];
  let guides: any[] = [];

  if (activeType === "GUIDE") {
    const rawGuides = await prisma.guidePost.findMany({
      orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    });
    guides = sortPinnableContents(rawGuides);
  } else {
    const rawPosts = await prisma.post.findMany({
      where: { type: activeType },
      orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: { author: true }
    });
    posts = sortPinnableContents(rawPosts);
  }

  const createHref = activeType === "GUIDE"
    ? "/admin/guides/new?returnType=GUIDE"
    : `/admin/posts/new?type=${activeType}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950">CONTENTS 관리 (CMS)</h2>
          <p className="text-xs text-zinc-500 mt-1">
            브랜드 스토리(/about), 저널 블로그, 공지/뉴스 및 사용 가이드의 노출 순서와 1순위 상단 고정(기간 설정)을 통합 관리합니다.
          </p>
        </div>
        <Link 
          href={createHref} 
          className="flex items-center gap-2 bg-zinc-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {activeType === "GUIDE" ? "새 가이드 아티클 작성" : "새 콘텐츠 작성하기"}
        </Link>
      </div>

      {/* Interactive Table with Category Tabs & Pin & Reorder */}
      <AdminPostsTable
        initialPosts={posts}
        initialGuides={guides}
        activeType={activeType}
        counts={{
          about: aboutCount,
          journal: journalCount,
          notice: noticeCount,
          guide: guideCount,
        }}
      />
    </div>
  );
}


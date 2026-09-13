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
  const type = resolved?.type;

  const where: any = {};
  if (type && type !== "ALL") {
    where.type = type;
  }

  const rawPosts = await prisma.post.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    include: { author: true }
  });

  const posts = sortPinnableContents(rawPosts);

  const totalAllCount = await prisma.post.count();
  const aboutCount = await prisma.post.count({ where: { type: "ABOUT" } });
  const journalCount = await prisma.post.count({ where: { type: "JOURNAL" } });
  const noticeCount = await prisma.post.count({ where: { type: "NOTICE" } });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950">브랜드 스토리 &amp; 저널 블로그 관리 (CMS)</h2>
          <p className="text-xs text-zinc-500 mt-1">
            쇼핑몰의 브랜드 스토리(/about), 저널 및 공지/뉴스 아티클의 노출 순서를 자유롭게 조정하고 1순위 상단 고정(기간 설정)을 관리합니다.
          </p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="flex items-center gap-2 bg-zinc-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          새 콘텐츠 작성하기
        </Link>
      </div>

      {/* Interactive Table with Pin & Reorder */}
      <AdminPostsTable
        initialPosts={posts as any}
        typeFilter={type || "ALL"}
        counts={{
          all: totalAllCount,
          about: aboutCount,
          journal: journalCount,
          notice: noticeCount,
        }}
      />
    </div>
  );
}


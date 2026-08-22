import Link from "next/link";
import { Plus, Edit, FileText, Sparkles, BookOpen, Eye, EyeOff, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  const where: any = {};
  if (type && type !== "ALL") {
    where.type = type;
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

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
            쇼핑몰의 브랜드 스토리(/about), 저널 및 매거진 블로그 아티클을 손쉽게 발행하고 수정·관리합니다.
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

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "전체 콘텐츠", val: "ALL", count: totalAllCount },
          { label: "브랜드 스토리 (About)", val: "ABOUT", count: aboutCount },
          { label: "저널 / 매거진 블로그 (Journal)", val: "JOURNAL", count: journalCount },
          { label: "공지 & 뉴스 (Notice)", val: "NOTICE", count: noticeCount },
        ].map((tab) => {
          const isActive = (type || "ALL") === tab.val;
          return (
            <Link
              key={tab.val}
              href={tab.val === "ALL" ? "/admin/posts" : `/admin/posts?type=${tab.val}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-6 py-3.5">콘텐츠 제목 &amp; 요약</th>
                <th className="px-6 py-3.5">분류 / 채널</th>
                <th className="px-6 py-3.5">발행 상태</th>
                <th className="px-6 py-3.5">작성일</th>
                <th className="px-6 py-3.5 text-right">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    등록된 콘텐츠가 없습니다. 상단 버튼을 눌러 새 글을 작성해보세요.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-bold text-sm text-zinc-900 line-clamp-1">{post.title}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-mono">
                        {post.content.substring(0, 100)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        post.type === "ABOUT"
                          ? "bg-amber-100 text-amber-900"
                          : post.type === "JOURNAL"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-zinc-100 text-zinc-800"
                      }`}>
                        {post.type === "ABOUT" ? "브랜드 스토리" : post.type === "JOURNAL" ? "저널 블로그" : post.type === "NOTICE" ? "공지사항" : post.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        post.published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {post.published ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-amber-600" />}
                        {post.published ? '공개 발행' : '임시저장 (비공개)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-[11px]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/posts/${post.id}/edit`} 
                        className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors inline-block shadow-2xs"
                      >
                        수정하기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

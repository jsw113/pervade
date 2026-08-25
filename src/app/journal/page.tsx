import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { DEFAULT_JOURNAL_POSTS, EditorialPost } from "@/lib/defaultEditorialContent";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "퍼베이드 저널 | PERVADE Journal",
  description: "공간의 가치를 높이는 감각적인 클리닝 팁과 라이프스타일 영감의 이야기",
  openGraph: {
    title: "퍼베이드 저널 | PERVADE Journal",
    description: "공간의 가치를 높이는 감각적인 클리닝 팁과 라이프스타일 영감의 이야기",
    url: "https://www.pervade.co.kr/journal",
    images: [{ url: "https://www.pervade.co.kr/og-image.jpg", width: 1200, height: 630 }],
  }
};

export default async function JournalPage() {
  const dbPosts = await prisma.post.findMany({
    where: { type: "JOURNAL", published: true },
    orderBy: { createdAt: "desc" },
  });

  const posts: EditorialPost[] = dbPosts.length > 0 ? dbPosts : DEFAULT_JOURNAL_POSTS;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full">
          <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
          Living Journal &amp; Editorial
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
          퍼베이드 저널 &amp; 라이프스타일
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          공간의 가치를 높이는 감각적인 클리닝 팁과 자연 유래 안심 포뮬러 이야기
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const formattedDate = new Date(post.createdAt).toLocaleDateString();
          const cleanExcerpt = post.content.replace(/[#*`]/g, "").slice(0, 100);

          return (
            <article 
              key={post.id} 
              className="group bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl hover:border-zinc-950 transition-all flex flex-col justify-between"
            >
              <div className="aspect-[16/10] bg-zinc-900 flex flex-col items-center justify-center p-6 text-center text-white relative group-hover:bg-zinc-800 transition-colors">
                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest uppercase mb-2">
                  PERVADE Editorial
                </span>
                <span className="text-sm font-extrabold line-clamp-2 px-2">{post.title}</span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <time className="text-[11px] text-zinc-400 font-mono block">
                    {formattedDate}
                  </time>
                  <h2 className="font-extrabold text-base text-zinc-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                    {cleanExcerpt}...
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <Link 
                    href={`/journal/${post.id}`} 
                    className="text-xs font-bold text-zinc-900 group-hover:text-amber-700 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-all"
                  >
                    아티클 전문 읽기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

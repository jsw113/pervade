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

  const defaultImages = [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop"
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 space-y-12 sm:space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-200/70 pb-6 gap-4">
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase block">
            PERVADE JOURNAL
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-950 tracking-tight">
            JOURNAL
          </h1>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          TOTAL <span className="text-zinc-900 font-bold">{posts.length}</span> ARTICLES
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
        {posts.map((post, idx) => {
          const formattedDate = new Date(post.createdAt).toLocaleDateString();
          const cleanExcerpt = post.content.replace(/[#*`]/g, "").slice(0, 120);
          const imgUrl = post.imageUrl || defaultImages[idx % defaultImages.length];

          return (
            <article 
              key={post.id} 
              className="group flex flex-col justify-between space-y-5"
            >
              <Link href={`/journal/${post.id}`} className="block space-y-5">
                {/* Sharp Editorial Image */}
                <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative">
                  <img
                    src={imgUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2.5">
                  <time className="text-xs text-zinc-400 font-mono tracking-wider block">
                    {formattedDate} · JOURNAL
                  </time>
                  <h2 className="font-serif font-normal text-xl sm:text-2xl text-zinc-950 group-hover:text-zinc-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-zinc-500 font-light line-clamp-2 leading-relaxed">
                    {cleanExcerpt}
                  </p>
                </div>
              </Link>

              <div className="pt-1">
                <Link 
                  href={`/journal/${post.id}`} 
                  className="text-xs font-semibold tracking-wider uppercase text-zinc-900 group-hover:text-zinc-500 inline-flex items-center gap-1.5 transition-colors"
                >
                  아티클 읽기
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, ArrowRight, ShoppingBag } from "lucide-react";
import { ShareButtons } from "@/components/common/ShareButtons";
import { DEFAULT_JOURNAL_POSTS, EditorialPost } from "@/lib/defaultEditorialContent";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let post: any = await prisma.post.findFirst({
    where: { id }
  }).catch(() => null);

  if (!post) {
    post = DEFAULT_JOURNAL_POSTS.find((p) => p.id === id) || null;
  }

  if (!post) return { title: "저널 아티클 | PERVADE" };

  return {
    title: `${post.title} | PERVADE Journal`,
    description: post.content.replace(/[#*`]/g, "").slice(0, 120),
    openGraph: {
      title: `${post.title} | PERVADE Journal`,
      description: post.content.replace(/[#*`]/g, "").slice(0, 120),
      url: `https://www.pervade.co.kr/journal/${id}`,
      images: [{ url: post.imageUrl || "https://www.pervade.co.kr/og-image.jpg", width: 1200, height: 630 }],
    }
  };
}

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let post: any = await prisma.post.findFirst({
    where: { id }
  });

  if (!post) {
    post = DEFAULT_JOURNAL_POSTS.find((p) => p.id === id) || null;
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-2xl font-bold text-zinc-950">아티클을 찾을 수 없습니다</h1>
        <p className="text-xs text-zinc-500">삭제되었거나 이동된 콘텐츠입니다.</p>
        <Link 
          href="/journal" 
          className="inline-block px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const defaultFallbackImages = [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop"
  ];

  const articleImage = post.imageUrl || defaultFallbackImages[0];
  const typeLabel = post.type === "ABOUT" ? "BRAND STORY" : post.type === "NOTICE" ? "NEWS" : "JOURNAL";

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl space-y-8">
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
        <Link 
          href="/journal" 
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 목록으로 돌아가기
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          PERVADE {typeLabel}
        </span>
      </div>
      
      {/* Two Column Magazine Layout */}
      <article className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image (Sticky on Desktop) */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200/80 shadow-md">
              <img
                src={articleImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Article Flows Beside the Image */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3 border-b border-zinc-100 pb-6">
              <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
                PERVADE {typeLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-tight text-zinc-950 leading-tight break-keep">
                {post.title}
              </h1>
              <time className="text-xs text-zinc-400 block font-mono pt-1">
                발행일: {new Date(post.createdAt).toLocaleDateString()} · PERVADE Editorial
              </time>
            </div>

            {/* Content Body */}
            <div className="whitespace-pre-wrap leading-relaxed sm:leading-loose text-zinc-700 text-sm sm:text-base font-light font-sans space-y-4 pt-2">
              {post.content}
            </div>

            {/* CTA to Shop */}
            <div className="pt-6 border-t border-zinc-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 text-white p-6 rounded-2xl shadow-sm">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h4 className="font-bold text-sm text-white">퍼베이드의 프리미엄 세정 제품을 만나보세요</h4>
                  <p className="text-xs text-zinc-400">일상의 공간을 안전하고 감각적으로 가꿔주는 친환경 포뮬러</p>
                </div>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 bg-white text-zinc-950 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  상품 보러가기
                </Link>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="pt-4 border-t border-zinc-100">
              <ShareButtons 
                title={post.title}
                description={post.content.replace(/[#*`]/g, "").slice(0, 100)}
              />
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}

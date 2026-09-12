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
    <div className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl space-y-10">
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between pb-4">
        <Link 
          href="/journal" 
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-950 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 목록으로 돌아가기
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          PERVADE {typeLabel}
        </span>
      </div>
      
      {/* Pure Editorial 2-Column Layout without Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* Left Column: Clean Image */}
        <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
          <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
            <img
              src={articleImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Article Flows Beside the Image */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2 pb-6">
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

          {/* Bottom Right Subtle Product Link */}
          <div className="pt-6 flex justify-end">
            <Link
              href="/shop"
              className="text-sm font-semibold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors inline-flex items-center gap-1 group"
            >
              관련제품
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Social Share (Minimalist Grey Text) */}
          <div className="pt-4">
            <ShareButtons 
              title={post.title}
              description={post.content.replace(/[#*`]/g, "").slice(0, 100)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

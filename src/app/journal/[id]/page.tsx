import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, ArrowRight, ShoppingBag } from "lucide-react";
import { ShareButtons } from "@/components/common/ShareButtons";
import { DEFAULT_JOURNAL_POSTS, EditorialPost } from "@/lib/defaultEditorialContent";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let post: EditorialPost | null = await prisma.post.findFirst({
    where: { id, type: "JOURNAL" }
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
      images: [{ url: "https://www.pervade.co.kr/og-image.jpg", width: 1200, height: 630 }],
    }
  };
}

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let post: EditorialPost | null = await prisma.post.findFirst({
    where: { id, type: "JOURNAL" }
  });

  if (!post) {
    post = DEFAULT_JOURNAL_POSTS.find((p) => p.id === id) || null;
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-2xl font-bold text-zinc-950">저널 아티클을 찾을 수 없습니다</h1>
        <p className="text-xs text-zinc-500">삭제되었거나 이동된 저널 아티클입니다.</p>
        <Link 
          href="/journal" 
          className="inline-block px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
        >
          저널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl space-y-8">
      <Link 
        href="/journal" 
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 text-xs font-bold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> 저널 목록 전체보기
      </Link>
      
      <article className="bg-white rounded-3xl border p-8 sm:p-12 shadow-xs space-y-8">
        <div className="space-y-3 border-b pb-6">
          <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
            PERVADE Living Journal
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 leading-tight">
            {post.title}
          </h1>
          <time className="text-xs text-zinc-400 block font-mono">
            발행일: {new Date(post.createdAt).toLocaleDateString()} · PERVADE Editorial
          </time>
        </div>

        <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 text-sm sm:text-base space-y-4 font-sans">
          {post.content}
        </div>

        {/* CTA to Shop & Guide */}
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 text-white p-6 rounded-2xl">
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

        {/* Social Share Buttons */}
        <div className="pt-4 border-t">
          <ShareButtons 
            title={post.title}
            description={post.content.replace(/[#*`]/g, "").slice(0, 100)}
          />
        </div>
      </article>
    </div>
  );
}

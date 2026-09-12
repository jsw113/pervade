import { prisma } from "@/lib/prisma";
import { ShareButtons } from "@/components/common/ShareButtons";
import { DEFAULT_BRAND_STORY } from "@/lib/defaultEditorialContent";
import { Sparkles, ShieldCheck, Leaf, Award, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "브랜드 스토리 | PERVADE (퍼베이드)",
  description: "퍼베이드가 만들어가는 새로운 일상의 기준과 친환경 클리닝 철학",
  openGraph: {
    title: "브랜드 스토리 | PERVADE (퍼베이드)",
    description: "자연과 공간, 사람을 잇는 지속 가능한 프리미엄 클리닝 솔루션",
    url: "https://www.pervade.co.kr/about",
    images: [{ url: "https://www.pervade.co.kr/og-image.jpg", width: 1200, height: 630 }],
  }
};

export default async function AboutPage() {
  let dbPosts: any[] = [];
  try {
    dbPosts = await prisma.post.findMany({
      where: { type: "ABOUT", published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    dbPosts = [];
  }

  const posts = dbPosts.length > 0 ? dbPosts : [DEFAULT_BRAND_STORY];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5" />
          Brand Story &amp; Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950">
          공간의 질서와 호흡을 바꾸는<br/>
          프리미엄 클리닝의 시작
        </h1>
        <p className="text-zinc-500 text-sm sm:text-base font-normal">
          자연과 사람, 공간을 잇는 지속 가능한 클린 라이프스타일 솔루션
        </p>
      </div>

      {/* Main Story Content */}
      <div className="space-y-12">
        {posts.map((post, idx) => {
          const defaultImages = [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop"
          ];
          const imgUrl = post.imageUrl || defaultImages[idx % defaultImages.length];

          return (
            <article key={post.id} className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs p-6 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Left Column: Image */}
                <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200/80 shadow-md">
                    <img
                      src={imgUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Column: Article Text */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="border-b border-zinc-100 pb-6 space-y-2">
                    <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
                      BRAND STORY
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-zinc-950 leading-tight break-keep">
                      {post.title}
                    </h2>
                    <time className="text-xs text-zinc-400 block font-mono pt-1">
                      발행일: {new Date(post.createdAt).toLocaleDateString()} · PERVADE Brand Editorial
                    </time>
                  </div>

                  {/* Editorial Body */}
                  <div className="whitespace-pre-wrap leading-relaxed sm:leading-loose text-zinc-700 text-sm sm:text-base font-light font-sans space-y-4">
                    {post.content}
                  </div>

                  {/* 3 Core Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-zinc-100">
                    <div className="p-4 rounded-xl bg-zinc-50 border text-center space-y-1">
                      <ShieldCheck className="w-5 h-5 text-zinc-900 mx-auto" />
                      <span className="text-xl font-bold text-zinc-950 block">99.9%</span>
                      <p className="text-[10px] text-zinc-500 font-medium">항균 시험 완료</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 border text-center space-y-1">
                      <Award className="w-5 h-5 text-amber-600 mx-auto" />
                      <span className="text-xl font-bold text-amber-600 block">0.00</span>
                      <p className="text-[10px] text-zinc-500 font-medium">피부 무자극 판정</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 border text-center space-y-1">
                      <Leaf className="w-5 h-5 text-emerald-600 mx-auto" />
                      <span className="text-xl font-bold text-emerald-600 block">100%</span>
                      <p className="text-[10px] text-zinc-500 font-medium">생분해성 포뮬러</p>
                    </div>
                  </div>

                  {/* CTA to Shop */}
                  <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 text-white p-6 rounded-2xl shadow-sm">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <h4 className="font-bold text-sm text-white">퍼베이드의 프리미엄 세정 라인을 직접 만나보세요</h4>
                      <p className="text-xs text-zinc-400">다목적 올인원 세정제부터 공간별 전문 케어 솔루션까지</p>
                    </div>
                    <Link
                      href="/shop"
                      className="px-5 py-2.5 bg-white text-zinc-950 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                    >
                      스토어 바로가기
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            </article>
          );
        })}

        {/* Social Share Buttons */}
        <div className="pt-4">
          <ShareButtons 
            title="PERVADE 브랜드 스토리 | 프리미엄 다목적 세정제"
            description="퍼베이드가 만들어가는 새로운 일상의 기준과 친환경 클리닝 철학"
          />
        </div>
      </div>
    </div>
  );
}

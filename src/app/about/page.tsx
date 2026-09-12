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
      <div className="space-y-16">
        {posts.map((post, idx) => {
          const defaultImages = [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop"
          ];
          const imgUrl = post.imageUrl || defaultImages[idx % defaultImages.length];

          return (
            <article key={post.id} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                
                {/* Left Column: Image */}
                <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
                  <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                    <img
                      src={imgUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Column: Article Text */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="border-b border-zinc-200/60 pb-6 space-y-2">
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

                  {/* Bottom Right Product Link */}
                  <div className="pt-6 flex justify-end">
                    <Link
                      href="/shop"
                      className="text-sm font-semibold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors inline-flex items-center gap-1 group"
                    >
                      관련제품
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

              </div>
            </article>
          );
        })}

        {/* Social Share Buttons */}
        <div className="pt-6 border-t border-zinc-200/60">
          <ShareButtons 
            title="PERVADE 브랜드 스토리 | 프리미엄 다목적 세정제"
            description="퍼베이드가 만들어가는 새로운 일상의 기준과 친환경 클리닝 철학"
          />
        </div>
      </div>
    </div>
  );
}

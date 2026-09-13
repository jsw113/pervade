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
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 space-y-12 sm:space-y-16">
      {/* Clean Luxury Header (Matching PRODUCTS / JOURNAL) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200/70 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-950 tracking-tight uppercase">
            BRAND STORY
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link 
            href="/" 
            className="text-xs font-mono tracking-wider uppercase text-zinc-400 hover:text-zinc-950 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> HOME
          </Link>
        </div>
      </div>

      {/* Main Story Content */}
      <div className="space-y-24">
        {posts.map((post, idx) => {
          const defaultImages = [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop"
          ];
          const imgUrl = post.imageUrl || defaultImages[idx % defaultImages.length];

          return (
            <article key={post.id} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-start">
                
                {/* Left Column: Sharp Image */}
                <div className="lg:col-span-6 w-full lg:sticky lg:top-24">
                  <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-zinc-100">
                    <img
                      src={imgUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Column: Article Text */}
                <div className="lg:col-span-6 space-y-8">
                  <div className="pb-6 space-y-3 border-b border-zinc-200/60">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-light text-zinc-950 leading-tight break-keep">
                      {post.title}
                    </h1>
                    <time className="text-xs text-zinc-400 block font-mono pt-1 tracking-wider">
                      발행일: {new Date(post.createdAt).toLocaleDateString()} · PERVADE Brand Story
                    </time>
                  </div>

                  {/* Editorial Body */}
                  <div className="whitespace-pre-wrap leading-relaxed sm:leading-loose text-zinc-700 text-sm sm:text-base font-light font-sans space-y-6">
                    {post.content}
                  </div>

                  {/* Bottom Right Product Link */}
                  <div className="pt-6 flex justify-end">
                    <Link
                      href="/shop"
                      className="text-xs font-semibold tracking-wider uppercase text-zinc-900 hover:text-zinc-500 transition-colors inline-flex items-center gap-1 group"
                    >
                      관련제품보기
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="pt-4 border-t border-zinc-200/60">
                    <ShareButtons 
                      title={post.title}
                      description={post.content.replace(/[#*`]/g, "").slice(0, 100)}
                    />
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

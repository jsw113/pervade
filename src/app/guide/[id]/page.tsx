import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, ShieldCheck, Eye, ArrowRight, ShoppingCart } from "lucide-react";
import { ShareButtons } from "@/components/common/ShareButtons";
import { GuideProductQuickBuy } from "@/components/shop/GuideProductQuickBuy";

export const dynamic = "force-dynamic";

export default async function GuideDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // Increment viewCount
  const guide = await prisma.guidePost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      product: true
    }
  }).catch(() => null);

  if (!guide || !guide.published) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-2xl font-bold">가이드를 찾을 수 없습니다</h1>
        <Link href="/guide" className="text-xs font-bold underline text-zinc-900">
          사용 가이드 허브로 돌아가기
        </Link>
      </div>
    );
  }

  // Fetch related guides in same category
  const relatedGuides = await prisma.guidePost.findMany({
    where: {
      id: { not: id },
      published: true,
      category: guide.category
    },
    take: 2,
    orderBy: { createdAt: "desc" }
  });

  // Helper: split content by headings if formatted with ###
  const sections = guide.content.split(/(?=### )/g);

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl space-y-10">
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between pb-4">
        <Link 
          href="/guide" 
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-950 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 가이드 목록으로 돌아가기
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          PERVADE GUIDE · {guide.category}
        </span>
      </div>

      {/* Pure Editorial 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Left Column: Sharp Image */}
        <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
          <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
            {guide.thumbnailUrl ? (
              <img 
                src={guide.thumbnailUrl} 
                alt={guide.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                <BookOpen className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Guide Content Flows Beside Image */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2 pb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light tracking-tight text-zinc-950 leading-tight break-keep">
              {guide.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono pt-1">
              <span>발행일: {new Date(guide.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span>{guide.category} 케어 가이드</span>
            </div>
          </div>

          {guide.summary && (
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
              {guide.summary}
            </p>
          )}

          {/* Step-by-step Clean Content */}
          <div className="space-y-8 text-zinc-700 font-light text-sm sm:text-base leading-relaxed">
            {sections.map((sec, idx) => {
              const isStep = sec.trim().startsWith("### ");
              if (isStep) {
                const lines = sec.trim().split("\n");
                const stepTitle = lines[0].replace("### ", "");
                const stepBody = lines.slice(1).join("\n");

                return (
                  <div key={idx} className="space-y-2">
                    <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">0{idx + 1}.</span>
                      {stepTitle}
                    </h2>
                    <p className="whitespace-pre-line leading-relaxed text-zinc-700">
                      {stepBody}
                    </p>
                  </div>
                );
              }

              return (
                <div key={idx} className="whitespace-pre-line leading-relaxed">
                  {sec}
                </div>
              );
            })}
          </div>

          {/* Pro Tips as Clean Section */}
          {guide.tips && (
            <div className="pt-6 space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                PRO TIPS &amp; CARE NOTE
              </h3>
              <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed font-light">
                {guide.tips}
              </p>
            </div>
          )}

          {/* Bottom Right Product Link */}
          <div className="pt-6 flex justify-end">
            <Link
              href={guide.productId ? `/shop/${guide.productId}` : "/shop"}
              className="text-xs font-semibold tracking-wider uppercase text-zinc-900 hover:text-zinc-500 transition-colors inline-flex items-center gap-1 group"
            >
              관련제품보기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-4">
            <ShareButtons 
              title={guide.title}
              description={guide.summary || guide.content.substring(0, 100)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

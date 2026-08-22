import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, ShieldCheck, Eye, ArrowRight, ShoppingCart } from "lucide-react";
import { ShareButtons } from "@/components/common/ShareButtons";

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
    <article className="container mx-auto px-4 py-12 max-w-4xl min-h-[80vh]">
      {/* Back Button */}
      <Link 
        href="/guide" 
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 text-xs font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 사용가이드 목록으로 돌아가기
      </Link>

      {/* Header Info */}
      <header className="space-y-4 border-b pb-8 mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-xs font-bold">
            {guide.category}
          </span>
          {guide.product && (
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {guide.product.name} 추천 가이드
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-950 leading-tight">
          {guide.title}
        </h1>

        {guide.summary && (
          <p className="text-base text-zinc-600 leading-relaxed font-normal bg-zinc-50 p-4 rounded-2xl border">
            {guide.summary}
          </p>
        )}

        <div className="flex justify-between items-center text-xs text-zinc-400 pt-2">
          <div className="flex items-center gap-4">
            <span>발행일: {new Date(guide.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {guide.viewCount}회 조회
            </span>
          </div>
          <span className="font-semibold text-zinc-600">PERVADE Clean Lab</span>
        </div>
      </header>

      {/* Main Cover Image */}
      {guide.thumbnailUrl && (
        <div className="rounded-3xl overflow-hidden shadow-md mb-12 aspect-[16/9] bg-zinc-100 border">
          <img 
            src={guide.thumbnailUrl} 
            alt={guide.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Body */}
      <div className="space-y-8 text-zinc-800 leading-relaxed">
        {sections.map((sec, idx) => {
          const isStep = sec.trim().startsWith("### ");
          if (isStep) {
            const lines = sec.trim().split("\n");
            const stepTitle = lines[0].replace("### ", "");
            const stepBody = lines.slice(1).join("\n");

            return (
              <div key={idx} className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900">{stepTitle}</h2>
                </div>
                <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed pt-1">
                  {stepBody}
                </p>
              </div>
            );
          }

          return (
            <div key={idx} className="prose prose-zinc max-w-none text-sm leading-relaxed whitespace-pre-line">
              {sec}
            </div>
          );
        })}
      </div>

      {/* Pro Tips Alert Box */}
      {guide.tips && (
        <div className="mt-12 bg-amber-50/80 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>전문가 Pro Tips & 안심 케어 노하우</span>
          </div>
          <p className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
            {guide.tips}
          </p>
        </div>
      )}

      {/* Social Share Buttons */}
      <div className="mt-8 mb-8">
        <ShareButtons 
          title={guide.title}
          description={guide.summary || guide.content.substring(0, 100)}
        />
      </div>

      {/* Connected Product Purchase Card */}
      {guide.product && (
        <div className="mt-8 bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shrink-0 border border-zinc-800 p-1">
              <img 
                src={guide.product.imageUrl} 
                alt={guide.product.name} 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">이 가이드에 사용된 추천 제품</span>
              <h3 className="font-bold text-lg text-white">{guide.product.name}</h3>
              <p className="text-xs text-zinc-400">
                ₩{guide.product.price.toLocaleString()}원
              </p>
            </div>
          </div>

          <Link
            href={`/shop/${guide.product.id}`}
            className="px-6 py-3.5 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 shrink-0 shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            상품 바로 구매하기
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <div className="mt-16 pt-12 border-t space-y-6">
          <h3 className="text-xl font-bold text-zinc-950">관련 공간 세정 가이드</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedGuides.map((rg) => (
              <Link
                key={rg.id}
                href={`/guide/${rg.id}`}
                className="group p-5 border rounded-2xl bg-zinc-50 hover:bg-white hover:shadow-md transition-all flex gap-4 items-center"
              >
                {rg.thumbnailUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-200">
                    <img src={rg.thumbnailUrl} alt={rg.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400">{rg.category}</span>
                  <h4 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 line-clamp-1">
                    {rg.title}
                  </h4>
                  <p className="text-xs text-zinc-500 line-clamp-1">{rg.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MessageCircle, Star, Sparkles, ShieldCheck, FileText, Info, ChevronRight, Tag, BookOpen, ArrowRight } from "lucide-react";
import { ProductPurchasePanel } from "@/components/shop/ProductPurchasePanel";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ShareButtons } from "@/components/common/ShareButtons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } }).catch(() => null);
  if (!product) return { title: "상품 상세 | PERVADE" };

  const title = `${product.name} | PERVADE`;
  const description = product.description || "퍼베이드 프리미엄 다목적 세정제 & 공간 케어 솔루션";
  const image = product.imageUrl || "https://www.pervade.co.kr/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.pervade.co.kr/shop/${id}`,
      siteName: "PERVADE (퍼베이드)",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  if (!product || !product.isVisible) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mb-8">존재하지 않거나 판매가 중단된 상품입니다.</p>
        <Link href="/shop" className="text-sm font-semibold underline">
          상품 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // Fetch Related Cleaning Guides
  const relatedGuides = await prisma.guidePost.findMany({
    where: {
      published: true,
      OR: [
        { productId: product.id },
        { category: product.category || "주방" }
      ]
    },
    take: 2,
    orderBy: { createdAt: "desc" }
  });

  // Parse multi images array
  let galleryImages: string[] = [];
  try {
    if (product.images) {
      galleryImages = JSON.parse(product.images);
    }
  } catch (e) {
    galleryImages = [];
  }
  if (galleryImages.length === 0 && product.imageUrl) {
    galleryImages = [product.imageUrl];
  }

  // Parse detail images array
  let detailImages: string[] = [];
  try {
    if (product.detailImages) {
      detailImages = JSON.parse(product.detailImages);
    }
  } catch (e) {
    detailImages = [];
  }

  // Fetch live shipping policy
  const policies = await prisma.policy.findMany();
  const shippingNotice = policies.find(p => p.key === "SHIPPING_NOTICE")?.value || 
    "· 배송 방법: CJ대한통운 (주문 후 1~2일 내 출고)\n· 배송비: 3,000원 (30,000원 이상 구매 시 무료배송)\n· 제주/도서산간 지역은 추가 배송비 3,000원이 부과됩니다.\n· 교환 및 반품은 수령 후 7일 이내 고객센터를 통해 신청 가능합니다.";

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1) 
    : "5.0";

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-12">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/shop" className="hover:text-zinc-950 flex items-center gap-1 font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> 스토어 전체
        </Link>
        <ChevronRight className="w-3 h-3 text-zinc-300" />
        <span className="font-semibold text-zinc-800">{product.category || "다목적 세정제"}</span>
        <ChevronRight className="w-3 h-3 text-zinc-300" />
        <span className="text-zinc-400 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Top Section: Gallery (Left) + Purchase Panel (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <ProductGallery images={galleryImages} productName={product.name} />
          
          {/* Social Share Buttons */}
          <div className="pt-2">
            <ShareButtons 
              title={product.name}
              description={product.description || `${product.name} - 프리미엄 세정제 퍼베이드`}
            />
          </div>
        </div>

        {/* Right: Purchase & Options Panel */}
        <div className="space-y-6">
          <ProductPurchasePanel product={product} />
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="border-t pt-10">
        <div className="flex border-b border-zinc-200 text-sm font-bold text-zinc-500 overflow-x-auto">
          <a href="#details" className="px-6 py-3 border-b-2 border-zinc-950 text-zinc-950 whitespace-nowrap">
            상세정보
          </a>
          <a href="#reviews" className="px-6 py-3 hover:text-zinc-950 transition-colors whitespace-nowrap">
            구매후기 ({reviewCount})
          </a>
          <a href="#guide" className="px-6 py-3 hover:text-zinc-950 transition-colors whitespace-nowrap">
            사용가이드
          </a>
          <a href="#shipping" className="px-6 py-3 hover:text-zinc-950 transition-colors whitespace-nowrap">
            배송/교환/반품
          </a>
        </div>
      </div>

      {/* Main Bottom Content Container */}
      <div className="space-y-16">
        
        {/* 1. Detail Content Area */}
        <div id="details" className="max-w-3xl mx-auto space-y-8">
          
          {/* Rich HTML Content */}
          {product.detailContent && (
            <div 
              className="prose prose-zinc max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.detailContent }}
            />
          )}

          {/* Detail Long Images Gallery */}
          {detailImages.length > 0 && (
            <div className="space-y-4 pt-4">
              {detailImages.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden shadow-xs border bg-white">
                  <img src={img} alt={`Detail story ${idx + 1}`} className="w-full h-auto block" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {/* Product Legal Disclosure Table */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-700" />
              상품정보 제공고시 (생활화학제품)
            </h3>
            
            <div className="bg-zinc-50 rounded-2xl border overflow-hidden text-xs">
              <table className="w-full text-left divide-y divide-zinc-200">
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700 w-1/3">품목 및 제품명</th>
                    <td className="px-5 py-3 text-zinc-800">{product.name} ({product.category || "세정제류"})</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">용도 및 제형</th>
                    <td className="px-5 py-3 text-zinc-800">{product.subCategory || "다목적/올인원"} (실내 공간 및 표면 세정용) / 분무형(액체)</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">용량 또는 중량</th>
                    <td className="px-5 py-3 text-zinc-800">500ml / 본품 단품</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">제조국 및 제조사/판매자</th>
                    <td className="px-5 py-3 text-zinc-800">대한민국 / (주)퍼베이드 (PERVADE Corp.)</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">안전기준적합확인신고번호</th>
                    <td className="px-5 py-3 text-zinc-800 font-mono">제 HB26-12-0048호</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">사용기한 및 보관방법</th>
                    <td className="px-5 py-3 text-zinc-800">제조일로부터 24개월 / 직사광선을 피해 실온 보관</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">사용상 주의사항</th>
                    <td className="px-5 py-3 text-zinc-800 leading-relaxed">
                      · 어린이의 손이 닿지 않는 곳에 보관하십시오.<br />
                      · 용도 외에는 사용하지 마시고 밀폐된 공간에서 사용 시 충분히 환기하십시오.<br />
                      · 눈에 들어갔을 경우 즉시 깨끗한 물로 씻고 의사와 상담하십시오.
                    </td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">소비자상담 관련 전화번호</th>
                    <td className="px-5 py-3 text-zinc-800 font-bold">퍼베이드 고객센터 02-1234-5678</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-zinc-50 p-6 rounded-2xl border space-y-2">
            <h4 className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              안심 포뮬러 &amp; 품질 보증
            </h4>
            <p className="text-zinc-600 text-xs leading-relaxed">
              퍼베이드는 전 성분 안전성 시험과 유해물질 불검출 테스트를 통과한 친환경 다목적 세정 솔루션입니다.
            </p>
          </div>
        </div>

        {/* 2. Reviews Section */}
        <div id="reviews" className="max-w-3xl mx-auto pt-12 border-t">
          <ReviewSection productId={product.id} />
        </div>

        {/* 3. Related Cleaning Guides & Magazine Tips Feed */}
        <div id="guide" className="max-w-3xl mx-auto space-y-6 pt-12 border-t">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Cleaning Master Guide
              </span>
              <h3 className="text-xl font-black text-zinc-950 mt-1">이 제품을 활용한 공간별 세정 꿀팁</h3>
              <p className="text-xs text-zinc-500 mt-0.5">인덕션 기름때, 욕실 물때, 가구 얼룩 등 3분 클리닝 비법</p>
            </div>
            <Link
              href="/guide"
              className="text-xs font-bold text-zinc-700 hover:text-zinc-950 flex items-center gap-0.5"
            >
              가이드 전체보기 &gt;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedGuides.length > 0 ? (
              relatedGuides.map((g) => (
                <Link
                  key={g.id}
                  href={`/guide/${g.id}`}
                  className="group bg-white p-4 rounded-2xl border hover:shadow-md hover:border-zinc-900 transition-all flex gap-3.5 items-center"
                >
                  {g.thumbnailUrl && (
                    <div className="w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-zinc-100 border">
                      <img src={g.thumbnailUrl} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-bold rounded-md">
                      {g.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-950 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {g.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{g.summary || g.content.substring(0, 50)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6 text-center space-y-2">
                <p className="text-xs text-zinc-600 font-medium">퍼베이드 공식 가이드에서 제품별 청소 비법을 만나보세요.</p>
                <Link href="/guide" className="inline-block px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold">
                  공식 청소 가이드 허브 바로가기
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 4. Shipping & Returns Info */}
        <div id="shipping" className="max-w-3xl mx-auto space-y-4 pt-12 border-t">
          <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-700" />
            배송 및 교환/반품 안내
          </h3>
          <div className="bg-zinc-50 rounded-2xl p-6 border text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
            {shippingNotice}
          </div>
        </div>

      </div>
    </div>
  );
}

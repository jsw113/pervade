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
      {/* Breadcrumbs & Back Navigation */}
      <div className="flex items-center flex-wrap gap-2.5 text-sm sm:text-base font-bold text-zinc-900 pb-1">
        <Link 
          href="/shop" 
          className="text-zinc-950 hover:text-amber-700 flex items-center gap-1.5 transition-colors font-bold group"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" /> 
          <span>스토어 전체</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400 stroke-[2.5] shrink-0" />
        <Link 
          href={`/shop?category=${encodeURIComponent(product.category || "세정제류")}`} 
          className="text-zinc-950 hover:text-amber-700 font-extrabold transition-colors underline-offset-4 hover:underline"
        >
          {product.category || "세정제류"}
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400 stroke-[2.5] shrink-0" />
        <span className="text-zinc-700 font-bold truncate max-w-[260px] sm:max-w-[450px]">
          {product.name}
        </span>
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

          {/* Product Legal Disclosure Table (안전확인대상 생활화학제품 필수 표기 정보) */}
          {(() => {
            let productLegal: any = {};
            try {
              if (product.legalInfo) {
                productLegal = typeof product.legalInfo === "string" ? JSON.parse(product.legalInfo) : product.legalInfo;
              }
            } catch (e) {
              productLegal = {};
            }

            const companyName = policies.find(p => p.key === "COMPANY_NAME")?.value || "(주)퍼베이드";
            const defaultCsPhone = policies.find(p => p.key === "CS_PHONE")?.value || "070-7756-3668";

            const legalProductName = productLegal.legalProductName || product.name;
            const legalUsageForm = productLegal.legalUsageForm || policies.find(p => p.key === "LEGAL_USAGE_FORM")?.value || "예) 일반방향·탈취제품 > 탈취제 > 일반용 (물체용)방향·탈취제품 > 탈취제 > 자동차용(실내용) > 특수목적용·세정제품 > 세정제 > 일반용 (건물 바닥용)세정제품 > 세정제 > 일반용 (렌지후드용)세정제품 > 세정제 > 일반용 (변기용)세정제품 > 세정제 > 일반용 (오븐용)세정제품 > 세정제 > 일반용 (욕실용)용 (실내공간용), 자동차용 (실내용) / 액체형 (라벨 & 상세이미지와 동일하게 기재)";
            const legalExpiryDate = productLegal.legalExpiryDate || policies.find(p => p.key === "LEGAL_EXPIRY_DATE")?.value || "해당 없음";
            const legalWeightCapacity = productLegal.legalWeightCapacity || policies.find(p => p.key === "LEGAL_WEIGHT_CAPACITY")?.value || "500ml";
            const legalEffect = productLegal.legalEffect || policies.find(p => p.key === "LEGAL_EFFECT")?.value || "상품 상세페이지 참조";
            const legalManufacturerOrigin = productLegal.legalManufacturerOrigin || policies.find(p => p.key === "LEGAL_MANUFACTURER_ORIGIN")?.value || `제조사 : ${companyName} / 제조국 : 대한민국`;
            const legalChildProtection = productLegal.legalChildProtection || policies.find(p => p.key === "LEGAL_CHILD_PROTECTION")?.value || "어린이보호포장 비대상";
            const legalIngredients = productLegal.legalIngredients || policies.find(p => p.key === "LEGAL_INGREDIENTS")?.value || "에탄올, 정제수, 천연향료";
            const legalCautions = productLegal.legalCautions || policies.find(p => p.key === "LEGAL_CAUTIONS")?.value || "밀폐된 공간에서 사용 시 환기를 충분히 하시오. 내용물을 마시거나, 내용물이 눈 또는 피부에 닿을 경우 인체에 심각한 손상을 입힐 수 있으니 주의하시오. 어린이 손에 닿지 않는 곳에 보관하시오. 사람 또는 동물에 직접 사용(분사)하지 마시오. 표시사항에 기재된 제품의 용도 외에는 사용하지 마시오. 다른 제품과 섞어 사용할 경우 인체에 치명적인 손상을 입힐 수 있으니 섞어 사용하지 마시오. 공기 소독(연무 소독, 고압분사용 소독장비 활용하는 경우 포함)의 용도 사용을 금지하오니, 물체 표면에만 사용하시오. 어린이보호포장이 적용되지 아니한 제품으로 어린이의 손이 닿지 않는 곳에 보관하시오. 화기를 가까이 하지 마시오. 직사광선을 피하여 보관하시오. 광택이 있는 물체 혹은 섬유에 사용 시 변색, 탈색 테스트 후 사용하십시오. 제품을 세워서 보관하십시오.";
            const legalSafetyCertNo = productLegal.legalSafetyCertNo || policies.find(p => p.key === "LEGAL_SAFETY_CERT_NO")?.value || "CB24-13-0521";
            const legalCsPhone = productLegal.legalCsPhone || policies.find(p => p.key === "LEGAL_CS_PHONE")?.value || defaultCsPhone;

            return (
              <div className="space-y-4 pt-10 border-t border-zinc-200">
                <h3 className="text-sm sm:text-base font-black text-zinc-950 flex items-center gap-2">
                  <span>필수 표기 정보</span>
                </h3>
                
                <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white text-[11px] sm:text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {/* Row 1 */}
                      <tr className="border-b border-zinc-200">
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 w-[18%] sm:w-[15%] border-r border-zinc-200 align-top">
                          품목 및 제품명
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 w-[32%] sm:w-[35%] border-r border-zinc-200 align-top leading-relaxed font-medium">
                          {legalProductName}
                        </td>
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 w-[18%] sm:w-[18%] border-r border-zinc-200 align-top">
                          용도(표백제의 경우 계열을 함께표시) 및 제형
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-700 w-[32%] align-top leading-relaxed break-words">
                          {legalUsageForm}
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="border-b border-zinc-200">
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          제조연월 및 유통기한<br />
                          <span className="text-[10px] text-zinc-500 font-normal">(유통기한의 경우 해당 없는 제품은 생략 가능)</span>
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 border-r border-zinc-200 align-top">
                          {legalExpiryDate}
                        </td>
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          중량·용량·매수·크기
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 align-top font-medium">
                          {legalWeightCapacity}
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="border-b border-zinc-200">
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          효과,효능<br />
                          <span className="text-[10px] text-zinc-500 font-normal">(승인대상 제품에 한함)</span>
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 border-r border-zinc-200 align-top">
                          {legalEffect}
                        </td>
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          수입자(수입제품에 한함), 제조국 및 제조사
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 align-top leading-relaxed">
                          {legalManufacturerOrigin}
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className="border-b border-zinc-200">
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          어린이보호포장 대상 제품 유무
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 border-r border-zinc-200 align-top">
                          {legalChildProtection}
                        </td>
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          제품에 사용된 화학물질 명칭<br />
                          <span className="text-[10px] text-zinc-500 font-normal">(안전확인대상 생활화학제품 지정 및 안전·표시기준 [별표 6]에 따른 표시대상 화학물질로서 주요물질, 보존제, 알레르기 반응가능물질 등의 명칭)</span>
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-800 align-top leading-relaxed">
                          {legalIngredients}
                        </td>
                      </tr>

                      {/* Row 5 */}
                      <tr className="border-b border-zinc-200">
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          사용상 주의사항
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-700 border-r border-zinc-200 align-top leading-relaxed text-[11px]">
                          {legalCautions}
                        </td>
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          안전기준적합확인신고번호 또는 안전확인대상생활화학제품승인번호<br />
                          <span className="text-[10px] text-zinc-500 font-normal">(화학제품안전법 시행일(경과조치 기간 포함) 이전에 생산·수입된 위해우려제품의 경우 종전 법에 따른 자가검사번호를 표시)</span>
                        </th>
                        <td className="p-3 sm:p-4 text-zinc-900 font-mono font-bold align-top">
                          {legalSafetyCertNo}
                        </td>
                      </tr>

                      {/* Row 6 */}
                      <tr>
                        <th className="p-3 sm:p-4 bg-zinc-50 font-bold text-zinc-800 border-r border-zinc-200 align-top">
                          소비자상담 관련 전화번호
                        </th>
                        <td colSpan={3} className="p-3 sm:p-4 text-zinc-900 font-bold align-top">
                          {legalCsPhone}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
          
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

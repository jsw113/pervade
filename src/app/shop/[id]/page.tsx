import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Star, Sparkles, ShieldCheck, FileText, Info, ChevronRight, Tag } from "lucide-react";
import { ProductPurchasePanel } from "@/components/shop/ProductPurchasePanel";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ShareButtons } from "@/components/common/ShareButtons";

export const dynamic = "force-dynamic";

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

  // Calculate average rating
  const avgRating = product.reviews.length > 0 
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "5.0";

  // Fetch Common Policy
  const shippingPolicy = await prisma.policy.findUnique({
    where: { key: "SHIPPING_INFO" }
  });

  const shippingNotice = shippingPolicy?.value || `
- 기본 배송비: ${product.shippingFee === 0 ? "무료배송" : `${product.shippingFee.toLocaleString()}원`} (제주/도서산간 3,000원 추가)
- 출고 마감: 평일 오후 2시 이전 결제 완료 건 당일 발송
- 택배사: CJ대한통운 (영업일 기준 1~3일 소요)
- 교환/반품: 상품 수령 후 7일 이내 (단순 변심 시 왕복 배송비 6,000원 고객 부담)
`;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* 2-Depth Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium mb-8 overflow-x-auto whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-zinc-950 transition-colors">홈</Link>
        <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
        <Link href="/shop" className="hover:text-zinc-950 transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
        <Link 
          href={`/shop?category=${encodeURIComponent(product.category || "세정제류")}`} 
          className="font-bold text-zinc-800 hover:text-amber-700 transition-colors"
        >
          {product.category || "세정제류"}
        </Link>
        {product.subCategory && (
          <>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <Link 
              href={`/shop?category=${encodeURIComponent(product.category || "세정제류")}&subCategory=${encodeURIComponent(product.subCategory)}`} 
              className="text-amber-700 font-semibold hover:underline"
            >
              {product.subCategory}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
        <span className="text-zinc-400 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
        
        {/* Left: Product Images Gallery with Thumbnails */}
        <ProductGallery 
          images={galleryImages} 
          productName={product.name} 
        />

        {/* Right: Product Order Info */}
        <div className="space-y-6">
          <div className="space-y-3 border-b border-zinc-100 pb-6">
            {/* 2-Depth Category Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-zinc-950 text-white rounded-md text-[10px] font-black tracking-wider uppercase">
                {product.category || "세정제류"}
              </span>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[10px] font-bold">
                {product.subCategory || "다목적/올인원"}
              </span>
              <div className="flex items-center text-amber-500 text-xs gap-1 ml-auto">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-zinc-800">{avgRating}</span>
                <span className="text-zinc-400">({product.reviews.length}개 리뷰)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {product.name}
            </h1>
            <p className="text-zinc-600 text-xs leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-1">
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 line-through">
                  ₩{product.originalPrice.toLocaleString()}
                </span>
                <span className="text-xs font-black text-red-500">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% 할인
                </span>
              </div>
            )}
            <div className="text-3xl font-black text-zinc-950">
              ₩{product.price.toLocaleString()}원
            </div>
          </div>

          {/* Benefits Block */}
          <div className="bg-zinc-50 rounded-2xl p-5 border text-xs space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-zinc-500 w-20">회원 혜택</span>
              <div className="flex-1">
                <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5">실명인증</span>
                <span className="font-bold text-zinc-950">결제 시 최대 {(product.price * 0.05).toLocaleString()}P 포인트 적립</span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-semibold text-zinc-500 w-20">배송 안내</span>
              <div className="flex-1 text-zinc-700">
                <span className="font-bold">{product.shippingFee === 0 ? "무료배송" : `${product.shippingFee.toLocaleString()}원`}</span>
                <span className="text-zinc-400 ml-1.5">(CJ대한통운 / 평일 14시 당일 출고)</span>
              </div>
            </div>
          </div>

          {/* Purchase Client Interactive Component */}
          <ProductPurchasePanel product={product} />

          {/* Social Share Buttons */}
          <div className="pt-2">
            <ShareButtons 
              title={product.name}
              description={product.description}
            />
          </div>
        </div>
      </div>

      {/* Detail Section Tabs & Content */}
      <div className="border-t pt-12 space-y-12">
        
        {/* Navigation Anchor Bar */}
        <div className="flex border-b text-sm font-bold justify-center gap-8 sticky top-16 bg-white/95 backdrop-blur-md z-30 py-3">
          <a href="#details" className="text-zinc-950 border-b-2 border-zinc-950 pb-2">제품 상세설명</a>
          <a href="#reviews" className="text-zinc-400 hover:text-zinc-950 transition-colors pb-2">상품 리뷰 ({product.reviews.length})</a>
          <a href="#guide" className="text-zinc-400 hover:text-zinc-950 transition-colors pb-2">사용가이드</a>
          <a href="#shipping" className="text-zinc-400 hover:text-zinc-950 transition-colors pb-2">배송/환불 안내</a>
        </div>

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

          {/* Product Legal Disclosure Table (전자상거래 등에서의 상품정보제공고시 - 생활화학제품 기준) */}
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

        {/* 3. Guide Callout */}
        <div id="guide" className="max-w-3xl mx-auto bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center space-y-3">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">Cleaning Pro Tips</span>
          <h3 className="text-xl font-bold text-zinc-950">이 제품을 더 효과적으로 사용하는 방법</h3>
          <p className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed">
            인덕션 기름때, 욕실 물때, 가구 얼룩 등 상황별 3분 클리닝 비법을 공식 가이드에서 확인하세요.
          </p>
          <Link
            href="/guide"
            className="inline-block px-6 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            공식 사용 가이드 보러가기 &gt;
          </Link>
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

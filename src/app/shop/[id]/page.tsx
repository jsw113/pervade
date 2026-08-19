import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Star, Sparkles, ShieldCheck, FileText, Info } from "lucide-react";
import { ProductPurchasePanel } from "@/components/shop/ProductPurchasePanel";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { ProductGallery } from "@/components/shop/ProductGallery";

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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Back Button */}
      <Link 
        href="/shop" 
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 text-xs font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 전체 상품으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
        
        {/* Left: Product Images Gallery with Thumbnails */}
        <ProductGallery 
          images={galleryImages} 
          productName={product.name} 
        />

        {/* Right: Product Order Info */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-zinc-100 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">PERVADE ORIGINAL</span>
              <div className="flex items-center text-amber-500 text-xs gap-1">
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
              <span className="font-semibold text-zinc-500 w-20">배송 정보</span>
              <div className="flex-1 text-zinc-700">
                <span>{product.shippingFee === 0 ? "무료배송" : `${product.shippingFee.toLocaleString()}원`} (CJ대한통운 / 평일 14시 당일출고)</span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-semibold text-zinc-500 w-20">안심 포뮬러</span>
              <div className="flex-1 text-zinc-600">
                <p>유해 화학물질 불검출 검증, 피부 저자극 안심 테스트 완료</p>
              </div>
            </div>
          </div>

          {/* Purchase Panel */}
          <ProductPurchasePanel product={JSON.parse(JSON.stringify(product))} />

        </div>
      </div>

      {/* Bottom Section: Separated Tab Body & Detailed Images */}
      <div className="border-t border-zinc-200 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left/Middle: Product detailed description & Detail Images & Legal Disclosure */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-xl font-bold border-b pb-4 border-zinc-200">상품 상세 정보</h2>
          
          {/* Rich Detail Content */}
          {product.detailContent ? (
            <div className="prose prose-zinc max-w-none text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap bg-white p-6 sm:p-8 rounded-2xl border">
              {product.detailContent}
            </div>
          ) : (
            <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          {/* Detailed Image Storytelling Blocks */}
          {detailImages.length > 0 && (
            <div className="space-y-4 pt-4">
              {detailImages.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden shadow-sm border">
                  <img src={img} alt={`Detail story ${idx + 1}`} className="w-full h-auto object-cover" />
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
                    <td className="px-5 py-3 text-zinc-800">{product.name} (다목적 세정제)</td>
                  </tr>
                  <tr>
                    <th className="px-5 py-3 bg-zinc-100/80 font-bold text-zinc-700">용도 및 제형</th>
                    <td className="px-5 py-3 text-zinc-800">일반용 (기름때, 물때, 실내 가구 및 공간 세정용) / 분무형(액체)</td>
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
            <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              퍼베이드 공식 사용 가이드
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              안전한 식물 유래 성분을 사용하여 일상 공간 어디든 안심하고 사용할 수 있습니다. 보다 자세한 공간별 세정 팁은 상단 메뉴의 [사용가이드]에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* Right: Common Shipping & Return Notice */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold border-b pb-4 border-zinc-200">주문 / 배송 / 교환 공통고지</h2>
          <div className="bg-zinc-50 p-6 rounded-2xl border text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
            {shippingNotice}
          </div>

          <div className="p-5 border rounded-2xl bg-zinc-900 text-white space-y-3">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
              <MessageCircle className="w-4 h-4" />
              1:1 상품 문의가 필요하신가요?
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              상품에 대해 궁금한 점이 있으시다면 언제든 1:1 Q&A 게시판에 문의를 남겨주세요.
            </p>
            <Link
              href={`/qna?productId=${product.id}`}
              className="inline-block w-full py-2 bg-white text-zinc-900 text-center rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors"
            >
              상품 Q&A 문의하기
            </Link>
          </div>
        </div>

      </div>

      {/* Review Section */}
      <div className="mt-16 pt-16 border-t">
        <ReviewSection productId={id} />
      </div>

    </div>
  );
}

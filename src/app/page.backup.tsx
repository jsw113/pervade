import Link from "next/link";
import { ArrowRight, Droplets, Sparkles, ShieldCheck, BookOpen, Quote, CheckCircle2, ShoppingBag, Megaphone, Calendar, Clock, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PromotionModal } from "@/components/common/PromotionModal";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Safe DB Fetching with graceful fallback
  let policies: any[] = [];
  let latestPromotion: any = null;
  let pastPromotion: any = null;
  let featuredProducts: any[] = [];
  let journalPosts: any[] = [];
  let featuredGuides: any[] = [];
  let brandStoryPost: any = null;

  try {
    policies = await prisma.policy.findMany({
      where: {
        key: {
          in: [
            "HERO_TITLE", "HERO_SUBTITLE", "HERO_BG_TYPE", "HERO_BG_URL", "HERO_VISIBLE", 
            "HERO_SHOW_TEXT", "HERO_SHOW_CTA", "HOME_SECTIONS_ORDER", "HERO_OVERLAY_OPACITY",
            "WHY_TITLE", "WHY_SUBTITLE", "WHY_CARD1_TITLE", "WHY_CARD1_DESC", 
            "WHY_CARD2_TITLE", "WHY_CARD2_DESC", "WHY_CARD3_TITLE", "WHY_CARD3_DESC"
          ]
        }
      }
    });

    const now = new Date();
    latestPromotion = await prisma.promotion.findFirst({
      where: { 
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { order: "asc" }
    });

    pastPromotion = await prisma.promotion.findFirst({
      orderBy: { createdAt: "desc" }
    });

    featuredProducts = await prisma.product.findMany({
      where: { isVisible: true },
      take: 4,
      orderBy: { createdAt: "desc" }
    });

    journalPosts = await prisma.post.findMany({
      where: { type: "JOURNAL", published: true },
      take: 2,
      orderBy: { createdAt: "desc" }
    });

    featuredGuides = await prisma.guidePost.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: "desc" }
    });

    brandStoryPost = await prisma.post.findFirst({
      where: { type: "ABOUT", published: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Home page DB fallback triggered:", error);
  }

  const getPolicy = (key: string, defaultValue: string) => 
    policies.find(p => p.key === key)?.value || defaultValue;

  const heroVisible = getPolicy("HERO_VISIBLE", "true") !== "false";
  const heroShowText = getPolicy("HERO_SHOW_TEXT", "false") === "true";
  const heroShowCta = getPolicy("HERO_SHOW_CTA", "true") !== "false";
  const heroTitle = getPolicy("HERO_TITLE", "");
  const heroSubtitle = getPolicy("HERO_SUBTITLE", "");
  const heroBgType = getPolicy("HERO_BG_TYPE", "IMAGE");
  const heroBgUrl = getPolicy("HERO_BG_URL", "");
  const heroOverlayOpacity = getPolicy("HERO_OVERLAY_OPACITY", "0");

  const fallbackDefaultBg = "";
  const activeBgUrl = heroBgUrl || fallbackDefaultBg;

  // 'Why PERVADE?' (Features) Section Dynamic Policies
  const whyTitle = getPolicy("WHY_TITLE", "왜 퍼베이드인가요?");
  const whySubtitle = getPolicy("WHY_SUBTITLE", "단 하나의 세정제로 경험하는 프리미엄 공간의 변화");
  const whyCard1Title = getPolicy("WHY_CARD1_TITLE", "강력한 오염 분해력");
  const whyCard1Desc = getPolicy("WHY_CARD1_DESC", "주방의 찌든 기름때부터 욕실의 완고한 물때까지 표면 손상 없이 깊숙이 침투하여 즉각 분해합니다.");
  const whyCard2Title = getPolicy("WHY_CARD2_TITLE", "안전한 성분 설계");
  const whyCard2Desc = getPolicy("WHY_CARD2_DESC", "식물 유래 계면활성제와 자연 유래 추출물로 가족 모두가 머무는 공간에 자극 없이 안전합니다.");
  const whyCard3Title = getPolicy("WHY_CARD3_TITLE", "지속되는 광택 & 향기");
  const whyCard3Desc = getPolicy("WHY_CARD3_DESC", "세정 후 끈적임 없는 보호막을 형성하여 오염 재착색을 방지하고 은은한 잔향을 남깁니다.");
  
  const sectionsOrderRaw = getPolicy("HOME_SECTIONS_ORDER", JSON.stringify([
    { id: "hero", visible: true },
    { id: "promotion", visible: true },
    { id: "features", visible: true },
    { id: "brand_story", visible: true },
    { id: "products", visible: true },
    { id: "journal", visible: true },
  ]));

  let sectionsOrder: { id: string; visible: boolean }[] = [];
  try {
    const parsed = JSON.parse(sectionsOrderRaw);
    sectionsOrder = parsed;
  } catch (e) {
    sectionsOrder = [
      { id: "hero", visible: true },
      { id: "promotion", visible: true },
      { id: "features", visible: true },
      { id: "brand_story", visible: true },
      { id: "products", visible: true },
      { id: "journal", visible: true },
    ];
  }

  // Ensure all default sections exist in sectionsOrder
  const allDefaultIds = ["hero", "promotion", "features", "brand_story", "products", "journal"];
  allDefaultIds.forEach(id => {
    if (!sectionsOrder.some(s => s.id === id)) {
      sectionsOrder.push({ id, visible: true });
    }
  });

  const now = new Date();
  const isPromoActive = latestPromotion && (!latestPromotion.endDate || new Date(latestPromotion.endDate).getTime() >= now.getTime());
  const activePromoData = isPromoActive ? latestPromotion : pastPromotion;

  // Component Mapping
  const renderSection = (id: string) => {
    switch (id) {
      case "hero":
        if (!heroVisible) return null;
        return (
          <section key="hero" className="w-full bg-white py-4 sm:py-6">
            <div className="max-w-6xl mx-auto px-4">
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 shadow-xl flex items-center justify-center">
                {/* Dynamic Background: Video vs Image */}
                {heroBgType === "VIDEO" && heroBgUrl ? (
                  <video 
                    key={heroBgUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    preload="auto"
                    className="w-full h-auto max-h-[85vh] object-cover block"
                  >
                    <source src={heroBgUrl} type="video/mp4" />
                    <source src={heroBgUrl} type="video/webm" />
                  </video>
                ) : activeBgUrl ? (
                  <img
                    src={activeBgUrl}
                    alt="PERVADE Main Hero"
                    className="w-full h-auto object-contain block"
                  />
                ) : (
                  <div className="w-full aspect-[16/9] min-h-[380px] bg-zinc-900 flex items-center justify-center" />
                )}

                {/* Dynamic Overlay Masking (0% = totally transparent / no mask, 100% = solid black) */}
                {(() => {
                  const num = Number(heroOverlayOpacity);
                  const opacityVal = isNaN(num) ? 0 : Math.max(0, Math.min(100, num)) / 100;
                  if (opacityVal <= 0) return null;
                  return (
                    <div 
                      className="absolute inset-0 bg-black z-10 transition-opacity duration-300 pointer-events-none" 
                      style={{ opacity: opacityVal }} 
                    />
                  );
                })()}

                {/* Main Headline Content Area (Upper / Center) */}
                {heroShowText && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-6 pb-16 md:pb-20">
                    <span className="text-xs md:text-sm font-bold tracking-widest uppercase mb-3 sm:mb-4 inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white shadow-xs">
                      Pervade Premium Clean Living
                    </span>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 max-w-3xl mx-auto leading-tight whitespace-pre-line drop-shadow-lg">
                      {heroTitle}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-xl mx-auto whitespace-pre-line leading-relaxed drop-shadow-md font-light">
                      {heroSubtitle}
                    </p>
                  </div>
                )}

                {/* Repositioned CTA Buttons: Lower 1/4 Center */}
                {heroShowCta && (
                  <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-0 right-0 z-20 px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-xl mx-auto">
                      <Link 
                        href="/shop" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-white text-zinc-950 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all shadow-2xl hover:scale-105 active:scale-95 text-xs sm:text-sm"
                      >
                        제품 둘러보기 <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link 
                        href="/guide" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-black/40 text-white rounded-full font-bold flex items-center justify-center border border-white/50 hover:bg-white/20 transition-all backdrop-blur-md shadow-2xl hover:scale-105 active:scale-95 text-xs sm:text-sm"
                      >
                        사용 가이드 확인
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case "promotion":
        return null;

      case "features":
        return (
          <section key="features" className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
              {/* Centered Section Header */}
              <div className="text-center mb-16 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Key Principles</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">{whyTitle}</h2>
                <p className="text-zinc-500 text-sm max-w-lg mx-auto">{whySubtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all space-y-4 text-center">
                  <div className="w-14 h-14 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Droplets className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{whyCard1Title}</h3>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    {whyCard1Desc}
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all space-y-4 text-center">
                  <div className="w-14 h-14 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{whyCard2Title}</h3>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    {whyCard2Desc}
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-all space-y-4 text-center">
                  <div className="w-14 h-14 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{whyCard3Title}</h3>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    {whyCard3Desc}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case "brand_story":
        return (
          <section key="brand_story" className="py-8 sm:py-12 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-14 lg:p-16 shadow-2xl text-center space-y-12">
                {/* Centered Section Header */}
                <div className="space-y-4 max-w-2xl mx-auto">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
                    <Quote className="w-3.5 h-3.5" />
                    Brand Philosophy
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                    {brandStoryPost?.title || "자연과 공간, 사람을 잇는 지속 가능한 클리닝"}
                  </h2>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-light max-w-2xl mx-auto">
                    {brandStoryPost?.content || 
                      "퍼베이드(PERVADE)는 단순한 세정제를 넘어, 일상 공간의 질서를 바로잡고 삶의 품격을 높이는 라이프스타일 뷰티 솔루션을 제안합니다.\n\n불필요한 화학 성분을 덜어내고 꼭 필요한 순수 자연의 정화력만을 담았습니다. 매일 손닿는 공간에 가장 건강한 깨끗함을 선사합니다."}
                  </p>
                </div>

                {/* Centered Key Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-inner max-w-4xl mx-auto">
                  <div className="space-y-1 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-white">99.9%</span>
                    <p className="text-xs text-zinc-400">대장균 및 황색포도상구균 항균</p>
                  </div>
                  <div className="space-y-1 text-center sm:border-x border-zinc-800">
                    <span className="text-3xl sm:text-4xl font-black text-amber-300">0.00</span>
                    <p className="text-xs text-zinc-400">피부 저자극 테스트 무자극 판정</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400">100%</span>
                    <p className="text-xs text-zinc-400">생분해성 포뮬러 친환경 패키징</p>
                  </div>
                </div>

                <div>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 rounded-full font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    브랜드 스토리 전체보기 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      case "products":
        return (
          <section key="products" className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
              {/* Centered Section Header */}
              <div className="text-center mb-14 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Featured Products</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">인기 제품 라인업</h2>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  퍼베이드가 제안하는 베스트셀러 프리미엄 세정 라인을 만나보세요.
                </p>
              </div>

              {/* Centered & Compact Product Cards Container */}
              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {featuredProducts.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    등록된 상품이 없습니다.
                  </div>
                ) : (
                  featuredProducts.map((prod) => (
                    <Link 
                      href={`/shop/${prod.id}`} 
                      key={prod.id}
                      className="group bg-white rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col w-full sm:w-[280px] md:w-[290px]"
                    >
                      {/* Compact Image */}
                      <div className="h-56 bg-zinc-100 relative overflow-hidden shrink-0 flex items-center justify-center p-4">
                        {(() => {
                          let imgUrl = prod.imageUrl;
                          if (!imgUrl && prod.images) {
                            try {
                              const parsed = JSON.parse(prod.images);
                              if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                            } catch (e) {}
                          }
                          if (!imgUrl) imgUrl = "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=800&auto=format&fit=crop";
                          return (
                            <img 
                              src={imgUrl} 
                              alt={prod.name} 
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          );
                        })()}
                      </div>
                      
                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                            {prod.name}
                          </h3>
                          <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-baseline">
                          <div>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-[10px] text-zinc-400 line-through mr-1.5">
                                ₩{(prod.originalPrice || 0).toLocaleString()}
                              </span>
                            )}
                            <span className="font-black text-sm text-zinc-950">
                              ₩{(prod.price || 0).toLocaleString()}원
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {!prod.shippingFee || prod.shippingFee === 0 ? "무료배송" : `배송비 ${(prod.shippingFee || 0).toLocaleString()}원`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Centered Bottom Action */}
              <div className="text-center mt-12">
                <Link 
                  href="/shop" 
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  전체 상품 보러가기
                </Link>
              </div>
            </div>
          </section>
        );

      case "journal":
        return (
          <section key="journal" className="py-16 sm:py-20 bg-white space-y-16">
            <div className="container mx-auto px-4 max-w-6xl">
              {/* 1. Cleaning Guides Feed */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest inline-flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Cleaning Pro Tips
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">공간별 3분 세정 가이드</h2>
                    <p className="text-zinc-500 text-xs mt-1">
                      인덕션 기름때부터 욕실 물때까지, 일상의 얼룩을 완벽하게 지우는 전문가 팁
                    </p>
                  </div>
                  <Link
                    href="/guide"
                    className="text-xs font-bold text-zinc-900 hover:text-amber-700 transition-colors shrink-0 flex items-center gap-1"
                  >
                    가이드 전체보기 &gt;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredGuides.length === 0 ? (
                    <div className="col-span-3 p-8 border rounded-3xl bg-zinc-50 text-center text-xs text-zinc-500">
                      등록된 가이드 콘텐츠를 준비 중입니다.
                    </div>
                  ) : (
                    featuredGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guide/${guide.id}`}
                        className="group bg-white rounded-3xl border overflow-hidden hover:shadow-xl hover:border-zinc-950 transition-all flex flex-col justify-between"
                      >
                        {guide.thumbnailUrl && (
                          <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
                            <img 
                              src={guide.thumbnailUrl} 
                              alt={guide.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm">
                              {guide.category}
                            </span>
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                              {guide.title}
                            </h3>
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                              {guide.summary || guide.content.substring(0, 80)}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2 border-t">
                            가이드 읽고 제품 보기 &gt;
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Lifestyle Journal Feed */}
              <div className="space-y-8 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest inline-flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                      Living Journal
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">퍼베이드 스토리 &amp; 저널</h2>
                    <p className="text-zinc-500 text-xs mt-1">
                      자연 유래 안심 포뮬러와 감각적인 클린 라이프스타일 이야기
                    </p>
                  </div>
                  <Link
                    href="/journal"
                    className="text-xs font-bold text-zinc-900 hover:text-amber-700 transition-colors shrink-0 flex items-center gap-1"
                  >
                    저널 전체보기 &gt;
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {journalPosts.length === 0 ? (
                    <>
                      <div className="p-8 border rounded-3xl bg-zinc-50 space-y-3">
                        <span className="text-[11px] font-bold text-zinc-400">2026. 08. 17</span>
                        <h3 className="font-bold text-base text-zinc-900">미니멀 라이프를 위한 단 하나의 세정 솔루션</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          복잡한 청소용품을 비우고, 자연 유래 다목적 세정제 하나로 주방과 욕실, 거실을 관리하는 건강한 라이프스타일 노하우.
                        </p>
                        <Link href="/journal/minimal-cleaning-solution" className="inline-block text-xs font-bold underline text-zinc-900 mt-1 hover:text-amber-700">
                          자세히 읽기 &gt;
                        </Link>
                      </div>

                      <div className="p-8 border rounded-3xl bg-zinc-50 space-y-3">
                        <span className="text-[11px] font-bold text-zinc-400">2026. 08. 16</span>
                        <h3 className="font-bold text-base text-zinc-900">가족의 숨결이 닿는 공간, 안전한 성분의 선택</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          화학 계면활성제 대신 자연 유래 성분으로 채운 퍼베이드의 안심 포뮬러 이야기와 일상 속 실천 팁.
                        </p>
                        <Link href="/journal/safe-ingredients-choice" className="inline-block text-xs font-bold underline text-zinc-900 mt-1 hover:text-amber-700">
                          자세히 읽기 &gt;
                        </Link>
                      </div>
                    </>
                  ) : (
                    journalPosts.map((post) => (
                      <article key={post.id} className="p-8 border rounded-3xl bg-zinc-50 hover:bg-zinc-100/80 transition-colors space-y-3">
                        <span className="text-[11px] font-bold text-zinc-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-base text-zinc-900 line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                          {post.content.replace(/[#*`]/g, '')}
                        </p>
                        <Link 
                          href={`/journal/${post.id}`} 
                          className="inline-block text-xs font-bold underline text-zinc-900 mt-1"
                        >
                          자세히 읽기 &gt;
                        </Link>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {sectionsOrder
        .filter(s => s.visible)
        .map(s => renderSection(s.id))
      }
      <PromotionModal promotion={latestPromotion ? JSON.parse(JSON.stringify(latestPromotion)) : null} />
    </div>
  );
}

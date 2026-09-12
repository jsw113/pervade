import Link from "next/link";
import { ArrowRight, Droplets, Sparkles, ShieldCheck, BookOpen, Quote, ShoppingBag, ArrowUpRight } from "lucide-react";
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

    latestPromotion = await prisma.promotion.findFirst({
      where: { isActive: true },
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
  const heroTitle = getPolicy("HERO_TITLE", "공간을 비우고,\n본질을 채우는 시간");
  const heroSubtitle = getPolicy("HERO_SUBTITLE", "자연에서 온 순수한 성분과 절제된 미학으로 머무는 공간에 고요한 휴식을 선사합니다.");
  const heroBgType = getPolicy("HERO_BG_TYPE", "IMAGE");
  const heroBgUrl = getPolicy("HERO_BG_URL", "");
  const heroOverlayOpacity = getPolicy("HERO_OVERLAY_OPACITY", "0");

  const activeBgUrl = heroBgUrl || "";

  // 'Why PERVADE?' (Features) Section Dynamic Policies
  const whyTitle = getPolicy("WHY_TITLE", "단순함 속에 담긴 온전한 깨끗함");
  const whySubtitle = getPolicy("WHY_SUBTITLE", "자연과 공간, 사람을 배려하는 퍼베이드의 3가지 본질");
  const whyCard1Title = getPolicy("WHY_CARD1_TITLE", "자연 유래 안심 성분");
  const whyCard1Desc = getPolicy("WHY_CARD1_DESC", "코코넛과 옥수수에서 추출한 순식물성 계면활성제로 자극 없이 안전합니다.");
  const whyCard2Title = getPolicy("WHY_CARD2_TITLE", "공간과 조화로운 미학");
  const whyCard2Desc = getPolicy("WHY_CARD2_DESC", "어디에 두어도 자연스럽게 스며드는 절제된 미니멀 실루엣을 제안합니다.");
  const whyCard3Title = getPolicy("WHY_CARD3_TITLE", "지속 가능한 순환");
  const whyCard3Desc = getPolicy("WHY_CARD3_DESC", "플라스틱 사용량을 줄이는 에코 리필 시스템으로 환경 책임을 실천합니다.");
  
  const sectionsOrderRaw = getPolicy("HOME_SECTIONS_ORDER", JSON.stringify([
    { id: "hero", visible: true },
    { id: "promotion", visible: true },
    { id: "features", visible: true },
    { id: "products", visible: true },
    { id: "brand_story", visible: true },
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
      { id: "products", visible: true },
      { id: "brand_story", visible: true },
      { id: "journal", visible: true },
    ];
  }

  // Ensure all default sections exist in sectionsOrder
  const allDefaultIds = ["hero", "promotion", "features", "products", "brand_story", "journal"];
  allDefaultIds.forEach(id => {
    if (!sectionsOrder.some(s => s.id === id)) {
      sectionsOrder.push({ id, visible: true });
    }
  });

  // Section Renderers
  const renderSection = (id: string) => {
    switch (id) {
      case "hero":
        if (!heroVisible) return null;
        return (
          <section key="hero" className="w-full bg-white py-3 sm:py-6">
            <div className="max-w-6xl mx-auto px-4">
              <div className="relative w-full rounded-none overflow-hidden bg-zinc-950 border border-zinc-200 flex items-center justify-center">
                {/* Dynamic Background: Video vs Image */}
                {heroBgType === "VIDEO" && heroBgUrl ? (
                  <video 
                    key={heroBgUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    preload="auto"
                    className="w-full h-auto max-h-[85vh] object-cover block rounded-none"
                  >
                    <source src={heroBgUrl} type="video/mp4" />
                    <source src={heroBgUrl} type="video/webm" />
                  </video>
                ) : activeBgUrl ? (
                  <img
                    src={activeBgUrl}
                    alt="PERVADE Main Hero"
                    className="w-full h-auto object-contain block rounded-none"
                  />
                ) : (
                  <div className="w-full aspect-[16/9] min-h-[380px] bg-zinc-900 flex items-center justify-center rounded-none" />
                )}

                {/* Dynamic Overlay Masking */}
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
                    <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-300 mb-3 sm:mb-4 inline-block px-3.5 py-1 bg-black/40 backdrop-blur-xs border border-white/20 rounded-none">
                      Silence in Cleanliness
                    </span>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight mb-4 max-w-3xl mx-auto leading-tight whitespace-pre-line drop-shadow-md">
                      {heroTitle}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-zinc-200 max-w-xl mx-auto whitespace-pre-line leading-relaxed drop-shadow-sm font-light">
                      {heroSubtitle}
                    </p>
                  </div>
                )}

                {/* Repositioned CTA Buttons: Sharp Rectangular */}
                {heroShowCta && (
                  <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-0 right-0 z-20 px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-xl mx-auto">
                      <Link 
                        href="/shop" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-white text-zinc-950 rounded-none font-serif text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors shadow-lg active:scale-95"
                      >
                        Discover Collection <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link 
                        href="/guide" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-black/60 text-white rounded-none font-serif text-xs tracking-widest uppercase flex items-center justify-center border border-white/40 hover:bg-black/80 transition-colors backdrop-blur-xs shadow-lg active:scale-95"
                      >
                        Care Routine Guide
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
          <section key="features" className="py-16 sm:py-24 bg-white">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              {/* Centered Editorial Section Header */}
              <div className="mb-14 space-y-3">
                <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400 block">
                  Brand Philosophy
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light tracking-tight text-zinc-900 break-keep">
                  {whyTitle}
                </h2>
                <div className="w-10 h-[1px] bg-zinc-300 mx-auto my-4" />
                <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto break-keep leading-relaxed">
                  {whySubtitle}
                </p>
              </div>

              {/* 3 Pillars: Sharp Rectangular Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-8 rounded-none bg-white border border-zinc-200 hover:border-zinc-900 transition-colors space-y-3">
                  <span className="text-[11px] font-mono text-zinc-400 tracking-wider block">01 / SAFETY</span>
                  <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-medium">{whyCard1Title}</h3>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed break-keep">
                    {whyCard1Desc}
                  </p>
                </div>

                <div className="p-8 rounded-none bg-white border border-zinc-200 hover:border-zinc-900 transition-colors space-y-3">
                  <span className="text-[11px] font-mono text-zinc-400 tracking-wider block">02 / AESTHETIC</span>
                  <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-medium">{whyCard2Title}</h3>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed break-keep">
                    {whyCard2Desc}
                  </p>
                </div>

                <div className="p-8 rounded-none bg-white border border-zinc-200 hover:border-zinc-900 transition-colors space-y-3">
                  <span className="text-[11px] font-mono text-zinc-400 tracking-wider block">03 / SUSTAINABLE</span>
                  <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-medium">{whyCard3Title}</h3>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed break-keep">
                    {whyCard3Desc}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case "products":
        return (
          <section key="products" className="py-16 sm:py-24 bg-white border-t border-zinc-100">
            <div className="container mx-auto px-4 max-w-6xl">
              {/* Header with Minimalist Link */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                <div>
                  <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400 block mb-1">
                    Selected Works
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-zinc-900 tracking-tight">
                    Signature Collection
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-serif tracking-widest uppercase text-zinc-900 hover:text-zinc-500 transition-colors flex items-center gap-1 group pb-1 border-b border-zinc-900 self-start sm:self-auto"
                >
                  전체 컬렉션 둘러보기 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Sharp Rectangular Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.length === 0 ? (
                  <div className="col-span-4 py-16 text-center text-zinc-400 text-xs font-light border border-zinc-200">
                    등록된 상품이 없습니다.
                  </div>
                ) : (
                  featuredProducts.map((prod) => {
                    let imgUrl = prod.imageUrl;
                    if (!imgUrl && prod.images) {
                      try {
                        const parsed = JSON.parse(prod.images);
                        if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                      } catch (e) {}
                    }
                    if (!imgUrl) imgUrl = "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=800&auto=format&fit=crop";

                    return (
                      <Link 
                        href={`/shop/${prod.id}`} 
                        key={prod.id}
                        className="group bg-white rounded-none border border-zinc-200 hover:border-zinc-900 transition-colors duration-300 flex flex-col justify-between"
                      >
                        {/* Image Container with Crisp Rectangular Proportion */}
                        <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden rounded-none p-6 flex items-center justify-center">
                          <img 
                            src={imgUrl} 
                            alt={prod.name} 
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="p-5 border-t border-zinc-100 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-400 tracking-wider block">PERVADE HOMECARE</span>
                            <h3 className="font-serif text-sm font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                              {prod.name}
                            </h3>
                            <p className="text-[11px] text-zinc-500 font-light line-clamp-1">
                              {prod.description}
                            </p>
                          </div>
                          
                          <div className="pt-2 border-t border-zinc-100 flex justify-between items-baseline">
                            <div>
                              {prod.originalPrice && prod.originalPrice > prod.price && (
                                <span className="text-[10px] text-zinc-400 line-through mr-1.5 font-mono">
                                  ₩{(prod.originalPrice || 0).toLocaleString()}
                                </span>
                              )}
                              <span className="font-sans font-semibold text-sm text-zinc-950">
                                ₩{(prod.price || 0).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-light">
                              {!prod.shippingFee || prod.shippingFee === 0 ? "무료배송" : `배송비 ${(prod.shippingFee || 0).toLocaleString()}원`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        );

      case "brand_story":
        return (
          <section key="brand_story" className="py-12 sm:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-zinc-950 text-white rounded-none border border-zinc-900 p-8 sm:p-14 lg:p-16 text-center space-y-10">
                {/* Centered Editorial Philosophy */}
                <div className="space-y-4 max-w-2xl mx-auto">
                  <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400 block">
                    Our Essence
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light tracking-tight leading-snug">
                    {brandStoryPost?.title || "자연과 공간, 사람을 잇는 고요한 정돈"}
                  </h2>
                  <div className="w-10 h-[1px] bg-zinc-800 mx-auto my-4" />
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light max-w-xl mx-auto break-keep">
                    {brandStoryPost?.content ? brandStoryPost.content.substring(0, 180) : 
                      "불필요한 화학 성분을 비우고 꼭 필요한 순수 자연의 정화력만을 담았습니다. 매일 손닿는 일상의 공간에 가장 건강하고 평온한 깨끗함을 선사합니다."}
                  </p>
                </div>

                {/* Key Stats in Sharp Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 max-w-3xl mx-auto rounded-none">
                  <div className="space-y-1 text-center">
                    <span className="text-2xl sm:text-3xl font-serif font-light text-white">99.9%</span>
                    <p className="text-[11px] text-zinc-400 font-light">유해 세균 항균력</p>
                  </div>
                  <div className="space-y-1 text-center sm:border-x border-zinc-800">
                    <span className="text-2xl sm:text-3xl font-serif font-light text-zinc-200">0.00</span>
                    <p className="text-[11px] text-zinc-400 font-light">피부 무자극 검증</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-2xl sm:text-3xl font-serif font-light text-emerald-400">100%</span>
                    <p className="text-[11px] text-zinc-400 font-light">생분해성 안심 포뮬러</p>
                  </div>
                </div>

                <div>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 rounded-none font-serif text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors shadow-md"
                  >
                    브랜드 스토리 읽기 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      case "journal":
        return (
          <section key="journal" className="py-16 sm:py-24 bg-white border-t border-zinc-100 space-y-16">
            <div className="container mx-auto px-4 max-w-6xl">
              {/* 1. Care Guides Feed */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
                  <div>
                    <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400 block mb-1">
                      Care Routine
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-zinc-900 tracking-tight">
                      공간별 케어 가이드
                    </h2>
                  </div>
                  <Link
                    href="/guide"
                    className="text-xs font-serif tracking-widest uppercase text-zinc-900 hover:text-zinc-500 transition-colors flex items-center gap-1 group pb-0.5 border-b border-zinc-900 self-start sm:self-auto"
                  >
                    가이드 전체보기 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredGuides.length === 0 ? (
                    <div className="col-span-3 p-8 border border-zinc-200 bg-white text-center text-xs text-zinc-400 font-light rounded-none">
                      등록된 가이드 콘텐츠가 없습니다.
                    </div>
                  ) : (
                    featuredGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guide/${guide.id}`}
                        className="group bg-white rounded-none border border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col justify-between"
                      >
                        {guide.thumbnailUrl && (
                          <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative rounded-none">
                            <img 
                              src={guide.thumbnailUrl} 
                              alt={guide.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-none" 
                            />
                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider uppercase rounded-none">
                              {guide.category}
                            </span>
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <h3 className="font-serif text-sm sm:text-base font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                              {guide.title}
                            </h3>
                            <p className="text-xs text-zinc-500 font-light line-clamp-2 leading-relaxed">
                              {guide.summary || guide.content.substring(0, 80)}
                            </p>
                          </div>
                          <span className="text-[11px] font-serif tracking-wider text-zinc-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-3 border-t border-zinc-100">
                            가이드 읽어보기 <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Lifestyle Journal Feed */}
              <div className="space-y-8 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
                  <div>
                    <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400 block mb-1">
                      Living Journal
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-zinc-900 tracking-tight">
                      라이프스타일 저널
                    </h2>
                  </div>
                  <Link
                    href="/journal"
                    className="text-xs font-serif tracking-widest uppercase text-zinc-900 hover:text-zinc-500 transition-colors flex items-center gap-1 group pb-0.5 border-b border-zinc-900 self-start sm:self-auto"
                  >
                    저널 전체보기 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {journalPosts.length === 0 ? (
                    <div className="col-span-2 p-8 border border-zinc-200 bg-white text-center text-xs text-zinc-400 font-light rounded-none">
                      등록된 저널 게시물이 없습니다.
                    </div>
                  ) : (
                    journalPosts.map((post) => (
                      <article key={post.id} className="p-8 border border-zinc-200 rounded-none bg-white hover:border-zinc-900 transition-colors space-y-3">
                        <span className="text-[11px] font-mono text-zinc-400 tracking-wider">
                          {new Date(post.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
                        </span>
                        <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-normal line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-2">
                          {post.content.replace(/[#*`]/g, '')}
                        </p>
                        <div className="pt-2">
                          <Link 
                            href={`/journal/${post.id}`} 
                            className="inline-flex items-center gap-1 text-xs font-serif tracking-wider underline text-zinc-900 hover:text-zinc-600"
                          >
                            자세히 읽기 <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
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


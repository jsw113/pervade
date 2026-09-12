import Link from "next/link";
import { ArrowRight, ChevronDown, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EditorialProductCarousel } from "@/components/editorial/EditorialProductCarousel";
import { EditorialJournalCarousel } from "@/components/editorial/EditorialJournalCarousel";
import { PromotionModal } from "@/components/common/PromotionModal";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Safe DB Fetching with graceful fallback
  let policies: any[] = [];
  let latestPromotion: any = null;
  let featuredProducts: any[] = [];
  let journalPosts: any[] = [];
  let featuredGuides: any[] = [];

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

    featuredProducts = await prisma.product.findMany({
      where: { isVisible: true },
      take: 6,
      orderBy: { createdAt: "desc" }
    });

    journalPosts = await prisma.post.findMany({
      where: { type: "JOURNAL", published: true },
      take: 4,
      orderBy: { createdAt: "desc" }
    });

    featuredGuides = await prisma.guidePost.findMany({
      where: { published: true },
      take: 4,
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Home page DB fallback triggered:", error);
  }

  const getPolicy = (key: string, defaultValue: string) => 
    policies.find(p => p.key === key)?.value || defaultValue;

  const heroBgType = getPolicy("HERO_BG_TYPE", "IMAGE");
  const heroBgUrl = getPolicy("HERO_BG_URL", "");
  const heroOverlayOpacity = parseInt(getPolicy("HERO_OVERLAY_OPACITY", "0"), 10) || 0;
  const heroShowText = getPolicy("HERO_SHOW_TEXT", "false") === "true";
  const heroTitle = getPolicy("HERO_TITLE", "");
  const heroSubtitle = getPolicy("HERO_SUBTITLE", "");
  const activeBgUrl = heroBgUrl || "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000&auto=format&fit=crop";

  // Brand Philosophy & 3 Pillars Policy Settings (Synced with CMS /admin/theme)
  const whyTitle = getPolicy("WHY_TITLE", "깨끗함이란 인공적인 향으로 덮는 것이 아니라,\n가장 맑은 본래의 상태로 되돌리는 것.");
  const whySubtitle = getPolicy("WHY_SUBTITLE", "퍼베이드는 눈에 띄는 화려한 포장 대신 미니멀한 실루엣을,\n독한 화학 계면활성제 대신 식물 유래 세정 성분을 선택했습니다.\n주방의 기름때부터 욕실의 물때까지, 표면을 상하게 하지 않고 자연스럽게 스며듭니다.");
  const whyCard1Title = getPolicy("WHY_CARD1_TITLE", "자연 유래 안심 성분");
  const whyCard1Desc = getPolicy("WHY_CARD1_DESC", "코코넛과 옥수수에서 추출한 식물 유래 계면활성제로 아이와 반려동물이 머무는 공간에도 안심하고 사용할 수 있습니다.");
  const whyCard2Title = getPolicy("WHY_CARD2_TITLE", "공간과 조화로운 미학");
  const whyCard2Desc = getPolicy("WHY_CARD2_DESC", "숨기고 싶은 청소 도구가 아닌, 선반 위에 오브제처럼 자연스럽게 놓여 감각적인 인테리어를 완성합니다.");
  const whyCard3Title = getPolicy("WHY_CARD3_TITLE", "지속 가능한 순환");
  const whyCard3Desc = getPolicy("WHY_CARD3_DESC", "플라스틱 소비를 70% 이상 줄일 수 있는 대용량 에코 리필 파우치 시스템을 통해 환경에 대한 책임을 실천합니다.");

  const homeSectionsOrder = getPolicy("HOME_SECTIONS_ORDER", "");
  let isWhyVisible = true;
  if (homeSectionsOrder) {
    try {
      const parsed = JSON.parse(homeSectionsOrder);
      const whySec = parsed.find((s: any) => s.id === "why" || s.id === "philosophy");
      if (whySec && whySec.visible === false) isWhyVisible = false;
    } catch(e) {}
  }

  // Fallback curated products merged with DB products
  const defaultCuratedProducts = [
    {
      id: "prod-main-500",
      name: "All-in-One Multi Cleaner",
      subTitle: "찌든 때와 오염을 자극 없이 분해하는 시그니처 다목적 세정제",
      volume: "500ml / 16.9 fl.oz",
      price: 18900,
      originalPrice: 22000,
      primaryImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      badge: "Signature",
      tag: "Best Seller"
    },
    {
      id: "prod-refill-1000",
      name: "Eco Refill Pouch",
      subTitle: "플라스틱 배출을 줄이는 1,000ml 대용량 친환경 에코 리필 파우치",
      volume: "1,000ml / 33.8 fl.oz",
      price: 24000,
      originalPrice: 28000,
      primaryImage: "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
      badge: "Eco Friendly",
      tag: "Sustainable"
    },
    {
      id: "prod-mist-300",
      name: "Room & Linen Fragrance Mist",
      subTitle: "공간의 냄새를 비우고 편안한 자연의 잔향을 남기는 패브릭 미스트",
      volume: "300ml / 10.1 fl.oz",
      price: 16000,
      originalPrice: 19000,
      primaryImage: "https://images.unsplash.com/photo-1608248597359-5936735e00b6?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1200&auto=format&fit=crop",
      badge: "New Arrival",
      tag: "Fragrance"
    },
    {
      id: "prod-kitchen-500",
      name: "Botanical Kitchen Degreaser",
      subTitle: "조리 공간과 식기에 안심하고 사용하는 순식물성 기름때 분해제",
      volume: "500ml / 16.9 fl.oz",
      price: 19500,
      originalPrice: 23000,
      primaryImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
      badge: "Kitchen Care",
      tag: "Plant-Based"
    },
    {
      id: "prod-bath-500",
      name: "Mineral Bathroom Descaler",
      subTitle: "타일과 수전의 백화 및 물때를 매끄럽게 지워내는 미네랄 클렌저",
      volume: "500ml / 16.9 fl.oz",
      price: 19000,
      originalPrice: 22500,
      primaryImage: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
      badge: "Bath Care",
      tag: "Shine & Clean"
    },
    {
      id: "prod-cloth-set",
      name: "Premium Microfiber Care Cloth",
      subTitle: "스크래치 없이 섬세한 표면을 닦아내는 프리미엄 극세사 3종 세트",
      volume: "Set of 3",
      price: 14000,
      originalPrice: 17000,
      primaryImage: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
      badge: "Accessory",
      tag: "Essential"
    }
  ];

  // Map DB products if they exist, otherwise use curated
  const displayProducts = featuredProducts.length > 0 
    ? featuredProducts.map((prod, idx) => {
        let pImg = prod.imageUrl;
        let sImg = "";
        if (prod.images) {
          try {
            const arr = JSON.parse(prod.images);
            if (Array.isArray(arr) && arr.length > 0) {
              if (!pImg) pImg = arr[0];
              if (arr.length > 1) sImg = arr[1];
            }
          } catch (e) {}
        }
        return {
          id: prod.id,
          name: prod.name,
          subTitle: prod.description || "프리미엄 공간 케어 솔루션",
          volume: "500ml",
          price: prod.price,
          originalPrice: prod.originalPrice || undefined,
          primaryImage: pImg || defaultCuratedProducts[idx % defaultCuratedProducts.length].primaryImage,
          secondaryImage: sImg || defaultCuratedProducts[idx % defaultCuratedProducts.length].secondaryImage,
          badge: idx === 0 ? "Signature" : undefined,
          tag: idx === 1 ? "Best Seller" : undefined,
        };
      })
    : defaultCuratedProducts;

  // Fallback curated articles merged with DB posts
  const defaultCuratedArticles = [
    {
      id: "journal-01",
      issue: "ISSUE 01 / LIVING & ROUTINE",
      title: "단정한 아침을 여는 10분의 정돈 습관",
      desc: "어수선한 일상에서 벗어나 나와 나의 공간을 돌보는 가장 고요하고 다정한 케어 리추얼.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
      link: "/journal"
    },
    {
      id: "journal-02",
      issue: "ISSUE 02 / SAFE ESSENCE",
      title: "우리가 머무는 공간에 남아야 할 성분들",
      desc: "인공 향료와 독한 화학 잔여물 없이, 표면을 지키고 공기를 맑게 만드는 자연 유래 포뮬러 이야기.",
      image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop",
      link: "/journal"
    },
    {
      id: "journal-03",
      issue: "ISSUE 03 / KITCHEN AESTHETIC",
      title: "오브제가 되는 주방과 찌든 때 없는 일상",
      desc: "수납장에 숨기지 않고 아일랜드 식탁 위에 올려두어도 감각적인 인테리어가 되는 미니멀 디자인.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
      link: "/journal"
    },
    {
      id: "journal-04",
      issue: "ISSUE 04 / ZERO PLASTIC",
      title: "지속 가능한 집을 만드는 에코 리필 파우치",
      desc: "플라스틱 사용량을 70% 줄이고 공간의 미니멀리즘을 유지하는 퍼베이드의 순환 프로젝트.",
      image: "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop",
      link: "/journal"
    }
  ];

  const displayArticles = (journalPosts.length > 0 || featuredGuides.length > 0)
    ? [
        ...journalPosts.map((post, idx) => ({
          id: post.id,
          issue: `ISSUE 0${idx + 1} / LIVING JOURNAL`,
          title: post.title,
          desc: post.content.replace(/[#*`]/g, '').substring(0, 70),
          image: defaultCuratedArticles[idx % defaultCuratedArticles.length].image,
          link: `/journal/${post.id}`
        })),
        ...featuredGuides.map((guide, idx) => ({
          id: guide.id,
          issue: `CARE ROUTINE / ${guide.category || 'GUIDE'}`,
          title: guide.title,
          desc: guide.summary || guide.content.substring(0, 70),
          image: guide.thumbnailUrl || defaultCuratedArticles[(idx + 2) % defaultCuratedArticles.length].image,
          link: `/guide/${guide.id}`
        }))
      ].slice(0, 6)
    : defaultCuratedArticles;

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* 1. Full-Bleed Hero Banner (Full Viewport) */}
      <section className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-zinc-950">
        {heroBgType === "VIDEO" && heroBgUrl ? (
          <video 
            key={heroBgUrl}
            autoPlay 
            loop 
            muted 
            playsInline 
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover rounded-none"
          >
            <source src={heroBgUrl} type="video/mp4" />
            <source src={heroBgUrl} type="video/webm" />
          </video>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
            style={{
              backgroundImage: `url('${activeBgUrl}')`,
              backgroundPosition: "center 40%"
            }}
          />
        )}

        {/* Dynamic Overlay Mask (Only if opacity > 0 in Backoffice) */}
        {heroOverlayOpacity > 0 && (
          <div 
            className="absolute inset-0 bg-black pointer-events-none transition-opacity" 
            style={{ opacity: heroOverlayOpacity / 100 }}
          />
        )}

        {/* Hero Typography (Strictly controlled by Backoffice HERO_SHOW_TEXT setting) */}
        {heroShowText && (heroTitle || heroSubtitle) && (
          <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto space-y-6 pt-16">
            {heroTitle && (
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-light tracking-tight leading-[1.15] whitespace-pre-line">
                {heroTitle}
              </h1>
            )}
            {heroSubtitle && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-light max-w-xl mx-auto leading-relaxed pt-2 whitespace-pre-line">
                {heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center justify-center text-white/80 gap-2">
          <span className="text-[10px] uppercase tracking-[0.25em] font-light">Scroll Down</span>
          <ChevronDown className="w-4 h-4 animate-bounce opacity-70" />
        </div>
      </section>

      {/* 2. Editorial Narrative / Brand Philosophy Section (Fully Synced with CMS) */}
      {isWhyVisible && (
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center w-full">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400">
              Brand Philosophy
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-zinc-900 leading-snug tracking-tight break-keep max-w-4xl mx-auto whitespace-pre-line">
              {whyTitle}
            </h2>
            <div className="w-12 h-[1px] bg-zinc-300 mx-auto my-4 sm:my-6" />
            <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-light leading-relaxed sm:leading-loose max-w-2xl mx-auto break-keep whitespace-pre-line">
              {whySubtitle}
            </p>
          </div>

          {/* 3 Pillars: Clean Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-12 sm:pt-16 lg:pt-20 text-left">
            <div className="space-y-3 p-6 sm:p-8 bg-white rounded-none border border-zinc-200 hover:border-zinc-900 transition-colors shadow-xs">
              <span className="text-xs font-mono text-zinc-400">01 / SAFETY</span>
              <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-medium">{whyCard1Title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light break-keep whitespace-pre-line">
                {whyCard1Desc}
              </p>
            </div>
            <div className="space-y-3 p-6 sm:p-8 bg-white rounded-none border border-zinc-200 hover:border-zinc-900 transition-colors shadow-xs">
              <span className="text-xs font-mono text-zinc-400">02 / AESTHETIC</span>
              <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-medium">{whyCard2Title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light break-keep whitespace-pre-line">
                {whyCard2Desc}
              </p>
            </div>
            <div className="space-y-3 p-6 sm:p-8 bg-white rounded-none border border-zinc-200 hover:border-zinc-900 transition-colors shadow-xs">
              <span className="text-xs font-mono text-zinc-400">03 / SUSTAINABLE</span>
              <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-medium">{whyCard3Title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light break-keep whitespace-pre-line">
                {whyCard3Desc}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Horizontal Curated Product Carousel (Fluid Smooth Flow) */}
      <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-zinc-200/60 overflow-hidden w-full">
        <div className="container mx-auto max-w-6xl">
          <EditorialProductCarousel products={displayProducts} />
        </div>
      </section>

      {/* 4. Full-Width Split Editorial Visual & Routine */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left: Atmospheric Living Scene */}
          <div className="relative aspect-[4/3] sm:aspect-[4/5] rounded-none overflow-hidden border border-zinc-200 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop"
              alt="Pervade Morning Routine"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 rounded-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white">
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-80 block mb-1">
                Aesthetic Routine
              </span>
              <p className="font-serif text-lg sm:text-2xl font-light">
                “청소는 고된 노동이 아니라, 나의 공간을 환대하는 가장 다정한 의식입니다.”
              </p>
            </div>
          </div>

          {/* Right: Narrative Detail */}
          <div className="space-y-6 sm:space-y-8 lg:pl-4">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400">
              Care Routine
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light text-zinc-900 tracking-tight leading-tight break-keep">
              매일 아침 햇살과 함께<br className="hidden sm:inline" />
              시작하는 10분의 정돈
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed break-keep">
              가벼운 분무 한 번으로 공간의 공기가 달라집니다. 끈적임이나 독한 잔여물 없이 깔끔하게 닦아내고, 은은하고 자연스러운 여운만을 남깁니다.
            </p>

            <div className="space-y-4 pt-2 border-t border-zinc-200">
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-zinc-400 pt-0.5">01</span>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 font-serif">주방 인덕션 &amp; 상판 케어</h4>
                  <p className="text-xs text-zinc-500 font-light break-keep">찌든 기름때 위에 분무 후 30초 뒤 극세사 타월로 부드럽게 닦아냅니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-zinc-400 pt-0.5">02</span>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 font-serif">욕실 거울 &amp; 수전 광택</h4>
                  <p className="text-xs text-zinc-500 font-light break-keep">유리 표면의 얼룩과 물때를 지우고 오염 재착색 방지 코팅막을 형성합니다.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-xs font-serif tracking-widest uppercase text-zinc-900 hover:text-zinc-600 border-b border-zinc-900 pb-1"
              >
                케어 루틴 가이드북 읽어보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Living Journal (Horizontal Flowing Carousel) */}
      <section className="py-16 sm:py-24 bg-white border-t border-zinc-200/70 px-4 sm:px-6 lg:px-8 overflow-hidden w-full">
        <div className="container mx-auto max-w-6xl">
          <EditorialJournalCarousel articles={displayArticles} />
        </div>
      </section>

      <PromotionModal promotion={latestPromotion ? JSON.parse(JSON.stringify(latestPromotion)) : null} />
    </div>
  );
}



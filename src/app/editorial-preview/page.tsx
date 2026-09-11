import Link from "next/link";
import { ArrowRight, Sparkles, Droplets, ShieldCheck, ChevronDown, ArrowUpRight } from "lucide-react";
import { EditorialHeader } from "@/components/editorial/EditorialHeader";
import { EditorialProductCarousel } from "@/components/editorial/EditorialProductCarousel";
import { EditorialJournalCarousel } from "@/components/editorial/EditorialJournalCarousel";

export const metadata = {
  title: "P E R V A D E | Editorial Lifestyle Preview",
  description: "공간을 비우고, 본질을 채우다. 퍼베이드 감성 에디토리얼 프리미엄 라이프스타일",
};

export default function EditorialPreviewPage() {
  const curatedArticles = [
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

  const curatedProducts = [
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
      volume: "Set of 3 (Linen, Sand, Slate)",
      price: 14000,
      originalPrice: 17000,
      primaryImage: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop",
      secondaryImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
      badge: "Accessory",
      tag: "Essential"
    }
  ];

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden bg-[#FAF9F6] text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Editorial Header */}
      <EditorialHeader />

      {/* 1. Full-Bleed Hero Banner (Full Viewport) */}
      <section className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Fullscreen Atmospheric Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000&auto=format&fit=crop')`,
            backgroundPosition: "center 40%"
          }}
        />
        {/* Soft Ambient Shadow Overlay */}
        <div className="absolute inset-0 bg-black/35 backdrop-brightness-90" />

        {/* Hero Typography */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto space-y-6 pt-16">
          <p className="text-xs sm:text-sm font-light tracking-[0.3em] uppercase opacity-90">
            Silence in Cleanliness
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-light tracking-tight leading-[1.15]">
            공간을 비우고,<br />본질을 채우는 시간
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-light max-w-xl mx-auto leading-relaxed pt-2">
            퍼베이드는 자연에서 온 순수한 성분과 절제된 미학으로<br className="hidden sm:inline" />
            당신의 매일 머무는 공간에 고요한 휴식을 선사합니다.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-white text-zinc-950 text-xs font-medium tracking-widest uppercase rounded-full hover:bg-zinc-100 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Discover Collection
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center justify-center text-white/80 gap-2">
          <span className="text-[10px] uppercase tracking-[0.25em] font-light">Scroll Down</span>
          <ChevronDown className="w-4 h-4 animate-bounce opacity-70" />
        </div>
      </section>

      {/* 2. Editorial Narrative / Brand Philosophy Section */}
      <section className="py-24 sm:py-36 px-6 max-w-5xl mx-auto text-center">
        <div className="space-y-6 sm:space-y-8">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400">
            Brand Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-zinc-900 leading-snug tracking-tight break-keep max-w-4xl mx-auto">
            깨끗함이란 인공적인 향으로 덮는 것이 아니라,<br className="hidden sm:inline" />
            가장 맑은 본래의 상태로 되돌리는 것.
          </h2>
          <div className="w-12 h-[1px] bg-zinc-300 mx-auto my-6" />
          <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-light leading-loose max-w-2xl mx-auto break-keep">
            퍼베이드는 눈에 띄는 화려한 포장 대신 미니멀한 실루엣을,<br className="hidden sm:inline" />
            독한 화학 계면활성제 대신 식물 유래 세정 성분을 선택했습니다.<br className="hidden sm:inline" />
            주방의 기름때부터 욕실의 물때까지, 표면을 상하게 하지 않고 자연스럽게 스며듭니다.
          </p>
        </div>

        {/* 3 Pillars Editorial Grid (Smooth horizontal snap scroll on mobile) */}
        <div className="flex md:grid md:grid-cols-3 gap-6 sm:gap-8 pt-16 sm:pt-20 text-left overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
          <div className="shrink-0 w-[260px] sm:w-[300px] md:w-auto snap-start space-y-3 p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200/60 shadow-xs">
            <span className="text-xs font-mono text-zinc-400">01 / SAFETY</span>
            <h3 className="font-serif text-lg text-zinc-900 font-medium">자연 유래 안심 성분</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light break-keep">
              코코넛과 옥수수에서 추출한 식물 유래 계면활성제로 아이와 반려동물이 머무는 공간에도 안심하고 사용할 수 있습니다.
            </p>
          </div>
          <div className="shrink-0 w-[260px] sm:w-[300px] md:w-auto snap-start space-y-3 p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200/60 shadow-xs">
            <span className="text-xs font-mono text-zinc-400">02 / AESTHETIC</span>
            <h3 className="font-serif text-lg text-zinc-900 font-medium">공간과 조화로운 미학</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light break-keep">
              숨기고 싶은 청소 도구가 아닌, 선반 위에 오브제처럼 자연스럽게 놓여 감각적인 인테리어를 완성합니다.
            </p>
          </div>
          <div className="shrink-0 w-[260px] sm:w-[300px] md:w-auto snap-start space-y-3 p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200/60 shadow-xs">
            <span className="text-xs font-mono text-zinc-400">03 / SUSTAINABLE</span>
            <h3 className="font-serif text-lg text-zinc-900 font-medium">지속 가능한 순환</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light break-keep">
              플라스틱 소비를 70% 이상 줄일 수 있는 대용량 에코 리필 파우치 시스템을 통해 환경에 대한 책임을 실천합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Horizontal Curated Product Carousel (Fluid Smooth Flow) */}
      <section className="py-20 sm:py-28 px-6 bg-white border-y border-zinc-200/60 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <EditorialProductCarousel products={curatedProducts} />
        </div>
      </section>

      {/* 4. Full-Width Split Editorial Visual & Routine */}
      <section className="py-24 sm:py-36 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Left: Atmospheric Living Scene */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop"
              alt="Pervade Morning Routine"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-80 block mb-1">
                Aesthetic Routine
              </span>
              <p className="font-serif text-xl sm:text-2xl font-light">
                “청소는 고된 노동이 아니라, 나의 공간을 환대하는 가장 다정한 의식입니다.”
              </p>
            </div>
          </div>

          {/* Right: Narrative Detail */}
          <div className="space-y-6 sm:space-y-8 lg:pl-6">
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400">
              Care Routine
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light text-zinc-900 tracking-tight leading-tight break-keep">
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
                  <h4 className="text-sm font-medium text-zinc-900">주방 인덕션 & 상판 케어</h4>
                  <p className="text-xs text-zinc-500 font-light break-keep">찌든 기름때 위에 분무 후 30초 뒤 극세사 타월로 부드럽게 닦아냅니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-zinc-400 pt-0.5">02</span>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900">욕실 거울 & 수전 광택</h4>
                  <p className="text-xs text-zinc-500 font-light break-keep">유리 표면의 얼룩과 물때를 지우고 오염 재착색 방지 코팅막을 형성합니다.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-zinc-900 hover:text-zinc-600 border-b border-zinc-900 pb-1"
              >
                케어 루틴 가이드북 읽어보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Living Journal (Horizontal Flowing Carousel) */}
      <section className="py-24 bg-stone-100/70 border-t border-zinc-200/70 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <EditorialJournalCarousel articles={curatedArticles} />
        </div>
      </section>

      {/* 6. Editorial Footer (Warm Ivory & Cream Aesthetic) */}
      <footer className="bg-[#F4F1EA] text-zinc-800 py-20 px-6 border-t border-[#E6E1D6]">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
          <div className="space-y-4 md:col-span-2">
            <span className="text-2xl font-serif tracking-[0.25em] uppercase font-light block text-zinc-950">
              P E R V A D E
            </span>
            <p className="text-zinc-600 font-light leading-relaxed max-w-sm">
              퍼베이드는 일상의 가장 가까운 곳에서 공간을 정돈하고 본질을 채우는 프리미엄 라이프스타일 케어 브랜드입니다.
            </p>
          </div>

          <div className="space-y-3 font-light">
            <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest block">Navigation</span>
            <ul className="space-y-2 text-zinc-700">
              <li><Link href="/shop" className="hover:text-zinc-950 transition-colors">전체 상품 컬렉션</Link></li>
              <li><Link href="/about" className="hover:text-zinc-950 transition-colors">브랜드 스토리</Link></li>
              <li><Link href="/journal" className="hover:text-zinc-950 transition-colors">라이프스타일 저널</Link></li>
              <li><Link href="/guide" className="hover:text-zinc-950 transition-colors">케어 루틴 가이드</Link></li>
            </ul>
          </div>

          <div className="space-y-3 font-light">
            <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest block">Customer Service</span>
            <div className="space-y-1 text-zinc-600">
              <p>평일 10:00 - 18:00 (점심 12:30 - 13:30)</p>
              <p>주말 및 공휴일 휴무</p>
              <p className="pt-2 font-medium text-zinc-900">support@pervade.co.kr</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl pt-12 mt-12 border-t border-[#E6E1D6] flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-[11px] font-mono">
          <p>© 2026 PERVADE. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-zinc-800">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-zinc-800">이용약관</Link>
          </div>
        </div>
      </footer>

      {/* Floating Mode Switcher Badge */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/95 text-zinc-900 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-zinc-200/80 flex items-center gap-3 text-xs tracking-wider">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-800">희녹 스타일 에디토리얼 프리뷰 모드</span>
          <div className="w-[1px] h-3 bg-zinc-300" />
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-950 underline font-medium"
          >
            현재 메인 홈 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

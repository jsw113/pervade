"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { EditorialProductCard } from "@/components/editorial/EditorialProductCard";

interface ProductItem {
  id: string;
  name: string;
  subTitle: string;
  volume: string;
  price: number;
  originalPrice?: number;
  primaryImage: string;
  secondaryImage: string;
  badge?: string;
  tag?: string;
}

interface EditorialProductCarouselProps {
  products: ProductItem[];
}

export function EditorialProductCarousel({ products }: EditorialProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    
    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Controls */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-serif text-zinc-900 font-light tracking-tight">
            PRODUCTS
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/shop"
            className="text-xs font-medium tracking-widest uppercase text-zinc-900 hover:text-zinc-500 transition-colors hidden sm:flex items-center gap-1 group"
          >
            VIEW ALL
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="이전 상품 보기"
              className={`w-9 h-9 rounded-none border border-zinc-200 flex items-center justify-center transition-all ${
                canScrollLeft 
                  ? "text-zinc-900 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white" 
                  : "text-zinc-300 border-zinc-100 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="다음 상품 보기"
              className={`w-9 h-9 rounded-none border border-zinc-200 flex items-center justify-center transition-all ${
                canScrollRight 
                  ? "text-zinc-900 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white" 
                  : "text-zinc-300 border-zinc-100 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Flow Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-4 pt-2 -mx-4 sm:mx-0 px-4 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[75vw] sm:w-[340px] md:w-[400px] lg:w-[440px] xl:w-[480px] 2xl:w-[500px] snap-start"
          >
            <EditorialProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Minimal Scroll Progress Bar */}
      <div className="w-full bg-zinc-100 h-[2px] rounded-none overflow-hidden mt-4">
        <div
          className="bg-zinc-900 h-full transition-all duration-300 rounded-none"
          style={{ width: `${Math.max(15, scrollProgress)}%` }}
        />
      </div>
    </div>
  );
}

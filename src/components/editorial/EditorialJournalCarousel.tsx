"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface JournalItem {
  id: string;
  issue: string;
  title: string;
  desc: string;
  image: string;
  link: string;
}

interface EditorialJournalCarouselProps {
  articles: JournalItem[];
}

export function EditorialJournalCarousel({ articles }: EditorialJournalCarouselProps) {
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
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header with Title & Left/Right Arrows */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-400 block mb-2">
            Editorial Journal
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-light text-zinc-900 tracking-tight break-keep">
            공간과 라이프스타일 이야기
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light mt-2 break-keep">
            퍼베이드가 제안하는 감각적인 공간 케어 노하우와 일상의 정돈 에세이
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/journal"
            className="text-xs font-medium tracking-widest uppercase text-zinc-900 hover:text-zinc-500 transition-colors hidden sm:flex items-center gap-1 group"
          >
            저널 전체보기
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="이전 이야기 보기"
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
              aria-label="다음 이야기 보기"
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

      {/* Horizontal Flow Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-4 pt-2 -mx-4 sm:mx-0 px-4 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {articles.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="shrink-0 w-[72vw] max-w-[290px] sm:w-[320px] md:w-[350px] snap-start group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-none border border-zinc-200 bg-zinc-900 shadow-sm">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Title embedded inside bottom-left of image */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white space-y-2 z-10">
                {item.issue && (
                  <span className="text-[10px] font-mono tracking-widest uppercase text-white/70 block">
                    {item.issue}
                  </span>
                )}
                <h3 className="font-serif text-base sm:text-lg font-light text-white leading-snug tracking-tight break-keep group-hover:underline underline-offset-4 line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Minimal Scroll Progress Bar */}
      <div className="w-full bg-zinc-200/60 h-[2px] rounded-none overflow-hidden mt-2">
        <div
          className="bg-zinc-900 h-full transition-all duration-300 rounded-none"
          style={{ width: `${Math.max(20, scrollProgress)}%` }}
        />
      </div>
    </div>
  );
}

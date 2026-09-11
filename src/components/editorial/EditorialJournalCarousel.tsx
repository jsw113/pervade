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
              className={`w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center transition-all ${
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
              className={`w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center transition-all ${
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
        className="flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-4 pt-2 -mx-6 px-6 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {articles.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="shrink-0 w-[300px] sm:w-[380px] md:w-[420px] snap-start group block space-y-4"
          >
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-zinc-200 shadow-xs">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-mono text-zinc-400 tracking-wider">
                {item.issue}
              </div>
              <h3 className="font-serif text-base sm:text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors break-keep leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-500 font-light line-clamp-2 leading-relaxed break-keep">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Minimal Scroll Progress Bar */}
      <div className="w-full bg-zinc-200/60 h-[2px] rounded-full overflow-hidden mt-2">
        <div
          className="bg-zinc-900 h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(20, scrollProgress)}%` }}
        />
      </div>
    </div>
  );
}

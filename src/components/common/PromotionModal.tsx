"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Clock, Sparkles } from "lucide-react";

interface PromotionData {
  id: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  badgeText?: string | null;
  discountText?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  startDate?: Date | string;
  endDate?: Date | string | null;
  isActive?: boolean;
}

interface PromotionModalProps {
  promotion: PromotionData | null;
}

export function PromotionModal({ promotion }: PromotionModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!promotion || !promotion.id) return;

    // 1. Client-side active period check
    const now = new Date();
    if (promotion.startDate && new Date(promotion.startDate) > now) {
      setIsOpen(false);
      return;
    }
    if (promotion.endDate && new Date(promotion.endDate) < now) {
      setIsOpen(false);
      return;
    }

    // 2. Check if user dismissed permanently ("다시 보지 않기")
    const neverShowKey = `pervade_never_show_promo_${promotion.id}`;
    if (localStorage.getItem(neverShowKey) === "true" || localStorage.getItem("pervade_never_show_all_promos") === "true") {
      setIsOpen(false);
      return;
    }

    // 3. Check if user dismissed today ("오늘 하루 보지 않기")
    const hideKey = `pervade_hide_promo_${promotion.id}`;
    const hiddenDate = localStorage.getItem(hideKey);
    const todayStr = new Date().toISOString().split("T")[0];

    if (hiddenDate === todayStr) {
      setIsOpen(false);
      return;
    }

    // Smooth entry after page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [promotion]);

  if (!isOpen || !promotion) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    if (promotion?.id) {
      const hideKey = `pervade_hide_promo_${promotion.id}`;
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(hideKey, todayStr);
    }
    setIsOpen(false);
  };

  const handleNeverShow = () => {
    if (promotion?.id) {
      const neverShowKey = `pervade_never_show_promo_${promotion.id}`;
      localStorage.setItem(neverShowKey, "true");
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-none overflow-hidden shadow-2xl border border-zinc-200 animate-scaleUp text-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-none bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="팝업 닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Promotion Image (if available) */}
        {promotion.imageUrl ? (
          <div className="relative aspect-[16/10] w-full bg-zinc-100 overflow-hidden rounded-none">
            <img
              src={promotion.imageUrl}
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
            {promotion.badgeText && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-zinc-950 text-white text-[10px] font-mono rounded-none uppercase tracking-wider shadow-md flex items-center gap-1.5">
                {promotion.badgeText}
              </span>
            )}
          </div>
        ) : (
          <div className="p-6 bg-zinc-950 text-white flex items-center gap-3 rounded-none">
            <div className="w-10 h-10 rounded-none bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded-none inline-block mb-1">
                {promotion.badgeText || "SPECIAL EVENT"}
              </span>
              <h3 className="font-serif text-base leading-tight">퍼베이드 특별 프로모션</h3>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-serif font-light text-zinc-950 tracking-tight leading-snug">
              {promotion.title}
            </h2>
            {promotion.subtitle && (
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                {promotion.subtitle}
              </p>
            )}
          </div>

          {promotion.discountText && (
            <div className="bg-stone-50 border border-zinc-200 rounded-none p-3 text-center">
              <span className="text-xs font-mono font-medium text-zinc-900">
                {promotion.discountText}
              </span>
            </div>
          )}

          {promotion.content && (
            <p className="text-xs text-zinc-500 font-light leading-relaxed whitespace-pre-line border-t border-zinc-100 pt-3">
              {promotion.content}
            </p>
          )}

          {/* CTA Link Button */}
          <div className="pt-2">
            <Link
              href={promotion.linkUrl || "/shop"}
              onClick={handleClose}
              className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-serif tracking-widest uppercase text-xs rounded-none flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              {promotion.buttonText || "혜택 바로가기"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer Actions: 오늘 하루 보지 않기 / 다시 보지 않기 / 닫기 */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-5 py-3 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <button
              onClick={handleHideToday}
              className="hover:text-zinc-950 transition-colors font-medium flex items-center gap-1.5 cursor-pointer text-[11px] sm:text-xs"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              오늘 하루 보지 않기
            </button>
            <span className="text-zinc-300">|</span>
            <button
              onClick={handleNeverShow}
              className="hover:text-zinc-950 transition-colors font-medium cursor-pointer text-[11px] sm:text-xs"
            >
              다시 보지 않기
            </button>
          </div>
          <button
            onClick={handleClose}
            className="hover:text-zinc-950 font-bold transition-colors cursor-pointer text-[11px] sm:text-xs px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 rounded-none text-zinc-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

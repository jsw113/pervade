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

    // Check if user dismissed today
    const hideKey = `pervade_hide_promo_${promotion.id}`;
    const hiddenDate = localStorage.getItem(hideKey);
    const todayStr = new Date().toISOString().split("T")[0];

    if (hiddenDate === todayStr) {
      setIsOpen(false);
    } else {
      // Small delay for smooth entry after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [promotion]);

  if (!isOpen || !promotion) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    const hideKey = `pervade_hide_promo_${promotion.id}`;
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem(hideKey, todayStr);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 animate-scaleUp text-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="팝업 닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Promotion Image (if available) */}
        {promotion.imageUrl ? (
          <div className="relative aspect-[16/10] w-full bg-zinc-100 overflow-hidden">
            <img
              src={promotion.imageUrl}
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
            {promotion.badgeText && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {promotion.badgeText}
              </span>
            )}
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-md inline-block mb-1">
                {promotion.badgeText || "SPECIAL EVENT"}
              </span>
              <h3 className="font-bold text-base leading-tight">퍼베이드 특별 프로모션</h3>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight leading-snug">
              {promotion.title}
            </h2>
            {promotion.subtitle && (
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                {promotion.subtitle}
              </p>
            )}
          </div>

          {promotion.discountText && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <span className="text-sm font-black text-amber-800">
                🎉 {promotion.discountText}
              </span>
            </div>
          )}

          {promotion.content && (
            <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-line border-t border-zinc-100 pt-3">
              {promotion.content}
            </p>
          )}

          {/* CTA Link Button */}
          <div className="pt-2">
            <Link
              href={promotion.linkUrl || "/shop"}
              onClick={handleClose}
              className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {promotion.buttonText || "혜택 바로가기"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer Actions: 오늘 하루 보지 않기 / 닫기 */}
        <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
          <button
            onClick={handleHideToday}
            className="hover:text-zinc-900 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            오늘 하루 보지 않기
          </button>
          <button
            onClick={handleClose}
            className="hover:text-zinc-900 font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

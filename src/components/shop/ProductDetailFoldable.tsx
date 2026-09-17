"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDetailFoldableProps {
  children: React.ReactNode;
}

export function ProductDetailFoldable({ children }: ProductDetailFoldableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-none pb-4" : "max-h-[750px] overflow-hidden"
        }`}
      >
        {children}

        {/* Gradient Overlay & Expand Button when Collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-white via-white/85 to-transparent flex items-end justify-center pb-6 z-10 pointer-events-none">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="pointer-events-auto px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>상품 상세정보 펼쳐보기</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Button when Expanded */}
      {isExpanded && (
        <div className="pt-10 pb-4 text-center border-t border-zinc-200/80">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              const detailsEl = document.getElementById("details");
              if (detailsEl) {
                detailsEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-7 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 group shadow-2xs"
          >
            <span>상세정보 접기</span>
            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

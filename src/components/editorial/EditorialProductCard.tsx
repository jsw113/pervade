"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, ArrowRight } from "lucide-react";

interface EditorialProductCardProps {
  id: string;
  name: string;
  subTitle: string;
  price: number;
  originalPrice?: number;
  primaryImage: string;
  secondaryImage: string;
  volume: string;
  tag?: string;
  badge?: string;
}

export function EditorialProductCard({
  id,
  name,
  subTitle,
  price,
  originalPrice,
  primaryImage,
  secondaryImage,
  volume,
  tag,
  badge
}: EditorialProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      className="group flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/shop/${id}`} className="block relative">
        {/* Image Container with Editorial Aspect Ratio (4:5) */}
        <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden rounded-none">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />

          {/* Secondary Ambient Lifestyle Image on Hover */}
          <img
            src={secondaryImage}
            alt={`${name} lifestyle`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          />

          {/* Minimal Badge */}
          {(badge || tag) && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[10px] tracking-widest font-mono uppercase px-2 py-0.5 bg-white text-zinc-900 rounded-none shadow-xs">
                {badge || tag}
              </span>
            </div>
          )}

          {/* Quick Add Floating Button on Hover */}
          <div className="absolute bottom-3 right-3 z-20">
            <button
              onClick={handleQuickAdd}
              aria-label="쇼핑백에 담기"
              className={`w-9 h-9 rounded-none flex items-center justify-center transition-all duration-300 shadow-md ${
                isAdded 
                  ? "bg-zinc-900 text-white" 
                  : isHovered 
                    ? "bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white opacity-100" 
                    : "bg-white/90 text-zinc-900 opacity-0 md:opacity-0"
              }`}
            >
              {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="pt-4 pb-2 space-y-1.5">
          <div className="flex justify-between items-baseline text-xs text-zinc-400 font-mono tracking-wider">
            <span>{volume}</span>
            {originalPrice && originalPrice > price && (
              <span className="line-through text-zinc-300">₩{originalPrice.toLocaleString()}</span>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-normal tracking-tight group-hover:text-zinc-600 transition-colors">
            {name}
          </h3>

          <p className="text-xs text-zinc-500 font-light line-clamp-1">
            {subTitle}
          </p>

          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-medium text-zinc-950">
              ₩{price.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShoppingCart, ArrowRight, Check, Plus, Minus, Sparkles } from "lucide-react";

interface GuideProductQuickBuyProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    imageUrl?: string | null;
    category?: string | null;
  };
}

export function GuideProductQuickBuy({ product }: GuideProductQuickBuyProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          optionSelected: "기본 패키지 단품",
          shippingMethod: "일반택배"
        })
      });

      if (res.ok) {
        setAdded(true);
        window.dispatchEvent(new Event("pervade_auth_update"));
        setTimeout(() => setAdded(false), 3000);
      } else {
        alert("장바구니 담기에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDirectBuy = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800 space-y-6">
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[11px] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          가이드 추천 공식 사용 제품
        </span>
        <span className="text-[11px] text-zinc-400 font-medium">원클릭 간편 구매</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Product Info */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl overflow-hidden shrink-0 border border-zinc-800 p-1 shadow-md">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{product.category || "다목적 세정제"}</span>
            <h3 className="font-extrabold text-lg sm:text-xl text-white truncate max-w-sm">{product.name}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-400">₩{product.price.toLocaleString()}원</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-500 line-through">₩{product.originalPrice.toLocaleString()}원</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quantity & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
          {/* Quantity Selector */}
          <div className="flex items-center bg-zinc-800/80 border border-zinc-700 rounded-2xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-black text-sm text-white font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
              added 
                ? "bg-emerald-600 text-white" 
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-white" />
                장바구니 담김!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-zinc-400" />
                장바구니 담기
              </>
            )}
          </button>

          {/* Direct Buy Button */}
          <button
            type="button"
            onClick={handleDirectBuy}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>₩{totalPrice.toLocaleString()}원 바로 구매</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, MessageCircle, Truck, ShieldCheck, ShieldAlert, Check } from "lucide-react";
import Link from "next/link";
import { RealNameVerifier } from "./RealNameVerifier";

interface ProductOption {
  id: string;
  name: string;
  extraPrice: number;
  isSoldOut?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  shippingFee: number;
  options?: string | null;
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  
  // Parse dynamic options (if none configured, it's an empty array)
  let initialOptions: ProductOption[] = [];
  if (product.options) {
    try {
      const parsed = JSON.parse(product.options);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialOptions = parsed;
      }
    } catch (e) {
      console.warn("Failed to parse product options:", e);
    }
  }

  const [availableOptions] = useState<ProductOption[]>(initialOptions);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    initialOptions[0]?.id || ""
  );
  
  const [shippingMethod] = useState("일반택배");
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User auth & verification
  const [user, setUser] = useState<{ id: string; name: string; realNameVerified: boolean } | null>(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);

  const hasOptions = availableOptions.length > 0;
  const currentOption = hasOptions 
    ? (availableOptions.find(o => o.id === selectedOptionId) || availableOptions[0])
    : null;

  const fetchAuth = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.loggedIn) {
          setUser(authData.user);
          
          // Wishlist check
          const wishRes = await fetch("/api/wishlist");
          if (wishRes.ok) {
            const wishes = await wishRes.json();
            const found = wishes.some((w: any) => w.productId === product.id);
            setIsWished(found);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, [product.id]);

  const checkAuthOrRedirect = () => {
    if (!user) {
      if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login");
      }
      return false;
    }
    return true;
  };

  const handleWishlist = async () => {
    if (!checkAuthOrRedirect()) return;

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsWished(data.wished);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async () => {
    if (!checkAuthOrRedirect()) return;

    if (currentOption && currentOption.isSoldOut) {
      alert("선택하신 옵션은 현재 품절 상태입니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      let formattedOptionName = "단품";
      if (currentOption) {
        formattedOptionName = currentOption.extraPrice !== 0
          ? `${currentOption.name} (${currentOption.extraPrice > 0 ? `+${currentOption.extraPrice.toLocaleString()}원` : `-${Math.abs(currentOption.extraPrice).toLocaleString()}원`})`
          : currentOption.name;
      }
        
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          optionSelected: formattedOptionName,
          shippingMethod,
          quantity
        }),
      });

      if (response.ok) {
        if (confirm("장바구니에 상품을 담았습니다. 장바구니로 이동하시겠습니까?")) {
          router.push("/cart");
        }
      } else {
        alert("장바구니 담기에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkAuthOrRedirect()) return;

    if (currentOption && currentOption.isSoldOut) {
      alert("선택하신 옵션은 현재 품절 상태입니다.");
      return;
    }

    // Real-name verification check requirement
    if (!user?.realNameVerified) {
      if (confirm("안전한 전자상거래 및 주문 혜택 적용을 위해 휴대폰 실명인증이 필요합니다.\n지금 바로 본인인증(실명인증)을 진행하시겠습니까?")) {
        setIsVerifierOpen(true);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      let formattedOptionName = "단품";
      if (currentOption) {
        formattedOptionName = currentOption.extraPrice !== 0
          ? `${currentOption.name} (${currentOption.extraPrice > 0 ? `+${currentOption.extraPrice.toLocaleString()}원` : `-${Math.abs(currentOption.extraPrice).toLocaleString()}원`})`
          : currentOption.name;
      }
      
      const extraCost = currentOption ? (currentOption.extraPrice || 0) : 0;
      const totalAmount = (product.price + extraCost) * quantity + product.shippingFee;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          optionSelected: formattedOptionName,
          shippingMethod,
          shippingFee: product.shippingFee,
          totalAmount
        }),
      });

      if (response.ok) {
        alert("주문 및 결제가 성공적으로 완료되었습니다!");
        router.push("/mypage");
        router.refresh();
      } else {
        alert("주문 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extraCost = currentOption ? (currentOption.extraPrice || 0) : 0;
  const unitPrice = product.price + extraCost;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="space-y-6">
      {/* Real Name Verification Notification if logged in but unverified */}
      {user && !user.realNameVerified && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>실명 미인증 회원 (주문 시 본인인증 필요)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsVerifierOpen(true)}
            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition-colors"
          >
            인증하기
          </button>
        </div>
      )}

      {/* Option Selector (Only rendered if product has options) */}
      <div className="space-y-3 pt-4 border-t">
        {hasOptions && (
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              상품 구매 옵션 선택 (필수) *
            </label>
            <select 
              value={selectedOptionId}
              onChange={(e) => setSelectedOptionId(e.target.value)}
              className="w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-xs sm:text-sm font-semibold text-zinc-900 shadow-2xs"
            >
              {availableOptions.map((opt) => {
                const isAvailable = !opt.isSoldOut;
                const priceText = opt.extraPrice > 0 
                  ? ` (+${opt.extraPrice.toLocaleString()}원)` 
                  : opt.extraPrice < 0 
                  ? ` (-${Math.abs(opt.extraPrice).toLocaleString()}원)` 
                  : " (추가금 없음)";
                return (
                  <option key={opt.id} value={opt.id} disabled={!isAvailable}>
                    {opt.name} {priceText} {!isAvailable ? " [품절]" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        
        {/* Quantity selector */}
        <div className="flex justify-between items-center bg-zinc-50 p-3.5 rounded-xl border">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-800">구매 수량</span>
            <span className="text-[11px] text-zinc-500 font-mono">
              단가: ₩{unitPrice.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center border rounded-lg bg-white shadow-2xs overflow-hidden">
            <button 
              type="button" 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-3 py-1 text-base font-bold border-r hover:bg-zinc-100 text-zinc-700 transition-colors"
            >
              -
            </button>
            <span className="px-4 py-1 text-xs font-black min-w-[36px] text-center">{quantity}</span>
            <button 
              type="button" 
              onClick={() => setQuantity(q => q + 1)}
              className="px-3 py-1 text-base font-bold border-l hover:bg-zinc-100 text-zinc-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Method Information */}
      <div className="space-y-2 pt-4 border-t">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
          배송 방법
        </label>
        <div className="p-3.5 bg-zinc-50 border rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border rounded-lg shadow-2xs">
              <Truck className="w-4 h-4 text-zinc-800" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span>일반택배 (CJ대한통운)</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  당일 출고
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                평일 14:00 이전 결제 시 당일 발송 (1~2일 소요)
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-zinc-900">
              {product.shippingFee === 0 ? (
                <span className="text-emerald-600 font-bold">무료배송</span>
              ) : (
                `₩${product.shippingFee.toLocaleString()}원`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Total Amount Card */}
      <div className="bg-zinc-50 p-4 rounded-xl border space-y-2">
        {hasOptions && currentOption && (
          <div className="flex justify-between text-xs text-zinc-500">
            <span>선택 옵션: {currentOption.name} ({quantity}개)</span>
            <span>₩{totalPrice.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-zinc-500">
          <span>배송비</span>
          <span>{product.shippingFee === 0 ? "무료" : `₩${product.shippingFee.toLocaleString()}원`}</span>
        </div>
        <div className="border-t pt-2 flex justify-between items-baseline font-bold text-zinc-950">
          <span className="text-sm">총 결제예정금액</span>
          <span className="text-2xl font-black">
            ₩{(totalPrice + product.shippingFee).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons: 찜하기 / 장바구니 / 바로구매 */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handleWishlist}
            className={`p-3.5 border rounded-xl flex items-center justify-center gap-2 transition-all ${
              isWished 
                ? "border-red-200 bg-red-50 text-red-600 shadow-sm" 
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
            title="찜하기"
          >
            <Heart className={`w-5 h-5 ${isWished ? "fill-red-600 text-red-600" : ""}`} />
            <span className="text-xs font-bold">{isWished ? "찜완료" : "찜하기"}</span>
          </button>

          <button 
            type="button"
            onClick={handleAddToCart}
            disabled={isSubmitting || (!!currentOption && currentOption.isSoldOut)}
            className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            장바구니 담기
          </button>
        </div>

        <button 
          type="button"
          onClick={handleCheckout}
          disabled={isSubmitting || (!!currentOption && currentOption.isSoldOut)}
          className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-base shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting 
            ? "결제 처리 중..." 
            : currentOption && currentOption.isSoldOut 
            ? "품절된 옵션입니다" 
            : "바로 결제하기"}
        </button>
      </div>

      {/* 1:1 Q&A button */}
      <div className="pt-2">
        <Link 
          href={`/qna?productId=${product.id}`}
          className="w-full py-2.5 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4 text-zinc-500" />
          상품 문의하기 (1:1 Q&amp;A)
        </Link>
      </div>

      {/* Real Name Verification Modal */}
      {user && isVerifierOpen && (
        <RealNameVerifier 
          isOpenControlled={isVerifierOpen}
          onCloseControlled={() => setIsVerifierOpen(false)}
          onVerified={() => {
            setIsVerifierOpen(false);
            fetchAuth();
          }}
          showButton={false}
        />
      )}
    </div>
  );
}

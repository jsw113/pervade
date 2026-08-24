"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, MessageCircle, Truck, ShieldCheck, ShieldAlert, Check, MapPin, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import Link from "next/link";
import { RealNameVerifier } from "./RealNameVerifier";
import { OrderPaymentModal } from "./OrderPaymentModal";

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
  imageUrl?: string;
  options?: string | null;
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  
  // Parse dynamic options
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
  const [user, setUser] = useState<{ 
    id: string; 
    name: string; 
    email: string;
    phone?: string;
    address?: string | null; 
    referralPoints?: number;
    realNameVerified: boolean 
  } | null>(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);

  // Order & Payment Checkout Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
      if (isWished) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: "DELETE" });
        setIsWished(false);
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id })
        });
        setIsWished(true);
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
      let formattedOptionName = "기본 패키지 단품";
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

  // Click "바로 결제하기" -> Opens the Order & Payment Modal
  const handleOpenCheckoutModal = () => {
    if (!checkAuthOrRedirect()) return;

    if (currentOption && currentOption.isSoldOut) {
      alert("선택하신 옵션은 현재 품절 상태입니다.");
      return;
    }

    // Real-name verification requirement check
    if (!user?.realNameVerified) {
      if (confirm("안전한 전자상거래 및 결제 혜택(5% 적립)을 위해 본인인증(실명인증)이 필요합니다.\n지금 바로 본인인증을 진행하시겠습니까?")) {
        setIsVerifierOpen(true);
      }
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const extraCost = currentOption ? (currentOption.extraPrice || 0) : 0;
  const unitPrice = product.price + extraCost;
  const totalPrice = unitPrice * quantity;

  let formattedOptionName = "기본 패키지 단품";
  if (currentOption) {
    formattedOptionName = currentOption.extraPrice !== 0
      ? `${currentOption.name} (${currentOption.extraPrice > 0 ? `+${currentOption.extraPrice.toLocaleString()}원` : `-${Math.abs(currentOption.extraPrice).toLocaleString()}원`})`
      : currentOption.name;
  }

  const checkoutItems = [
    {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      optionSelected: formattedOptionName,
      price: unitPrice,
      quantity,
      shippingFee: product.shippingFee
    }
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* 1. Dynamic Option Selector */}
      {hasOptions && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700">
            상품 옵션 선택 <span className="text-zinc-400 font-normal">({availableOptions.length}개 옵션)</span>
          </label>
          <div className="space-y-2">
            {availableOptions.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isSoldOut = !!opt.isSoldOut;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-900 text-white shadow-sm"
                      : isSoldOut
                      ? "border-zinc-100 bg-zinc-50/60 text-zinc-300 cursor-not-allowed"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-white bg-white text-zinc-950" : "border-zinc-300"
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{opt.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isSelected ? "text-zinc-200" : "text-zinc-700"}`}>
                      {opt.extraPrice > 0 ? `+₩${opt.extraPrice.toLocaleString()}원` : opt.extraPrice < 0 ? `-₩${Math.abs(opt.extraPrice).toLocaleString()}원` : "기본가"}
                    </span>
                    {isSoldOut && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold">
                        품절
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Quantity & Total Price */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 border rounded-2xl">
        <span className="text-xs font-bold text-zinc-700">구매 수량</span>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-sm font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="w-6 text-center text-xs font-bold">{quantity}</span>
          <button 
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-sm font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* 3. Real-Name Verification Benefit Notification */}
      {user && !user.realNameVerified && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>본인인증 완료 시 결제 금액의 <strong>5% 즉시 포인트 적립</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setIsVerifierOpen(true)}
            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
          >
            인증하기
          </button>
        </div>
      )}

      {/* 4. Summary Total */}
      <div className="space-y-1 text-xs text-zinc-500 pt-2 border-t">
        <div className="flex justify-between">
          <span>상품 금액</span>
          <span>₩{totalPrice.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between">
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
            className={`p-3.5 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
            className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            장바구니 담기
          </button>
        </div>

        <button 
          type="button"
          onClick={handleOpenCheckoutModal}
          disabled={isSubmitting || (!!currentOption && currentOption.isSoldOut)}
          className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-base shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <span>
            {currentOption && currentOption.isSoldOut ? "품절된 옵션입니다" : "주문서 작성 및 결제하기"}
          </span>
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

      {/* Full Order & Payment Modal */}
      {isPaymentModalOpen && (
        <OrderPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          items={checkoutItems}
          user={user}
          fromCart={false}
          onOrderCompleted={() => {
            fetchAuth();
          }}
        />
      )}
    </div>
  );
}

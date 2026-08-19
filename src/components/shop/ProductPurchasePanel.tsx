"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, MessageCircle, Truck, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { RealNameVerifier } from "./RealNameVerifier";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  shippingFee: number;
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const [optionSelected, setOptionSelected] = useState("default");
  const [shippingMethod, setShippingMethod] = useState("일반택배");
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User auth & verification
  const [user, setUser] = useState<{ id: string; name: string; realNameVerified: boolean } | null>(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);

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

    setIsSubmitting(true);
    try {
      const optionName = optionSelected === "default" 
        ? "기본 패키지 단품" 
        : "기본형 + 리필 보틀 세트 (+5,000원)";
        
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          optionSelected: optionName,
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

    // Real-name verification check requirement
    if (!user?.realNameVerified) {
      if (confirm("안전한 전자상거래 및 주문 혜택 적용을 위해 휴대폰 실명인증이 필요합니다.\n지금 바로 본인인증(실명인증)을 진행하시겠습니까?")) {
        setIsVerifierOpen(true);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const optionName = optionSelected === "default" 
        ? "기본 패키지 단품" 
        : "기본형 + 리필 보틀 세트 (+5,000원)";
      
      const extraCost = optionSelected === "set" ? 5000 : 0;
      const totalAmount = (product.price + extraCost) * quantity + product.shippingFee;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          optionSelected: optionName,
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

  const extraCost = optionSelected === "set" ? 5000 : 0;
  const totalPrice = (product.price + extraCost) * quantity;

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

      {/* Option Selector */}
      <div className="space-y-3 pt-4 border-t">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            옵션 선택 (필수) *
          </label>
          <select 
            value={optionSelected}
            onChange={(e) => setOptionSelected(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800 bg-white text-sm"
          >
            <option value="default">기본 패키지 단품 (추가금 없음)</option>
            <option value="set">기본형 + 리필 보틀 세트 (+5,000원)</option>
          </select>
        </div>
        
        {/* Quantity selector */}
        <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg border">
          <span className="text-sm font-medium">수량</span>
          <div className="flex items-center border rounded-md bg-white">
            <button 
              type="button" 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-3 py-1 text-lg font-bold border-r hover:bg-zinc-50"
            >
              -
            </button>
            <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
            <button 
              type="button" 
              onClick={() => setQuantity(q => q + 1)}
              className="px-3 py-1 text-lg font-bold border-l hover:bg-zinc-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Method Selector */}
      <div className="space-y-2 pt-4 border-t">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
          배송 방법 선택
        </label>
        <div className="grid grid-cols-2 gap-3">
          {["일반택배", "당일/새벽배송"].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setShippingMethod(method)}
              className={`p-3 text-left border rounded-xl flex items-center gap-3 transition-all ${
                shippingMethod === method 
                  ? "border-black bg-zinc-900 text-white shadow-sm" 
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              <Truck className={`w-4 h-4 ${shippingMethod === method ? "text-white" : "text-zinc-500"}`} />
              <div>
                <div className="text-xs font-bold">{method}</div>
                <div className={`text-[10px] ${shippingMethod === method ? "text-zinc-300" : "text-zinc-400"}`}>
                  {method === "일반택배" ? "평균 1~2일 소요" : "수도권 당일 도착"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Total Amount Card */}
      <div className="bg-zinc-50 p-4 rounded-xl border space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>상품 금액</span>
          <span>₩{totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>배송비</span>
          <span>₩{product.shippingFee.toLocaleString()}</span>
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
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            장바구니 담기
          </button>
        </div>

        <button 
          type="button"
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-base shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? "결제 처리 중..." : "바로 결제하기"}
        </button>
      </div>

      {/* 1:1 Q&A button */}
      <div className="pt-2">
        <Link 
          href={`/qna?productId=${product.id}`}
          className="w-full py-2.5 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          이 상품에 대해 1:1 문의하기
        </Link>
      </div>

      {/* Embedded Real Name Verifier Modal */}
      <RealNameVerifier 
        isOpenControlled={isVerifierOpen}
        onCloseControlled={() => setIsVerifierOpen(false)}
        showButton={false}
        onVerified={() => {
          setIsVerifierOpen(false);
          fetchAuth();
        }}
      />
    </div>
  );
}

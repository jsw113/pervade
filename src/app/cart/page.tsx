"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, ShoppingBag, Truck, ShieldAlert, ArrowRight, Plus, Minus, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { RealNameVerifier } from "@/components/shop/RealNameVerifier";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; realNameVerified: boolean } | null>(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCartAndUser = async () => {
    try {
      // 1. Auth check
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.loggedIn) {
          setUser(authData.user);
        } else {
          alert("로그인이 필요한 페이지입니다.");
          router.push("/login");
          return;
        }
      } else {
        alert("로그인이 필요한 페이지입니다.");
        router.push("/login");
        return;
      }

      // 2. Cart fetch
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndUser();
  }, []);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      if (confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) {
        handleDeleteItem(id);
      }
      return;
    }

    // Optimistic UI update
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    setUpdatingId(id);

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: newQuantity }),
      });

      if (!res.ok) {
        // Rollback on failure
        fetchCartAndUser();
      }
    } catch (err) {
      console.error(err);
      fetchCartAndUser();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    // Optimistic UI update
    setItems(prev => prev.filter(item => item.id !== id));

    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        fetchCartAndUser();
      }
    } catch (err) {
      console.error(err);
      fetchCartAndUser();
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Real-name verification guard
    if (!user?.realNameVerified) {
      if (confirm("안전한 전자상거래 및 결제 혜택(5% 적립)을 위해 본인인증(실명인증)이 필요합니다.\n지금 바로 본인인증을 진행하시겠습니까?")) {
        setIsVerifierOpen(true);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromCart: true }),
      });

      if (response.ok) {
        alert("🎉 장바구니 상품 주문 및 결제가 성공적으로 완료되었습니다!");
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

  // Helper for extra price calculation from option string
  const getExtraPrice = (optString?: string) => {
    if (!optString) return 0;
    const match = optString.match(/\+\s*([\d,]+)\s*원/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ""), 10) || 0;
    }
    return 0;
  };

  // Compute totals
  const productTotal = items.reduce((acc, item) => {
    const extraPrice = getExtraPrice(item.optionSelected);
    return acc + (item.product.price + extraPrice) * item.quantity;
  }, 0);
  
  // Free shipping policy (e.g. over 50,000 KRW or sum of shipping fees)
  const shippingTotal = items.reduce((acc, item) => acc + (item.product.shippingFee || 0), 0);
  const grandTotal = productTotal + shippingTotal;
  const rewardPoints = Math.floor(productTotal * 0.05);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-zinc-400">
        장바구니 정보를 불러오는 중...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-16 h-16 bg-zinc-50 border rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">장바구니가 비어있습니다</h1>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">퍼베이드의 안전하고 탁월한 친환경 세정 제품들을 담아보세요.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-black/90 transition-colors">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-3xl font-black tracking-tight mb-8">장바구니 ({items.length})</h1>

      {user && !user.realNameVerified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5 font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              주문 결제를 진행하시려면 <strong>본인인증(실명인증)</strong>이 필요합니다. (완료 시 5% 포인트 {rewardPoints.toLocaleString()}P 적립!)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsVerifierOpen(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            본인인증 진행하기
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const extraPrice = getExtraPrice(item.optionSelected);
            const unitPrice = item.product.price + extraPrice;
            const itemTotalPrice = unitPrice * item.quantity;

            return (
              <div key={item.id} className="bg-white border rounded-2xl p-5 flex gap-4 items-center shadow-xs">
                <div className="w-20 h-20 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border relative">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate text-zinc-950">{item.product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.optionSelected}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border rounded-xl bg-zinc-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id}
                        className="p-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors disabled:opacity-50 cursor-pointer"
                        title="수량 감소"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className="w-10 text-center text-xs font-bold text-zinc-900">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="p-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors disabled:opacity-50 cursor-pointer"
                        title="수량 증가"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs text-zinc-400">개당 ₩{unitPrice.toLocaleString()}원</span>
                  </div>

                  <div className="text-base font-black text-zinc-950 mt-2">
                    ₩{itemTotalPrice.toLocaleString()}원
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-50 border rounded-3xl p-6 h-fit space-y-6 shadow-xs">
          <h2 className="font-black text-lg border-b pb-4 text-zinc-950">주문 결제 요약</h2>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600 font-medium">
              <span>총 상품 금액</span>
              <span className="font-bold text-zinc-950">₩{productTotal.toLocaleString()}원</span>
            </div>

            <div className="flex justify-between text-zinc-600 font-medium">
              <span>총 배송비</span>
              <span className="font-bold text-zinc-950">
                {shippingTotal === 0 ? "무료배송" : `+₩${shippingTotal.toLocaleString()}원`}
              </span>
            </div>

            {user?.realNameVerified && (
              <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="font-bold">회원 구매 적립 예정 (5%)</span>
                <span className="font-black">+{rewardPoints.toLocaleString()}P</span>
              </div>
            )}

            <div className="border-t pt-4 flex justify-between items-center text-sm font-black text-zinc-950">
              <span>최종 결제 예상 금액</span>
              <span className="text-xl font-black text-zinc-950">₩{grandTotal.toLocaleString()}원</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full py-4 bg-zinc-950 text-white rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "주문 처리 중..." : "주문 및 결제 진행하기"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Name Verification Modal */}
      <RealNameVerifier
        isOpenControlled={isVerifierOpen}
        onCloseControlled={() => setIsVerifierOpen(false)}
        showButton={false}
        onVerified={() => {
          setIsVerifierOpen(false);
          fetchCartAndUser();
        }}
      />
    </div>
  );
}

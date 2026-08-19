"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, ShoppingBag, Truck, ShieldAlert, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { RealNameVerifier } from "@/components/shop/RealNameVerifier";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; realNameVerified: boolean } | null>(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        fetchCartAndUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Real-name verification guard
    if (!user?.realNameVerified) {
      if (confirm("안전한 전자상거래 및 주문 혜택 적용을 위해 휴대폰 실명인증이 필요합니다.\n지금 바로 본인인증(실명인증)을 진행하시겠습니까?")) {
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
        alert("장바구니 상품 결제 및 주문이 최종 완료되었습니다!");
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

  // Compute total values
  const productTotal = items.reduce((acc, item) => {
    const extraPrice = item.optionSelected?.includes("+5,000") ? 5000 : 0;
    return acc + (item.product.price + extraPrice) * item.quantity;
  }, 0);
  
  const shippingTotal = items.reduce((acc, item) => acc + (item.product.shippingFee || 3000), 0);
  const grandTotal = productTotal + shippingTotal;

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
        <Link href="/shop" className="inline-block px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-black/90 transition-colors">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">장바구니 ({items.length})</h1>

      {user && !user.realNameVerified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>주문 결제를 진행하시려면 <strong>휴대폰 본인인증(실명인증)</strong>이 필요합니다.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsVerifierOpen(true)}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
          >
            실명인증 진행
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const extraPrice = item.optionSelected?.includes("+5,000") ? 5000 : 0;
            const itemPrice = (item.product.price + extraPrice) * item.quantity;
            return (
              <div key={item.id} className="bg-white border rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                <div className="w-20 h-20 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border relative">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.optionSelected}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-medium">
                      {item.shippingMethod}
                    </span>
                    <span className="text-xs text-zinc-400">| 수량: {item.quantity}개</span>
                  </div>
                  <div className="text-sm font-bold mt-2">
                    ₩{itemPrice.toLocaleString()}
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-50 border rounded-2xl p-6 h-fit space-y-6">
          <h2 className="font-bold text-lg border-b pb-4">주문 결제 요약</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>총 상품 금액</span>
              <span className="font-medium text-zinc-900">₩{productTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>총 배송비</span>
              <span className="font-medium text-zinc-900">₩{shippingTotal.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base text-zinc-950">
              <span>최종 결제 금액</span>
              <span className="text-xl font-black">₩{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full py-4 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "결제 처리 중..." : "전체 상품 결제하기"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";

function TossSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setError("결제 승인 파라미터가 유효하지 않습니다.");
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        // Retrieve temporary order details stored in session before opening Toss Payments
        let tempOrderPayload: any = {};
        try {
          const stored = sessionStorage.getItem("pervade_toss_order_pending");
          if (stored) {
            tempOrderPayload = JSON.parse(stored);
          }
        } catch (e) {}

        const res = await fetch("/api/payments/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            ...tempOrderPayload
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setResult(data);
          try {
            sessionStorage.removeItem("pervade_toss_order_pending");
          } catch (e) {}
        } else {
          setError(data.error || "토스페이먼츠 결제 승인에 실패했습니다.");
        }
      } catch (err: any) {
        setError(err?.message || "결제 승인 처리 중 네트워크 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <h2 className="text-lg font-bold text-zinc-900">토스페이먼츠 안전 결제 승인 중...</h2>
        <p className="text-xs text-zinc-500">결제가 안전하게 확인될 때까지 브라우저 창을 닫지 마세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-red-100 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-950">결제 승인 실패</h2>
          <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
        </div>
        <div className="pt-4 flex gap-3">
          <Link
            href="/shop"
            className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors"
          >
            쇼핑몰로 이동
          </Link>
          <Link
            href="/mypage"
            className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            마이페이지
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white border border-zinc-200 rounded-3xl text-center space-y-6 shadow-xl animate-in zoom-in-95">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          토스페이먼츠 안전 결제 완료
        </span>
        <h2 className="text-2xl font-black text-zinc-950 pt-2">주문이 정상 완료되었습니다!</h2>
        <p className="text-xs text-zinc-500">
          주문번호: <span className="font-mono font-bold text-zinc-800">{orderId}</span>
        </p>
      </div>

      <div className="bg-zinc-50 p-5 rounded-2xl border text-left space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-zinc-500">최종 결제 금액</span>
          <span className="font-bold text-zinc-900">{Number(amount).toLocaleString()}원</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">결제 수단</span>
          <span className="font-semibold text-zinc-800">{result?.paymentMethod || "토스페이먼츠"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">배송지</span>
          <span className="text-zinc-800 max-w-[200px] truncate text-right">{result?.shippingAddress || "등록 배송지"}</span>
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-2.5">
        <Link
          href="/mypage"
          className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <span>주문 내역 및 배송 조회하기</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/shop"
          className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>쇼핑 계속하기</span>
        </Link>
      </div>
    </div>
  );
}

export default function TossSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    }>
      <TossSuccessContent />
    </Suspense>
  );
}

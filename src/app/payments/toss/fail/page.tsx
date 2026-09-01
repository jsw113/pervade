"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RotateCcw, ShoppingBag, Loader2 } from "lucide-react";

function TossFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white border border-red-200 rounded-3xl text-center space-y-6 shadow-xl animate-in zoom-in-95">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          토스페이먼츠 결제 취소 / 실패
        </span>
        <h2 className="text-2xl font-black text-zinc-950 pt-2">결제가 완료되지 않았습니다.</h2>
        <p className="text-xs text-zinc-500">
          {message || "사용자에 의해 결제가 취소되었거나 카드 한도/잔액 부족 등으로 승인되지 않았습니다."}
        </p>
      </div>

      {code && (
        <div className="bg-zinc-50 p-3 rounded-xl border text-xs text-zinc-500 font-mono">
          오류 코드: {code}
        </div>
      )}

      <div className="pt-2 flex flex-col gap-2.5">
        <Link
          href="/shop"
          className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>결제 다시 시도하기</span>
        </Link>
        <Link
          href="/shop"
          className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>쇼핑몰로 돌아가기</span>
        </Link>
      </div>
    </div>
  );
}

export default function TossFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    }>
      <TossFailContent />
    </Suspense>
  );
}

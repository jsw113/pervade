"use client";

import { useState, useEffect } from "react";
import {
  Ticket,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  ArrowRight,
  Gift,
  Copy,
  Check,
  Plus
} from "lucide-react";

interface UserCouponItem {
  id: string;
  couponId: string;
  status: "UNUSED" | "USED" | "EXPIRED";
  usedAt: string | null;
  issuedAt: string;
  code: string | null;
  name: string;
  description: string | null;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

export function MyPageCouponBox() {
  const [coupons, setCoupons] = useState<UserCouponItem[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<UserCouponItem[]>([]);
  const [historyCoupons, setHistoryCoupons] = useState<UserCouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"AVAILABLE" | "HISTORY">("AVAILABLE");

  // Code input
  const [inputCode, setInputCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<{ text: string; type: "SUCCESS" | "ERROR" } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const fetchMyCoupons = async () => {
    try {
      const res = await fetch("/api/coupons/my");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.all || []);
        setAvailableCoupons(data.available || []);
        setHistoryCoupons(data.history || []);
      }
    } catch (e) {
      console.error("Failed to load user coupons:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsRegistering(true);
    setRegisterMessage(null);

    try {
      const res = await fetch("/api/coupons/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setRegisterMessage({ text: data.message, type: "SUCCESS" });
        setInputCode("");
        fetchMyCoupons();
      } else {
        setRegisterMessage({ text: data.error || "쿠폰 등록에 실패했습니다.", type: "ERROR" });
      }
    } catch (err: any) {
      setRegisterMessage({ text: "오류 발생: " + err.message, type: "ERROR" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-600" />
            나의 보유 쿠폰함
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            주문 결제 시 즉시 사용 가능한 할인 쿠폰 목록입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            사용 가능: <strong>{availableCoupons.length}장</strong>
          </span>
        </div>
      </div>

      {/* 2. Coupon Code Claim Box */}
      <form
        onSubmit={handleRegisterCode}
        className="p-4 bg-zinc-50 border rounded-2xl space-y-2.5"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-purple-600" />
            이벤트 / SNS 프로모션 쿠폰 코드 등록
          </label>
          <span className="text-[11px] text-zinc-400">코드 입력 후 [등록]을 누르면 즉시 쿠폰함에 지급됩니다.</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="예: WELCOME2026, INSTA10 등 쿠폰 코드 입력"
            className="flex-1 p-2.5 bg-white border rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <button
            type="submit"
            disabled={isRegistering || !inputCode.trim()}
            className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition-all shadow-xs disabled:opacity-40 shrink-0"
          >
            {isRegistering ? "등록 중..." : "쿠폰 등록"}
          </button>
        </div>

        {registerMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              registerMessage.type === "SUCCESS"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {registerMessage.type === "SUCCESS" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{registerMessage.text}</span>
          </div>
        )}
      </form>

      {/* 3. Tab Switcher */}
      <div className="flex items-center gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("AVAILABLE")}
          className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === "AVAILABLE"
              ? "border-zinc-950 text-zinc-950"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          사용 가능 쿠폰 ({availableCoupons.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === "HISTORY"
              ? "border-zinc-950 text-zinc-950"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          지난 쿠폰 내역 ({historyCoupons.length})
        </button>
      </div>

      {/* 4. Coupons List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            쿠폰함을 불러오는 중입니다...
          </div>
        ) : activeTab === "AVAILABLE" ? (
          availableCoupons.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 space-y-1">
              <Ticket className="w-8 h-8 mx-auto text-zinc-200 mb-2" />
              <p className="font-bold text-zinc-600">보유 중인 사용 가능한 쿠폰이 없습니다.</p>
              <p className="text-[11px]">이벤트 코드 등록 또는 프로모션을 통해 쿠폰을 받아보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {availableCoupons.map((c) => {
                const now = Date.now();
                const expiry = c.validUntil ? new Date(c.validUntil).getTime() : null;
                const daysRemaining = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-white shadow-xs space-y-3 relative overflow-hidden group hover:border-amber-400 transition-all"
                  >
                    {/* Top Tag & Expiry */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-900 border border-amber-200">
                        {c.discountType === "FIXED" ? "정액 할인" : "정률 할인"}
                      </span>
                      {daysRemaining !== null && (
                        <span className={`font-bold ${daysRemaining <= 3 ? "text-red-600 animate-pulse" : "text-zinc-500"}`}>
                          ⏳ D-{daysRemaining} ({c.validUntil?.split("T")[0]}까지)
                        </span>
                      )}
                    </div>

                    {/* Discount & Name */}
                    <div className="space-y-1">
                      <div className="text-xl font-black text-zinc-950 tracking-tight flex items-baseline gap-1.5">
                        <span className="text-amber-700">
                          {c.discountType === "FIXED"
                            ? `${c.discountValue.toLocaleString()}원`
                            : `${c.discountValue}%`}
                        </span>
                        <span className="text-sm font-bold text-zinc-700">할인</span>
                        {c.maxDiscountAmount && (
                          <span className="text-[10px] text-zinc-400 font-medium">
                            (최대 {c.maxDiscountAmount.toLocaleString()}원)
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs text-zinc-900 line-clamp-1">{c.name}</h4>
                      {c.description && (
                        <p className="text-[11px] text-zinc-500 line-clamp-1">{c.description}</p>
                      )}
                    </div>

                    {/* Min Order Condition */}
                    <div className="pt-2 border-t border-zinc-100 flex justify-between items-center text-[11px] text-zinc-500">
                      <span>
                        {c.minOrderAmount > 0
                          ? `${c.minOrderAmount.toLocaleString()}원 이상 구매 시`
                          : "최소 금액 제한 없음"}
                      </span>
                      {c.code && (
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code!)}
                          className="font-mono text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                          title="코드 복사"
                        >
                          {copiedCode === c.code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">복사됨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{c.code}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          historyCoupons.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              지난 쿠폰 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {historyCoupons.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs flex items-center justify-between opacity-70"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-zinc-800 line-through">{c.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      {c.discountType === "FIXED" ? `${c.discountValue.toLocaleString()}원 할인` : `${c.discountValue}% 할인`}
                      {" · "}
                      {c.status === "USED" ? "결제에 사용 완료" : "유효기간 만료"}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200 text-zinc-600">
                    {c.status === "USED" ? "사용 완료" : "만료됨"}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

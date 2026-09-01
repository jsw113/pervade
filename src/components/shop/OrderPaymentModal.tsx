"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  ShoppingBag, 
  Lock, 
  Sparkles, 
  Receipt, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { ShippingAddressSelector } from "./ShippingAddressSelector";

export interface OrderItem {
  id: string;
  name: string;
  imageUrl?: string;
  optionSelected?: string;
  price: number;
  quantity: number;
  shippingFee?: number;
}

interface OrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string | null;
    referralPoints?: number;
    realNameVerified: boolean;
  } | null;
  fromCart?: boolean;
  onOrderCompleted?: () => void;
}

export function OrderPaymentModal({
  isOpen,
  onClose,
  items,
  user,
  fromCart = false,
  onOrderCompleted
}: OrderPaymentModalProps) {
  const router = useRouter();

  // Step 1: Checkout Form, Step 2: Processing, Step 3: Success Receipt
  const [step, setStep] = useState<"FORM" | "PROCESSING" | "SUCCESS">("FORM");
  
  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(true);

  // Delivery Memo
  const [deliveryMemo, setDeliveryMemo] = useState("문 앞에 놓아주세요");
  const [customMemo, setCustomMemo] = useState("");

  // Point Usage
  const maxPoints = user?.referralPoints || 0;
  const [usedPoints, setUsedPoints] = useState<number>(0);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<string>("CARD");

  // Receipt data
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);

  if (!isOpen) return null;

  // Compute Totals
  const productTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingTotal = items.reduce((acc, item) => acc + (item.shippingFee || 0), 0);
  const actualPointsUsed = Math.min(usedPoints, productTotal, maxPoints);
  const finalPayAmount = Math.max(0, productTotal + shippingTotal - actualPointsUsed);
  const rewardPoints = Math.floor((productTotal - actualPointsUsed) * 0.05);

  const handleUseAllPoints = () => {
    setUsedPoints(Math.min(maxPoints, productTotal));
  };

  const handlePointsChange = (val: string) => {
    const num = parseInt(val, 10) || 0;
    setUsedPoints(Math.min(num, maxPoints, productTotal));
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress || shippingAddress.trim() === "") {
      alert("배송지 주소를 입력하거나 선택해주세요.");
      return;
    }

    const memoText = deliveryMemo === "CUSTOM" ? customMemo : deliveryMemo;

    // Transition to payment processing
    setStep("PROCESSING");

    const paymentMethodNames: Record<string, string> = {
      CARD: "신용/체크카드 (안전 간편결제)",
      KAKAO: "카카오페이 (KakaoPay)",
      NAVER: "네이버페이 (NaverPay)",
      TOSS: "토스페이 (TossPay)",
      VBANK: "가상계좌 / 무통장입금",
    };

    try {
      // 1. If paying with cash/card > 0, open Toss Payments window
      if (finalPayAmount > 0) {
        try {
          const configRes = await fetch("/api/payments/toss/config");
          const config = await configRes.json();

          if (config?.enabled && config?.clientKey) {
            const { loadTossPayments } = await import("@tosspayments/payment-sdk");
            const toss = await loadTossPayments(config.clientKey);

            const generatedOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const orderTitle = items.length === 1 
              ? `${items[0].name}${items[0].optionSelected ? ` (${items[0].optionSelected})` : ""}`
              : `${items[0].name} 외 ${items.length - 1}건`;

            // Save temporary order context in sessionStorage for the success redirect
            sessionStorage.setItem("pervade_toss_order_pending", JSON.stringify({
              fromCart,
              productId: items[0]?.id,
              optionSelected: items[0]?.optionSelected,
              shippingMethod: "일반택배",
              shippingFee: shippingTotal,
              totalAmount: finalPayAmount,
              shippingAddress,
              saveAsDefaultAddress,
              deliveryMemo: memoText,
              paymentMethod: paymentMethodNames[paymentMethod] || "신용/체크카드 (토스페이먼츠)",
              usedPoints: actualPointsUsed
            }));

            const methodMap: Record<string, string> = {
              CARD: "카드",
              TOSS: "토스페이",
              KAKAO: "카카오페이",
              NAVER: "네이버페이",
              VBANK: "가상계좌",
            };

            const selectedTossMethod = methodMap[paymentMethod] || "카드";

            await toss.requestPayment(selectedTossMethod as any, {
              amount: finalPayAmount,
              orderId: generatedOrderId,
              orderName: orderTitle,
              customerName: user?.name || "고객",
              customerEmail: user?.email || "customer@pervade.co.kr",
              successUrl: `${window.location.origin}/payments/toss/success`,
              failUrl: `${window.location.origin}/payments/toss/fail`,
            });
            return;
          }
        } catch (tossErr: any) {
          console.warn("Toss Payments flow exception:", tossErr);
          if (tossErr?.code === "USER_CANCEL" || tossErr?.message?.includes("취소")) {
            setStep("FORM");
            return;
          }
        }
      }

      // Direct fallback (e.g. 100% points used or simulated fallback)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCart,
          productId: items[0]?.id,
          optionSelected: items[0]?.optionSelected,
          shippingMethod: "일반택배",
          shippingFee: shippingTotal,
          totalAmount: finalPayAmount,
          shippingAddress,
          saveAsDefaultAddress,
          deliveryMemo: memoText,
          paymentMethod: paymentMethodNames[paymentMethod] || "신용카드",
          usedPoints: actualPointsUsed
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCompletedOrderData({
          orderId: data.orders?.[0]?.id || "ORD-" + Math.floor(100000 + Math.random() * 900000),
          totalAmount: finalPayAmount,
          productTotal,
          shippingTotal,
          usedPoints: actualPointsUsed,
          rewardPoints,
          paymentMethod: paymentMethodNames[paymentMethod],
          shippingAddress,
          deliveryMemo: memoText,
          itemsCount: items.length
        });
        setStep("SUCCESS");
        if (onOrderCompleted) onOrderCompleted();
      } else {
        alert(data.error || "결제 처리에 실패했습니다.");
        setStep("FORM");
      }
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + err.message);
      setStep("FORM");
    }
  };

  const handleFinishAndGoToMypage = () => {
    onClose();
    router.push("/mypage");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-zinc-950 p-5 sm:p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              {step === "SUCCESS" ? (
                <Receipt className="w-5 h-5 text-emerald-400" />
              ) : (
                <CreditCard className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {step === "SUCCESS" ? "주문 및 결제 완료 (영수증)" : "주문서 작성 및 안전 결제"}
              </h2>
              <span className="text-[11px] text-zinc-400">
                {step === "SUCCESS" ? "정상적으로 결제 승인 및 출고 접수되었습니다." : "주문 상품, 배송지 및 결제 수단을 확인해주세요."}
              </span>
            </div>
          </div>
          
          {step !== "PROCESSING" && (
            <button 
              type="button"
              onClick={step === "SUCCESS" ? handleFinishAndGoToMypage : onClose}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 text-xs">
          
          {/* STEP 1: FORM */}
          {step === "FORM" && (
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              
              {/* 1. Ordered Products Overview */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-black text-sm text-zinc-950 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-zinc-700" />
                    주문 상품 내역 ({items.length}건)
                  </h3>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50 border rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl && (
                          <div className="w-12 h-12 rounded-xl bg-white border overflow-hidden shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-zinc-950 truncate">{item.name}</h4>
                          <span className="text-[10px] text-zinc-500 block truncate">{item.optionSelected}</span>
                          <span className="text-[10px] text-zinc-400">{item.quantity}개</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-zinc-950 shrink-0">
                        ₩{(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Shipping Address & Delivery Memo */}
              <div className="space-y-3">
                <h3 className="font-black text-sm text-zinc-950 flex items-center gap-1.5 border-b pb-2">
                  <Truck className="w-4 h-4 text-zinc-700" />
                  배송지 및 배송 요청사항
                </h3>

                <ShippingAddressSelector
                  defaultAddress={user?.address}
                  onAddressChange={(addr, saveAsDef) => {
                    setShippingAddress(addr);
                    setSaveAsDefaultAddress(saveAsDef);
                  }}
                />

                {/* Delivery Memo Dropdown */}
                <div className="p-4 bg-zinc-50 border rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">배송 시 요청사항</label>
                  <select
                    value={deliveryMemo}
                    onChange={(e) => setDeliveryMemo(e.target.value)}
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  >
                    <option value="문 앞에 놓아주세요">문 앞에 놓아주세요 (기본)</option>
                    <option value="부재 시 경비실에 맡겨주세요">부재 시 경비실에 맡겨주세요</option>
                    <option value="배송 전 미리 연락 바랍니다">배송 전 미리 연락 바랍니다</option>
                    <option value="택배함에 보관해주세요">택배함에 보관해주세요</option>
                    <option value="CUSTOM">직접 입력</option>
                  </select>

                  {deliveryMemo === "CUSTOM" && (
                    <input
                      type="text"
                      value={customMemo}
                      onChange={(e) => setCustomMemo(e.target.value)}
                      placeholder="배송 기사님께 전달할 메시지를 입력하세요"
                      className="w-full p-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  )}
                </div>
              </div>

              {/* 3. Point Usage */}
              <div className="p-4 bg-zinc-50 border rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    퍼베이드 적립금 포인트 사용
                  </span>
                  <span className="text-[11px] text-zinc-500 font-bold">
                    보유 포인트: <strong className="text-purple-700">{maxPoints.toLocaleString()}P</strong>
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      max={Math.min(maxPoints, productTotal)}
                      value={usedPoints || ""}
                      onChange={(e) => handlePointsChange(e.target.value)}
                      placeholder="0"
                      className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-zinc-900 pr-8 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                    <span className="absolute right-3 top-2.5 text-zinc-400 font-bold">P</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseAllPoints}
                    className="px-3.5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    전액 사용
                  </button>
                </div>
              </div>

              {/* 4. Payment Method Selector */}
              <div className="space-y-3">
                <h3 className="font-black text-sm text-zinc-950 flex items-center gap-1.5 border-b pb-2">
                  <CreditCard className="w-4 h-4 text-zinc-700" />
                  결제 수단 선택
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "CARD", label: "신용/체크카드", sub: "모든 카드사 안전결제" },
                    { id: "KAKAO", label: "카카오페이", sub: "KakaoPay 1초 결제" },
                    { id: "NAVER", label: "네이버페이", sub: "NaverPay 결제" },
                    { id: "TOSS", label: "토스페이", sub: "Toss 간편결제" },
                    { id: "VBANK", label: "무통장 / 가상계좌", sub: "입금 확인 후 출고" },
                  ].map((m) => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                            : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800"
                        }`}
                      >
                        <span className="font-bold text-xs block">{m.label}</span>
                        <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                          {m.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Payment Amount Breakdown */}
              <div className="p-4 sm:p-5 bg-zinc-50 border rounded-2xl space-y-2">
                <div className="flex justify-between text-zinc-600">
                  <span>총 상품 금액</span>
                  <span className="font-bold text-zinc-900">₩{productTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>배송비</span>
                  <span className="font-bold text-zinc-900">
                    {shippingTotal === 0 ? "무료배송" : `+₩${shippingTotal.toLocaleString()}원`}
                  </span>
                </div>
                {actualPointsUsed > 0 && (
                  <div className="flex justify-between text-purple-700">
                    <span>포인트 적립금 사용</span>
                    <span className="font-bold">-₩{actualPointsUsed.toLocaleString()}원</span>
                  </div>
                )}
                {user?.realNameVerified && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded-lg text-[11px]">
                    <span className="font-bold">회원 구매 적립 예정 (5%)</span>
                    <span className="font-black">+{rewardPoints.toLocaleString()}P</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-baseline font-black text-zinc-950 text-sm">
                  <span>최종 결제 금액</span>
                  <span className="text-xl sm:text-2xl text-zinc-950">
                    ₩{finalPayAmount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Submit Payment Button */}
              <button
                type="submit"
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>₩{finalPayAmount.toLocaleString()}원 안전 결제 승인 요청</span>
              </button>
            </form>
          )}

          {/* STEP 2: PROCESSING (PG SIMULATION) */}
          {step === "PROCESSING" && (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-zinc-950" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-zinc-950">PG 전자결제 모듈 안전 승인 중...</h3>
                <p className="text-xs text-zinc-500">결제 정보 검증 및 주문서를 안전하게 등록하고 있습니다.</p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS RECEIPT */}
          {step === "SUCCESS" && completedOrderData && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center space-y-2 py-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-zinc-950">주문 및 결제가 완료되었습니다!</h3>
                <p className="text-xs text-zinc-500">
                  고객님의 주문이 성공적으로 접수되어 신속하게 출고 준비를 시작합니다.
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="p-5 bg-zinc-50 border rounded-2xl space-y-3 font-mono">
                <div className="flex justify-between border-b pb-2 text-zinc-600">
                  <span>주문 번호</span>
                  <span className="font-bold text-zinc-900">{completedOrderData.orderId}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-zinc-600">
                  <span>결제 수단</span>
                  <span className="font-bold text-zinc-900">{completedOrderData.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-zinc-600">
                  <span>배송지</span>
                  <span className="font-bold text-zinc-900 text-right max-w-xs truncate">
                    {completedOrderData.shippingAddress}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2 text-zinc-600">
                  <span>배송 요청</span>
                  <span className="font-bold text-zinc-900">{completedOrderData.deliveryMemo}</span>
                </div>
                {completedOrderData.usedPoints > 0 && (
                  <div className="flex justify-between border-b pb-2 text-purple-700">
                    <span>적립금 사용</span>
                    <span className="font-bold">-{completedOrderData.usedPoints.toLocaleString()}P</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2 text-emerald-700">
                  <span>구매 적립 포인트 (5%)</span>
                  <span className="font-bold">+{completedOrderData.rewardPoints.toLocaleString()}P</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 text-sm font-sans font-black text-zinc-950">
                  <span>최종 결제 금액</span>
                  <span className="text-xl text-zinc-950 font-black">
                    ₩{completedOrderData.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/shop");
                  }}
                  className="py-3.5 border rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  쇼핑 계속하기
                </button>
                <button
                  type="button"
                  onClick={handleFinishAndGoToMypage}
                  className="py-3.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>주문내역 확인</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

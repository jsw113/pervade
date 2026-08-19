"use client";

import { Truck, RotateCcw, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      <div className="text-center space-y-3 mb-12 border-b pb-8">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Policy & Information</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">배송 및 교환 / 반품 안내</h1>
        <p className="text-sm text-zinc-500">
          퍼베이드의 안전한 배송 정책과 투명한 교환/반품 기준을 확인하세요.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Shipping */}
        <section className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2.5 bg-zinc-100 rounded-xl text-zinc-900">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">배송 안내</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm">배송 방법 및 배송사</h3>
              <p>· 지정 택배사: CJ대한통운 / 우체국택배 (또는 수도권 당일특송)</p>
              <p>· 발송 마감: 평일 오후 2시 이전 결제 완료 건 당일 발송</p>
              <p>· 배송 기간: 출고 후 평균 1~2 영업일 소요 (주말/공휴일 제외)</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm">배송비 정책</h3>
              <p>· 기본 배송비: 3,000원</p>
              <p>· 무료 배송 조건: 실 결제금액 30,000원 이상 구매 시 무료배송</p>
              <p>· 제주 및 도서산간 지역: 추가 배송비 3,000원 발생</p>
            </div>
          </div>
        </section>

        {/* Section 2: Returns & Exchanges */}
        <section className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2.5 bg-zinc-100 rounded-xl text-zinc-900">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">교환 및 반품 안내</h2>
          </div>

          <div className="space-y-6 text-xs text-zinc-600 leading-relaxed">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm mb-2">교환/반품 가능 기간</h3>
              <p>· 상품 수령일로부터 7일 이내 교환 및 반품 신청이 가능합니다.</p>
              <p>· 상품의 내용이 표시·광고 내용과 다르거나 하자가 있는 경우, 수령일로부터 3개월 이내 또는 그 사실을 안 날로부터 30일 이내에 교환/반품이 가능합니다.</p>
            </div>

            <div>
              <h3 className="font-bold text-zinc-900 text-sm mb-2">교환/반품 배송비 기준</h3>
              <p>· <strong>단순 변심에 의한 교환/반품</strong>: 왕복 택배비 6,000원 고객 부담</p>
              <p>· <strong>상품 불량 및 오배송</strong>: 왕복 배송비 전액 본사 부담</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                교환 및 반품이 불가능한 경우
              </div>
              <p>· 고객님의 책임 있는 사유로 상품 등이 멸실 또는 훼손된 경우</p>
              <p>· 포장을 개봉하여 씰(Seal)이 훼손되었거나 사용 흔적이 있는 경우</p>
              <p>· 시간의 경과에 의하여 재판매가 곤란할 정도로 상품 등의 가치가 현저히 감소한 경우</p>
            </div>
          </div>
        </section>

        {/* Support Help Contact */}
        <div className="text-center bg-zinc-50 border rounded-2xl p-8 space-y-3">
          <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="font-bold text-base text-zinc-900">교환/반품 접수가 필요하신가요?</h3>
          <p className="text-xs text-zinc-500">
            [마이페이지]의 주문 내역 또는 [1:1 Q&A 게시판]을 통해 손쉽게 접수하실 수 있습니다.
          </p>
          <div className="pt-2">
            <Link
              href="/qna"
              className="inline-block px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
            >
              1:1 Q&A 문의 접수하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

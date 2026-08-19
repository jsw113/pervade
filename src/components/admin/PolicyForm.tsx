"use client";

import { useState } from "react";
import { Save, Building2, Truck, Gift, ShieldCheck, Megaphone } from "lucide-react";

export function PolicyForm({ initialPolicies }: { initialPolicies: any[] }) {
  const getPolicy = (key: string, defaultValue: string) =>
    initialPolicies.find((p) => p.key === key)?.value || defaultValue;

  // 0. Top Promo Banner State (DB Policy)
  const [topBannerText, setTopBannerText] = useState(
    getPolicy("TOP_BANNER_TEXT", "신규 가입 시 3,000P 적립 & 첫 구매 무료배송")
  );
  const [topBannerEnabled, setTopBannerEnabled] = useState(
    getPolicy("TOP_BANNER_ENABLED", "true") === "true"
  );

  // 1. Legal Business Info State (DB Policy)
  const [companyName, setCompanyName] = useState(getPolicy("COMPANY_NAME", "(주)퍼베이드"));
  const [ceoName, setCeoName] = useState(getPolicy("CEO_NAME", "홍길동"));
  const [companyAddress, setCompanyAddress] = useState(getPolicy("COMPANY_ADDRESS", "서울특별시 강남구 테헤란로 123, 퍼베이드타워 4층"));
  const [bizRegNumber, setBizRegNumber] = useState(getPolicy("BIZ_REG_NUMBER", "123-45-67890"));
  const [ecommerceNumber, setEcommerceNumber] = useState(getPolicy("ECOMMERCE_NUMBER", "2026-서울강남-1234호"));
  const [privacyOfficer, setPrivacyOfficer] = useState(getPolicy("PRIVACY_OFFICER", "홍길동 (privacy@pervade.co.kr)"));
  const [csPhone, setCsPhone] = useState(getPolicy("CS_PHONE", "02-1234-5678"));
  const [csHours, setCsHours] = useState(getPolicy("CS_HOURS", "평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00 / 주말·공휴일 휴무)"));
  const [csEmail, setCsEmail] = useState(getPolicy("CS_EMAIL", "support@pervade.co.kr"));
  const [hostingProvider, setHostingProvider] = useState(getPolicy("HOSTING_PROVIDER", "(주)퍼베이드"));
  const [escrowInfo, setEscrowInfo] = useState(getPolicy("ESCROW_INFO", "토스페이먼츠 구매안전(에스크로) 서비스"));

  // 2. Shipping & Notice State
  const [shippingNotice, setShippingNotice] = useState(
    getPolicy(
      "SHIPPING_COMMON_NOTICE",
      "- 기본 배송비: 3,000원 (제주/도서산간 3,000원 추가)\n- 출고 마감: 평일 오후 2시 이전 결제 완료 건 당일 발송\n- 택배사: CJ대한통운 (영업일 기준 1~3일 소요)\n- 교환/반품: 상품 수령 후 7일 이내 (단순 변심 시 왕복 배송비 6,000원 고객 부담)"
    )
  );

  // 3. Rewards & VIP State
  const [referralReward, setReferralReward] = useState(getPolicy("REFERRAL_REWARD_PERCENTAGE", "5"));
  const [vipThreshold, setVipThreshold] = useState(getPolicy("VIP_THRESHOLD", "500000"));
  const [reviewRewardEnabled, setReviewRewardEnabled] = useState(getPolicy("REVIEW_REWARD_ENABLED", "true") === "true");
  const [reviewReward, setReviewReward] = useState(getPolicy("REVIEW_REWARD_PERCENTAGE", "1.0"));
  const [photoReviewReward, setPhotoReviewReward] = useState(getPolicy("PHOTO_REVIEW_REWARD_PERCENTAGE", "2.0"));

  const [isSavingAll, setIsSavingAll] = useState(false);

  const saveAllPolicies = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAll(true);
    try {
      const response = await fetch("/api/admin/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policies: {
            TOP_BANNER_TEXT: topBannerText,
            TOP_BANNER_ENABLED: topBannerEnabled ? "true" : "false",
            COMPANY_NAME: companyName,
            CEO_NAME: ceoName,
            COMPANY_ADDRESS: companyAddress,
            BIZ_REG_NUMBER: bizRegNumber,
            ECOMMERCE_NUMBER: ecommerceNumber,
            PRIVACY_OFFICER: privacyOfficer,
            CS_PHONE: csPhone,
            CS_HOURS: csHours,
            CS_EMAIL: csEmail,
            HOSTING_PROVIDER: hostingProvider,
            ESCROW_INFO: escrowInfo,
            SHIPPING_COMMON_NOTICE: shippingNotice,
            REFERRAL_REWARD_PERCENTAGE: referralReward,
            VIP_THRESHOLD: vipThreshold,
            REVIEW_REWARD_ENABLED: reviewRewardEnabled ? "true" : "false",
            REVIEW_REWARD_PERCENTAGE: reviewReward,
            PHOTO_REVIEW_REWARD_PERCENTAGE: photoReviewReward,
          },
        }),
      });

      if (response.ok) {
        alert("모든 설정 및 프로모션 문구가 성공적으로 저장되었습니다!\n쇼핑몰 상단 띠배너 및 푸터에 실시간 반영됩니다.");
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <form onSubmit={saveAllPolicies} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Floating Action Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-zinc-950">운영 정책 및 프로모션 문구 관리</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            상단 띠배너 이벤트 문구, 전자상거래법 법정 사업자 표시사항 및 리워드 정책을 실시간으로 관리합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSavingAll}
          className="px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSavingAll ? "저장 중..." : "전체 변경사항 일괄 저장"}
        </button>
      </div>

      {/* 0. Top Promo Banner (헤더 최상단 띠배너) */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Megaphone className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">0. 쇼핑몰 최상단 띠배너 프로모션 문구 설정</h3>
            <p className="text-xs text-zinc-500">쇼핑몰 모든 페이지 헤더 최상단 검정 바에 실시간으로 노출되는 이벤트/혜택 문구입니다.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">프로모션 / 공지 문구</label>
            <input
              type="text"
              value={topBannerText}
              onChange={(e) => setTopBannerText(e.target.value)}
              className="w-full p-3.5 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="예: 신규 가입 시 3,000P 적립 & 첫 구매 무료배송"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={topBannerEnabled}
              onChange={(e) => setTopBannerEnabled(e.target.checked)}
              className="w-4 h-4 text-zinc-900 rounded"
            />
            <span className="text-xs font-bold text-zinc-800">상단 띠배너 문구 항상 노출 활성화</span>
          </label>
        </div>
      </div>

      {/* 1. Legal Business Information (전자상거래법 제10조 제1항) */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Building2 className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">1. 전자상거래법 필수 사업자 및 고객센터 정보</h3>
            <p className="text-xs text-zinc-500">쇼핑몰 최하단 푸터 및 법적 고시 영역에 실시간 연동되어 자동 표출됩니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">상호명 (법인/개인 상호)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="(주)퍼베이드"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">대표자 성명</label>
            <input
              type="text"
              value={ceoName}
              onChange={(e) => setCeoName(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="홍길동"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">사업장 주소 (소비자 불만접수 주소 포함)</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="서울특별시 강남구 테헤란로 123, 퍼베이드타워 4층"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">사업자등록번호</label>
            <input
              type="text"
              value={bizRegNumber}
              onChange={(e) => setBizRegNumber(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="123-45-67890"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">통신판매업신고번호</label>
            <input
              type="text"
              value={ecommerceNumber}
              onChange={(e) => setEcommerceNumber(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="2026-서울강남-1234호"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">개인정보보호책임자 (성명/이메일)</label>
            <input
              type="text"
              value={privacyOfficer}
              onChange={(e) => setPrivacyOfficer(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="홍길동 (privacy@pervade.co.kr)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">호스팅 서비스 제공자</label>
            <input
              type="text"
              value={hostingProvider}
              onChange={(e) => setHostingProvider(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="(주)퍼베이드"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 대표 전화번호</label>
            <input
              type="text"
              value={csPhone}
              onChange={(e) => setCsPhone(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="02-1234-5678"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">대표 문의 이메일</label>
            <input
              type="email"
              value={csEmail}
              onChange={(e) => setCsEmail(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="support@pervade.co.kr"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 운영시간 안내</label>
            <input
              type="text"
              value={csHours}
              onChange={(e) => setCsHours(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00 / 주말·공휴일 휴무)"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">구매안전서비스(에스크로) 안내 문구</label>
            <input
              type="text"
              value={escrowInfo}
              onChange={(e) => setEscrowInfo(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="토스페이먼츠 구매안전(에스크로) 서비스"
            />
          </div>
        </div>
      </div>

      {/* 2. Shipping & Return Common Notice */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Truck className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">2. 주문 / 배송 / 교환 공통 고지사항</h3>
            <p className="text-xs text-zinc-500">모든 상품 상세 페이지 우측 하단 공통 안내 박스에 노출됩니다.</p>
          </div>
        </div>

        <textarea
          rows={6}
          value={shippingNotice}
          onChange={(e) => setShippingNotice(e.target.value)}
          className="w-full p-4 bg-zinc-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
          placeholder="공통 배송 및 교환/환불 고지사항을 입력하세요..."
        />
      </div>

      {/* 3. Rewards & VIP Policy */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Gift className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">3. 추천인, VIP 등급 및 리뷰 적립금 정책</h3>
            <p className="text-xs text-zinc-500">쇼핑몰 회원 리워드 포인트 및 등급 산정 기준입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">추천인 보상 포인트 적립률 (%)</label>
            <input
              type="number"
              value={referralReward}
              onChange={(e) => setReferralReward(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="text-[11px] text-zinc-400 mt-1">추천 코드를 통해 가입한 회원의 결제액에 대해 추천인에게 지급할 포인트 비율</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">VIP 등급 달성 기준 누적 결제금액 (원)</label>
            <input
              type="number"
              value={vipThreshold}
              onChange={(e) => setVipThreshold(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="text-[11px] text-zinc-400 mt-1">VIP 등급으로 자동 승급되는 누적 실결제액 기준</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">일반 텍스트 리뷰 적립률 (%)</label>
            <input
              type="number"
              step="0.1"
              value={reviewReward}
              onChange={(e) => setReviewReward(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">포토 / 베스트 리뷰 적립률 (%)</label>
            <input
              type="number"
              step="0.1"
              value={photoReviewReward}
              onChange={(e) => setPhotoReviewReward(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

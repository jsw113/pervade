"use client";

import { useState } from "react";
import { Save, Building2, Truck, Gift, ShieldCheck, Megaphone, Award, Check } from "lucide-react";

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

  // 3. 4-Tier Membership Policy State
  const [tierRepeatCount, setTierRepeatCount] = useState(getPolicy("TIER_REPEAT_COUNT", "2"));
  const [tierSuperiorThreshold, setTierSuperiorThreshold] = useState(getPolicy("TIER_SUPERIOR_THRESHOLD", "100000"));
  const [tierVipThreshold, setTierVipThreshold] = useState(getPolicy("TIER_VIP_THRESHOLD", "300000"));
  
  const [tierGeneralRate, setTierGeneralRate] = useState(getPolicy("TIER_GENERAL_RATE", "1.0"));
  const [tierRepeatRate, setTierRepeatRate] = useState(getPolicy("TIER_REPEAT_RATE", "2.0"));
  const [tierSuperiorRate, setTierSuperiorRate] = useState(getPolicy("TIER_SUPERIOR_RATE", "3.0"));
  const [tierVipRate, setTierVipRate] = useState(getPolicy("TIER_VIP_RATE", "5.0"));

  // 4. Rewards & Reviews Policy State
  const [referralReward, setReferralReward] = useState(getPolicy("REFERRAL_REWARD_PERCENTAGE", "5"));
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
            TIER_REPEAT_COUNT: tierRepeatCount,
            TIER_SUPERIOR_THRESHOLD: tierSuperiorThreshold,
            TIER_VIP_THRESHOLD: tierVipThreshold,
            TIER_GENERAL_RATE: tierGeneralRate,
            TIER_REPEAT_RATE: tierRepeatRate,
            TIER_SUPERIOR_RATE: tierSuperiorRate,
            TIER_VIP_RATE: tierVipRate,
            REFERRAL_REWARD_PERCENTAGE: referralReward,
            VIP_THRESHOLD: tierVipThreshold,
            REVIEW_REWARD_ENABLED: reviewRewardEnabled ? "true" : "false",
            REVIEW_REWARD_PERCENTAGE: reviewReward,
            PHOTO_REVIEW_REWARD_PERCENTAGE: photoReviewReward,
          },
        }),
      });

      if (response.ok) {
        alert("모든 설정 및 회원등급/프로모션 정책이 성공적으로 저장되었습니다!\n쇼핑몰 및 마이페이지에 실시간 반영됩니다.");
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
          <h2 className="text-xl font-bold text-zinc-950">운영 정책 및 회원등급 관리</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            4단계 회원등급 기준(일반/재구매/우수/VIP), 프로모션 및 전자상거래법 법정 표시사항을 통합 관리합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSavingAll}
          className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingAll ? "저장 중..." : "전체 정책 저장하기"}</span>
        </button>
      </div>

      {/* 0. Top Promo Banner */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-zinc-700" />
            <div>
              <h3 className="font-bold text-lg text-zinc-950">0. 쇼핑몰 상단 띠배너 프로모션</h3>
              <p className="text-xs text-zinc-500">웹사이트 최상단 헤더 위에 노출되는 실시간 공지 및 혜택 배너입니다.</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={topBannerEnabled}
              onChange={(e) => setTopBannerEnabled(e.target.checked)}
              className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900"
            />
            <span className="text-xs font-bold text-zinc-800">배너 노출 활성화</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">배너 문구</label>
          <input
            type="text"
            value={topBannerText}
            onChange={(e) => setTopBannerText(e.target.value)}
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="예: 신규 가입 시 3,000P 적립 & 첫 구매 무료배송"
          />
        </div>
      </div>

      {/* 1. 4-Tier Membership Policy (일반 / 재구매 / 우수 / VIP) */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Award className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">1. 4단계 회원등급 정책 설정 (구매횟수 및 구매금액 기준)</h3>
            <p className="text-xs text-zinc-500">
              일반(가입+본인인증), 재구매(구매횟수), 우수(누적금액), VIP(누적금액) 4단계 자동 산정 기준 및 등급별 혜택을 설정합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tier 1: 일반 */}
          <div className="p-4 bg-zinc-50 border rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-xs px-2.5 py-1 bg-zinc-200 text-zinc-800 rounded-lg">
                1단계: 일반 회원
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 font-medium">
              가입 및 본인인증(실명인증) 완료 시 기본 부여
            </p>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">구매 적립률 (%)</label>
              <input
                type="number"
                step="0.1"
                value={tierGeneralRate}
                onChange={(e) => setTierGeneralRate(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Tier 2: 재구매 */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                2단계: 재구매 회원
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">기준 구매 횟수 (회 이상)</label>
              <input
                type="number"
                value={tierRepeatCount}
                onChange={(e) => setTierRepeatCount(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">구매 적립률 (%)</label>
              <input
                type="number"
                step="0.1"
                value={tierRepeatRate}
                onChange={(e) => setTierRepeatRate(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Tier 3: 우수 */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                3단계: 우수 회원
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">기준 누적 결제금액 (원 이상)</label>
              <input
                type="number"
                value={tierSuperiorThreshold}
                onChange={(e) => setTierSuperiorThreshold(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">구매 적립률 (%)</label>
              <input
                type="number"
                step="0.1"
                value={tierSuperiorRate}
                onChange={(e) => setTierSuperiorRate(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Tier 4: VIP */}
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">
                4단계: VIP 회원
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">기준 누적 결제금액 (원 이상)</label>
              <input
                type="number"
                value={tierVipThreshold}
                onChange={(e) => setTierVipThreshold(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
                placeholder="300000"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">구매 적립률 (%)</label>
              <input
                type="number"
                step="0.1"
                value={tierVipRate}
                onChange={(e) => setTierVipRate(e.target.value)}
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Legal Business Info */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Building2 className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">2. 전자상거래법 법정 사업자 고지사항 (푸터 실시간 반영)</h3>
            <p className="text-xs text-zinc-500">쇼핑몰 하단(Footer)에 공시되는 필수 사업자 정보입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">상호명 (법인명)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="(주)퍼베이드"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">대표자명</label>
            <input
              type="text"
              value={ceoName}
              onChange={(e) => setCeoName(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="홍길동"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">사업장 주소지</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="서울특별시 강남구 테헤란로 123"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">사업자등록번호</label>
            <input
              type="text"
              value={bizRegNumber}
              onChange={(e) => setBizRegNumber(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="123-45-67890"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">통신판매업 신고번호</label>
            <input
              type="text"
              value={ecommerceNumber}
              onChange={(e) => setEcommerceNumber(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="2026-서울강남-1234호"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">개인정보보호책임자</label>
            <input
              type="text"
              value={privacyOfficer}
              onChange={(e) => setPrivacyOfficer(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="홍길동 (privacy@pervade.co.kr)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 대표전화</label>
            <input
              type="text"
              value={csPhone}
              onChange={(e) => setCsPhone(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="02-1234-5678"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 운영시간</label>
            <input
              type="text"
              value={csHours}
              onChange={(e) => setCsHours(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="평일 10:00 ~ 17:00"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 이메일</label>
            <input
              type="text"
              value={csEmail}
              onChange={(e) => setCsEmail(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="support@pervade.co.kr"
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
            <label className="block text-xs font-bold text-zinc-700 mb-1">에스크로(구매안전) 서비스 안내</label>
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

      {/* 3. Shipping & Return Common Notice */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Truck className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">3. 주문 / 배송 / 교환 공통 고지사항</h3>
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

      {/* 4. Referral Rewards Policy */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b pb-4">
          <Gift className="w-5 h-5 text-zinc-700" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">4. 추천인 및 리뷰 적립금 정책</h3>
            <p className="text-xs text-zinc-500">친구 추천 리워드 및 후기 작성 적립금 비율입니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">추천인 보상 적립률 (%)</label>
            <input
              type="number"
              value={referralReward}
              onChange={(e) => setReferralReward(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="text-[11px] text-zinc-400 mt-1">친구 추천 시 추천인에게 지급할 포인트 비율</p>
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

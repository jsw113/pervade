"use client";

import { useState } from "react";
import { Save, Building2, Truck, Gift, Megaphone, Award, Lock, Key, CreditCard } from "lucide-react";

export function PolicyForm({ initialPolicies }: { initialPolicies: any[] }) {
  const getPolicy = (key: string, defaultValue: string) =>
    initialPolicies.find((p) => p.key === key)?.value || defaultValue;

  // Admin Password Change State
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [isUpdatingAdminPass, setIsUpdatingAdminPass] = useState(false);

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

  // 5. Legal Product Disclosure State (안전확인대상 생활화학제품 필수 표기 정보)
  const [legalProductName, setLegalProductName] = useState(getPolicy("LEGAL_PRODUCT_NAME", "퍼베이드 레몬 에센셜 다목적 스프레이"));
  const [legalUsageForm, setLegalUsageForm] = useState(getPolicy("LEGAL_USAGE_FORM", "예) 일반방향·탈취제품 > 탈취제 > 일반용 (물체용)방향·탈취제품 > 탈취제 > 자동차용(실내용) > 특수목적용·세정제품 > 세정제 > 일반용 (건물 바닥용)세정제품 > 세정제 > 일반용 (렌지후드용)세정제품 > 세정제 > 일반용 (변기용)세정제품 > 세정제 > 일반용 (오븐용)세정제품 > 세정제 > 일반용 (욕실용)용 (실내공간용), 자동차용 (실내용) / 액체형 (라벨 & 상세이미지와 동일하게 기재)"));
  const [legalExpiryDate, setLegalExpiryDate] = useState(getPolicy("LEGAL_EXPIRY_DATE", "해당 없음"));
  const [legalWeightCapacity, setLegalWeightCapacity] = useState(getPolicy("LEGAL_WEIGHT_CAPACITY", "500ml"));
  const [legalEffect, setLegalEffect] = useState(getPolicy("LEGAL_EFFECT", "상품 상세페이지 참조"));
  const [legalManufacturerOrigin, setLegalManufacturerOrigin] = useState(getPolicy("LEGAL_MANUFACTURER_ORIGIN", "제조사 : 퍼베이드제조국 : 한국"));
  const [legalChildProtection, setLegalChildProtection] = useState(getPolicy("LEGAL_CHILD_PROTECTION", "어린이보호포장 비대상"));
  const [legalIngredients, setLegalIngredients] = useState(getPolicy("LEGAL_INGREDIENTS", "에탄올, 정제수, 천연향료"));
  const [legalCautions, setLegalCautions] = useState(getPolicy("LEGAL_CAUTIONS", "밀폐된 공간에서 사용 시 환기를 충분히 하시오. 내용물을 마시거나, 내용물이 눈 또는 피부에 닿을 경우 인체에 심각한 손상을 입힐 수 있으니 주의하시오. 어린이 손에 닿지 않는 곳에 보관하시오. 사람 또는 동물에 직접 사용(분사)하지 마시오. 표시사항에 기재된 제품의 용도 외에는 사용하지 마시오. 다른 제품과 섞어 사용할 경우 인체에 치명적인 손상을 입힐 수 있으니 섞어 사용하지 마시오. 공기 소독(연무 소독, 고압분사용 소독장비 활용하는 경우 포함)의 용도 사용을 금지하오니, 물체 표면에만 사용하시오. 어린이보호포장이 적용되지 아니한 제품으로 어린이의 손이 닿지 않는 곳에 보관하시오. 화기를 가까이 하지 마시오. 직사광선을 피하여 보관하시오. 광택이 있는 물체 혹은 섬유에 사용 시 변색, 탈색 테스트 후 사용하십시오. 제품을 세워서 보관하십시오."));
  const [legalSafetyCertNo, setLegalSafetyCertNo] = useState(getPolicy("LEGAL_SAFETY_CERT_NO", "CB24-13-0521"));
  const [legalCsPhone, setLegalCsPhone] = useState(getPolicy("LEGAL_CS_PHONE", "070-7756-3668"));

  // 6. Toss Payments PG State
  const [tossPaymentEnabled, setTossPaymentEnabled] = useState(getPolicy("TOSS_PAYMENT_ENABLED", "true") === "true");
  const [tossPgMode, setTossPgMode] = useState(getPolicy("TOSS_PG_MODE", "TEST"));
  const [tossClientKey, setTossClientKey] = useState(getPolicy("TOSS_CLIENT_KEY", "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"));
  const [tossSecretKey, setTossSecretKey] = useState(getPolicy("TOSS_SECRET_KEY", "test_gsk_docs_OaPzBL5KdmQXkzRz3y47BMW6"));
  const [tossMid, setTossMid] = useState(getPolicy("TOSS_MID", "개발 연동 체험 상점"));

  const [isSavingAll, setIsSavingAll] = useState(false);

  const saveAllPolicies = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAll(true);
    try {
      let adminUserId = "";
      try {
        const stored = sessionStorage.getItem("pervade_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) adminUserId = parsed.id;
        }
      } catch (e) {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminUserId) {
        headers["x-user-id"] = adminUserId;
      }

      const response = await fetch("/api/admin/policies", {
        method: "POST",
        headers,
        credentials: "include",
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
            LEGAL_PRODUCT_NAME: legalProductName,
            LEGAL_USAGE_FORM: legalUsageForm,
            LEGAL_EXPIRY_DATE: legalExpiryDate,
            LEGAL_WEIGHT_CAPACITY: legalWeightCapacity,
            LEGAL_EFFECT: legalEffect,
            LEGAL_MANUFACTURER_ORIGIN: legalManufacturerOrigin,
            LEGAL_CHILD_PROTECTION: legalChildProtection,
            LEGAL_INGREDIENTS: legalIngredients,
            LEGAL_CAUTIONS: legalCautions,
            LEGAL_SAFETY_CERT_NO: legalSafetyCertNo,
            LEGAL_CS_PHONE: legalCsPhone,
            TOSS_PAYMENT_ENABLED: tossPaymentEnabled ? "true" : "false",
            TOSS_PG_MODE: tossPgMode,
            TOSS_CLIENT_KEY: tossClientKey,
            TOSS_SECRET_KEY: tossSecretKey,
            TOSS_MID: tossMid,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && (data?.success || data?.id || data?.key)) {
        alert("✅ 모든 설정 및 회원등급/프로모션 정책이 성공적으로 저장되었습니다!\n쇼핑몰 및 마이페이지에 실시간 반영됩니다.");
      } else {
        alert(data?.error || "정책 저장에 실패했습니다. 관리자 로그인 세션을 확인해주세요.");
      }
    } catch (err: any) {
      console.error("Policy save error:", err);
      alert("저장 중 네트워크 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminNewPassword || adminNewPassword.length < 6) {
      alert("새 비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsUpdatingAdminPass(true);
    try {
      let adminUserId = "";
      try {
        const stored = sessionStorage.getItem("pervade_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) adminUserId = parsed.id;
        }
      } catch (e) {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminUserId) {
        headers["x-user-id"] = adminUserId;
      }

      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ newPassword: adminNewPassword.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("🔒 최고관리자 비밀번호가 안전하게 변경되었습니다!\n다음 로그인부터 새 비밀번호가 적용됩니다.");
        setAdminNewPassword("");
        setAdminConfirmPassword("");
      } else {
        alert(`비밀번호 변경 실패: ${data?.error || "알 수 없는 오류"}`);
      }
    } catch (err: any) {
      console.error(err);
      alert("네트워크 통신 오류가 발생했습니다.");
    } finally {
      setIsUpdatingAdminPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <form onSubmit={saveAllPolicies} className="space-y-8">
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
            <span>{isSavingAll ? "전체 정책 저장 중..." : "전체 운영 정책 일괄 저장"}</span>
          </button>
        </div>

        {/* 0. Top Promo Banner */}
        <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-lg text-zinc-950">0. 최상단 프로모션 띠배너 (Live Top Banner)</h3>
                <p className="text-xs text-zinc-500">모든 쇼핑몰 최상단에 상시 노출되는 핵심 이벤트/공지 텍스트입니다.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={topBannerEnabled}
                onChange={(e) => setTopBannerEnabled(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900"
              />
              <span className="text-xs font-bold text-zinc-700">띠배너 활성화 (Live On)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">띠배너 노출 문구</label>
            <input
              type="text"
              value={topBannerText}
              onChange={(e) => setTopBannerText(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="예: 신규 가입 시 3,000P 적립 & 첫 구매 무료배송"
            />
          </div>
        </div>

        {/* 1. 4-Tier Membership Policy */}
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
            {/* Tier 1 */}
            <div className="p-4 bg-zinc-50 border rounded-2xl space-y-3">
              <span className="font-black text-xs px-2.5 py-1 bg-zinc-200 text-zinc-800 rounded-lg">1단계: 일반 회원</span>
              <p className="text-[11px] text-zinc-600 font-medium">가입 및 본인인증 완료 시 기본 부여</p>
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

            {/* Tier 2 */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
              <span className="font-black text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">2단계: 재구매 회원</span>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">기준 구매 횟수 (회 이상)</label>
                <input
                  type="number"
                  value={tierRepeatCount}
                  onChange={(e) => setTierRepeatCount(e.target.value)}
                  className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
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

            {/* Tier 3 */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
              <span className="font-black text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">3단계: 우수 회원</span>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">기준 누적금액 (원 이상)</label>
                <input
                  type="number"
                  value={tierSuperiorThreshold}
                  onChange={(e) => setTierSuperiorThreshold(e.target.value)}
                  className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
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

            {/* Tier 4 */}
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
              <span className="font-black text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">4단계: VIP 회원</span>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">기준 누적금액 (원 이상)</label>
                <input
                  type="number"
                  value={tierVipThreshold}
                  onChange={(e) => setTierVipThreshold(e.target.value)}
                  className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
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
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">대표자명</label>
              <input type="text" value={ceoName} onChange={(e) => setCeoName(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 mb-1">사업장 주소지</label>
              <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">사업자등록번호</label>
              <input type="text" value={bizRegNumber} onChange={(e) => setBizRegNumber(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">통신판매업 신고번호</label>
              <input type="text" value={ecommerceNumber} onChange={(e) => setEcommerceNumber(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">개인정보보호책임자</label>
              <input type="text" value={privacyOfficer} onChange={(e) => setPrivacyOfficer(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 대표전화</label>
              <input type="text" value={csPhone} onChange={(e) => setCsPhone(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 운영시간</label>
              <input type="text" value={csHours} onChange={(e) => setCsHours(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">고객센터 이메일</label>
              <input type="text" value={csEmail} onChange={(e) => setCsEmail(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">호스팅 서비스 제공자</label>
              <input type="text" value={hostingProvider} onChange={(e) => setHostingProvider(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">에스크로(구매안전) 서비스 안내</label>
              <input type="text" value={escrowInfo} onChange={(e) => setEscrowInfo(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold" />
            </div>
          </div>
        </div>

        {/* 3. Shipping & Return */}
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
          />
        </div>

        {/* 4. Referral Rewards */}
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
              <input type="number" value={referralReward} onChange={(e) => setReferralReward(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">일반 텍스트 리뷰 적립률 (%)</label>
              <input type="number" step="0.1" value={reviewReward} onChange={(e) => setReviewReward(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">포토 / 베스트 리뷰 적립률 (%)</label>
              <input type="number" step="0.1" value={photoReviewReward} onChange={(e) => setPhotoReviewReward(e.target.value)} className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold" />
            </div>
          </div>
        </div>

        {/* 5. Legal Product Disclosure (안전확인대상 생활화학제품 필수 표기 정보) */}
        <div className="bg-white border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b pb-4">
            <Building2 className="w-5 h-5 text-zinc-700" />
            <div>
              <h3 className="font-bold text-lg text-zinc-950">5. 📜 상품 필수 표기 정보 (생활화학제품 법정 고시사항)</h3>
              <p className="text-xs text-zinc-500">모든 상품 상세설명 하단에 2x2 테이블 규격으로 항상 자동 노출됩니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">품목 및 제품명</label>
              <input
                type="text"
                value={legalProductName}
                onChange={(e) => setLegalProductName(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">중량·용량·매수·크기</label>
              <input
                type="text"
                value={legalWeightCapacity}
                onChange={(e) => setLegalWeightCapacity(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">제조연월 및 유통기한</label>
              <input
                type="text"
                value={legalExpiryDate}
                onChange={(e) => setLegalExpiryDate(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">효과, 효능 (승인대상 제품에 한함)</label>
              <input
                type="text"
                value={legalEffect}
                onChange={(e) => setLegalEffect(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">수입자, 제조국 및 제조사</label>
              <input
                type="text"
                value={legalManufacturerOrigin}
                onChange={(e) => setLegalManufacturerOrigin(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">어린이보호포장 대상 제품 유무</label>
              <input
                type="text"
                value={legalChildProtection}
                onChange={(e) => setLegalChildProtection(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 mb-1">용도(표백제의 경우 계열을 함께표시) 및 제형</label>
              <textarea
                rows={2}
                value={legalUsageForm}
                onChange={(e) => setLegalUsageForm(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium leading-relaxed"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 mb-1">제품에 사용된 화학물질 명칭 (주요물질, 보존제 등)</label>
              <input
                type="text"
                value={legalIngredients}
                onChange={(e) => setLegalIngredients(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">안전기준적합확인신고번호</label>
              <input
                type="text"
                value={legalSafetyCertNo}
                onChange={(e) => setLegalSafetyCertNo(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">소비자상담 관련 전화번호</label>
              <input
                type="text"
                value={legalCsPhone}
                onChange={(e) => setLegalCsPhone(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 mb-1">사용상 주의사항</label>
              <textarea
                rows={4}
                value={legalCautions}
                onChange={(e) => setLegalCautions(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* 6. Toss Payments PG Setting */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-100 pb-4">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg text-zinc-950">6. 💳 토스페이먼츠(Toss Payments) 전자결제(PG) 연동 설정</h3>
                <p className="text-xs text-blue-700 font-medium">신용카드, 카카오페이, 네이버페이, 토스페이, 가상계좌 등 안전 결제창 연동 키입니다.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${tossPgMode === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                {tossPgMode === 'LIVE' ? '🟢 실결제 운영 (LIVE)' : '🟡 테스트 결제 (TEST)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">연동 모드 (PG Mode)</label>
              <select
                value={tossPgMode}
                onChange={(e) => setTossPgMode(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold"
              >
                <option value="TEST">TEST (테스트 결제 모드 - 가상 결제/심사용)</option>
                <option value="LIVE">LIVE (실결제 운영 모드 - 실제 고객 결제)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">토스페이먼츠 결제창 활성화</label>
              <select
                value={tossPaymentEnabled ? "true" : "false"}
                onChange={(e) => setTossPaymentEnabled(e.target.value === "true")}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold"
              >
                <option value="true">활성화 (ON - 실제 토스페이먼츠 결제창 호출)</option>
                <option value="false">비활성화 (OFF)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">클라이언트 키 (Client Key)</label>
              <input
                type="text"
                value={tossClientKey}
                onChange={(e) => setTossClientKey(e.target.value)}
                placeholder="test_gck_..."
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">시크릿 키 (Secret Key)</label>
              <input
                type="text"
                value={tossSecretKey}
                onChange={(e) => setTossSecretKey(e.target.value)}
                placeholder="test_gsk_..."
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 mb-1">상점 식별자 (MID / 상점명)</label>
              <input
                type="text"
                value={tossMid}
                onChange={(e) => setTossMid(e.target.value)}
                placeholder="개발 연동 체험 상점"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
              />
            </div>
          </div>
          
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
            💡 <strong>토스페이먼츠 연동 안내</strong>: 현재 <strong>테스트 키</strong>가 기본 적용되어 결제 시 실제 대금이 청구되지 않고 안전하게 결제창 및 주문 프로세스를 테스트하실 수 있습니다. 토스페이먼츠 관리자센터에서 심사가 승인된 후 <strong>[라이브]</strong> 탭의 클라이언트 키 및 시크릿 키를 여기에 입력하고 모드를 <strong>LIVE</strong>로 변경하시면 즉시 실제 고객 카드결제가 시작됩니다.
          </div>
        </div>
      </form>

      {/* 7. Admin Password Security */}
      <form onSubmit={handleAdminPasswordChange} className="bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-red-100 pb-4">
          <Lock className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-bold text-lg text-zinc-950">7. 🔐 최고관리자(Admin) 비밀번호 변경 및 보안 강화</h3>
            <p className="text-xs text-red-600 font-medium">관리자 계정의 비밀번호를 안전하게 즉시 변경합니다. 기존 임시 비밀번호는 즉시 무효화됩니다.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">새 관리자 비밀번호 (6자리 이상)</label>
            <input
              type="password"
              required
              value={adminNewPassword}
              onChange={(e) => setAdminNewPassword(e.target.value)}
              placeholder="새 관리자 비밀번호 입력"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:ring-red-600 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">새 관리자 비밀번호 확인</label>
            <input
              type="password"
              required
              value={adminConfirmPassword}
              onChange={(e) => setAdminConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:ring-red-600 font-mono"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdatingAdminPass}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            <span>{isUpdatingAdminPass ? "비밀번호 변경 중..." : "관리자 비밀번호 즉시 변경 및 적용"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

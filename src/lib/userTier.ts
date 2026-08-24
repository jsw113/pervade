export interface TierPolicyConfig {
  TIER_REPEAT_COUNT?: number; // Default 2 orders
  TIER_SUPERIOR_THRESHOLD?: number; // Default 100,000 KRW
  TIER_VIP_THRESHOLD?: number; // Default 300,000 KRW
  TIER_GENERAL_RATE?: number; // Default 1%
  TIER_REPEAT_RATE?: number; // Default 2%
  TIER_SUPERIOR_RATE?: number; // Default 3%
  TIER_VIP_RATE?: number; // Default 5%
}

export interface UserTierResult {
  tier: "일반" | "재구매" | "우수" | "VIP";
  tierEng: "GENERAL" | "REPEAT" | "SUPERIOR" | "VIP";
  rewardRate: number; // e.g. 0.05 for 5%
  badgeColor: string;
  benefits: string;
  nextTier: "재구매" | "우수" | "VIP" | null;
  progressPercent: number;
  remainingMessage: string;
}

export function calculateUserTier(
  user: {
    totalPurchases?: number;
    realNameVerified?: boolean;
  },
  orderCount: number = 0,
  policyMap?: Record<string, string | number>
): UserTierResult {
  const purchases = user?.totalPurchases || 0;
  const isVerified = !!user?.realNameVerified;

  const repeatOrderCount = parseInt(String(policyMap?.TIER_REPEAT_COUNT || "2"), 10);
  const superiorThreshold = parseInt(String(policyMap?.TIER_SUPERIOR_THRESHOLD || "100000"), 10);
  const vipThreshold = parseInt(String(policyMap?.TIER_VIP_THRESHOLD || "300000"), 10);

  const generalRate = parseFloat(String(policyMap?.TIER_GENERAL_RATE || "1.0")) / 100;
  const repeatRate = parseFloat(String(policyMap?.TIER_REPEAT_RATE || "2.0")) / 100;
  const superiorRate = parseFloat(String(policyMap?.TIER_SUPERIOR_RATE || "3.0")) / 100;
  const vipRate = parseFloat(String(policyMap?.TIER_VIP_RATE || "5.0")) / 100;

  // 1. VIP Tier (>= 300,000 KRW)
  if (purchases >= vipThreshold) {
    return {
      tier: "VIP",
      tierEng: "VIP",
      rewardRate: vipRate,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      benefits: `모든 구매 시 ${(vipRate * 100).toFixed(0)}% 적립 + VIP 전담 케어 & 무료배송`,
      nextTier: null,
      progressPercent: 100,
      remainingMessage: "최고 등급인 VIP 회원 혜택을 누리고 계십니다.",
    };
  }

  // 2. Superior Tier (>= 100,000 KRW)
  if (purchases >= superiorThreshold) {
    const needed = vipThreshold - purchases;
    const progress = Math.min(100, Math.floor((purchases / vipThreshold) * 100));
    return {
      tier: "우수",
      tierEng: "SUPERIOR",
      rewardRate: superiorRate,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      benefits: `모든 구매 시 ${(superiorRate * 100).toFixed(0)}% 적립 + 우수회원 전용 할인쿠폰`,
      nextTier: "VIP",
      progressPercent: progress,
      remainingMessage: `VIP 등급까지 ₩${needed.toLocaleString()}원 남았습니다.`,
    };
  }

  // 3. Repeat Tier (>= 2 orders)
  if (orderCount >= repeatOrderCount) {
    const needed = superiorThreshold - purchases;
    const progress = Math.min(100, Math.floor((purchases / superiorThreshold) * 100));
    return {
      tier: "재구매",
      tierEng: "REPEAT",
      rewardRate: repeatRate,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      benefits: `모든 구매 시 ${(repeatRate * 100).toFixed(0)}% 적립 + 재구매 감사 혜택`,
      nextTier: "우수",
      progressPercent: progress,
      remainingMessage: `우수 등급까지 ₩${needed.toLocaleString()}원 남았습니다.`,
    };
  }

  // 4. General Tier (Default: Sign up + Verification)
  const neededOrders = Math.max(1, repeatOrderCount - orderCount);
  return {
    tier: "일반",
    tierEng: "GENERAL",
    rewardRate: generalRate,
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-300",
    benefits: isVerified 
      ? `기본 ${(generalRate * 100).toFixed(0)}% 적립 + 본인인증 회원 혜택`
      : "회원가입 기본 혜택 (본인인증 시 추가 혜택)",
    nextTier: "재구매",
    progressPercent: Math.min(100, Math.floor((orderCount / repeatOrderCount) * 100)),
    remainingMessage: `재구매 등급까지 ${neededOrders}회 추가 구매 필요`,
  };
}

import { Gift, ShoppingBag, Trophy, Users, Heart, Clipboard, User as UserIcon, MapPin, Calendar, CheckCircle, ShieldAlert, Sparkles, Award, LogOut } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RealNameVerifier } from "@/components/shop/RealNameVerifier";
import { MyPageAddressEditor } from "@/components/shop/MyPageAddressEditor";
import { ShippingAddressManager } from "@/components/shop/ShippingAddressManager";
import { calculateUserTier } from "@/lib/userTier";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findFirst({
    where: { id: userId }
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Get active policies
  const policies = await prisma.policy.findMany();
  const policyMap: Record<string, string> = {};
  policies.forEach(p => {
    policyMap[p.key] = p.value;
  });

  // Fetch live orders
  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  // Fetch live wishlist items
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: dbUser.id },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  // Calculate tier using 4-tier policy (일반 / 재구매 / 우수 / VIP)
  const totalPurchases = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const tierInfo = calculateUserTier(
    { totalPurchases, realNameVerified: dbUser.realNameVerified },
    orders.length,
    policyMap
  );

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-10">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">마이페이지</h1>
          <p className="text-xs text-zinc-400 mt-1">회원 정보 및 배송지 / 주문 실적 관리</p>
        </div>
        <Link
          href="/api/auth/logout"
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>로그아웃</span>
        </Link>
      </div>
      
      {/* 1. Profile & 4-Tier Membership Status */}
      <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-18 h-18 bg-zinc-950 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-md shrink-0">
            {dbUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-zinc-950">{dbUser.name} 님</h2>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${tierInfo.badgeColor} flex items-center gap-1 shadow-2xs`}>
                <Award className="w-3.5 h-3.5" />
                {tierInfo.tier} 회원
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">{dbUser.email}</p>
            <p className="text-xs text-zinc-700 font-bold mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{tierInfo.benefits}</span>
            </p>
          </div>
        </div>
        
        {/* Next Tier Progression */}
        <div className="w-full md:w-80 bg-zinc-50 p-4 rounded-2xl border space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-zinc-700">
              {tierInfo.nextTier ? `${tierInfo.nextTier} 등급 달성 기준` : "최고 등급 달성 완료"}
            </span>
            <span className="text-[11px] font-bold text-zinc-500">
              {tierInfo.progressPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-950 rounded-full transition-all duration-500" 
              style={{ width: `${tierInfo.progressPercent}%` }} 
            />
          </div>
          <p className="text-[11px] text-zinc-500 font-medium text-right">
            {tierInfo.remainingMessage}
          </p>
        </div>
      </div>

      {/* 2. Detailed Member Profile Info (Registered Base Address) */}
      <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-zinc-700" />
            나의 기본 회원 정보
          </h3>
          <div>
            {dbUser.realNameVerified ? (
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> 실명인증 완료
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> 실명인증 미완료
                </span>
                <RealNameVerifier />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
          <div className="flex border-b pb-2.5">
            <span className="w-28 text-zinc-400 font-bold">아이디 (ID)</span>
            <span className="text-zinc-950 font-bold">{dbUser.loginId || "미등록"}</span>
          </div>
          <div className="flex border-b pb-2.5">
            <span className="w-28 text-zinc-400 font-bold">이름 / 실명</span>
            <span className="text-zinc-950 font-bold">{dbUser.name}</span>
          </div>
          <div className="flex border-b pb-2.5">
            <span className="w-28 text-zinc-400 font-bold">이메일</span>
            <span className="text-zinc-950 font-medium">{dbUser.email}</span>
          </div>
          <div className="flex border-b pb-2.5">
            <span className="w-28 text-zinc-400 font-bold">휴대폰 번호</span>
            <span className="text-zinc-950 font-bold">{dbUser.phone || "미등록"}</span>
          </div>
          <div className="flex border-b pb-2.5">
            <span className="w-28 text-zinc-400 font-bold">생년월일</span>
            <span className="text-zinc-950 font-medium">{dbUser.birthDate || "미등록"}</span>
          </div>
          <div className="flex border-b pb-2.5">
            <span className="w-28 text-zinc-400 font-bold">가입 방식</span>
            <span className="text-zinc-950 font-bold uppercase">
              {dbUser.socialProvider ? `${dbUser.socialProvider} 간편가입` : "일반 회원가입"}
            </span>
          </div>
          
          {/* Member Profile Base Address */}
          <div className="border-t pt-4 md:col-span-2">
            <MyPageAddressEditor currentAddress={dbUser.address} />
          </div>
        </div>
      </div>

      {/* 3. Delivery Shipping Address Management (Max 3 Addresses) */}
      <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-700" />
              배송지 관리 (최대 3개 운용)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              주문 시 사용할 배송지를 최대 3개까지 등록하고 기본 배송지를 설정할 수 있습니다.
            </p>
          </div>
        </div>

        <ShippingAddressManager />
      </div>
      
      {/* 4. Performance & Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Performance */}
        <div className="bg-white border rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">나의 누적 구매 실적</h3>
              <p className="text-xs text-zinc-500">실시간 주문 및 결제 데이터 기준</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-950 mb-1">₩{totalPurchases.toLocaleString()}원</p>
            <p className="text-xs text-zinc-500 font-medium">
              누적 결제 완료 금액 (총 주문 <strong>{orders.length}회</strong> 완료)
            </p>
          </div>
        </div>

        {/* Affiliate & Points Performance */}
        <div className="bg-white border rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">나의 적립금 (포인트)</h3>
                <p className="text-xs text-zinc-500">상품 결제 시 현금처럼 사용 가능</p>
              </div>
            </div>
            <span className="text-xl font-black text-purple-700">
              {(dbUser.referralPoints || 0).toLocaleString()} P
            </span>
          </div>

          <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-1.5 text-xs text-purple-950">
            <div className="flex justify-between items-center">
              <span className="font-bold">나의 추천인 코드:</span>
              <span className="font-mono font-black bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                {dbUser.referralCode}
              </span>
            </div>
            <p className="text-[11px] text-purple-700">
              친구 추천 시 친구 결제 금액의 <strong>{tierInfo.rewardRate * 100}%</strong> 포인트가 적립됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Recent Orders */}
      <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-black text-zinc-950 flex items-center gap-2 border-b pb-4">
          <ShoppingBag className="w-4 h-4 text-zinc-700" />
          최근 주문 내역 ({orders.length}건)
        </h3>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
            <p>아직 주문한 내역이 없습니다.</p>
            <Link href="/shop" className="inline-block font-bold text-zinc-950 underline">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-950">{order.product?.name || "주문 상품"}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px]">
                      {order.status === "COMPLETED" ? "결제완료 / 출고준비" : order.status}
                    </span>
                  </div>
                  <p className="text-zinc-500">
                    옵션: {order.optionSelected} · {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-zinc-950">
                    ₩{order.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

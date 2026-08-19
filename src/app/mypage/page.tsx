import { Gift, ShoppingBag, Trophy, Users, Heart, Clipboard, User as UserIcon, MapPin, Calendar, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RealNameVerifier } from "@/components/shop/RealNameVerifier";

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
  const vipThreshold = parseInt(policies.find(p => p.key === "VIP_THRESHOLD")?.value || "500000");
  const referralRewardPercent = policies.find(p => p.key === "REFERRAL_REWARD_PERCENTAGE")?.value || "5";

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

  // Calculate tier and totals
  const totalPurchases = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const tier = totalPurchases >= vipThreshold ? "VIP" : "일반";
  const progress = Math.min((totalPurchases / vipThreshold) * 100, 100);

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      <h1 className="text-3xl font-bold tracking-tight">마이페이지</h1>
      
      {/* Profile Overview */}
      <div className="bg-white border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-2xl font-bold text-zinc-600 border shadow-inner">
            {dbUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold">{dbUser.name} 님</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                tier === "VIP" ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-700"
              }`}>
                {tier} 등급
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{dbUser.email}</p>
          </div>
        </div>
        
        {tier !== "VIP" && (
          <div className="w-full md:w-1/3 bg-zinc-50 p-4 rounded-xl border text-sm">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-zinc-700">VIP 등급 달성까지</span>
              <span className="text-zinc-500 font-medium">₩{(vipThreshold - totalPurchases).toLocaleString()} 남음</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Member Info */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-zinc-700" />
            나의 상세 회원 정보
          </h3>
          <div className="flex items-center gap-2">
            {dbUser.realNameVerified ? (
              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" /> 실명인증 완료
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> 실명인증 미완료
                </span>
                <RealNameVerifier />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div className="flex border-b pb-2">
            <span className="w-28 text-zinc-500 font-bold">아이디 (ID)</span>
            <span className="text-zinc-950 font-medium">{dbUser.loginId || "미등록"}</span>
          </div>
          <div className="flex border-b pb-2">
            <span className="w-28 text-zinc-500 font-bold">이름 / 실명</span>
            <span className="text-zinc-950 font-medium">{dbUser.name}</span>
          </div>
          <div className="flex border-b pb-2">
            <span className="w-28 text-zinc-500 font-bold">이메일</span>
            <span className="text-zinc-950 font-medium">{dbUser.email}</span>
          </div>
          <div className="flex border-b pb-2">
            <span className="w-28 text-zinc-500 font-bold">휴대폰 번호</span>
            <span className="text-zinc-950 font-medium">{dbUser.phone || "미등록"}</span>
          </div>
          <div className="flex border-b pb-2">
            <span className="w-28 text-zinc-500 font-bold">생년월일</span>
            <span className="text-zinc-950 font-medium">{dbUser.birthDate || "미등록"}</span>
          </div>
          <div className="flex border-b pb-2">
            <span className="w-28 text-zinc-500 font-bold">가입 방식</span>
            <span className="text-zinc-950 font-semibold uppercase">
              {dbUser.socialProvider ? `${dbUser.socialProvider} 간편가입` : "일반 회원가입"}
            </span>
          </div>
          <div className="flex border-b pb-2 md:col-span-2">
            <span className="w-28 text-zinc-500 font-bold flex-shrink-0">배송 주소</span>
            <span className="text-zinc-950 font-medium flex-1">{dbUser.address || "미등록 (주문 배송지 설정 필요)"}</span>
          </div>
        </div>
      </div>
      
      {/* Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Performance */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">나의 누적 구매 실적</h3>
          </div>
          <div>
            <p className="text-3xl font-black mb-1">₩{totalPurchases.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">누적 결제 완료 금액 (주문 {orders.length}건)</p>
          </div>
        </div>

        {/* Affiliate Performance */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">추천인 실적 포인트</h3>
            </div>
            <button className="text-xs px-3 py-1.5 bg-black text-white rounded-full font-semibold hover:bg-black/80 transition-colors">
              출금 신청
            </button>
          </div>
          <p className="text-3xl font-black text-green-600 mb-1">{dbUser.referralPoints.toLocaleString()} P</p>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">나의 추천인 코드</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-zinc-50 p-2.5 rounded-lg text-center font-mono font-bold tracking-wider border text-sm text-zinc-700">
                {dbUser.referralCode}
              </code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              이 코드를 공유해 친구가 가입 및 구매 시 결제액의 {referralRewardPercent}%가 포인트로 즉시 적립됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold border-b pb-3">최근 주문 내역</h3>
          {orders.length === 0 ? (
            <div className="bg-white border rounded-2xl text-center py-16 text-muted-foreground">
              <p className="text-sm">최근 주문 내역이 없습니다.</p>
              <div className="mt-4">
                <Link href="/shop" className="text-sm text-blue-600 hover:underline font-semibold">쇼핑하러 가기 &gt;</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {orders.map(order => (
                <div key={order.id} className="bg-white border rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-zinc-100 border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-zinc-400">
                      {order.product?.imageUrl ? (
                        <img src={order.product.imageUrl} alt={order.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px]">No Img</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-950 text-base">{order.product?.name || "알 수 없는 제품"}</h4>
                      <p className="text-xs text-zinc-400 mt-1">주문일: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                        <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-medium">{order.optionSelected}</span>
                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{order.shippingMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-zinc-950 text-base">₩{order.totalAmount.toLocaleString()}</span>
                    <span className="inline-block mt-1 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {order.status === "PENDING" ? "결제완료" : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Wishlist */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-1.5">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            찜한 상품 ({wishlist.length})
          </h3>
          {wishlist.length === 0 ? (
            <div className="bg-white border rounded-2xl text-center py-16 text-muted-foreground text-sm">
              찜한 상품이 없습니다.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {wishlist.map(wish => (
                <Link href={`/shop/${wish.productId}`} key={wish.id} className="block group bg-white border rounded-xl p-4 flex items-center gap-4 hover:border-zinc-400 transition-colors">
                  <div className="w-12 h-12 bg-zinc-100 border rounded overflow-hidden flex-shrink-0">
                    {wish.product?.imageUrl ? (
                      <img src={wish.product.imageUrl} alt={wish.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">No Img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-zinc-950 truncate group-hover:text-primary transition-colors">
                      {wish.product?.name}
                    </h4>
                    <p className="text-xs font-semibold text-zinc-600 mt-0.5">₩{wish.product?.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const userCoupons = await prisma.userCoupon.findMany({
      where: { userId },
      include: { coupon: true },
      orderBy: { issuedAt: "desc" }
    });

    const now = Date.now();

    // Format and calculate status dynamically
    const formatted = userCoupons.map((uc) => {
      const isExpired = uc.coupon.validUntil ? new Date(uc.coupon.validUntil).getTime() < now : false;
      let effectiveStatus = uc.status;
      if (uc.status === "UNUSED" && isExpired) {
        effectiveStatus = "EXPIRED";
      }

      return {
        id: uc.id,
        couponId: uc.couponId,
        status: effectiveStatus,
        usedAt: uc.usedAt,
        issuedAt: uc.issuedAt,
        code: uc.coupon.code,
        name: uc.coupon.name,
        description: uc.coupon.description,
        discountType: uc.coupon.discountType,
        discountValue: uc.coupon.discountValue,
        minOrderAmount: uc.coupon.minOrderAmount,
        maxDiscountAmount: uc.coupon.maxDiscountAmount,
        validFrom: uc.coupon.validFrom,
        validUntil: uc.coupon.validUntil,
        isActive: uc.coupon.isActive && !isExpired,
      };
    });

    const availableCoupons = formatted.filter((c) => c.status === "UNUSED" && c.isActive);
    const historyCoupons = formatted.filter((c) => c.status !== "UNUSED" || !c.isActive);

    return NextResponse.json({
      all: formatted,
      available: availableCoupons,
      history: historyCoupons,
      availableCount: availableCoupons.length
    });
  } catch (error: any) {
    console.error("Failed to fetch user coupons:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

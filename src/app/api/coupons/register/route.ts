import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요한 서비스입니다." }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "쿠폰 번호(코드)를 정확히 입력해주세요." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (!coupon) {
      return NextResponse.json({ error: "존재하지 않거나 유효하지 않은 쿠폰 코드입니다." }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "현재 사용이 일시 중단된 쿠폰입니다." }, { status: 400 });
    }

    const now = Date.now();

    // 2. Check validity date range
    if (coupon.validFrom && new Date(coupon.validFrom).getTime() > now) {
      return NextResponse.json({ error: "아직 사용 기간이 시작되지 않은 쿠폰입니다." }, { status: 400 });
    }

    if (coupon.validUntil && new Date(coupon.validUntil).getTime() < now) {
      return NextResponse.json({ error: "유효기간이 만료된 쿠폰입니다." }, { status: 400 });
    }

    // 3. Check stock / totalQuantity limit
    if (coupon.totalQuantity) {
      if (coupon.issuedQuantity >= coupon.totalQuantity) {
        return NextResponse.json({ error: `해당 쿠폰은 선착순 한도(${coupon.totalQuantity}장)가 모두 마감되었습니다.` }, { status: 400 });
      }
    }

    // 4. Check if user already registered this coupon
    const existing = await prisma.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId: coupon.id
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "이미 내 쿠폰함에 등록된 쿠폰입니다." }, { status: 400 });
    }

    // 5. Create UserCoupon and increment coupon.issuedQuantity
    const userCoupon = await prisma.userCoupon.create({
      data: {
        userId,
        couponId: coupon.id,
        status: "UNUSED"
      },
      include: { coupon: true }
    });

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { issuedQuantity: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      message: `'${coupon.name}' 쿠폰이 내 쿠폰함에 성공적으로 등록되었습니다!`,
      coupon: {
        id: userCoupon.id,
        couponId: coupon.id,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        validUntil: coupon.validUntil
      }
    });
  } catch (error: any) {
    console.error("Failed to register coupon code:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

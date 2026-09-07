import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, hasPermission } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// POST: Issue coupon to specific user IDs or all users
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin, "POLICIES") && !hasPermission(admin, "CONTENTS") && !hasPermission(admin, "USERS"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { userIds, issueToAll = false } = body;

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      return NextResponse.json({ error: "쿠폰을 찾을 수 없습니다." }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "비활성화된 쿠폰은 발급할 수 없습니다." }, { status: 400 });
    }

    // Check expiration
    if (coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now()) {
      return NextResponse.json({ error: "유효기간이 만료된 쿠폰입니다." }, { status: 400 });
    }

    let targetUserIds: string[] = [];

    if (issueToAll) {
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      targetUserIds = allUsers.map((u) => u.id);
    } else if (Array.isArray(userIds) && userIds.length > 0) {
      targetUserIds = userIds;
    } else {
      return NextResponse.json({ error: "지급 대상 회원을 1명 이상 선택해주세요." }, { status: 400 });
    }

    // Check inventory / stock
    if (coupon.totalQuantity) {
      const remainingStock = coupon.totalQuantity - coupon.issuedQuantity;
      if (remainingStock <= 0) {
        return NextResponse.json({ error: `쿠폰 총 발행 한도(${coupon.totalQuantity}장)가 모두 소진되었습니다.` }, { status: 400 });
      }
      if (targetUserIds.length > remainingStock) {
        targetUserIds = targetUserIds.slice(0, remainingStock);
      }
    }

    // Find users who already have this coupon
    const existingUserCoupons = await prisma.userCoupon.findMany({
      where: {
        couponId: id,
        userId: { in: targetUserIds }
      },
      select: { userId: true }
    });

    const alreadyIssuedIds = new Set(existingUserCoupons.map((uc) => uc.userId));
    const eligibleUserIds = targetUserIds.filter((uid) => !alreadyIssuedIds.has(uid));

    if (eligibleUserIds.length === 0) {
      return NextResponse.json({
        error: "선택한 모든 회원이 이미 해당 쿠폰을 보유하고 있습니다."
      }, { status: 400 });
    }

    // Create UserCoupon records
    await prisma.userCoupon.createMany({
      data: eligibleUserIds.map((uid) => ({
        userId: uid,
        couponId: id,
        status: "UNUSED"
      })),
      skipDuplicates: true
    });

    // Update issued quantity
    const updatedCount = await prisma.userCoupon.count({
      where: { couponId: id }
    });

    await prisma.coupon.update({
      where: { id },
      data: { issuedQuantity: updatedCount }
    });

    // Record notifications in MessageLog for each user
    try {
      await prisma.messageLog.createMany({
        data: eligibleUserIds.map((uid) => ({
          userId: uid,
          type: "KAKAO",
          content: `[퍼베이드] 고객님께 '${coupon.name}' 쿠폰이 발급되었습니다. 마이페이지 또는 주문 결제창에서 확인해보세요!`,
          status: "SUCCESS"
        }))
      });
    } catch (msgErr) {
      console.warn("Message log creation failed:", msgErr);
    }

    return NextResponse.json({
      success: true,
      issuedCount: eligibleUserIds.length,
      skippedCount: targetUserIds.length - eligibleUserIds.length
    });
  } catch (error: any) {
    console.error("Failed to issue coupons:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

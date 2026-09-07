import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, hasPermission } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// GET: List all coupons with inventory stats
export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { userCoupons: true, orders: true }
        }
      }
    });

    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("Failed to fetch admin coupons:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new coupon
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin, "POLICIES") && !hasPermission(admin, "CONTENTS"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      name,
      description,
      discountType = "FIXED", // "FIXED" | "PERCENT"
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount,
      validFrom,
      validUntil,
      totalQuantity,
      issueType = "MANUAL", // "ALL_USERS" | "MANUAL" | "CODE_REGISTER" | "CHANNEL" | "SIGNUP"
      targetChannel,
      isActive = true
    } = body;

    if (!name || !discountValue || discountValue <= 0) {
      return NextResponse.json({ error: "쿠폰명과 유효한 할인 금액/할인율을 입력해주세요." }, { status: 400 });
    }

    if (discountType === "PERCENT" && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json({ error: "정률 할인율은 1% ~ 100% 사이로 설정해야 합니다." }, { status: 400 });
    }

    // Code normalization
    const cleanCode = code ? code.trim().toUpperCase() : null;

    if (cleanCode) {
      const existing = await prisma.coupon.findUnique({
        where: { code: cleanCode }
      });
      if (existing) {
        return NextResponse.json({ error: `이미 등록된 쿠폰 코드('${cleanCode}')입니다.` }, { status: 400 });
      }
    }

    // 1. Create Coupon Master Record
    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        description: description?.trim() || null,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount || 0),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        totalQuantity: totalQuantity ? Number(totalQuantity) : null,
        issueType,
        targetChannel: targetChannel?.trim() || null,
        isActive: Boolean(isActive),
      }
    });

    // 2. If issueType is "ALL_USERS", automatically issue to all current users
    if (issueType === "ALL_USERS") {
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      const userCount = allUsers.length;

      // Check stock
      const issueLimit = coupon.totalQuantity ? Math.min(coupon.totalQuantity, userCount) : userCount;
      const targetUsers = allUsers.slice(0, issueLimit);

      if (targetUsers.length > 0) {
        await prisma.userCoupon.createMany({
          data: targetUsers.map((u) => ({
            userId: u.id,
            couponId: coupon.id,
            status: "UNUSED"
          })),
          skipDuplicates: true
        });

        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { issuedQuantity: targetUsers.length }
        });
      }
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Failed to create coupon:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

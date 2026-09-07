import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, hasPermission } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// GET: Single coupon details with issued users
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        userCoupons: {
          include: {
            user: {
              select: { id: true, name: true, email: true, loginId: true, phone: true }
            }
          },
          orderBy: { issuedAt: "desc" },
          take: 100
        }
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: "쿠폰을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error("Failed to fetch coupon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update coupon settings or toggle active
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin, "POLICIES") && !hasPermission(admin, "CONTENTS"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      totalQuantity,
      issueType,
      targetChannel,
      isActive
    } = body;

    const cleanCode = code !== undefined ? (code ? code.trim().toUpperCase() : null) : undefined;

    if (cleanCode) {
      const existing = await prisma.coupon.findFirst({
        where: {
          code: cleanCode,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: `이미 등록된 쿠폰 코드('${cleanCode}')입니다.` }, { status: 400 });
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(cleanCode !== undefined ? { code: cleanCode } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(discountType ? { discountType } : {}),
        ...(discountValue ? { discountValue: Number(discountValue) } : {}),
        ...(minOrderAmount !== undefined ? { minOrderAmount: Number(minOrderAmount || 0) } : {}),
        ...(maxDiscountAmount !== undefined ? { maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null } : {}),
        ...(validFrom ? { validFrom: new Date(validFrom) } : {}),
        ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}),
        ...(totalQuantity !== undefined ? { totalQuantity: totalQuantity ? Number(totalQuantity) : null } : {}),
        ...(issueType ? { issueType } : {}),
        ...(targetChannel !== undefined ? { targetChannel: targetChannel?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      }
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error("Failed to update coupon:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete coupon
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin, "POLICIES") && !hasPermission(admin, "CONTENTS"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

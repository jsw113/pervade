import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, loginId, address, birthDate, role, totalPurchases, referralPoints, realNameVerified } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(loginId !== undefined && { loginId }),
        ...(address !== undefined && { address }),
        ...(birthDate !== undefined && { birthDate }),
        ...(role !== undefined && { role }),
        ...(totalPurchases !== undefined && { totalPurchases: parseInt(totalPurchases) }),
        ...(referralPoints !== undefined && { referralPoints: parseInt(referralPoints) }),
        ...(realNameVerified !== undefined && { realNameVerified: !!realNameVerified }),
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;

    // Prevent deleting the main admin account
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.loginId === "admin" || targetUser?.email === "admin@pervade.co.kr") {
      return NextResponse.json({ error: "기본 최고관리자 계정은 삭제할 수 없습니다." }, { status: 400 });
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.cartItem.deleteMany({ where: { userId: id } });
    await prisma.wishlist.deleteMany({ where: { userId: id } });
    await prisma.order.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });
    await prisma.question.deleteMany({ where: { userId: id } });
    await prisma.messageLog.deleteMany({ where: { userId: id } });
    await prisma.post.deleteMany({ where: { authorId: id } });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "회원이 성공적으로 강제 탈퇴 처리되었습니다." });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

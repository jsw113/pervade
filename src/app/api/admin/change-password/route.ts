import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/authCrypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request);

    if (!adminUser) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json({ error: "새 비밀번호는 최소 6자리 이상이어야 합니다." }, { status: 400 });
    }

    const trimmedPassword = newPassword.trim();
    const newHash = hashPassword(trimmedPassword);

    // 1. Update Super Admin user record
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        passwordHash: newHash,
      },
    });

    // 2. Also update ADMIN_PASSWORD policy record
    await prisma.policy.upsert({
      where: { key: "ADMIN_PASSWORD" },
      update: { value: trimmedPassword },
      create: {
        key: "ADMIN_PASSWORD",
        value: trimmedPassword,
        description: "Super Admin Master Password",
      },
    });

    return NextResponse.json({
      success: true,
      message: "관리자 비밀번호가 안전하게 변경되었습니다. 다음 로그인부터 새 비밀번호가 적용됩니다.",
    });
  } catch (error: any) {
    console.error("Failed to change admin password:", error);
    return NextResponse.json({ error: error?.message || "비밀번호 변경 중 오류가 발생했습니다." }, { status: 500 });
  }
}

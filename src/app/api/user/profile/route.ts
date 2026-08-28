import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/authCrypto";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("userId")?.value;

    if (!userId) {
      userId = request.headers.get("x-user-id") || undefined;
    }

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, birthDate, address, currentPassword, newPassword } = body;

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const updateData: any = {};

    if (name && typeof name === "string") {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone ? String(phone).trim() : null;
    }

    if (birthDate !== undefined) {
      updateData.birthDate = birthDate ? String(birthDate).trim() : null;
    }

    if (address !== undefined) {
      updateData.address = address ? String(address).trim() : "";
    }

    // Password change validation
    if (newPassword && typeof newPassword === "string" && newPassword.trim().length > 0) {
      const trimmedNewPass = newPassword.trim();

      // Rule: 6 characters or more
      if (trimmedNewPass.length < 6) {
        return NextResponse.json(
          { error: "새 비밀번호는 최소 6자 이상이어야 합니다." },
          { status: 400 }
        );
      }

      // Rule: English (case-sensitive) or Number requirement
      const hasAlphaOrNum = /[a-zA-Z0-9]/.test(trimmedNewPass);
      if (!hasAlphaOrNum) {
        return NextResponse.json(
          { error: "비밀번호는 6자 이상 영문(대소문자) 또는 숫자를 포함해야 합니다." },
          { status: 400 }
        );
      }

      // Verify current password if user already has a password set
      if (user.passwordHash && user.passwordHash !== "$2b$10$dummyhashvalue") {
        if (!currentPassword || typeof currentPassword !== "string") {
          return NextResponse.json(
            { error: "보안을 위해 기존(현재) 비밀번호를 입력해주세요." },
            { status: 400 }
          );
        }

        const isCurrentValid = verifyPassword(currentPassword.trim(), user.passwordHash);
        if (!isCurrentValid) {
          return NextResponse.json(
            { error: "기존(현재) 비밀번호가 일치하지 않습니다. 다시 확인해주세요." },
            { status: 400 }
          );
        }
      }

      // Update with secure hash
      updateData.passwordHash = hashPassword(trimmedNewPass);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "회원 정보가 성공적으로 변경되었습니다.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        birthDate: updatedUser.birthDate,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "회원 정보 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;

  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function ensureDefaultAdminExists() {
  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { loginId: "admin" },
        { email: "admin@pervade.co.kr" }
      ]
    }
  });

  if (!admin) {
    await prisma.user.create({
      data: {
        loginId: "admin",
        email: "admin@pervade.co.kr",
        name: "최고관리자",
        role: "ADMIN",
        passwordHash: "$2b$10$admin123456hash",
        realNameVerified: true,
        phone: "010-0000-0000",
        address: "서울특별시 강남구 테헤란로 123",
      }
    });
  } else if (admin.role !== "ADMIN" || admin.loginId !== "admin") {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        loginId: "admin",
        role: "ADMIN"
      }
    });
  }
}

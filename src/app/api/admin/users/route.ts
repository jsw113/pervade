import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: true, reviews: true, questions: true }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, loginId, password, address, birthDate, role, referralPoints } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "이름과 이메일은 필수입니다." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(loginId ? [{ loginId }] : [])]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 이메일 또는 아이디입니다." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || "",
        loginId: loginId || `user_${Date.now().toString().slice(-6)}`,
        passwordHash: "$2b$10$dummyhashadmincreated",
        address: address || "",
        birthDate: birthDate || "",
        role: role || "USER",
        referralPoints: referralPoints ? parseInt(referralPoints) : 0,
        realNameVerified: true,
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

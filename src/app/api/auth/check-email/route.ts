import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ available: false, message: "이메일 주소를 입력해주세요." }, { status: 400 });
    }

    const trimmed = email.trim();

    // Check email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json({ 
        available: false, 
        message: "올바른 이메일 형식(예: name@example.com)을 입력해주세요." 
      }, { status: 200 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: trimmed },
    });

    if (existing) {
      return NextResponse.json({ 
        available: false, 
        message: "이미 가입된 이메일 계정입니다." 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      available: true, 
      message: "가입 가능한 이메일입니다." 
    }, { status: 200 });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json({ available: false, message: "이메일 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}

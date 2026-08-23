import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { loginId } = await request.json();

    if (!loginId || typeof loginId !== "string") {
      return NextResponse.json({ available: false, message: "아이디를 입력해주세요." }, { status: 400 });
    }

    const trimmed = loginId.trim();

    // Check ID pattern (4~20 chars, alphanumeric + underscore / hyphen)
    const idRegex = /^[a-zA-Z0-9_-]{4,20}$/;
    if (!idRegex.test(trimmed)) {
      return NextResponse.json({ 
        available: false, 
        message: "아이디는 4~20자의 영문, 숫자, 특수문자(_,-)만 사용 가능합니다." 
      }, { status: 200 });
    }

    const existing = await prisma.user.findFirst({
      where: { loginId: trimmed },
    });

    if (existing) {
      return NextResponse.json({ 
        available: false, 
        message: "이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요." 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      available: true, 
      message: "사용 가능한 멋진 아이디입니다!" 
    }, { status: 200 });
  } catch (error) {
    console.error("Check ID error:", error);
    return NextResponse.json({ available: false, message: "아이디 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}

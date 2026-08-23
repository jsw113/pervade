import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.loginId || "").trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: "아이디 또는 이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }

    // Find user by either email OR loginId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { loginId: identifier }
        ]
      },
    });

    if (!user) {
      return NextResponse.json({ error: "가입되지 않은 아이디 또는 이메일 계정입니다." }, { status: 401 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        loginId: user.loginId 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

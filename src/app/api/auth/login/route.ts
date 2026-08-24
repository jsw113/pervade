import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ensureDefaultAdminExists } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.loginId || "").trim();
    const password = (body.password || "").trim();
    const rememberMe = !!body.rememberMe;

    if (!identifier || !password) {
      return NextResponse.json({ error: "아이디 또는 이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }

    // Special validation for admin account (admin / 123456)
    if (identifier === "admin" || identifier === "admin@pervade.co.kr") {
      if (password !== "123456") {
        return NextResponse.json({ error: "관리자 비밀번호가 일치하지 않습니다." }, { status: 401 });
      }

      const adminUser = await ensureDefaultAdminExists();

      if (adminUser) {
        const cookieStore = await cookies();
        const cookieOptions: any = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
        };

        if (rememberMe) {
          cookieOptions.maxAge = 60 * 60 * 24 * 7; // 1 week
        }

        cookieStore.set("userId", adminUser.id, cookieOptions);

        return NextResponse.json({
          success: true,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            loginId: adminUser.loginId,
            role: adminUser.role,
          },
        });
      }
    }

    // Find regular user by either email OR loginId
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
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    if (rememberMe) {
      cookieOptions.maxAge = 60 * 60 * 24 * 7; // 1 week
    }

    cookieStore.set("userId", user.id, cookieOptions);

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        loginId: user.loginId,
        role: user.role
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

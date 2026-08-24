import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { loginId, name, email, password, phone, birthDate, address, consent } = await request.json();

    if (!loginId || !name || !email || !password) {
      return NextResponse.json({ error: "아이디, 이름, 이메일, 비밀번호는 필수 입력 항목입니다." }, { status: 400 });
    }

    // Check if user already exists with email or loginId
    const existingEmail = await prisma.user.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json({ error: "이미 존재하는 이메일 계정입니다." }, { status: 400 });
    }

    const existingLoginId = await prisma.user.findFirst({
      where: { loginId },
    });

    if (existingLoginId) {
      return NextResponse.json({ error: "이미 존재하는 사용자 아이디입니다." }, { status: 400 });
    }

    // Create user in DB (No automatic session cookie / No auto-login)
    const user = await prisma.user.create({
      data: {
        loginId,
        name,
        email,
        phone: phone || "",
        birthDate: birthDate || "",
        address: address || "",
        marketingConsent: !!consent,
        passwordHash: "$2b$10$dummyhashvalue",
      },
    });

    // NOTE: Auto-login is DISABLED upon signup.
    // User must manually log in with their ID/Password.

    return NextResponse.json({ 
      success: true, 
      message: "회원가입이 성공적으로 완료되었습니다. 로그인해 주세요.",
      user: { id: user.id, email: user.email, name: user.name, loginId: user.loginId } 
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

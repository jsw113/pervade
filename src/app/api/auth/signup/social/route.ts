import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashPassword } from "@/lib/authCrypto";
import { verifySocialToken } from "@/lib/socialToken";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, loginId, name, password, phone, birthDate, address, consent } = body;

    if (!token) {
      return NextResponse.json({ error: "간편인증 토큰이 누락되었습니다." }, { status: 400 });
    }

    // 1. Verify Social Pending Token
    const profile = verifySocialToken(token);
    if (!profile) {
      return NextResponse.json({ 
        error: "간편인증 세션이 만료되었습니다. 처음부터 다시 간편로그인을 진행해주세요." 
      }, { status: 401 });
    }

    if (!loginId || !loginId.trim()) {
      return NextResponse.json({ error: "사용자 아이디(ID)는 필수 입력 항목입니다." }, { status: 400 });
    }

    const trimmedLoginId = loginId.trim();
    const idRegex = /^[a-zA-Z0-9_-]{4,20}$/;
    if (!idRegex.test(trimmedLoginId)) {
      return NextResponse.json({ 
        error: "아이디는 4~20자의 영문, 숫자, 특수문자(_,-)만 사용 가능합니다." 
      }, { status: 400 });
    }

    // 2. Check if ID already exists
    const existingId = await prisma.user.findFirst({
      where: { loginId: trimmedLoginId }
    });

    if (existingId) {
      return NextResponse.json({ error: "이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요." }, { status: 400 });
    }

    // 3. Check if email or socialId already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { socialProvider: profile.socialProvider, socialId: profile.socialId },
          { email: profile.email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: "이미 해당 정보로 가입된 계정이 존재합니다. 기존 계정으로 로그인해주세요." 
      }, { status: 400 });
    }

    // 4. Secure Password Hashing (if password provided, use it; else generate secure unique hash)
    const finalPasswordHash = password && password.length >= 6
      ? hashPassword(password)
      : hashPassword(`social_secure_${profile.socialProvider}_${profile.socialId}_${Date.now()}`);

    // 5. Create user in DB
    const finalName = (name && name.trim()) || profile.name || "퍼베이드 회원";
    const finalPhone = (phone && phone.trim()) || profile.phone || "";
    const finalBirthDate = (birthDate && birthDate.trim()) || profile.birthDate || "";
    const finalAddress = (address && address.trim()) || "";

    const user = await prisma.user.create({
      data: {
        loginId: trimmedLoginId,
        name: finalName,
        email: profile.email,
        phone: finalPhone,
        birthDate: finalBirthDate,
        address: finalAddress,
        marketingConsent: !!consent,
        passwordHash: finalPasswordHash,
        socialProvider: profile.socialProvider,
        socialId: profile.socialId,
        kakaoId: profile.socialProvider === "KAKAO" ? profile.socialId : null,
        realNameVerified: true, // Social auth identity verified
        referralPoints: 3000,   // Welcome 3,000P
        role: "USER"
      }
    });

    // 6. Record Welcome Notification in MessageLogs
    try {
      await prisma.messageLog.create({
        data: {
          userId: user.id,
          type: "KAKAO",
          content: `${user.name}님, 퍼베이드 가입을 축하드립니다! 즉시 사용 가능한 웰컴 적립금 3,000P가 지급되었습니다.`,
          status: "SUCCESS",
        }
      });
    } catch (msgErr) {
      console.warn("Failed to create welcome message log:", msgErr);
    }

    // 7. Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "🎉 정식 회원가입이 완료되었습니다! 웰컴 3,000P가 지급되었습니다.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        loginId: user.loginId,
        role: user.role,
        realNameVerified: true,
        referralPoints: user.referralPoints,
      }
    });
  } catch (error: any) {
    console.error("Social signup error:", error);
    return NextResponse.json({ error: error?.message || "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

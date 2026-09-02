import { NextRequest, NextResponse } from "next/server";
import { verifySocialToken } from "@/lib/socialToken";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 누락되었습니다." }, { status: 400 });
    }

    const profile = verifySocialToken(token);
    if (!profile) {
      return NextResponse.json({ error: "인증 토큰이 유효하지 않거나 만료되었습니다. 다시 간편인증을 진행해주세요." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        birthDate: profile.birthDate || "",
        socialProvider: profile.socialProvider,
        realNameVerified: profile.realNameVerified,
      }
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "토큰 검증 중 오류가 발생했습니다." }, { status: 500 });
  }
}

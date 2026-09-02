import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/authConfig";
import { signSocialToken } from "@/lib/socialToken";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = "https://www.pervade.co.kr";

  // Parse redirectUrl from state if present
  let redirectUrl = "/";
  if (state) {
    try {
      const parsedState = JSON.parse(decodeURIComponent(state));
      if (parsedState && parsedState.redirect) {
        redirectUrl = parsedState.redirect;
      }
    } catch (e) {
      if (state.startsWith("/")) {
        redirectUrl = decodeURIComponent(state);
      }
    }
  }

  if (error || !code) {
    console.error("Kakao OAuth error:", error, errorDescription);
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_cancelled`);
  }

  try {
    // 1. Exchange code for access token from Kakao KAuth
    const tokenUrl = "https://kauth.kakao.com/oauth/token";
    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: AUTH_CONFIG.kakao.clientId,
      client_secret: AUTH_CONFIG.kakao.clientSecret,
      redirect_uri: AUTH_CONFIG.kakao.redirectUri,
      code,
    });

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: bodyParams.toString(),
    });

    if (!tokenRes.ok) {
      console.error("Failed to get Kakao token:", await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=kakao_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token in Kakao response:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=kakao_no_token`);
    }

    // 2. Fetch User Profile from Kakao API
    const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!profileRes.ok) {
      console.error("Failed to get Kakao profile:", await profileRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=kakao_profile_failed`);
    }

    const kakaoUser = await profileRes.json();

    if (!kakaoUser || !kakaoUser.id) {
      console.error("Invalid Kakao profile data:", kakaoUser);
      return NextResponse.redirect(`${baseUrl}/login?error=kakao_invalid_user`);
    }

    const socialId = String(kakaoUser.id);
    const kakaoAccount = kakaoUser.kakao_account || {};
    const email = kakaoAccount.email || `kakao_${socialId.slice(0, 10)}@pervade.co.kr`;
    const name = kakaoAccount.name || kakaoAccount.profile?.nickname || "카카오 고객";
    
    // Normalize phone number
    let phone: string | null = kakaoAccount.phone_number || null;
    if (phone) {
      phone = phone.replace(/\+82\s?/, "0").replace(/[^0-9-]/g, "").trim();
      if (!phone.includes("-") && phone.length === 11) {
        phone = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
      }
    }

    const birthDate = (kakaoAccount.birthyear && kakaoAccount.birthday)
      ? `${kakaoAccount.birthyear}-${kakaoAccount.birthday.slice(0, 2)}-${kakaoAccount.birthday.slice(2)}`
      : null;

    // 3. Find User in Database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { socialProvider: "KAKAO", socialId },
          { email }
        ]
      }
    });

    // -------------------------------------------------------------
    // Branch 1: New User -> Redirect to /signup/social (No auto-creation)
    // -------------------------------------------------------------
    if (!user) {
      const pendingToken = signSocialToken({
        name,
        email,
        phone,
        birthDate,
        socialProvider: "KAKAO",
        socialId,
        realNameVerified: true,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      });

      const socialSignupUrl = `${baseUrl}/signup/social?token=${encodeURIComponent(pendingToken)}${
        redirectUrl && redirectUrl !== "/" ? `&redirect=${encodeURIComponent(redirectUrl)}` : ""
      }`;
      return NextResponse.redirect(socialSignupUrl);
    }

    // -------------------------------------------------------------
    // Branch 2: Existing User -> Immediate Login & Redirect
    // -------------------------------------------------------------
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        socialProvider: "KAKAO",
        socialId,
        kakaoId: socialId,
        name: user.name || name,
        phone: user.phone || phone,
        realNameVerified: true,
      }
    });

    // Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    const safeUserData = JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginId: user.loginId,
    });

    const destination = redirectUrl || "/";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>카카오 로그인 완료</title>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fef9c3;">
          <div style="text-align: center; background: white; padding: 32px 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size: 36px; margin-bottom: 12px;">🟡</div>
            <h2 style="margin: 0 0 8px 0; color: #0f172a;">카카오 1초 간편로그인 성공</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>${user.name}</strong>님 환영합니다! 페이지로 이동 중입니다...</p>
          </div>
          <script>
            try {
              localStorage.removeItem("pervade_user");
              sessionStorage.setItem("pervade_user", ${JSON.stringify(safeUserData)});
              window.dispatchEvent(new Event("pervade_auth_update"));
            } catch(e) {}
            setTimeout(function() {
              window.location.href = "${destination}";
            }, 600);
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      }
    });

  } catch (err) {
    console.error("Kakao OAuth processing error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_server_error`);
  }
}

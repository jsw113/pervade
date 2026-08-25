import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/authConfig";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "pervade_naver_auth";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = "https://www.pervade.co.kr";

  if (error || !code) {
    console.error("Naver OAuth error:", error, errorDescription);
    return NextResponse.redirect(`${baseUrl}/login?error=naver_cancelled`);
  }

  try {
    // 1. Exchange code for access token
    const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${AUTH_CONFIG.naver.clientId}&client_secret=${AUTH_CONFIG.naver.clientSecret}&code=${code}&state=${state}`;

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    if (!tokenRes.ok) {
      console.error("Failed to get Naver token:", await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=naver_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token in Naver response:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=naver_no_token`);
    }

    // 2. Fetch User Profile from Naver API
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileRes.ok) {
      console.error("Failed to get Naver profile:", await profileRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=naver_profile_failed`);
    }

    const profileData = await profileRes.json();
    const naverUser = profileData.response;

    if (!naverUser || !naverUser.id) {
      console.error("Invalid Naver profile data:", profileData);
      return NextResponse.redirect(`${baseUrl}/login?error=naver_invalid_user`);
    }

    const socialId = naverUser.id;
    const email = naverUser.email || `naver_${socialId.slice(0, 10)}@pervade.co.kr`;
    const name = naverUser.name || naverUser.nickname || "네이버 고객";
    const phone = naverUser.mobile || null;
    const birthDate = (naverUser.birthyear && naverUser.birthday) 
      ? `${naverUser.birthyear}-${naverUser.birthday}` 
      : null;

    // 3. Find or Create User in Database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { socialProvider: "NAVER", socialId },
          { email }
        ]
      }
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const mockLoginId = `naver_${socialId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`;
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          loginId: mockLoginId,
          phone,
          birthDate,
          passwordHash: `$2b$10$naver_oauth_secure_hash_${socialId.slice(0, 10)}`,
          socialProvider: "NAVER",
          socialId,
          realNameVerified: true, // Naver login inherently verifies identity
          referralPoints: 3000,   // Welcome 3,000P
        }
      });
    } else {
      // Update info if existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          socialProvider: "NAVER",
          socialId,
          name: name || user.name,
          phone: phone || user.phone,
          realNameVerified: true,
        }
      });
    }

    // 4. Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 5. Return HTML to sync localStorage and redirect cleanly
    const safeUserData = JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginId: user.loginId,
    });

    const destination = isNewUser ? "/mypage" : "/";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>네이버 로그인 완료</title>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; background: white; padding: 32px 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size: 36px; margin-bottom: 12px;">🟢</div>
            <h2 style="margin: 0 0 8px 0; color: #0f172a;">네이버 간편로그인 성공</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>${user.name}</strong>님 환영합니다! 페이지로 이동 중입니다...</p>
          </div>
          <script>
            try {
              localStorage.setItem("pervade_user", ${JSON.stringify(safeUserData)});
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
    console.error("Naver OAuth processing error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=naver_server_error`);
  }
}

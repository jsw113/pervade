import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = "https://www.pervade.co.kr";

  if (error || !code) {
    console.error("Google OAuth error or cancelled:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  try {
    // 1. Read Google OAuth credentials from DB Policy or environment variables
    const policies = await prisma.policy.findMany({
      where: { key: { in: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] } }
    });
    const clientId = process.env.GOOGLE_CLIENT_ID || policies.find(p => p.key === "GOOGLE_CLIENT_ID")?.value || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || policies.find(p => p.key === "GOOGLE_CLIENT_SECRET")?.value || "";
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "https://www.pervade.co.kr/api/auth/callback/google";

    // 2. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("Failed to get Google token:", await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=google_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token in Google response:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=google_no_token`);
    }

    // 3. Fetch User Profile from Google userinfo API
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileRes.ok) {
      console.error("Failed to get Google profile:", await profileRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=google_profile_failed`);
    }

    const googleUser = await profileRes.json();
    if (!googleUser || !googleUser.sub) {
      console.error("Invalid Google profile data:", googleUser);
      return NextResponse.redirect(`${baseUrl}/login?error=google_invalid_user`);
    }

    const socialId = String(googleUser.sub);
    const email = googleUser.email || `google_${socialId.slice(0, 10)}@pervade.co.kr`;
    const name = googleUser.name || "구글 고객";

    // 4. Find or Create User in Database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { socialProvider: "GOOGLE", socialId },
          { email },
        ],
      },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const mockLoginId = `google_${socialId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`;

      user = await prisma.user.create({
        data: {
          email,
          name,
          loginId: mockLoginId,
          passwordHash: `$2b$10$google_oauth_secure_hash_${socialId.slice(0, 10)}`,
          socialProvider: "GOOGLE",
          socialId,
          realNameVerified: true, // Google login verifies identity
          referralPoints: 3000,   // Welcome 3,000P
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          socialProvider: "GOOGLE",
          socialId,
          name: name || user.name,
          realNameVerified: true,
        },
      });
    }

    // 5. Set Session Cookie (session-only)
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // 6. Return HTML to sync sessionStorage and redirect cleanly
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
          <title>구글 로그인 완료</title>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; background: white; padding: 32px 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size: 36px; margin-bottom: 12px;">🔵</div>
            <h2 style="margin: 0 0 8px 0; color: #0f172a;">구글 간편로그인 성공</h2>
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
      },
    });
  } catch (err) {
    console.error("Google OAuth processing error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_server_error`);
  }
}

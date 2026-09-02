import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const redirectParam = url.searchParams.get("redirect") || "/";

    const policy = await prisma.policy.findUnique({
      where: { key: "GOOGLE_CLIENT_ID" }
    });
    const clientId = process.env.GOOGLE_CLIENT_ID || policy?.value || "";
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "https://www.pervade.co.kr/api/auth/callback/google");

    if (!clientId) {
      return NextResponse.redirect("https://www.pervade.co.kr/login?error=google_not_configured");
    }

    const stateParam = encodeURIComponent(JSON.stringify({ redirect: redirectParam }));
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account&state=${stateParam}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (err) {
    console.error("Failed to initiate Google OAuth:", err);
    return NextResponse.redirect("https://www.pervade.co.kr/login?error=google_init_error");
  }
}

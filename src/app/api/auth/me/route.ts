import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("userId")?.value;

    // Robust fallback: check header if cookie is in transit
    if (!userId) {
      userId = request.headers.get("x-user-id") || undefined;
    }

    if (!userId) {
      return NextResponse.json({ loggedIn: false }, { 
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" }
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ loggedIn: false }, { 
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" }
      });
    }

    // Refresh/ensure session cookie is actively set
    try {
      cookieStore.set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch (e) {}

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loginId: user.loginId,
        birthDate: user.birthDate,
        address: user.address,
        role: user.role,
        realNameVerified: user.realNameVerified,
        totalPurchases: user.totalPurchases,
        referralPoints: user.referralPoints,
        referralCode: user.referralCode,
        socialProvider: user.socialProvider,
      }
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

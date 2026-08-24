import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

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
        shippingAddresses: user.shippingAddresses,
        role: user.role,
        realNameVerified: user.realNameVerified,
        totalPurchases: user.totalPurchases,
        referralPoints: user.referralPoints,
        referralCode: user.referralCode,
        socialProvider: user.socialProvider,
      }
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

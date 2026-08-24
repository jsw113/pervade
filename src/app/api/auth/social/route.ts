import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { provider, email, name, socialId } = await request.json();

    if (!provider || !email || !name || !socialId) {
      return NextResponse.json({ error: "Provider, email, name, and socialId are required" }, { status: 400 });
    }

    // 1. Look up user by social provider + social ID, or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { socialProvider: provider, socialId },
          { email }
        ]
      }
    });

    if (!user) {
      // 2. Register new user dynamically under this social profile
      const providerSlug = provider.toLowerCase();
      const mockLoginId = `${providerSlug}_${Math.floor(100000 + Math.random() * 900000)}`;
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          loginId: mockLoginId,
          passwordHash: `$2b$10$socialmockhash_${provider}`,
          socialProvider: provider,
          socialId,
          realNameVerified: false
        }
      });
    } else if (!user.socialProvider) {
      // 3. Link existing general user to social credentials if they share same email
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          socialProvider: provider,
          socialId
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
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role
      } 
    });
  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

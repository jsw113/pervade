import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, birthDate } = await request.json();

    if (!name || !phone || !birthDate) {
      return NextResponse.json({ error: "Name, phone, and birthDate are required" }, { status: 400 });
    }

    // Update user profile with real verified details
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        birthDate,
        realNameVerified: true
      }
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, realNameVerified: user.realNameVerified } });
  } catch (error) {
    console.error("Real-name verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

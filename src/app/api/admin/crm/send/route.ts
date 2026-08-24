import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { userIds, type, content } = body;

    if (!userIds || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Record logs in DB
    const validUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true, phone: true }
    });

    for (const user of validUsers) {
      await prisma.messageLog.create({
        data: {
          userId: user.id,
          type: type || "KAKAO",
          content: `[관리자 CRM 발송] ${content}`,
          status: "SENT",
        }
      });
    }

    return NextResponse.json({ success: true, count: validUsers.length });
  } catch (error) {
    console.error("CRM Send Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

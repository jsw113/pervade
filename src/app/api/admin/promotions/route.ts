import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Admin fetch promotions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, badgeText, discountText, content, imageUrl, linkUrl, buttonText, startDate, endDate, isActive, order } = body;

    if (!title) {
      return NextResponse.json({ error: "프로모션 타이틀은 필수입니다." }, { status: 400 });
    }

    const promo = await prisma.promotion.create({
      data: {
        title,
        subtitle: subtitle || "",
        badgeText: badgeText || "SPECIAL EVENT",
        discountText: discountText || "",
        content: content || "",
        imageUrl: imageUrl || "",
        linkUrl: linkUrl || "/shop",
        buttonText: buttonText || "이벤트 혜택 받기",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? !!isActive : true,
        order: order || 0,
      }
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error("Admin create promotion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

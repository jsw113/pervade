import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const promo = await prisma.promotion.findUnique({ where: { id } });
    if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(promo);
  } catch (error) {
    console.error("Get single promo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, badgeText, discountText, content, imageUrl, linkUrl, buttonText, startDate, endDate, isActive, order } = body;

    const promo = await prisma.promotion.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badgeText !== undefined && { badgeText }),
        ...(discountText !== undefined && { discountText }),
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(buttonText !== undefined && { buttonText }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : new Date() }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive: !!isActive }),
        ...(order !== undefined && { order }),
      }
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error("Update promo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete promo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

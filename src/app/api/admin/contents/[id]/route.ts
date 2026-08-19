import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, title, body: contentBody, order, isVisible } = body;

    const content = await prisma.content.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(title !== undefined && { title }),
        ...(contentBody !== undefined && { body: contentBody }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isVisible !== undefined && { isVisible: !!isVisible }),
      }
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Admin update content error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete content error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { comment } = body;

    const review = await prisma.review.update({
      where: { id },
      data: { comment }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to update review comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

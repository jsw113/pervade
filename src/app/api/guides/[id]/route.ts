import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guide = await prisma.guidePost.update({
      where: { id },
      data: {
        viewCount: { increment: 1 }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            imageUrl: true,
            shippingFee: true,
            description: true,
          }
        }
      }
    });

    // Fetch related guides
    const related = await prisma.guidePost.findMany({
      where: {
        id: { not: id },
        published: true,
        category: guide.category
      },
      take: 2,
      select: {
        id: true,
        title: true,
        summary: true,
        thumbnailUrl: true,
        category: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ guide, related });
  } catch (error) {
    console.error("Fetch single guide error:", error);
    return NextResponse.json({ error: "가이드를 찾을 수 없습니다." }, { status: 404 });
  }
}

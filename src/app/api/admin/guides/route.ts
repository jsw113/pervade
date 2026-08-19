import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const guides = await prisma.guidePost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    });
    return NextResponse.json(guides);
  } catch (error) {
    console.error("Admin fetch guides error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, summary, content, thumbnailUrl, images, tips, productId, published } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "가이드 제목과 본문 내용은 필수입니다." }, { status: 400 });
    }

    const guide = await prisma.guidePost.create({
      data: {
        title,
        category: category || "주방",
        summary: summary || "",
        content,
        thumbnailUrl: thumbnailUrl || "",
        images: Array.isArray(images) ? JSON.stringify(images) : images,
        tips: tips || "",
        productId: productId || null,
        published: published !== undefined ? !!published : true,
      }
    });

    return NextResponse.json({ success: true, guide });
  } catch (error) {
    console.error("Admin create guide error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

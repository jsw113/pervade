import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const contents = await prisma.content.findMany({
      where: {
        ...(category ? { category } : {})
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }]
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Admin fetch contents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, body: contentBody, order, isVisible } = body;

    if (!category || !title || !contentBody) {
      return NextResponse.json({ error: "카테고리, 제목, 본문 내용은 필수입니다." }, { status: 400 });
    }

    const content = await prisma.content.create({
      data: {
        category,
        title,
        body: contentBody,
        order: order !== undefined ? parseInt(order) : 0,
        isVisible: isVisible !== undefined ? !!isVisible : true,
      }
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Admin create content error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

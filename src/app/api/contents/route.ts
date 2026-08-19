import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const contents = await prisma.content.findMany({
      where: {
        isVisible: true,
        ...(category ? { category } : {})
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }]
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Failed to fetch contents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: any = {};
    if (type && type !== "ALL") {
      where.type = type;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { author: true }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, content, published } = body;

    let adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: "admin@pervade.com",
          name: "Admin",
          passwordHash: "dummy_hash",
          role: "ADMIN"
        }
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        type: type || "JOURNAL",
        content,
        published: published !== undefined ? !!published : true,
        authorId: adminUser.id
      }
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/admin/posts");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

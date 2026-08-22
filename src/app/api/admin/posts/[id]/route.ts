import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Admin get single post error:", error);
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
    const { title, type, content, published } = body;

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published: !!published }),
      }
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/admin/posts");
      revalidatePath(`/admin/posts/${id}/edit`);
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Admin update post error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.post.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/admin/posts");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete post error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

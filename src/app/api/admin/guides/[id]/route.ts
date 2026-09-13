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
    const guide = await prisma.guidePost.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error("Admin get single guide error:", error);
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
    const { title, category, summary, content, thumbnailUrl, images, tips, productId, published, order, isPinned, pinUntil } = body;

    const guide = await prisma.guidePost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(summary !== undefined && { summary }),
        ...(content !== undefined && { content }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(images !== undefined && { images: Array.isArray(images) ? JSON.stringify(images) : images }),
        ...(tips !== undefined && { tips }),
        ...(productId !== undefined && { productId: productId || null }),
        ...(published !== undefined && { published: !!published }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isPinned !== undefined && { isPinned: !!isPinned }),
        ...(pinUntil !== undefined && { pinUntil: pinUntil ? new Date(pinUntil) : null }),
      }
    });

    try {
      revalidatePath("/");
      revalidatePath("/guides");
      revalidatePath(`/guides/${id}`);
      revalidatePath("/admin/guides");
      revalidatePath(`/admin/guides/${id}/edit`);
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, guide });
  } catch (error) {
    console.error("Admin update guide error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.guidePost.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/guides");
      revalidatePath("/admin/guides");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete guide error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

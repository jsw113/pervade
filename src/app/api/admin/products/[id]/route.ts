import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      subCategory, 
      price, 
      originalPrice, 
      shippingFee, 
      imageUrl, 
      images, 
      detailContent, 
      detailImages, 
      options,
      legalInfo,
      stock, 
      safetyStock, 
      isVisible,
      order,
      badge,
      tag
    } = body;

    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "해당 제품을 찾을 수 없습니다." }, { status: 404 });
    }

    const newStock = stock !== undefined && !isNaN(parseInt(String(stock), 10))
      ? parseInt(String(stock), 10)
      : current.stock;
    const stockDiff = newStock - current.stock;

    const parsedPrice = price !== undefined && !isNaN(parseInt(String(price), 10))
      ? parseInt(String(price), 10)
      : undefined;

    const parsedOriginalPrice = originalPrice !== undefined
      ? (originalPrice !== null && String(originalPrice).trim() !== "" ? parseInt(String(originalPrice), 10) : null)
      : undefined;

    const parsedShippingFee = shippingFee !== undefined && !isNaN(parseInt(String(shippingFee), 10))
      ? parseInt(String(shippingFee), 10)
      : undefined;

    const parsedSafetyStock = safetyStock !== undefined && !isNaN(parseInt(String(safetyStock), 10))
      ? parseInt(String(safetyStock), 10)
      : undefined;

    const parsedOrder = order !== undefined && !isNaN(parseInt(String(order), 10))
      ? parseInt(String(order), 10)
      : undefined;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(category !== undefined && { category }),
        ...(subCategory !== undefined && { subCategory }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(parsedOriginalPrice !== undefined && { originalPrice: parsedOriginalPrice }),
        ...(parsedShippingFee !== undefined && { shippingFee: parsedShippingFee }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(images !== undefined && { images: Array.isArray(images) ? JSON.stringify(images) : images }),
        ...(detailContent !== undefined && { detailContent }),
        ...(detailImages !== undefined && { detailImages: Array.isArray(detailImages) ? JSON.stringify(detailImages) : detailImages }),
        ...(options !== undefined && { options: Array.isArray(options) ? JSON.stringify(options) : options }),
        ...(legalInfo !== undefined && { legalInfo: typeof legalInfo === "string" ? legalInfo : JSON.stringify(legalInfo) }),
        stock: newStock,
        ...(parsedSafetyStock !== undefined && { safetyStock: parsedSafetyStock }),
        ...(isVisible !== undefined && { isVisible: !!isVisible }),
        ...(parsedOrder !== undefined && { order: parsedOrder }),
        ...(badge !== undefined && { badge: badge ? String(badge).trim() : null }),
        ...(tag !== undefined && { tag: tag ? String(tag).trim() : null }),
      },
    });

    // Record inventory log if stock changed directly in edit form
    if (stockDiff !== 0) {
      try {
        await prisma.inventoryLog.create({
          data: {
            productId: id,
            type: stockDiff > 0 ? "IN" : "OUT",
            quantity: Math.abs(stockDiff),
            balance: newStock,
            reason: "제품 정보 수정 페이지에서 재고 직접 수정"
          }
        });
      } catch (logErr) {
        console.warn("InventoryLog update warning:", logErr);
      }
    }

    // Revalidate paths for instant reflect
    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath(`/shop/${id}`);
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}/edit`);
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: error?.message || "제품 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Clean up relations first
    await prisma.inventoryLog.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlist.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.question.deleteMany({ where: { productId: id } });
    await prisma.order.updateMany({ where: { productId: id }, data: { productId: null } });
    await prisma.product.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/products");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: error?.message || "제품 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

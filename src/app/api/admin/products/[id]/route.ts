import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, originalPrice, shippingFee, imageUrl, images, detailContent, detailImages, stock, safetyStock, isVisible } = body;

    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newStock = stock !== undefined ? parseInt(stock) : current.stock;
    const stockDiff = newStock - current.stock;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseInt(originalPrice) : null }),
        ...(shippingFee !== undefined && { shippingFee: parseInt(shippingFee) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(images !== undefined && { images: Array.isArray(images) ? JSON.stringify(images) : images }),
        ...(detailContent !== undefined && { detailContent }),
        ...(detailImages !== undefined && { detailImages: Array.isArray(detailImages) ? JSON.stringify(detailImages) : detailImages }),
        ...(stock !== undefined && { stock: newStock }),
        ...(safetyStock !== undefined && { safetyStock: parseInt(safetyStock) }),
        ...(isVisible !== undefined && { isVisible: !!isVisible }),
      },
    });

    // Record inventory log if stock changed directly in edit form
    if (stockDiff !== 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          type: stockDiff > 0 ? "IN" : "OUT",
          quantity: Math.abs(stockDiff),
          balance: newStock,
          reason: "제품 정보 수정 페이지에서 재고 직접 수정"
        }
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Clear relations
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlist.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.question.deleteMany({ where: { productId: id } });
    await prisma.inventoryLog.deleteMany({ where: { productId: id } });

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

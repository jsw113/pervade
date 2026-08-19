import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        safetyStock: true,
        imageUrl: true,
        isVisible: true,
        _count: { select: { orders: true } }
      }
    });

    const logs = await prisma.inventoryLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { name: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json({ products, logs });
  } catch (error) {
    console.error("Fetch inventory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, type, quantity, reason } = body;

    if (!productId || !type || !quantity || !reason) {
      return NextResponse.json({ error: "상품, 유형, 수량, 사유는 필수 입력 항목입니다." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "해당 상품을 찾을 수 없습니다." }, { status: 404 });
    }

    const qty = parseInt(quantity);
    let newBalance = product.stock;

    if (type === "IN") {
      newBalance = product.stock + qty;
    } else if (type === "OUT") {
      newBalance = Math.max(0, product.stock - qty);
    } else if (type === "ADJUST") {
      newBalance = qty;
    }

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newBalance }
    });

    // Record inventory log
    const log = await prisma.inventoryLog.create({
      data: {
        productId,
        type,
        quantity: qty,
        balance: newBalance,
        reason
      }
    });

    return NextResponse.json({ success: true, product: updatedProduct, log });
  } catch (error) {
    console.error("Adjust inventory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

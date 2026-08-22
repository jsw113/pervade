import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        subCategory: true,
        price: true,
        originalPrice: true,
        stock: true,
        safetyStock: true,
        imageUrl: true,
        isVisible: true,
        _count: { select: { orders: true } }
      }
    });

    const logs = await prisma.inventoryLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { name: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json({ products, logs });
  } catch (error: any) {
    console.error("Fetch inventory error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      type,
      quantity,
      reason,
      partnerId,
      partnerName,
      channelType,
      unitPrice,
      totalAmount,
      taxInvoiceStatus,
      taxInvoiceNumber,
      memo,
    } = body;

    if (!productId || !type || quantity === undefined || !reason) {
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

    // Update Product Stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: newBalance },
    });

    const finalUnitPrice = unitPrice !== undefined ? parseInt(unitPrice) : product.price;
    const finalTotalAmount = totalAmount !== undefined ? parseInt(totalAmount) : (finalUnitPrice * qty);

    // Create Detailed Inventory Log
    const log = await prisma.inventoryLog.create({
      data: {
        productId,
        type,
        quantity: qty,
        balance: newBalance,
        reason,
        partnerId: partnerId || null,
        partnerName: partnerName || null,
        channelType: channelType || "MANUAL",
        taxInvoiceStatus: taxInvoiceStatus || "NOT_APPLICABLE",
        taxInvoiceNumber: taxInvoiceNumber?.trim() || null,
        taxInvoiceDate: taxInvoiceStatus === "ISSUED" ? new Date() : null,
        unitPrice: finalUnitPrice,
        totalAmount: finalTotalAmount,
        memo: memo?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, product: { ...product, stock: newBalance }, log });
  } catch (error: any) {
    console.error("Inventory adjustment error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

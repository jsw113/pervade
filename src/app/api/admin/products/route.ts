import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        inventoryLogs: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, originalPrice, shippingFee, imageUrl, images, detailContent, detailImages, stock, safetyStock, isVisible } = body;

    if (!name || !description || price === undefined) {
      return NextResponse.json({ error: "제품명, 설명, 판매가는 필수입니다." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        shippingFee: shippingFee !== undefined ? parseInt(shippingFee) : 3000,
        imageUrl: imageUrl || (Array.isArray(images) && images.length > 0 ? images[0] : ""),
        images: Array.isArray(images) ? JSON.stringify(images) : (typeof images === "string" ? images : null),
        detailContent: detailContent || null,
        detailImages: Array.isArray(detailImages) ? JSON.stringify(detailImages) : (typeof detailImages === "string" ? detailImages : null),
        stock: stock !== undefined ? parseInt(stock) : 100,
        safetyStock: safetyStock !== undefined ? parseInt(safetyStock) : 10,
        isVisible: isVisible !== undefined ? !!isVisible : true,
      },
    });

    // Record initial inventory log
    if (product.stock > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: product.stock,
          balance: product.stock,
          reason: "초기 제품 등록 입고"
        }
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

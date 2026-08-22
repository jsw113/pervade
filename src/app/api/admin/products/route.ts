import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (subCategory && subCategory !== "ALL") {
      where.subCategory = subCategory;
    }

    const products = await prisma.product.findMany({
      where,
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
      stock, 
      safetyStock, 
      isVisible 
    } = body;

    if (!name || !description || price === undefined) {
      return NextResponse.json({ error: "제품명, 설명, 판매가는 필수입니다." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category: category || "세정제류",
        subCategory: subCategory || "다목적/올인원",
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        shippingFee: shippingFee !== undefined ? parseInt(shippingFee) : 3000,
        imageUrl: imageUrl || (Array.isArray(images) && images.length > 0 ? images[0] : ""),
        images: Array.isArray(images) ? JSON.stringify(images) : (typeof images === "string" ? images : null),
        detailContent: detailContent || null,
        detailImages: Array.isArray(detailImages) ? JSON.stringify(detailImages) : (typeof detailImages === "string" ? detailImages : null),
        options: Array.isArray(options) ? JSON.stringify(options) : (typeof options === "string" ? options : null),
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

    // Revalidate paths for instant reflect
    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/products");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

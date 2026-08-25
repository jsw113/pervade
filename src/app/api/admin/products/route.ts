import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/adminAuth";

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
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

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

    const parsedPrice = parseInt(price);
    const parsedStock = parseInt(stock || "0");
    const parsedSafetyStock = parseInt(safetyStock || "0");
    const parsedShippingFee = parseInt(shippingFee || "0");

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category: category || "BATHROOM",
        subCategory: subCategory || "",
        price: parsedPrice,
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        shippingFee: parsedShippingFee,
        imageUrl: imageUrl || "",
        images: images ? (typeof images === "string" ? images : JSON.stringify(images)) : null,
        detailContent: detailContent || "",
        detailImages: detailImages ? (typeof detailImages === "string" ? detailImages : JSON.stringify(detailImages)) : null,
        options: options ? (typeof options === "string" ? options : JSON.stringify(options)) : null,
        stock: parsedStock,
        safetyStock: parsedSafetyStock,
        isVisible: isVisible !== undefined ? !!isVisible : true,
      }
    });

    if (parsedStock > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: parsedStock,
          balance: parsedStock,
          reason: "신규 제품 최초 등록 입고"
        }
      });
    }

    revalidatePath("/shop");
    revalidatePath("/admin/products");

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

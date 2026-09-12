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
      return NextResponse.json({ error: "관리자 로그인 인증이 필요합니다. 다시 로그인해주세요." }, { status: 403 });
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
      legalInfo,
      stock, 
      safetyStock, 
      isVisible 
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "제품명을 입력해주세요." }, { status: 400 });
    }

    const parsedPrice = parseInt(String(price ?? ""), 10);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "판매가를 올바른 숫자로 입력해주세요." }, { status: 400 });
    }

    const parsedOriginalPrice = originalPrice !== null && originalPrice !== undefined && String(originalPrice).trim() !== ""
      ? parseInt(String(originalPrice), 10)
      : null;

    const parsedStock = !isNaN(parseInt(String(stock), 10)) ? parseInt(String(stock), 10) : 100;
    const parsedSafetyStock = !isNaN(parseInt(String(safetyStock), 10)) ? parseInt(String(safetyStock), 10) : 10;
    const parsedShippingFee = !isNaN(parseInt(String(shippingFee), 10)) ? parseInt(String(shippingFee), 10) : 3000;

    // Sanitize options if array
    let sanitizedOptions = options;
    if (Array.isArray(options)) {
      sanitizedOptions = options.map((opt: any) => ({
        ...opt,
        extraPrice: !isNaN(parseInt(String(opt.extraPrice), 10)) ? parseInt(String(opt.extraPrice), 10) : 0,
        stock: !isNaN(parseInt(String(opt.stock), 10)) ? parseInt(String(opt.stock), 10) : undefined,
      }));
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : "프리미엄 공간 케어 솔루션",
        category: category || "세정제류",
        subCategory: subCategory || "다목적/올인원",
        price: parsedPrice,
        originalPrice: isNaN(parsedOriginalPrice as number) ? null : parsedOriginalPrice,
        shippingFee: parsedShippingFee,
        imageUrl: imageUrl || (Array.isArray(images) && images.length > 0 ? images[0] : ""),
        images: images ? (typeof images === "string" ? images : JSON.stringify(images)) : null,
        detailContent: detailContent || "",
        detailImages: detailImages ? (typeof detailImages === "string" ? detailImages : JSON.stringify(detailImages)) : null,
        options: sanitizedOptions ? (typeof sanitizedOptions === "string" ? sanitizedOptions : JSON.stringify(sanitizedOptions)) : null,
        legalInfo: legalInfo ? (typeof legalInfo === "string" ? legalInfo : JSON.stringify(legalInfo)) : null,
        stock: parsedStock,
        safetyStock: parsedSafetyStock,
        isVisible: isVisible !== undefined ? !!isVisible : true,
      }
    });

    if (parsedStock > 0) {
      try {
        await prisma.inventoryLog.create({
          data: {
            productId: product.id,
            type: "IN",
            quantity: parsedStock,
            balance: parsedStock,
            reason: "신규 제품 최초 등록 입고"
          }
        });
      } catch (logErr) {
        console.warn("InventoryLog warning:", logErr);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/products");
    } catch (revErr) {
      console.warn("Revalidate warning:", revErr);
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ 
      error: error?.message || "제품 등록 처리 중 데이터베이스 오류가 발생했습니다." 
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PRODUCT_CATEGORIES, getDynamicProductCategories } from "@/lib/constants/categories";

export async function GET() {
  try {
    const categories = await getDynamicProductCategories();
    const products = await prisma.product.findMany({
      where: { isVisible: true },
      select: { category: true, subCategory: true }
    });

    const productCounts: Record<string, number> = {};
    const subCategoryCounts: Record<string, Record<string, number>> = {};

    products.forEach((p) => {
      const cat = p.category || "기타";
      productCounts[cat] = (productCounts[cat] || 0) + 1;
      if (!subCategoryCounts[cat]) subCategoryCounts[cat] = {};
      if (p.subCategory) {
        subCategoryCounts[cat][p.subCategory] = (subCategoryCounts[cat][p.subCategory] || 0) + 1;
      }
    });

    return NextResponse.json({
      categories,
      productCounts,
      subCategoryCounts,
    });
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categories } = body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: "최소 1개 이상의 대분류가 필요합니다." }, { status: 400 });
    }

    await prisma.policy.upsert({
      where: { key: "PRODUCT_CATEGORIES_DATA" },
      update: {
        value: JSON.stringify(categories),
        description: "쇼핑몰 제품 2단계 카테고리 계층 마스터 설정",
      },
      create: {
        key: "PRODUCT_CATEGORIES_DATA",
        value: JSON.stringify(categories),
        description: "쇼핑몰 제품 2단계 카테고리 계층 마스터 설정",
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Failed to save categories:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.policy.upsert({
      where: { key: "PRODUCT_CATEGORIES_DATA" },
      update: {
        value: JSON.stringify(DEFAULT_PRODUCT_CATEGORIES),
      },
      create: {
        key: "PRODUCT_CATEGORIES_DATA",
        value: JSON.stringify(DEFAULT_PRODUCT_CATEGORIES),
        description: "쇼핑몰 제품 2단계 카테고리 계층 마스터 설정",
      },
    });
    return NextResponse.json({ success: true, categories: DEFAULT_PRODUCT_CATEGORIES });
  } catch (error: any) {
    console.error("Failed to reset categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

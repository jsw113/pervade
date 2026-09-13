import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDynamicProductCategories } from "@/lib/constants/categories";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { sortPinnableContents } from "@/lib/contentSort";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subCategory?: string }>;
}) {
  let category: string | undefined;
  let subCategory: string | undefined;

  try {
    const resolvedParams = (await searchParams) || {};
    category = resolvedParams.category;
    subCategory = resolvedParams.subCategory;
  } catch (e) {
    category = undefined;
    subCategory = undefined;
  }

  let categoriesList = await getDynamicProductCategories().catch(() => []);
  let products: any[] = [];
  let totalCount = 0;

  try {
    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (subCategory && subCategory !== "ALL") {
      where.subCategory = subCategory;
    }

    const rawProducts = await prisma.product.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    products = sortPinnableContents(rawProducts);
    totalCount = await prisma.product.count();
  } catch (err) {
    console.error("AdminProductsPage DB error:", err);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">제품 및 계열 분류 관리</h2>
          <p className="text-xs text-zinc-500 mt-1">
            대분류(제품 계열)와 중/소분류(용처별) 2단계 계층 구조로 제품을 체계적으로 분류하고, 1순위 대표 상품 고정(기간 설정 가능) 및 노출 순서를 관리합니다.
          </p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-zinc-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          신규 제품 등록
        </Link>
      </div>

      {/* Interactive Products Table with Pin & Reorder */}
      <AdminProductsTable
        initialProducts={products as any}
        categoriesList={categoriesList}
        currentCategory={category}
        totalCount={totalCount}
      />
    </div>
  );
}


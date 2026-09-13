import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, Tag } from "lucide-react";
import { getDynamicProductCategories, getSubCategoriesByMainCategory } from "@/lib/constants/categories";
import { EditorialProductCard } from "@/components/editorial/EditorialProductCard";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; subCategory?: string }>;
}) {
  const { search, category, subCategory } = await searchParams;

  let categoriesList: any[] = [];
  try {
    categoriesList = await getDynamicProductCategories();
  } catch (e) {
    categoriesList = [];
  }

  // 1. Calculate live product counts for each category & subcategory
  let categoryCounts: Record<string, number> = {};
  let subCategoryCounts: Record<string, Record<string, number>> = {};
  let allActiveProducts: any[] = [];

  try {
    allActiveProducts = await prisma.product.findMany({
      where: { isVisible: true },
      select: { category: true, subCategory: true }
    });

    allActiveProducts.forEach((p) => {
      const catName = p.category || "기타";
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

      if (!subCategoryCounts[catName]) {
        subCategoryCounts[catName] = {};
      }
      if (p.subCategory) {
        subCategoryCounts[catName][p.subCategory] = (subCategoryCounts[catName][p.subCategory] || 0) + 1;
      }
    });
  } catch (e) {
    categoryCounts = {};
    subCategoryCounts = {};
  }

  // Filter categories to ONLY show categories that currently have at least 1 active product
  const visibleCategories = categoriesList.filter((cat) => (categoryCounts[cat.name] || 0) > 0);

  // If a category was requested via URL that has 0 products, gracefully fallback to ALL
  const effectiveCategory = (category && category !== "ALL" && (categoryCounts[category] || 0) > 0)
    ? category
    : (category && category !== "ALL" ? "ALL" : category);

  const where: any = {
    isVisible: true,
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    } : {}),
    ...(effectiveCategory && effectiveCategory !== "ALL" ? { category: effectiveCategory } : {}),
    ...(subCategory && subCategory !== "ALL" ? { subCategory } : {}),
  };

  let dbProducts: any[] = [];
  let totalAllCount = 0;

  try {
    const rawProducts = await prisma.product.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { order: "asc" },
        { createdAt: "desc" }
      ]
    });
    const { sortPinnableContents } = await import("@/lib/contentSort");
    dbProducts = sortPinnableContents(rawProducts);
    totalAllCount = allActiveProducts.length || await prisma.product.count({ where: { isVisible: true } });
  } catch (e) {
    console.error("Shop DB fallback triggered:", e);
    dbProducts = [];
    totalAllCount = 0;
  }

  // Filter subcategories to ONLY show subcategories with at least 1 product
  const rawSubs = (effectiveCategory && effectiveCategory !== "ALL")
    ? getSubCategoriesByMainCategory(effectiveCategory, categoriesList)
    : [];
  const activeSubs = rawSubs.filter((sub) => (subCategoryCounts[effectiveCategory || ""]?.[sub] || 0) > 0);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 min-h-[75vh]">
      {/* Header: Clean unified 'PRODUCTS' title & Category Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 sm:mb-12 border-b border-zinc-200/70 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif text-zinc-900 font-light tracking-tight uppercase">
            {search ? `SEARCH: "${search}"` : effectiveCategory && effectiveCategory !== "ALL" ? `PRODUCTS / ${effectiveCategory}` : "PRODUCTS"}
          </h1>
        </div>

        {/* 1st Depth: Minimal Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/shop${search ? `?search=${encodeURIComponent(search)}` : ""}`}
            className={`px-3.5 py-1.5 rounded-none text-xs tracking-wider font-medium transition-all ${
              !effectiveCategory || effectiveCategory === "ALL"
                ? "bg-zinc-950 text-white font-bold"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            ALL ({totalAllCount})
          </Link>
          {visibleCategories.map((cat) => {
            const isSelected = effectiveCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.name)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`px-3.5 py-1.5 rounded-none text-xs tracking-wider font-medium transition-all ${
                  isSelected
                    ? "bg-zinc-950 text-white font-bold"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {cat.name.toUpperCase()} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2nd Depth: Subcategories (용처별 칩 - 상품이 존재하는 경우만 표시) */}
      {activeSubs.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center gap-2 animate-in fade-in">
          <span className="text-xs font-mono text-zinc-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-stone-600" /> CATEGORY:
          </span>
          <Link
            href={`/shop?category=${encodeURIComponent(effectiveCategory!)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className={`px-3 py-1 text-xs transition-all ${
              !subCategory || subCategory === "ALL"
                ? "bg-stone-900 text-white font-bold"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            ALL ({categoryCounts[effectiveCategory!] || 0})
          </Link>
          {activeSubs.map((sub) => {
            const isSubSelected = subCategory === sub;
            const subCount = subCategoryCounts[effectiveCategory!]?.[sub] || 0;
            return (
              <Link
                key={sub}
                href={`/shop?category=${encodeURIComponent(effectiveCategory!)}&subCategory=${encodeURIComponent(sub)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`px-3 py-1 text-xs transition-all ${
                  isSubSelected
                    ? "bg-stone-900 text-white font-bold"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {sub} ({subCount})
              </Link>
            );
          })}
        </div>
      )}

      {/* Unboxed & Large Product Cards Grid (3 Columns on Desktop) */}
      {dbProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4 max-w-md mx-auto bg-stone-50 rounded-none border border-stone-200 p-8">
          <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mx-auto text-zinc-400 shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif text-zinc-900">해당 분류의 상품이 없습니다</h2>
          <p className="text-xs text-zinc-500 leading-relaxed font-light">
            다른 카테고리를 선택하시거나 전체 상품 목록을 확인해 보세요.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-zinc-950 text-white rounded-none text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            전체 상품 목록 보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {dbProducts.map((product) => {
            let pImg = product.imageUrl;
            let sImg = "";
            if (product.images) {
              try {
                const arr = JSON.parse(product.images);
                if (Array.isArray(arr) && arr.length > 0) {
                  if (!pImg) pImg = arr[0];
                  if (arr.length > 1) sImg = arr[1];
                }
              } catch (e) {}
            }

            return (
              <EditorialProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                subTitle={product.description}
                volume="500ml / 16.9 fl.oz"
                price={product.price}
                originalPrice={product.originalPrice || undefined}
                primaryImage={pImg}
                secondaryImage={sImg || pImg}
                badge={product.badge || undefined}
                tag={product.tag || undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

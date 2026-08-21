import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, ShoppingBag, Sparkles, Layers, Tag } from "lucide-react";
import { PRODUCT_CATEGORIES, getSubCategoriesByMainCategory } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; subCategory?: string }>;
}) {
  const { search, category, subCategory } = await searchParams;

  const where: any = {
    isVisible: true,
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    } : {}),
    ...(category && category !== "ALL" ? { category } : {}),
    ...(subCategory && subCategory !== "ALL" ? { subCategory } : {}),
  };

  const dbProducts = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  const totalAllCount = await prisma.product.count({ where: { isVisible: true } });
  const activeSubs = category && category !== "ALL" ? getSubCategoriesByMainCategory(category) : [];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl min-h-[75vh]">
      {/* Centered Header */}
      <div className="text-center mb-10 space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          Pervade Collections
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950">
          {search ? `'${search}' 검색 결과` : category && category !== "ALL" ? category : "전체 컬렉션"}
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
          {search 
            ? `총 ${dbProducts.length}개의 상품이 검색되었습니다.` 
            : "퍼베이드의 프리미엄 친환경 세정 및 라이프스타일 전 제품 라인업을 만나보세요."}
        </p>
      </div>

      {/* 2-Tier Category Navigation */}
      <div className="mb-12 space-y-3 max-w-4xl mx-auto">
        {/* 1st Depth: 대분류 (제품 계열) */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          <Link
            href={`/shop${search ? `?search=${encodeURIComponent(search)}` : ""}`}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              !category || category === "ALL"
                ? "bg-zinc-950 text-white shadow-md scale-105"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            전체 ({totalAllCount})
          </Link>
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.name)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-zinc-950 text-white shadow-md scale-105"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* 2nd Depth: 중/소분류 (용처별 칩) */}
        {activeSubs.length > 0 && (
          <div className="pt-2 flex flex-wrap justify-center items-center gap-1.5 border-t border-zinc-100 animate-in fade-in">
            <span className="text-[11px] font-bold text-zinc-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-600" /> 용처별:
            </span>
            <Link
              href={`/shop?category=${encodeURIComponent(category!)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                !subCategory || subCategory === "ALL"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              전체
            </Link>
            {activeSubs.map((sub) => {
              const isSubSelected = subCategory === sub;
              return (
                <Link
                  key={sub}
                  href={`/shop?category=${encodeURIComponent(category!)}&subCategory=${encodeURIComponent(sub)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isSubSelected
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-zinc-50 border border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {sub}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Cards */}
      {dbProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-zinc-50 rounded-3xl border p-8">
          <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800">해당 분류의 상품이 없습니다</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            다른 카테고리를 선택하시거나 전체 상품 목록을 확인해 보세요.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            전체 상품 목록 보기
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
          {dbProducts.map((product) => (
            <Link 
              href={`/shop/${product.id}`} 
              key={product.id} 
              className="group bg-white rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col w-full sm:w-[280px] md:w-[290px]"
            >
              {/* Image Area */}
              <div className="h-60 bg-zinc-50 relative overflow-hidden shrink-0 flex items-center justify-center p-4 border-b">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-xs text-zinc-400">[제품 이미지 준비중]</span>
                )}
                
                {product.stock <= 0 ? (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs">
                    일시 품절
                  </div>
                ) : product.originalPrice && product.originalPrice > product.price ? (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                ) : null}
              </div>

              {/* Info Area */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  {/* 2-Depth Category Badge */}
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700">
                    <span className="px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                      {product.category || "세정제류"}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-zinc-500 font-medium">
                      {product.subCategory || "다목적/올인원"}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t flex justify-between items-baseline">
                  <div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-zinc-400 line-through mr-1.5">
                        ₩{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="font-black text-sm text-zinc-950">
                      ₩{product.price.toLocaleString()}원
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {product.shippingFee === 0 ? "무료배송" : `배송비 ${product.shippingFee?.toLocaleString()}원`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Plus, Tag, Layers, Package, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDynamicProductCategories } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subCategory?: string }>;
}) {
  const { category, subCategory } = await searchParams;

  const categoriesList = await getDynamicProductCategories();

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
  });

  const totalCount = await prisma.product.count();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">제품 및 계열 분류 관리</h2>
          <p className="text-xs text-zinc-500 mt-1">
            대분류(제품 계열)와 중/소분류(용처별) 2단계 계층 구조로 제품을 체계적으로 분류하고 관리합니다.
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

      {/* Category Filter Tabs (1st Depth) */}
      <div className="bg-white p-4 rounded-2xl border shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>대분류(계열) 필터:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !category || category === "ALL"
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            전체 ({totalCount})
          </Link>
          {categoriesList.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <Link
                key={cat.id}
                href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-5 py-3.5">이미지</th>
                <th className="px-5 py-3.5">2단계 계열 분류</th>
                <th className="px-5 py-3.5">제품명 & 요약</th>
                <th className="px-5 py-3.5">판매가</th>
                <th className="px-5 py-3.5">구매 옵션 구성</th>
                <th className="px-5 py-3.5">재고 현황</th>
                <th className="px-5 py-3.5">쇼핑몰 노출</th>
                <th className="px-5 py-3.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    선택한 분류에 등록된 제품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  let parsedOpts: any[] = [];
                  try {
                    if (product.options) parsedOpts = JSON.parse(product.options);
                  } catch (e) {}

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">No Img</div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-black">
                            {product.category || "세정제류"}
                          </span>
                          <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                            <span>↳</span>
                            <span>{product.subCategory || "다목적/올인원"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-bold text-zinc-900 line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{product.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-blue-600">{product.price.toLocaleString()}원</div>
                        {product.originalPrice && (
                          <div className="text-[10px] text-zinc-400 line-through">
                            {product.originalPrice.toLocaleString()}원
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        {parsedOpts.length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
                              총 {parsedOpts.length}개 옵션
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parsedOpts.slice(0, 2).map((opt, i) => (
                                <span key={i} className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                                  {opt.name} ({opt.extraPrice > 0 ? `+${opt.extraPrice.toLocaleString()}원` : "0원"})
                                </span>
                              ))}
                              {parsedOpts.length > 2 && (
                                <span className="text-[10px] text-zinc-400 font-bold">+{parsedOpts.length - 2}개 더보기</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400">기본 단품</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-bold ${product.stock <= product.safetyStock ? "text-red-600" : "text-zinc-900"}`}>
                          {product.stock}개
                        </span>
                        {product.stock <= product.safetyStock && (
                          <span className="block text-[9px] text-red-500 font-bold mt-0.5">⚠️ 안전재고 부족</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          product.isVisible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {product.isVisible ? '● 노출 중' : '숨김'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link 
                          href={`/admin/products/${product.id}/edit`} 
                          className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors inline-block shadow-2xs"
                        >
                          옵션/정보 수정
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

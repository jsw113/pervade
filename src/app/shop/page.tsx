import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, ShoppingBag, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const dbProducts = await prisma.product.findMany({
    where: {
      isVisible: true,
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      } : {})
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl min-h-[75vh]">
      {/* Centered Header */}
      <div className="text-center mb-14 space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          Pervade Collections
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-950">
          {search ? `'${search}' 검색 결과` : "전체 상품"}
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          {search 
            ? `총 ${dbProducts.length}개의 상품이 검색되었습니다.` 
            : "퍼베이드의 프리미엄 친환경 세정 및 라이프스타일 전 제품 라인업을 만나보세요."}
        </p>

        {search && (
          <div className="pt-2">
            <Link 
              href="/shop" 
              className="inline-block px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full text-xs font-bold transition-colors"
            >
              전체 상품 목록으로 돌아가기
            </Link>
          </div>
        )}
      </div>

      {/* Centered Product Cards */}
      {dbProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4 max-w-md mx-auto bg-zinc-50 rounded-3xl border p-8">
          <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800">일치하는 상품이 없습니다</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            검색어의 철자를 확인하시거나 다른 키워드로 검색해 보세요.
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
          {dbProducts.map(product => (
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

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t flex justify-between items-baseline">
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
                    {product.shippingFee === 0 ? "무료배송" : `배송비 ${product.shippingFee.toLocaleString()}원`}
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

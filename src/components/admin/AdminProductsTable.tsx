"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Pin, ArrowUp, ArrowDown, Layers, Eye, EyeOff } from "lucide-react";
import { PinModal } from "@/components/admin/PinModal";
import { getPinStatusText, sortPinnableContents } from "@/lib/contentSort";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string | null;
  price: number;
  originalPrice?: number | null;
  shippingFee: number;
  imageUrl: string;
  options?: string | null;
  stock: number;
  safetyStock: number;
  isVisible: boolean;
  order: number;
  isPinned: boolean;
  pinUntil?: string | Date | null;
  badge?: string | null;
  tag?: string | null;
  createdAt: string | Date;
}

interface AdminProductsTableProps {
  initialProducts: ProductItem[];
  categoriesList: any[];
  currentCategory?: string;
  totalCount: number;
}

export function AdminProductsTable({
  initialProducts,
  categoriesList,
  currentCategory,
  totalCount,
}: AdminProductsTableProps) {
  const [products, setProducts] = useState<ProductItem[]>(sortPinnableContents(initialProducts));
  const [selectedProductForPin, setSelectedProductForPin] = useState<ProductItem | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleOpenPinModal = (product: ProductItem) => {
    setSelectedProductForPin(product);
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (isPinned: boolean, pinUntil: string | null) => {
    if (!selectedProductForPin) return;

    try {
      const res = await fetch(`/api/admin/products/${selectedProductForPin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned, pinUntil }),
      });

      if (!res.ok) throw new Error("상품 고정 상태 저장 실패");
      
      const updated = products.map((p) =>
        p.id === selectedProductForPin.id ? { ...p, isPinned, pinUntil } : p
      );
      setProducts(sortPinnableContents(updated));
    } catch (err: any) {
      console.error(err);
      alert("고정 설정 중 오류가 발생했습니다: " + (err?.message || ""));
    }
  };

  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const current = newProducts[index];
    const target = newProducts[targetIndex];

    const currentOrder = current.order ?? 0;
    const targetOrder = target.order ?? 0;
    
    let newCurrentOrder = targetOrder;
    let newTargetOrder = currentOrder;
    if (newCurrentOrder === newTargetOrder) {
      if (direction === "UP") {
        newCurrentOrder = Math.max(0, targetOrder - 1);
        newTargetOrder = targetOrder + 1;
      } else {
        newCurrentOrder = targetOrder + 1;
        newTargetOrder = Math.max(0, currentOrder - 1);
      }
    }

    current.order = newCurrentOrder;
    target.order = newTargetOrder;

    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    setProducts(sortPinnableContents(newProducts));

    try {
      await Promise.all([
        fetch(`/api/admin/products/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newCurrentOrder }),
        }),
        fetch(`/api/admin/products/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newTargetOrder }),
        }),
      ]);
    } catch (e) {
      console.warn("Product order save sync error:", e);
    }
  };

  const handleToggleVisibility = async (product: ProductItem) => {
    const newVisible = !product.isVisible;
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, isVisible: newVisible } : p
    );
    setProducts(updated);

    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: newVisible }),
      });
    } catch (e) {
      console.warn("Visibility toggle error:", e);
    }
  };

  return (
    <div className="space-y-6">
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
              !currentCategory || currentCategory === "ALL"
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            전체 ({totalCount})
          </Link>
          {categoriesList.map((cat) => {
            const isSelected = currentCategory === cat.name;
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

      {/* Guide Banner */}
      <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-base">📌</span>
          <span>
            <strong>1순위 대표 상품 고정:</strong> 특정 주력 상품을 상시 또는 프로모션 기간 동안 최상단에 1순위로 고정할 수 있습니다. 
            <strong> [▲/▼] 버튼</strong>으로 일반 상품들의 노출 순서를 바로 변경할 수 있습니다.
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">순서</th>
                <th className="px-4 py-3.5 w-36">1순위 고정</th>
                <th className="px-4 py-3.5 w-16">이미지</th>
                <th className="px-4 py-3.5">계열 분류</th>
                <th className="px-6 py-3.5">제품명 &amp; 배지</th>
                <th className="px-4 py-3.5">판매가</th>
                <th className="px-4 py-3.5">재고 현황</th>
                <th className="px-4 py-3.5">노출 상태</th>
                <th className="px-5 py-3.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-zinc-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    선택한 분류에 등록된 제품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const pinStatus = getPinStatusText(product);
                  return (
                    <tr 
                      key={product.id} 
                      className={`transition-colors ${
                        pinStatus.isPinned 
                          ? "bg-amber-50/30 hover:bg-amber-50/60" 
                          : "hover:bg-zinc-50/80"
                      }`}
                    >
                      {/* Order Controls */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, "UP")}
                            disabled={index === 0}
                            className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                            title="위로 이동"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, "DOWN")}
                            disabled={index === products.length - 1}
                            className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                            title="아래로 이동"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          #{product.order ?? 0}
                        </div>
                      </td>

                      {/* 1st-Priority Pin Button */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenPinModal(product)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all w-full justify-center ${
                            pinStatus.isPinned
                              ? "bg-amber-600 text-white border-amber-600 shadow-2xs hover:bg-amber-700"
                              : pinStatus.isExpired
                              ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200"
                              : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${pinStatus.isPinned ? "fill-white text-white" : "text-zinc-400"}`} />
                          <span className="truncate">{pinStatus.label}</span>
                        </button>
                      </td>

                      {/* Product Image */}
                      <td className="px-4 py-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-400">No Img</div>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-bold">
                            {product.category || "세정제류"}
                          </span>
                          <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                            <span>↳</span>
                            <span>{product.subCategory || "다목적/올인원"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Name & Badge */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {pinStatus.isPinned && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shrink-0">
                              📌 1순위 대표
                            </span>
                          )}
                          {product.badge && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-black uppercase">
                              ★ {product.badge}
                            </span>
                          )}
                          {product.tag && (
                            <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded text-[9px] font-bold">
                              #{product.tag}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sm text-zinc-900 line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{product.description}</div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-blue-600">{product.price.toLocaleString()}원</div>
                        {product.originalPrice && (
                          <div className="text-[10px] text-zinc-400 line-through">
                            {product.originalPrice.toLocaleString()}원
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4">
                        <span className={`font-bold ${product.stock <= product.safetyStock ? "text-red-600" : "text-zinc-900"}`}>
                          {product.stock}개
                        </span>
                        {product.stock <= product.safetyStock && (
                          <span className="block text-[9px] text-red-500 font-bold mt-0.5">⚠️ 안전재고 부족</span>
                        )}
                      </td>

                      {/* Visibility Toggle */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(product)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            product.isVisible 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {product.isVisible ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                          {product.isVisible ? '노출 중' : '숨김'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Link 
                          href={`/admin/products/${product.id}/edit`} 
                          className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors inline-block shadow-2xs"
                        >
                          옵션/수정
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

      {/* Pin Modal */}
      {selectedProductForPin && (
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          title="상품 1순위 대표 고정 설정"
          itemTitle={selectedProductForPin.name}
          currentIsPinned={selectedProductForPin.isPinned}
          currentPinUntil={selectedProductForPin.pinUntil}
          onSave={handleSavePin}
        />
      )}
    </div>
  );
}

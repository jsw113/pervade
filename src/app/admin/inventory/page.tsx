"use client";

import { useState, useEffect } from "react";
import { Package, ArrowDownRight, ArrowUpRight, AlertTriangle, RefreshCw, Plus, Minus, History, Check, X } from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT" | "ADJUST">("OUT");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdjustModal = (product: any, defaultType: "IN" | "OUT" | "ADJUST" = "OUT") => {
    setSelectedProduct(product);
    setAdjustType(defaultType);
    setQuantity(1);
    setReason(defaultType === "OUT" ? "네이버 스마트스토어 판매 출고" : defaultType === "IN" ? "본사 공장 입고" : "재고 실사 수량 정정");
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!reason.trim()) {
      alert("사유를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjustType,
          quantity,
          reason,
        }),
      });

      if (res.ok) {
        alert("재고가 성공적으로 반영되었습니다.");
        setIsModalOpen(false);
        fetchInventory();
      } else {
        alert("재고 변경 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonPresets = [
    "네이버 스마트스토어 판매 출고",
    "쿠팡 로켓/윙 판매 출고",
    "오프라인 매장/팝업 판매 출고",
    "본사 공장 입고",
    "고객 반품 정상 입고",
    "불량/파손 폐기 출고",
    "재고 실사 수량 정정",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통합 재고 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">
            자사몰 및 외부 채널(스마트스토어, 쿠팡, 오프라인 등)의 수기 판매 차감, 입출고 및 재고 실사 이력을 통합 관리합니다.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="p-2.5 border rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          실시간 재고 새로고침
        </button>
      </div>

      {/* Product Stock Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            제품별 실시간 재고 현황
          </span>
          <span className="text-xs text-zinc-400">
            총 {products.length}종 제품 관리 중
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold">
              <tr>
                <th className="px-6 py-4">상품 정보</th>
                <th className="px-6 py-4">판매가</th>
                <th className="px-6 py-4">현재 잔여 재고</th>
                <th className="px-6 py-4">안전 재고 기준</th>
                <th className="px-6 py-4">재고 상태</th>
                <th className="px-6 py-4 text-right">수기 재고 조정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    재고 현황을 불러오는 중...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    등록된 제품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= (p.safetyStock || 10);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">No</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-zinc-900">{p.name}</div>
                            <div className="text-[10px] text-zinc-400">누적 주문: {p._count?.orders || 0}건</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-zinc-700">
                        ₩{p.price.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-base font-black ${
                          isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-zinc-900"
                        }`}>
                          {p.stock.toLocaleString()}개
                        </span>
                      </td>

                      <td className="px-6 py-4 text-zinc-500 font-medium">
                        {p.safetyStock || 10}개 이하 경고
                      </td>

                      <td className="px-6 py-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> 일시 품절
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> 안전재고 부족
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" /> 정상 여유
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAdjustModal(p, "IN")}
                            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" /> 입고
                          </button>
                          <button
                            onClick={() => openAdjustModal(p, "OUT")}
                            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-red-600" /> 출고(차감)
                          </button>
                          <button
                            onClick={() => openAdjustModal(p, "ADJUST")}
                            className="px-2.5 py-1.5 border hover:bg-zinc-50 text-zinc-600 rounded-lg text-xs font-bold transition-colors"
                          >
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Logs History */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-600" />
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            최근 재고 변동 이력 로그 (최근 50건)
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold sticky top-0">
              <tr>
                <th className="px-6 py-3">일시</th>
                <th className="px-6 py-3">상품명</th>
                <th className="px-6 py-3">구분</th>
                <th className="px-6 py-3">변동 수량</th>
                <th className="px-6 py-3">변동 후 최종 잔고</th>
                <th className="px-6 py-3">변동 사유 / 채널</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                    재고 변동 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-3 text-zinc-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-bold text-zinc-800">
                      {log.product?.name || "-"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === "IN" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : log.type === "OUT"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {log.type === "IN" ? "입고 (+)" : log.type === "OUT" ? "출고 (-)" : "직접 조정"}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold">
                      {log.type === "IN" ? `+${log.quantity}` : log.type === "OUT" ? `-${log.quantity}` : `${log.quantity}로 설정`}
                    </td>
                    <td className="px-6 py-3 font-mono font-bold text-zinc-900">
                      {log.balance.toLocaleString()}개
                    </td>
                    <td className="px-6 py-3 text-zinc-600">
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">재고 수기 조정 - {selectedProduct.name}</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-zinc-50 rounded-xl border text-xs flex justify-between items-center">
                <span className="text-zinc-500 font-medium">현재 보유 재고</span>
                <span className="text-base font-black text-zinc-900">{selectedProduct.stock}개</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">조정 유형 선택 *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("OUT")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustType === "OUT"
                        ? "bg-red-500 text-white border-red-600 shadow-sm"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    판매 출고 (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("IN")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustType === "IN"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    신규 입고 (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("ADJUST")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustType === "ADJUST"
                        ? "bg-zinc-900 text-white border-black shadow-sm"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    직접 값 설정
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">
                  {adjustType === "ADJUST" ? "최종 변경할 재고 수량 *" : "변동 수량 *"}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">변동 사유 / 채널명 *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="예: 네이버 스마트스토어 3개 주문 판매"
                  className="w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {reasonPresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-md text-[10px] font-medium transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? "처리 중..." : "재고 변경 적용"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Megaphone, Calendar, Tag, RefreshCw, CheckCircle2, Clock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("이 프로모션 이벤트를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (promo: any) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (res.ok) {
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate).getTime() < new Date().getTime();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">프로모션 & 이벤트 캠페인 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">
            메인 섹션에 노출할 시즌 이벤트, 할인 페스티벌 및 지난 프로모션을 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPromotions}
            className="p-2.5 border rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/promotions/new"
            className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            새 프로모션 등록
          </Link>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b flex justify-between items-center text-xs font-bold text-zinc-700">
          <span>등록된 프로모션 캠페인 ({promotions.length}개)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-6 py-4">프로모션 정보</th>
                <th className="px-6 py-4">뱃지 / 혜택 강조</th>
                <th className="px-6 py-4">진행 기간</th>
                <th className="px-6 py-4">진행 상태</th>
                <th className="px-6 py-4">노출 활성화</th>
                <th className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    프로모션 목록을 불러오는 중...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    등록된 프로모션이 없습니다. 상단 버튼을 눌러 첫 이벤트를 등록해보세요.
                  </td>
                </tr>
              ) : (
                promotions.map((p) => {
                  const expired = isExpired(p.endDate);
                  const activeNow = p.isActive && !expired;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Title & Banner */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Megaphone className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{p.title}</h3>
                            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{p.subtitle || "서브 설명 없음"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Badge & Discount */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded font-bold text-[10px] block w-fit mb-1">
                          {p.badgeText}
                        </span>
                        <span className="text-amber-700 font-bold text-xs">
                          {p.discountText || "-"}
                        </span>
                      </td>

                      {/* Period */}
                      <td className="px-6 py-4 text-zinc-600">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{new Date(p.startDate).toLocaleDateString()}</span>
                          <span>~</span>
                          <span>{p.endDate ? new Date(p.endDate).toLocaleDateString() : "상시"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {activeNow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            진행중 (Active)
                          </span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            기간 종료 (Ended)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
                            비활성화 (Off)
                          </span>
                        )}
                      </td>

                      {/* Active Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                            p.isActive
                              ? "bg-zinc-950 text-white hover:bg-zinc-800"
                              : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                          }`}
                        >
                          {p.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {p.isActive ? "노출 ON" : "숨김 OFF"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/promotions/${p.id}/edit`}
                            className="p-1.5 border rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 border rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}

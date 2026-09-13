"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff, RefreshCw, Pin, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { PinModal } from "@/components/admin/PinModal";
import { getPinStatusText, sortPinnableContents } from "@/lib/contentSort";

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuideForPin, setSelectedGuideForPin] = useState<any | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guides");
      if (res.ok) {
        const data = await res.json();
        setGuides(sortPinnableContents(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleOpenPinModal = (guide: any) => {
    setSelectedGuideForPin(guide);
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (isPinned: boolean, pinUntil: string | null) => {
    if (!selectedGuideForPin) return;

    try {
      const res = await fetch(`/api/admin/guides/${selectedGuideForPin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned, pinUntil }),
      });

      if (!res.ok) throw new Error("가이드 고정 상태 저장 실패");
      
      const updated = guides.map((g) =>
        g.id === selectedGuideForPin.id ? { ...g, isPinned, pinUntil } : g
      );
      setGuides(sortPinnableContents(updated));
    } catch (err: any) {
      console.error(err);
      alert("고정 설정 중 오류가 발생했습니다: " + (err?.message || ""));
    }
  };

  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= guides.length) return;

    const newGuides = [...guides];
    const current = newGuides[index];
    const target = newGuides[targetIndex];

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

    [newGuides[index], newGuides[targetIndex]] = [newGuides[targetIndex], newGuides[index]];
    setGuides(sortPinnableContents(newGuides));

    try {
      await Promise.all([
        fetch(`/api/admin/guides/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newCurrentOrder }),
        }),
        fetch(`/api/admin/guides/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newTargetOrder }),
        }),
      ]);
    } catch (e) {
      console.warn("Guide order save sync error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 가이드 포스트를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/guides/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        fetchGuides();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (guide: any) => {
    try {
      const res = await fetch(`/api/admin/guides/${guide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !guide.published })
      });
      if (res.ok) {
        fetchGuides();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">제품별 사용 가이드 (블로그 CMS)</h1>
          <p className="text-sm text-zinc-500 mt-1">
            제품별/공간별 세정 팁과 노하우 아티클을 발행하고, 1순위 추천 가이드 고정(기간 설정 가능) 및 노출 순서를 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGuides}
            className="p-2.5 border rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/guides/new"
            className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            새 가이드 아티클 작성
          </Link>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-base">📌</span>
          <span>
            <strong>1순위 가이드 고정:</strong> 특정 가이드를 상시 또는 특정 기간 동안 최상단에 1순위로 고정할 수 있습니다. 
            <strong> [▲/▼] 버튼</strong>으로 가이드들의 노출 순서를 변경할 수 있습니다.
          </span>
        </div>
      </div>

      {/* Guide List Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b flex justify-between items-center text-xs font-bold text-zinc-700">
          <span>발행된 가이드 포스트 ({guides.length}개)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-4 w-16 text-center">순서</th>
                <th className="px-4 py-4 w-36">1순위 고정</th>
                <th className="px-6 py-4">가이드 아티클 정보</th>
                <th className="px-4 py-4">공간 분류</th>
                <th className="px-4 py-4">연결된 추천 제품</th>
                <th className="px-4 py-4">조회수 / 발행일</th>
                <th className="px-4 py-4">공개 상태</th>
                <th className="px-6 py-4 text-right">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-400">
                    가이드 포스트 목록을 불러오는 중...
                  </td>
                </tr>
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-400">
                    등록된 가이드 포스트가 없습니다. 상단 버튼을 눌러 첫 가이드를 작성해보세요.
                  </td>
                </tr>
              ) : (
                guides.map((g, index) => {
                  const pinStatus = getPinStatusText(g);
                  return (
                    <tr 
                      key={g.id} 
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
                            disabled={index === guides.length - 1}
                            className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                            title="아래로 이동"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          #{g.order ?? 0}
                        </div>
                      </td>

                      {/* 1st-Priority Pin Button */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenPinModal(g)}
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

                      {/* Title & Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border">
                            {g.thumbnailUrl ? (
                              <img src={g.thumbnailUrl} alt={g.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <BookOpen className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              {pinStatus.isPinned && (
                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shrink-0">
                                  📌 1순위 추천
                                </span>
                              )}
                              <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{g.title}</h3>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{g.summary || "요약 없음"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-[11px] font-bold">
                          {g.category}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-4">
                        {g.product ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-800 text-xs">{g.product.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">연결 제품 없음</span>
                        )}
                      </td>

                      {/* Views & Date */}
                      <td className="px-4 py-4">
                        <div className="text-zinc-700 font-bold">{g.viewCount}회 조회</div>
                        <div className="text-[11px] text-zinc-400">{new Date(g.createdAt).toLocaleDateString()}</div>
                      </td>

                      {/* Published Toggle */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleTogglePublish(g)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            g.published
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                          }`}
                        >
                          {g.published ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                          {g.published ? "공개 발행중" : "비공개"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/guides/${g.id}/edit`}
                            className="p-1.5 border rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(g.id)}
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

      {/* Pin Modal */}
      {selectedGuideForPin && (
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          title="가이드 1순위 추천 고정 설정"
          itemTitle={selectedGuideForPin.title}
          currentIsPinned={selectedGuideForPin.isPinned}
          currentPinUntil={selectedGuideForPin.pinUntil}
          onSave={handleSavePin}
        />
      )}
    </div>
  );
}

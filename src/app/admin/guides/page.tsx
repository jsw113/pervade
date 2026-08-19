"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guides");
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
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
            제품별/공간별(주방, 욕실, 가구 등) 세정 팁과 노하우 아티클을 지속적으로 발행 및 관리합니다.
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

      {/* Guide List Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b flex justify-between items-center text-xs font-bold text-zinc-700">
          <span>발행된 가이드 포스트 ({guides.length}개)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-6 py-4">가이드 아티클 정보</th>
                <th className="px-6 py-4">공간 분류</th>
                <th className="px-6 py-4">연결된 추천 제품</th>
                <th className="px-6 py-4">조회수 / 발행일</th>
                <th className="px-6 py-4">공개 상태</th>
                <th className="px-6 py-4 text-right">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    가이드 포스트 목록을 불러오는 중...
                  </td>
                </tr>
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    등록된 가이드 포스트가 없습니다. 상단 버튼을 눌러 첫 가이드를 작성해보세요.
                  </td>
                </tr>
              ) : (
                guides.map((g) => (
                  <tr key={g.id} className="hover:bg-zinc-50/80 transition-colors">
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
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{g.title}</h3>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{g.summary || "요약 없음"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-[11px] font-bold">
                        {g.category}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      {g.product ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-800 text-xs">{g.product.name}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">연결 제품 없음</span>
                      )}
                    </td>

                    {/* Views & Date */}
                    <td className="px-6 py-4">
                      <div className="text-zinc-700 font-bold">{g.viewCount}회 조회</div>
                      <div className="text-[11px] text-zinc-400">{new Date(g.createdAt).toLocaleDateString()}</div>
                    </td>

                    {/* Published Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(g)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          g.published
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {g.published ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                        {g.published ? "공개 발행중" : "비공개 (초안)"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

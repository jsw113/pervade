"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, HelpCircle, FileText, Check, X, RefreshCw, Eye, EyeOff } from "lucide-react";

export default function AdminContentsPage() {
  const [activeCategory, setActiveCategory] = useState<"FAQ" | "GUIDE" | "SHIPPING" | "TERMS" | "PRIVACY">("FAQ");
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    order: 0,
    isVisible: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contents?category=${activeCategory}`);
      if (res.ok) {
        const data = await res.json();
        setContents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [activeCategory]);

  const openCreateModal = () => {
    setEditingContent(null);
    setFormData({
      title: "",
      body: "",
      order: contents.length + 1,
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      body: item.body,
      order: item.order || 0,
      isVisible: item.isVisible !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 항목을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/contents/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        fetchContents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingContent) {
        // Edit
        const res = await fetch(`/api/admin/contents/${editingContent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, category: activeCategory }),
        });
        if (res.ok) {
          alert("수정되었습니다.");
          setIsModalOpen(false);
          fetchContents();
        }
      } else {
        // Create
        const res = await fetch("/api/admin/contents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, category: activeCategory }),
        });
        if (res.ok) {
          alert("성공적으로 등록되었습니다.");
          setIsModalOpen(false);
          fetchContents();
        }
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">콘텐츠 & 고객센터 CMS</h1>
          <p className="text-sm text-zinc-500 mt-1">
            FAQ(자주 묻는 질문), 제품 사용 가이드, 배송/반품 정책, 약관 내용을 웹 에디터로 관리합니다.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          신규 {activeCategory} 항목 추가
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto pb-3">
        {(["FAQ", "GUIDE", "SHIPPING", "TERMS", "PRIVACY"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {cat === "FAQ"
              ? "FAQ (자주 묻는 질문)"
              : cat === "GUIDE"
              ? "사용 가이드"
              : cat === "SHIPPING"
              ? "배송/반품 안내"
              : cat === "TERMS"
              ? "서비스 이용약관"
              : "개인정보처리방침"}
          </button>
        ))}
      </div>

      {/* Contents List */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm divide-y">
        <div className="p-4 bg-zinc-50 border-b flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-600">
            등록된 {activeCategory} 목록 ({contents.length}개)
          </span>
          <button
            onClick={fetchContents}
            className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-400 text-xs">
            콘텐츠를 불러오는 중...
          </div>
        ) : contents.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs">
            등록된 {activeCategory} 항목이 없습니다. 우측 상단의 '+ 추가' 버튼을 눌러보세요.
          </div>
        ) : (
          contents.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold">
                    순서: {item.order}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-900">{item.title}</h3>
                  {!item.isVisible && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">
                      숨김 처리됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed line-clamp-3">
                  {item.body}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 border rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
                  title="수정"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 border rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-sm">
                {editingContent ? `${activeCategory} 수정` : `신규 ${activeCategory} 등록`}
              </span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">제목 (질문 / 항목명) *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 퍼베이드 세정제는 어떤 재질에 사용 가능한가요?"
                  className="w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">내용 (답변 / 상세설명) *</label>
                <textarea
                  required
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="고객에게 안내할 내용을 상세히 입력하세요."
                  className="w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">노출 우선순위 (순서)</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="w-4 h-4 text-zinc-900 rounded"
                    />
                    <span className="text-xs font-bold text-zinc-700">고객 화면에 노출</span>
                  </label>
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
                  className="flex-1 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? "저장 중..." : "저장 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

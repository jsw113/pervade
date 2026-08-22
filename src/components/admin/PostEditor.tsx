"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, ArrowLeft, Eye, Sparkles } from "lucide-react";
import Link from "next/link";

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    type?: string;
    content?: string;
    published?: boolean;
  };
}

export function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState(initialData?.type || "JOURNAL");
  const [content, setContent] = useState(initialData?.content || "");
  const [published, setPublished] = useState(initialData?.published !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditMode = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent, shouldPublish: boolean) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 본문 내용은 필수입니다.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = isEditMode ? `/api/admin/posts/${initialData.id}` : "/api/admin/posts";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          type, 
          content, 
          published: shouldPublish 
        }),
      });
      
      if (!res.ok) throw new Error("콘텐츠 저장에 실패했습니다.");
      
      alert(isEditMode ? "✅ 콘텐츠가 성공적으로 수정되었습니다!" : "✅ 새 콘텐츠가 성공적으로 등록되었습니다!");
      router.push("/admin/posts");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEditMode) return;
    if (!confirm("정말 이 콘텐츠를 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${initialData.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("콘텐츠가 삭제되었습니다.");
        router.push("/admin/posts");
        router.refresh();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form className="space-y-6 max-w-4xl bg-white p-6 sm:p-8 rounded-2xl border shadow-xs">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">콘텐츠 제목 *</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="예: 퍼베이드가 추구하는 미니멀 라이프스타일과 공간 케어"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">콘텐츠 분류 (채널 선택) *</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
            >
              <option value="ABOUT">브랜드 스토리 / 소개 (About)</option>
              <option value="JOURNAL">저널 &amp; 매거진 블로그 (Journal)</option>
              <option value="PRODUCT">제품 특장점 아티클 (Product Info)</option>
              <option value="NOTICE">공지사항 &amp; 뉴스 (Notice)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">공개 상태 설정</label>
            <div className="flex items-center gap-3 p-2.5 bg-zinc-50 border rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
                <input 
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900"
                />
                <span>쇼핑몰/웹사이트 즉시 공개 발행</span>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-zinc-700">본문 내용 (Markdown 및 일반 텍스트 지원) *</label>
            <span className="text-[11px] text-zinc-400">줄바꿈 및 마크다운 문법 지원</span>
          </div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={16}
            className="w-full p-4 bg-zinc-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
            placeholder="여기에 브랜드 스토리, 저널 아티클, 소개 글을 작성하세요..."
          />
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        {isEditMode ? (
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "삭제 중..." : "콘텐츠 삭제"}
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="px-5 py-2.5 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            취소
          </Link>
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            임시저장 (비공개)
          </button>
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? "저장 중..." : isEditMode ? "수정사항 저장" : "공개 발행하기"}
          </button>
        </div>
      </div>
    </form>
  );
}

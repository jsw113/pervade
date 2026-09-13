"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, ArrowLeft, Eye, Sparkles, Upload, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { optimizeImageFile } from "@/lib/utils/imageOptimizer";

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    type?: string;
    content?: string;
    imageUrl?: string | null;
    published?: boolean;
    order?: number;
    isPinned?: boolean;
    pinUntil?: string | Date | null;
  };
}

export function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState(initialData?.type || "JOURNAL");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [imageSourceType, setImageSourceType] = useState<"FILE" | "URL">("FILE");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [published, setPublished] = useState(initialData?.published !== false);
  const [order, setOrder] = useState<number>(initialData?.order ?? 0);
  const [isPinned, setIsPinned] = useState<boolean>(!!initialData?.isPinned);
  const [pinType, setPinType] = useState<"PERMANENT" | "PERIOD">(
    initialData?.pinUntil ? "PERIOD" : "PERMANENT"
  );
  const [pinUntilDate, setPinUntilDate] = useState<string>(
    initialData?.pinUntil ? new Date(initialData.pinUntil).toISOString().split("T")[0] : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditMode = !!initialData?.id;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      // 1600x1200 high-res optimization
      const dataUrl = await optimizeImageFile(file, 1600, 1200, 0.85);
      setImageUrl(dataUrl);
    } catch (err: any) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setIsImageUploading(false);
    }
  };

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

      const finalPinUntil = isPinned && pinType === "PERIOD" && pinUntilDate
        ? new Date(`${pinUntilDate}T23:59:59.999Z`).toISOString()
        : null;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          type, 
          content,
          imageUrl: imageUrl || null,
          published: shouldPublish,
          order: Number(order || 0),
          isPinned,
          pinUntil: finalPinUntil
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
      <div className="space-y-5">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <label className="block text-xs font-bold text-zinc-700 mb-1">노출 우선순위 (Order 번호)</label>
            <input 
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
              placeholder="0 (낮을수록 우선)"
            />
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

        {/* 1순위 상단 고정 (PIN) & 고정 기간 설정 */}
        <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-bold text-xs flex items-center gap-1.5">
                📌 1순위 상단 고정 (PIN)
              </span>
              <span className="text-[11px] text-zinc-500">목록 최상단에 우선 배치</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>1순위 고정 활성화</span>
            </label>
          </div>

          {isPinned && (
            <div className="pt-2 border-t border-amber-200/50 space-y-3 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-zinc-700">
                  <input
                    type="radio"
                    name="pinType"
                    checked={pinType === "PERMANENT"}
                    onChange={() => setPinType("PERMANENT")}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  상시 고정 (종료일 없음)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-zinc-700">
                  <input
                    type="radio"
                    name="pinType"
                    checked={pinType === "PERIOD"}
                    onChange={() => setPinType("PERIOD")}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  기간 지정 고정
                </label>
              </div>

              {pinType === "PERIOD" && (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 font-medium">고정 종료일:</span>
                  <input
                    type="date"
                    value={pinUntilDate}
                    onChange={(e) => setPinUntilDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="p-2 bg-white border border-zinc-300 rounded-xl font-bold text-zinc-900"
                  />
                  <span className="text-[11px] text-zinc-400">해당 일자 23:59까지 고정 후 자동 일반 정렬 복귀</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cover / Thumbnail Image Upload Section */}
        <div className="p-4 bg-zinc-50 rounded-2xl border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                대표 커버 / 썸네일 이미지 (메인 및 리스트에 노출)
              </label>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                메인 홈페이지 저널/스토리 카드 및 블로그 목록에 노출될 고화질 사진을 등록합니다.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setImageSourceType("FILE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  imageSourceType === "FILE" 
                    ? "bg-zinc-950 text-white shadow-2xs" 
                    : "bg-white text-zinc-600 border"
                }`}
              >
                직접 파일 업로드
              </button>
              <button
                type="button"
                onClick={() => setImageSourceType("URL")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  imageSourceType === "URL" 
                    ? "bg-zinc-950 text-white shadow-2xs" 
                    : "bg-white text-zinc-600 border"
                }`}
              >
                이미지 URL 입력
              </button>
            </div>
          </div>

          {imageSourceType === "FILE" ? (
            <div>
              <label className="border-2 border-dashed border-zinc-200 hover:border-zinc-900 bg-white rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 transition-colors mb-1.5" />
                <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950">
                  {isImageUploading ? "이미지 압축 최적화 중..." : "이미지 파일 선택하여 업로드하기"}
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, WebP (자동 고화질 압축 처리)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageUploading}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... (또는 외부 이미지 링크)"
                className="w-full p-2.5 bg-white border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          )}

          {/* Image Preview & Delete */}
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden border bg-zinc-900 w-full max-w-sm aspect-16/10 shadow-xs group">
              <img
                src={imageUrl}
                alt="Post Thumbnail Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
                title="이미지 제거"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-white font-medium">
                등록된 대표 이미지
              </div>
            </div>
          )}
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
            rows={14}
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

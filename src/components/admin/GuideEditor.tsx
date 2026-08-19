"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Image as ImageIcon, Sparkles, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface GuideEditorProps {
  initialData?: any;
}

export function GuideEditor({ initialData }: GuideEditorProps) {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "주방");
  const [productId, setProductId] = useState(initialData?.productId || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tips, setTips] = useState(initialData?.tips || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "");
  const [published, setPublished] = useState(initialData?.published !== false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/guides/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.url);
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 본문 내용은 필수입니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = initialData?.id ? `/api/admin/guides/${initialData.id}` : "/api/admin/guides";
      const method = initialData?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          productId: productId || null,
          summary,
          content,
          tips,
          thumbnailUrl,
          published
        })
      });

      if (res.ok) {
        alert(initialData?.id ? "가이드가 성공적으로 수정되었습니다." : "새 사용가이드가 성공적으로 발행되었습니다.");
        router.push("/admin/guides");
        router.refresh();
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6 shadow-sm max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <Link href="/admin/guides" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> 가이드 목록으로 돌아가기
        </Link>
        <span className="text-xs text-zinc-400">블로그 & 매거진 스타일 CMS</span>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">가이드 제목 *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: [다목적 세정제] 주방 인덕션 & 후드 찌든 기름때 5분 완벽 제거법"
            className="w-full p-3.5 bg-zinc-50 border rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Category & Product Link Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">공간 / 카테고리 분류 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="주방">주방 (Kitchen)</option>
              <option value="욕실">욕실 / 타일 (Bathroom)</option>
              <option value="리빙/가구">리빙 / 가구 / 패브릭 (Living & Furniture)</option>
              <option value="유리/거울">유리 / 거울 / 창문 (Glass & Mirror)</option>
              <option value="다목적">다목적 종합 (All Purpose)</option>
              <option value="기타">기타 특수 케어</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">연결할 대표 제품 선택 (상품 바로구매 연동)</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">-- 연결 제품 없음 (일반 팁) --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₩{p.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thumbnail Image */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">가이드 대표 썸네일 이미지</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full space-y-2">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="이미지 URL 직접 입력 또는 우측 업로드 버튼 사용"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "이미지 업로드 중..." : "로컬 컴퓨터에서 이미지 업로드"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {thumbnailUrl && (
              <div className="w-32 h-24 bg-zinc-100 rounded-xl overflow-hidden border shrink-0 relative group">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">한 줄 요약 (카드 뷰에 노출) *</label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="매일 요리 후 눌어붙은 기름때와 탄 자국을 스크래치 없이 손쉽게 지우는 퍼베이드만의 전문가 세정 루틴."
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">상세 가이드 본문 (단계별 세정법 & 마크다운) *</label>
          <p className="text-[11px] text-zinc-400 mb-2">
            ### 1단계: 온수 타월로 표면 불리기 처럼 단계별로 내용을 작성하시면 고객 화면에서 시각적으로 예쁘게 정렬됩니다.
          </p>
          <textarea
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`### 1단계: 표면 오염 상태 확인 및 1차 먼지 제거\n...\n\n### 2단계: 퍼베이드 세정제 원액 분사 및 2분 방치\n...\n\n### 3단계: 극세사 타월로 원을 그리며 닦아내기\n...`}
            className="w-full p-4 bg-zinc-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
          />
        </div>

        {/* Pro Tips */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">전문가 꿀팁 (Pro Tips) & 주의사항</label>
          <textarea
            rows={3}
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="· 탄 자국이 심한 경우 세정제를 도포한 후 랩을 씌워 5분간 방치하면 손쉽게 분해됩니다.&#10;· 천연 대리석의 경우 눈에 띄지 않는 부위에 사전 테스트 후 사용하세요."
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
          />
        </div>

        {/* Published Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer p-4 bg-zinc-50 rounded-xl border">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-zinc-900 rounded"
            />
            <span className="text-xs font-bold text-zinc-800">쇼핑몰 [사용가이드] 허브에 즉시 공개 발행</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.push("/admin/guides")}
          className="px-6 py-3 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {isSubmitting ? "발행 중..." : initialData?.id ? "가이드 수정 저장" : "새 가이드 포스트 발행"}
        </button>
      </div>
    </form>
  );
}

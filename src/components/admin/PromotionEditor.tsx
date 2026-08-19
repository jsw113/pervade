"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, ArrowLeft, Check, Calendar, Megaphone, Sparkles, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";

interface PromotionEditorProps {
  initialData?: any;
}

export function PromotionEditor({ initialData }: PromotionEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [badgeText, setBadgeText] = useState(initialData?.badgeText || "SPECIAL EVENT");
  const [discountText, setDiscountText] = useState(initialData?.discountText || "최대 25% 할인 + 신규 3,000P");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || "/shop");
  const [buttonText, setButtonText] = useState(initialData?.buttonText || "프로모션 혜택 받기");

  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split("T")[0]
      : ""
  );

  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/promotions/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
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
    if (!title.trim()) {
      alert("프로모션 제목은 필수입니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = initialData?.id ? `/api/admin/promotions/${initialData.id}` : "/api/admin/promotions";
      const method = initialData?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          badgeText,
          discountText,
          content,
          imageUrl,
          linkUrl,
          buttonText,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          isActive,
        }),
      });

      if (res.ok) {
        alert(initialData?.id ? "프로모션이 성공적으로 수정되었습니다." : "새 프로모션이 성공적으로 등록되었습니다.");
        router.push("/admin/promotions");
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
        <Link href="/admin/promotions" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> 프로모션 목록으로 돌아가기
        </Link>
        <span className="text-xs text-zinc-400 font-semibold">이벤트 & 캠페인 CMS</span>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">프로모션 메인 타이틀 *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2026 썸머 클린 & 웰니스 스페셜 페스티벌"
            className="w-full p-3.5 bg-zinc-50 border rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">서브 헤드라인 / 핵심 설명 문구</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="예: 찌든 오염은 비우고 공간의 품격을 채우는 시간, 전 제품 특별 세트 구성 및 리필 추가 증정"
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Badge & Discount Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">상단 뱃지 텍스트</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="예: SEASON SPECIAL, LIMITED OFFER, 신제품 런칭"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">할인 / 혜택 강조 문구 (Punchline)</label>
            <input
              type="text"
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              placeholder="예: 최대 25% 할인 + 신규 가입 3,000P 즉시 증정"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              이벤트 시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-white border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              이벤트 마감일 (미입력 시 상시 진행)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 bg-white border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <p className="sm:col-span-2 text-[10px] text-zinc-400">
            * 마감일이 지나면 메인 화면에서 자동으로 <strong>[종료된 지난 프로모션]</strong> 상태로 전환됩니다.
          </p>
        </div>

        {/* Promotion Banner Image */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">프로모션 비주얼 배너 이미지</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full space-y-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="이미지 URL 직접 입력 또는 업로드 버튼 사용"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "이미지 업로드 중..." : "배너 이미지 직접 업로드"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {imageUrl && (
              <div className="w-40 h-24 bg-zinc-100 rounded-xl overflow-hidden border shrink-0 relative group">
                <img src={imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Link & Button Text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">클릭 시 이동할 링크 URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/shop 또는 /shop/제품ID"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">버튼 텍스트</label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="예: 프로모션 특별 세트 바로가기"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* Detailed Benefit Bullets */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">세부 혜택 및 이벤트 안내 내용</label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="· 다목적 세정제 500ml 본품 + 리필 2팩 세트 20% 특별 할인&#10;· 3만원 이상 구매 고객 전원 전용 타월 증정&#10;· 실명인증 회원 추가 5% 적립"
            className="w-full p-3.5 bg-zinc-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
          />
        </div>

        {/* Active Switch */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer p-4 bg-zinc-50 rounded-xl border">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-zinc-900 rounded"
            />
            <div>
              <span className="text-xs font-bold text-zinc-800 block">이 프로모션을 즉시 메인 화면에 활성화</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">체크 해제 시 즉시 비활성화(종료/보관) 상태가 됩니다.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.push("/admin/promotions")}
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
          {isSubmitting ? "저장 중..." : initialData?.id ? "프로모션 수정 저장" : "새 프로모션 등록"}
        </button>
      </div>
    </form>
  );
}

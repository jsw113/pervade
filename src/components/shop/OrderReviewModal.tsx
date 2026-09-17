"use client";

import { useState } from "react";
import { Star, X, Camera, UploadCloud, CheckCircle2, Sparkles } from "lucide-react";

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: {
    id: string;
    name: string;
    imageUrl?: string | null;
    price: number;
  };
  orderId: string;
  optionSelected?: string;
}

export function OrderReviewModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  orderId,
  optionSelected,
}: OrderReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const ratingLabels: Record<number, string> = {
    5: "⭐⭐⭐⭐⭐ 아주 만족해요!",
    4: "⭐⭐⭐⭐ 만족스러워요",
    3: "⭐⭐⭐ 보통이에요",
    2: "⭐⭐ 조금 아쉬워요",
    1: "⭐ 별로예요",
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일 크기는 최대 10MB까지 가능합니다.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/reviews/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPhotoUrl(data.url);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "이미지 업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("후기 내용을 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          orderId,
          rating,
          content: content.trim(),
          imageUrl: photoUrl || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const pts = result.rewardPoints || 0;
        alert(`🎉 소중한 구매후기가 등록되었습니다!\n적립금 +${pts.toLocaleString()} P가 즉시 지급되었습니다.`);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "리뷰 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Purchase Review
          </span>
          <h2 className="text-xl font-black text-zinc-950">구매후기 작성</h2>
          <p className="text-xs text-zinc-500">실제 제품을 사용해보신 솔직한 경험을 공유해 주세요.</p>
        </div>

        {/* Product Info Summary */}
        <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100">
          <div className="w-14 h-14 bg-zinc-200 rounded-xl overflow-hidden shrink-0">
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=300&auto=format&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-zinc-900 line-clamp-1">{product.name}</p>
            {optionSelected && (
              <p className="text-zinc-500 text-[11px]">옵션: {optionSelected}</p>
            )}
            <p className="font-semibold text-zinc-700 font-mono">₩{product.price.toLocaleString()}원</p>
          </div>
        </div>

        {/* Reward Benefit Callout */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 text-xs text-purple-950 flex items-start gap-2.5">
          <span className="text-base">🎁</span>
          <div className="space-y-0.5">
            <p className="font-bold">리뷰 작성 즉시 적립금 지급!</p>
            <p className="text-[11px] text-purple-700">
              일반 텍스트 리뷰 작성 시 <strong>1.0%</strong>, 포토 사진 첨부 시 <strong>2.0%</strong> 포인트가 실시간 적립됩니다.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="space-y-2 text-center py-2 bg-zinc-50/50 rounded-2xl border border-zinc-100">
            <label className="block text-xs font-bold text-zinc-600">제품 만족도 평점</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-xs"
                        : "text-zinc-200 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-zinc-700">{ratingLabels[rating]}</p>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700">
              포토 리뷰 사진 첨부 <span className="text-purple-600 font-normal">(선택 / 2.0% 우대 적립)</span>
            </label>

            {photoUrl ? (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-zinc-200 shadow-xs">
                <img src={photoUrl} alt="Review attachment" className="w-28 h-28 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[10px] font-bold text-center py-0.5">
                  포토 첨부 완료
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
                {isUploadingPhoto ? (
                  <div className="text-xs text-zinc-500 font-medium py-2">사진 업로드 중...</div>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-700 mt-1">사진 등록하기</span>
                    <span className="text-[11px] text-zinc-400">JPG, PNG 파일 (최대 10MB)</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700">후기 내용</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="제품의 세정력, 향, 사용 편의성 등 솔직한 사용 소감을 작성해 주세요."
              className="w-full p-4 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingPhoto}
              className="w-2/3 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
            >
              {isSubmitting ? "등록 중..." : "후기 등록하고 포인트 받기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

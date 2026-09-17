"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export function ReviewSection({ productId }: { productId: string }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      setIsLoggedIn(res.ok);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkAuth();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          content,
        }),
      });

      if (response.ok) {
        setContent("");
        setRating(5);
        fetchReviews();
        alert("리뷰가 등록되었습니다. 마이페이지에서 구매 내역을 통해 포토 후기를 작성하시면 최대 2.0% 추가 적립금이 지급됩니다!");
      } else {
        alert("리뷰 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Review Banner Notice */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[11px] font-bold rounded-full border border-amber-400/30">
              리뷰 적립 혜택
            </span>
            <span className="text-sm font-bold">실구매자 리뷰 작성 시 최대 2.0% 적립금 지급</span>
          </div>
          <p className="text-xs text-zinc-400">
            마이페이지의 최근 주문 내역에서 [구매후기 작성]을 클릭하시면 텍스트 후기 1.0%, 포토 후기 2.0%가 즉시 적립됩니다.
          </p>
        </div>
        <Link
          href="/mypage"
          className="px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
        >
          마이페이지 주문내역 가기 →
        </Link>
      </div>

      {/* Review Form */}
      <div className="bg-zinc-50 border rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">한 줄 리뷰 작성하기</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              평점
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              내용
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isLoggedIn
                  ? "제품의 솔직한 사용 후기를 남겨주세요."
                  : "로그인 후 후기를 작성하실 수 있습니다."
              }
              disabled={!isLoggedIn}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 bg-white text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">
              * 포토 리뷰 및 구매 인증은 <Link href="/mypage" className="underline font-semibold text-zinc-600">마이페이지</Link>에서 가능합니다.
            </span>
            {isLoggedIn ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-zinc-950 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "등록 중..." : "리뷰 등록"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="px-6 py-2.5 bg-zinc-200 text-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-300 transition-colors"
              >
                로그인 하러가기
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg border-b pb-3">고객 리뷰 ({reviews.length})</h3>
        
        {loading ? (
          <p className="text-sm text-zinc-400">리뷰를 불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-zinc-400 py-6">첫 번째 리뷰를 작성해 보세요!</p>
        ) : (
          <div className="divide-y space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="pt-6 first:pt-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Badges */}
                    {review.orderId && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        인증된 실구매자
                      </span>
                    )}
                    {review.isPhoto && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                        <Camera className="w-3 h-3 text-amber-600" />
                        포토 후기
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-700">{review.user?.name || "익명 고객"}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-zinc-700 leading-relaxed text-sm whitespace-pre-line">{review.content}</p>

                {/* Photo Thumbnail */}
                {review.imageUrl && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(review.imageUrl)}
                      className="group relative block w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-zinc-200 hover:border-zinc-900 transition-all cursor-zoom-in"
                    >
                      <img
                        src={review.imageUrl}
                        alt="리뷰 첨부 사진"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        확대보기
                      </div>
                    </button>
                  </div>
                )}

                {/* Admin Comment Reply */}
                {review.comment ? (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 ml-4 space-y-1.5 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                      <span>PERVADE 관리자 답변</span>
                    </div>
                    <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-zinc-900 rounded-2xl p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="리뷰 사진 원본"
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

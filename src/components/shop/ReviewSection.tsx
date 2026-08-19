"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function ReviewSection({ productId }: { productId: string }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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
        alert("리뷰가 등록되었습니다. (리뷰 보상 포인트가 자동으로 적립되었습니다)");
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
      {/* Review Form */}
      <div className="bg-zinc-50 border rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">리뷰 작성하기</h3>
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

          <div className="flex justify-end">
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
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-700">{review.user?.name}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-zinc-700 leading-relaxed text-sm">{review.content}</p>

                {/* Admin Comment Reply */}
                {review.comment ? (
                  <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 ml-4 space-y-1.5">
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
    </div>
  );
}

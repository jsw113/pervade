"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Edit3, CheckCircle, Star } from "lucide-react";
import { OrderReviewModal } from "@/components/shop/OrderReviewModal";

interface OrderItem {
  id: string;
  totalAmount: number;
  status: string;
  shippingMethod: string;
  shippingFee: number;
  optionSelected: string;
  createdAt: string | Date;
  productId?: string | null;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  } | null;
  reviews?: Array<{
    id: string;
    rating: number;
    content: string;
    imageUrl?: string | null;
  }>;
}

interface MyPageOrderListProps {
  orders: OrderItem[];
}

export function MyPageOrderList({ orders }: MyPageOrderListProps) {
  const router = useRouter();
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<OrderItem | null>(null);

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
        <p>아직 주문한 내역이 없습니다.</p>
        <Link href="/shop" className="inline-block font-bold text-zinc-950 underline">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y">
        {orders.map((order) => {
          const hasReviewed = Boolean(order.reviews && order.reviews.length > 0);
          const review = order.reviews?.[0];

          return (
            <div
              key={order.id}
              className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              {/* Product Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                  <img
                    src={order.product?.imageUrl || "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=300&auto=format&fit=crop"}
                    alt={order.product?.name || "주문 상품"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-950 text-sm">{order.product?.name || "주문 상품"}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px]">
                      {order.status === "COMPLETED" ? "결제완료 / 출고준비" : order.status}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[11px]">
                    옵션: {order.optionSelected} · {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>

              {/* Price & Review Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                <div className="text-left sm:text-right">
                  <span className="font-black text-sm text-zinc-950 block font-mono">
                    ₩{order.totalAmount.toLocaleString()}원
                  </span>
                </div>

                {/* Review Button */}
                {order.status === "COMPLETED" && (
                  <div>
                    {hasReviewed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold border border-zinc-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        작성완료 ({review?.rating}★)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForReview(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>후기 작성 (+적립)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedOrderForReview && selectedOrderForReview.product && (
        <OrderReviewModal
          isOpen={true}
          onClose={() => setSelectedOrderForReview(null)}
          onSuccess={() => {
            router.refresh();
          }}
          orderId={selectedOrderForReview.id}
          product={selectedOrderForReview.product}
          optionSelected={selectedOrderForReview.optionSelected}
        />
      )}
    </>
  );
}

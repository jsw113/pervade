"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, FileText, Sparkles, BookOpen, Eye, EyeOff, Tag, Pin, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { PinModal } from "@/components/admin/PinModal";
import { getPinStatusText, sortPinnableContents } from "@/lib/contentSort";

interface PostItem {
  id: string;
  title: string;
  content: string;
  type: string;
  published: boolean;
  order: number;
  isPinned: boolean;
  pinUntil?: string | Date | null;
  createdAt: string | Date;
  author?: { name: string; email: string };
}

interface AdminPostsTableProps {
  initialPosts: PostItem[];
  typeFilter: string;
  counts: {
    all: number;
    about: number;
    journal: number;
    notice: number;
  };
}

export function AdminPostsTable({ initialPosts, typeFilter, counts }: AdminPostsTableProps) {
  const [posts, setPosts] = useState<PostItem[]>(sortPinnableContents(initialPosts));
  const [selectedPostForPin, setSelectedPostForPin] = useState<PostItem | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleOpenPinModal = (post: PostItem) => {
    setSelectedPostForPin(post);
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (isPinned: boolean, pinUntil: string | null) => {
    if (!selectedPostForPin) return;
    setLoadingId(selectedPostForPin.id);

    try {
      const res = await fetch(`/api/admin/posts/${selectedPostForPin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned, pinUntil }),
      });

      if (!res.ok) throw new Error("고정 상태 저장 실패");
      const data = await res.json();
      
      const updated = posts.map((p) =>
        p.id === selectedPostForPin.id ? { ...p, isPinned, pinUntil } : p
      );
      setPosts(sortPinnableContents(updated));
    } catch (err: any) {
      console.error(err);
      alert("고정 설정 중 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setLoadingId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    const newPosts = [...posts];
    const current = newPosts[index];
    const target = newPosts[targetIndex];

    // Swap order values or ensure current has higher priority
    const currentOrder = current.order ?? 0;
    const targetOrder = target.order ?? 0;
    
    // If orders are identical, adjust them
    let newCurrentOrder = targetOrder;
    let newTargetOrder = currentOrder;
    if (newCurrentOrder === newTargetOrder) {
      if (direction === "UP") {
        newCurrentOrder = Math.max(0, targetOrder - 1);
        newTargetOrder = targetOrder + 1;
      } else {
        newCurrentOrder = targetOrder + 1;
        newTargetOrder = Math.max(0, currentOrder - 1);
      }
    }

    current.order = newCurrentOrder;
    target.order = newTargetOrder;

    [newPosts[index], newPosts[targetIndex]] = [newPosts[targetIndex], newPosts[index]];
    setPosts(sortPinnableContents(newPosts));

    // Save both orders to DB
    try {
      await Promise.all([
        fetch(`/api/admin/posts/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newCurrentOrder }),
        }),
        fetch(`/api/admin/posts/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newTargetOrder }),
        }),
      ]);
    } catch (e) {
      console.warn("Order save sync error:", e);
    }
  };

  const handleOrderChange = async (postId: string, newOrder: number) => {
    const updated = posts.map((p) =>
      p.id === postId ? { ...p, order: newOrder } : p
    );
    setPosts(sortPinnableContents(updated));

    try {
      await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });
    } catch (e) {
      console.warn("Order change save error:", e);
    }
  };

  const handleTogglePublish = async (post: PostItem) => {
    const newPublished = !post.published;
    const updated = posts.map((p) =>
      p.id === post.id ? { ...p, published: newPublished } : p
    );
    setPosts(updated);

    try {
      await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newPublished }),
      });
    } catch (e) {
      console.warn("Publish toggle error:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "전체 콘텐츠", val: "ALL", count: counts.all },
          { label: "브랜드 스토리 (About)", val: "ABOUT", count: counts.about },
          { label: "저널 / 매거진 블로그 (Journal)", val: "JOURNAL", count: counts.journal },
          { label: "공지 & 뉴스 (Notice)", val: "NOTICE", count: counts.notice },
        ].map((tab) => {
          const isActive = (typeFilter || "ALL") === tab.val;
          return (
            <Link
              key={tab.val}
              href={tab.val === "ALL" ? "/admin/posts" : `/admin/posts?type=${tab.val}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Guide Banner */}
      <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-base">📌</span>
          <span>
            <strong>1순위 고정 기능:</strong> 특정 공지나 저널을 상시 또는 지정 날짜까지 최상단에 고정할 수 있습니다. 
            <strong> [▲/▼] 버튼</strong>으로 노출 순서를 즉시 재배치할 수 있습니다.
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">순서</th>
                <th className="px-4 py-3.5 w-36">1순위 상단 고정</th>
                <th className="px-6 py-3.5">콘텐츠 제목 &amp; 요약</th>
                <th className="px-4 py-3.5 w-28">분류 / 채널</th>
                <th className="px-4 py-3.5 w-28">발행 상태</th>
                <th className="px-4 py-3.5 w-24">작성일</th>
                <th className="px-6 py-3.5 text-right w-24">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    등록된 콘텐츠가 없습니다. 상단 버튼을 눌러 새 글을 작성해보세요.
                  </td>
                </tr>
              ) : (
                posts.map((post, index) => {
                  const pinStatus = getPinStatusText(post);
                  return (
                    <tr 
                      key={post.id} 
                      className={`transition-colors ${
                        pinStatus.isPinned 
                          ? "bg-amber-50/30 hover:bg-amber-50/60" 
                          : "hover:bg-zinc-50/80"
                      }`}
                    >
                      {/* Order Controls */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, "UP")}
                            disabled={index === 0}
                            className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                            title="위로 이동"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, "DOWN")}
                            disabled={index === posts.length - 1}
                            className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                            title="아래로 이동"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          #{post.order ?? 0}
                        </div>
                      </td>

                      {/* 1st-Priority Pin Button & Status */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenPinModal(post)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all w-full justify-center ${
                            pinStatus.isPinned
                              ? "bg-amber-600 text-white border-amber-600 shadow-2xs hover:bg-amber-700"
                              : pinStatus.isExpired
                              ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200"
                              : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${pinStatus.isPinned ? "fill-white text-white" : "text-zinc-400"}`} />
                          <span className="truncate">{pinStatus.label}</span>
                        </button>
                      </td>

                      {/* Title & Preview */}
                      <td className="px-6 py-4 max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2">
                          {pinStatus.isPinned && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shrink-0">
                              📌 1순위
                            </span>
                          )}
                          <span className="font-bold text-sm text-zinc-900 line-clamp-1">{post.title}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-mono">
                          {post.content.substring(0, 80)}
                        </div>
                      </td>

                      {/* Channel Type */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-block ${
                          post.type === "ABOUT"
                            ? "bg-amber-100 text-amber-900"
                            : post.type === "JOURNAL"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-zinc-100 text-zinc-800"
                        }`}>
                          {post.type === "ABOUT" ? "브랜드 스토리" : post.type === "JOURNAL" ? "저널 블로그" : post.type === "NOTICE" ? "공지사항" : post.type}
                        </span>
                      </td>

                      {/* Published State Toggle */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            post.published 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {post.published ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                          {post.published ? '공개 발행' : '임시저장'}
                        </button>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-4 text-zinc-400 text-[11px]">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/posts/${post.id}/edit`} 
                          className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors inline-block shadow-2xs"
                        >
                          수정하기
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pin Settings Modal */}
      {selectedPostForPin && (
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          title="콘텐츠 1순위 상단 고정 설정"
          itemTitle={selectedPostForPin.title}
          currentIsPinned={selectedPostForPin.isPinned}
          currentPinUntil={selectedPostForPin.pinUntil}
          onSave={handleSavePin}
        />
      )}
    </div>
  );
}

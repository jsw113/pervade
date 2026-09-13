"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, BookOpen, Eye, EyeOff, Pin, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
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

interface GuideItem {
  id: string;
  title: string;
  summary?: string;
  content: string;
  category: string;
  thumbnailUrl?: string;
  viewCount?: number;
  published: boolean;
  order: number;
  isPinned: boolean;
  pinUntil?: string | Date | null;
  createdAt: string | Date;
  product?: { id: string; name: string; imageUrl?: string };
}

interface AdminPostsTableProps {
  initialPosts: PostItem[];
  initialGuides?: GuideItem[];
  initialType?: string;
}

export function AdminPostsTable({
  initialPosts,
  initialGuides = [],
  initialType = "ABOUT",
}: AdminPostsTableProps) {
  const [activeTab, setActiveTab] = useState<string>(initialType);
  const [posts, setPosts] = useState<PostItem[]>(sortPinnableContents(initialPosts));
  const [guides, setGuides] = useState<GuideItem[]>(sortPinnableContents(initialGuides));
  const [selectedItemForPin, setSelectedItemForPin] = useState<{
    id: string;
    title: string;
    isPinned: boolean;
    pinUntil?: any;
    isGuide?: boolean;
  } | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Instant 0ms Tab Switch Function (No full-page reload, no server roundtrip freeze)
  const handleTabChange = (tabVal: string) => {
    setActiveTab(tabVal);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("type", tabVal);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  };

  const isGuideTab = activeTab === "GUIDE";

  // Filtered posts for currently active post category
  const filteredPosts = posts.filter((p) => p.type === activeTab);

  // Dynamic Counts for each category
  const counts = {
    about: posts.filter((p) => p.type === "ABOUT").length,
    journal: posts.filter((p) => p.type === "JOURNAL").length,
    notice: posts.filter((p) => p.type === "NOTICE").length,
    guide: guides.length,
  };

  const createHref = isGuideTab
    ? "/admin/guides/new?returnType=GUIDE"
    : `/admin/posts/new?type=${activeTab}`;

  const handleOpenPinModal = (item: PostItem | GuideItem, isGuide: boolean) => {
    setSelectedItemForPin({
      id: item.id,
      title: item.title,
      isPinned: item.isPinned,
      pinUntil: item.pinUntil,
      isGuide,
    });
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (isPinned: boolean, pinUntil: string | null) => {
    if (!selectedItemForPin) return;

    try {
      if (selectedItemForPin.isGuide) {
        const res = await fetch(`/api/admin/guides/${selectedItemForPin.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned, pinUntil }),
        });
        if (!res.ok) throw new Error("가이드 고정 저장 실패");
        const updated = guides.map((g) =>
          g.id === selectedItemForPin.id ? { ...g, isPinned, pinUntil } : g
        );
        setGuides(sortPinnableContents(updated));
      } else {
        const res = await fetch(`/api/admin/posts/${selectedItemForPin.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned, pinUntil }),
        });
        if (!res.ok) throw new Error("콘텐츠 고정 저장 실패");
        const updated = posts.map((p) =>
          p.id === selectedItemForPin.id ? { ...p, isPinned, pinUntil } : p
        );
        setPosts(sortPinnableContents(updated));
      }
    } catch (err: any) {
      console.error(err);
      alert("고정 설정 중 오류가 발생했습니다: " + (err?.message || ""));
    }
  };

  const handleMovePostOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredPosts.length) return;

    const current = filteredPosts[index];
    const target = filteredPosts[targetIndex];

    const currentOrder = current.order ?? 0;
    const targetOrder = target.order ?? 0;

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

    const updatedPosts = posts.map((p) => {
      if (p.id === current.id) return { ...p, order: newCurrentOrder };
      if (p.id === target.id) return { ...p, order: newTargetOrder };
      return p;
    });

    setPosts(sortPinnableContents(updatedPosts));

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

  const handleMoveGuideOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= guides.length) return;

    const newGuides = [...guides];
    const current = newGuides[index];
    const target = newGuides[targetIndex];

    const currentOrder = current.order ?? 0;
    const targetOrder = target.order ?? 0;

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

    [newGuides[index], newGuides[targetIndex]] = [newGuides[targetIndex], newGuides[index]];
    setGuides(sortPinnableContents(newGuides));

    try {
      await Promise.all([
        fetch(`/api/admin/guides/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newCurrentOrder }),
        }),
        fetch(`/api/admin/guides/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newTargetOrder }),
        }),
      ]);
    } catch (e) {
      console.warn("Guide order save sync error:", e);
    }
  };

  const handleTogglePostPublish = async (post: PostItem) => {
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

  const handleToggleGuidePublish = async (guide: GuideItem) => {
    const newPublished = !guide.published;
    const updated = guides.map((g) =>
      g.id === guide.id ? { ...g, published: newPublished } : g
    );
    setGuides(updated);

    try {
      await fetch(`/api/admin/guides/${guide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newPublished }),
      });
    } catch (e) {
      console.warn("Guide publish toggle error:", e);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuide = async (id: string) => {
    if (!confirm("이 사용가이드 포스트를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/guides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuides(guides.filter((g) => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { label: "브랜드 스토리 (About)", val: "ABOUT", count: counts.about },
    { label: "저널 / 매거진 블로그 (Journal)", val: "JOURNAL", count: counts.journal },
    { label: "공지 & 뉴스 (Notice)", val: "NOTICE", count: counts.notice },
    { label: "사용 가이드 (Guide)", val: "GUIDE", count: counts.guide },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
            CONTENTS 관리 <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold">CMS</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            브랜드 스토리(About), 저널(Journal), 공지사항(Notice), 사용가이드(Guide)를 통합 관리합니다.
          </p>
        </div>
        <Link
          href={createHref}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isGuideTab ? "새 가이드 아티클 작성" : "새 콘텐츠 작성하기"}</span>
        </Link>
      </div>

      {/* Category Tabs (Strictly Category-only, 0ms Instant Switch) */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.val;
          return (
            <button
              key={tab.val}
              type="button"
              onClick={() => handleTabChange(tab.val)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Guide Banner */}
      <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-base">📌</span>
          <span>
            <strong>1순위 고정 기능:</strong> 특정 글을 상시 또는 지정 날짜까지 최상단에 고정할 수 있습니다.{" "}
            <strong>[▲/▼] 버튼</strong>으로 노출 순서를 즉시 재배치할 수 있습니다.
          </span>
        </div>
      </div>

      {/* Table: Guide or Post */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {isGuideTab ? (
            /* Guide Posts Table */
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">순서</th>
                  <th className="px-4 py-3.5 w-36">1순위 추천 고정</th>
                  <th className="px-6 py-3.5">가이드 아티클 정보</th>
                  <th className="px-4 py-3.5 w-28">공간 분류</th>
                  <th className="px-4 py-3.5 w-36">연결 제품</th>
                  <th className="px-4 py-3.5 w-24">조회수 / 작성일</th>
                  <th className="px-4 py-3.5 w-28">발행 상태</th>
                  <th className="px-6 py-3.5 text-right w-28">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {guides.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-zinc-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                      등록된 사용가이드 콘텐츠가 없습니다. 상단 버튼을 눌러 새 가이드를 작성해보세요.
                    </td>
                  </tr>
                ) : (
                  guides.map((guide, index) => {
                    const pinStatus = getPinStatusText(guide);
                    return (
                      <tr
                        key={guide.id}
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
                              onClick={() => handleMoveGuideOrder(index, "UP")}
                              disabled={index === 0}
                              className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                              title="위로 이동"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveGuideOrder(index, "DOWN")}
                              disabled={index === guides.length - 1}
                              className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                              title="아래로 이동"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-1">
                            #{guide.order ?? 0}
                          </div>
                        </td>

                        {/* 1st-Priority Pin */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleOpenPinModal(guide, true)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all w-full justify-center ${
                              pinStatus.isPinned
                                ? "bg-amber-600 text-white border-amber-600 shadow-2xs hover:bg-amber-700"
                                : pinStatus.isExpired
                                ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200"
                                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            <Pin
                              className={`w-3.5 h-3.5 ${
                                pinStatus.isPinned ? "fill-white text-white" : "text-zinc-400"
                              }`}
                            />
                            <span className="truncate">{pinStatus.label}</span>
                          </button>
                        </td>

                        {/* Title & Thumbnail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border">
                              {guide.thumbnailUrl ? (
                                <img
                                  src={guide.thumbnailUrl}
                                  alt={guide.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <div className="flex items-center gap-1.5">
                                {pinStatus.isPinned && (
                                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shrink-0">
                                    📌 1순위 추천
                                  </span>
                                )}
                                <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">
                                  {guide.title}
                                </h3>
                              </div>
                              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                {guide.summary || guide.content?.substring(0, 60)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-[10px] font-bold">
                            {guide.category}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-4 text-zinc-700 font-medium">
                          {guide.product?.name || (
                            <span className="text-zinc-400 text-[11px]">연결 없음</span>
                          )}
                        </td>

                        {/* ViewCount & Date */}
                        <td className="px-4 py-4 text-[11px] text-zinc-500">
                          <div>{guide.viewCount || 0}회</div>
                          <div className="text-zinc-400">
                            {new Date(guide.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Published State */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleGuidePublish(guide)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              guide.published
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                            }`}
                          >
                            {guide.published ? (
                              <Eye className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-zinc-400" />
                            )}
                            {guide.published ? "공개 발행" : "임시저장"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/guides/${guide.id}/edit?returnType=GUIDE`}
                              className="px-2.5 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors inline-block shadow-2xs"
                            >
                              수정
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteGuide(guide.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Post Table (ABOUT, JOURNAL, NOTICE) */
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">순서</th>
                  <th className="px-4 py-3.5 w-36">1순위 상단 고정</th>
                  <th className="px-6 py-3.5">콘텐츠 제목 &amp; 요약</th>
                  <th className="px-4 py-3.5 w-28">분류 / 채널</th>
                  <th className="px-4 py-3.5 w-28">발행 상태</th>
                  <th className="px-4 py-3.5 w-24">작성일</th>
                  <th className="px-6 py-3.5 text-right w-28">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-zinc-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                      이 분류에 등록된 콘텐츠가 없습니다. 상단 버튼을 눌러 새 글을 작성해보세요.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post, index) => {
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
                              onClick={() => handleMovePostOrder(index, "UP")}
                              disabled={index === 0}
                              className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-20 text-zinc-600 transition-colors"
                              title="위로 이동"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePostOrder(index, "DOWN")}
                              disabled={index === filteredPosts.length - 1}
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
                            onClick={() => handleOpenPinModal(post, false)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all w-full justify-center ${
                              pinStatus.isPinned
                                ? "bg-amber-600 text-white border-amber-600 shadow-2xs hover:bg-amber-700"
                                : pinStatus.isExpired
                                ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200"
                                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            <Pin
                              className={`w-3.5 h-3.5 ${
                                pinStatus.isPinned ? "fill-white text-white" : "text-zinc-400"
                              }`}
                            />
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
                            <span className="font-bold text-sm text-zinc-900 line-clamp-1">
                              {post.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-mono">
                            {post.content.substring(0, 80)}
                          </div>
                        </td>

                        {/* Channel Type */}
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-block ${
                              post.type === "ABOUT"
                                ? "bg-amber-100 text-amber-900"
                                : post.type === "JOURNAL"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            {post.type === "ABOUT"
                              ? "브랜드 스토리"
                              : post.type === "JOURNAL"
                              ? "저널 블로그"
                              : post.type === "NOTICE"
                              ? "공지사항"
                              : post.type}
                          </span>
                        </td>

                        {/* Published State Toggle */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePostPublish(post)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              post.published
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                            }`}
                          >
                            {post.published ? (
                              <Eye className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-zinc-400" />
                            )}
                            {post.published ? "공개 발행" : "임시저장"}
                          </button>
                        </td>

                        {/* Created At */}
                        <td className="px-4 py-4 text-zinc-400 text-[11px]">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/posts/${post.id}/edit?returnType=${activeTab}`}
                              className="px-2.5 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors inline-block shadow-2xs"
                            >
                              수정
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pin Settings Modal */}
      {selectedItemForPin && (
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          title={
            selectedItemForPin.isGuide
              ? "가이드 1순위 추천 고정 설정"
              : "콘텐츠 1순위 상단 고정 설정"
          }
          itemTitle={selectedItemForPin.title}
          currentIsPinned={selectedItemForPin.isPinned}
          currentPinUntil={selectedItemForPin.pinUntil}
          onSave={handleSavePin}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("ABOUT");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent, published: boolean) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, content, published }),
      });
      
      if (!res.ok) throw new Error("Failed to save post");
      
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6 max-w-4xl bg-white p-6 rounded-xl border shadow-sm" onSubmit={(e) => handleSubmit(e, true)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">제목</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="게시물 제목을 입력하세요"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">분류</label>
        <select 
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ABOUT">브랜드 소개 (About)</option>
          <option value="PRODUCT">제품 설명 (Products)</option>
          <option value="JOURNAL">저널 / 게시판 (Journal)</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">내용 (Markdown 지원)</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={15}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="여기에 내용을 작성하세요..."
        />
        <p className="text-xs text-muted-foreground">
          * 간단한 위지윅 에디터 대신 임시로 마크다운 입력기를 사용합니다. 추후 Tiptap 등으로 교체 가능합니다.
        </p>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button 
          type="button" 
          onClick={(e) => handleSubmit(e, false)}
          disabled={isSubmitting}
          className="px-6 py-2 border rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          임시저장
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          발행하기
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefill = params.get("prefill");
      if (prefill) {
        setTitle(prefill);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isSecret }),
      });

      if (response.ok) {
        alert("문의가 성공적으로 등록되었습니다.");
        router.push("/contact");
        router.refresh();
      } else {
        alert("등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/contact" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">1:1 문의하기</h1>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">제목</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="문의 제목을 입력해주세요"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">내용</label>
            <textarea 
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="제품 관련 문의, 배송/교환/반품 등 궁금하신 점을 상세히 적어주세요."
              className="w-full h-48 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="secret"
              checked={isSecret}
              onChange={e => setIsSecret(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-primary"
            />
            <label htmlFor="secret" className="text-sm font-medium">
              비밀글로 등록하기 (관리자와 작성자만 볼 수 있습니다)
            </label>
          </div>
          
          <div className="pt-4 flex gap-4">
            <Link 
              href="/contact"
              className="flex-1 py-3 text-center border rounded-lg font-medium hover:bg-zinc-50 transition-colors"
            >
              취소
            </Link>
            <button 
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-lg font-medium hover:bg-black/90 transition-colors"
            >
              문의 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles, Check, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    if (!confirm("클라우드 DB에 기본 상품(2종), 프로모션 배너, 사용가이드(3편), 운영 정책 데이터를 자동으로 채우시겠습니까?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed");
      const data = await res.json();
      if (res.ok) {
        alert("기본 데이터가 성공적으로 생성되었습니다!");
        router.refresh();
      } else {
        alert("오류: " + (data.error || "실패했습니다."));
      }
    } catch (e: any) {
      alert("오류가 발생했습니다: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
    >
      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {loading ? "데이터 채우는 중..." : "🌱 기본 샘플 데이터 자동 채우기"}
    </button>
  );
}

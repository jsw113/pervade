"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        alert("로그인되었습니다.");
        router.push("/mypage");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulated Social Login (Google, Naver, Kakao)
  const handleSocialLogin = async (provider: "GOOGLE" | "NAVER" | "KAKAO") => {
    setIsSubmitting(true);
    
    // For mockup login, we fetch/create a user with a fixed email or similar
    const mockEmail = `social_${provider.toLowerCase()}_test@example.com`;
    const mockName = `${provider.charAt(0) + provider.slice(1).toLowerCase()} 테스트유저`;
    const mockSocialId = `id_test_${provider.toLowerCase()}`;

    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          email: mockEmail,
          name: mockName,
          socialId: mockSocialId
        })
      });

      if (response.ok) {
        alert(`${provider} 간편 로그인 완료!`);
        router.push("/mypage");
        router.refresh();
      } else {
        alert(`${provider} 간편 로그인에 실패했습니다.`);
      }
    } catch (err) {
      console.error(err);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-zinc-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">로그인</h1>
          <p className="text-xs text-zinc-500">퍼베이드에 오신 것을 환영합니다.</p>
        </div>

        {/* Social Logins */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
            간편 로그인
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSocialLogin("GOOGLE")}
              disabled={isSubmitting}
              className="py-2.5 px-2 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-lg text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="text-red-500 font-extrabold text-sm">G</span> Google
            </button>
            <button
              onClick={() => handleSocialLogin("NAVER")}
              disabled={isSubmitting}
              className="py-2.5 px-2 bg-[#03C75A] text-white font-bold rounded-lg text-xs hover:bg-[#02B14F] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="font-extrabold text-sm">N</span> Naver
            </button>
            <button
              onClick={() => handleSocialLogin("KAKAO")}
              disabled={isSubmitting}
              className="py-2.5 px-2 bg-[#FEE500] text-[#191919] font-bold rounded-lg text-xs hover:bg-[#F2DA00] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="font-extrabold text-sm">K</span> Kakao
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold text-zinc-400 uppercase">또는 일반 로그인</span>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-zinc-800 text-sm bg-zinc-50" 
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-zinc-800 text-sm bg-zinc-50" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-zinc-950 text-white rounded-lg font-bold hover:bg-zinc-800 transition-colors mt-6 disabled:opacity-50"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground">
          계정이 없으신가요? <Link href="/signup" className="text-zinc-950 font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

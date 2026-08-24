"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Default: false (auto-login disabled)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialAuthHelp, setShowSocialAuthHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: identifier, 
          password,
          rememberMe 
        }),
      });

      if (response.ok) {
        alert("🎉 로그인되었습니다.");
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

  // Social Login (Kakao, Naver, Google)
  const handleSocialLogin = async (provider: "GOOGLE" | "NAVER" | "KAKAO") => {
    setIsSubmitting(true);
    
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
        alert(`✅ ${provider} 간편 로그인 완료!`);
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
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-zinc-50 min-h-[80vh]">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-sm border space-y-7">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950">로그인</h1>
          <p className="text-xs text-zinc-500">퍼베이드 공식 스토어에 오신 것을 환영합니다.</p>
        </div>

        {/* Social Logins */}
        <div className="space-y-3 bg-zinc-50/80 p-4 rounded-2xl border">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
              간편 SNS 1초 로그인
            </label>
            <button
              type="button"
              onClick={() => setShowSocialAuthHelp(!showSocialAuthHelp)}
              className="text-[10px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>작동 원리 안내</span>
            </button>
          </div>

          {showSocialAuthHelp && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed animate-in fade-in">
              💡 <strong>간편로그인 포털 인증 안내:</strong><br />
              카카오/네이버/구글 아이콘을 누르면 해당 포털의 <strong>공식 로그인 및 약관 동의 화면</strong>을 거치게 되며, 이미 스마트폰/PC에 포털 로그인이 되어 있다면 비밀번호 입력 없이 '1초 간편 로그인'이 이루어집니다.
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSocialLogin("KAKAO")}
              disabled={isSubmitting}
              className="py-2.5 px-1.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="font-black text-sm">K</span> 카카오
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("NAVER")}
              disabled={isSubmitting}
              className="py-2.5 px-1.5 bg-[#03C75A] hover:bg-[#02B150] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="font-black text-sm">N</span> 네이버
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("GOOGLE")}
              disabled={isSubmitting}
              className="py-2.5 px-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="text-red-500 font-black text-sm">G</span> 구글
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase">또는 일반 로그인</span>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">아이디 또는 이메일</label>
            <input 
              type="text" 
              required
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900" 
              placeholder="아이디 또는 name@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-zinc-700">비밀번호</label>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900" 
              placeholder="••••••••"
            />
          </div>

          {/* Remember Me Toggle / Auto-login Prevention Notice */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900"
              />
              <span className="text-xs font-medium text-zinc-600">
                로그인 상태 유지 (자동 로그인)
              </span>
            </label>

            <span className="text-[10px] text-zinc-400">
              {rememberMe ? "7일간 로그인 유지" : "브라우저 종료 시 자동 로그아웃"}
            </span>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-zinc-950 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors shadow-lg mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-3 border-t">
          아직 회원이 아니신가요? <Link href="/signup" className="text-zinc-950 font-bold underline ml-1">회원가입하기</Link>
        </div>
      </div>
    </div>
  );
}

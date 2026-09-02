"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, HelpCircle, Check, X, Shield, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialAuthHelp, setShowSocialAuthHelp] = useState(false);

  // Load saved ID on mount and clear password
  useEffect(() => {
    setPassword("");
    try {
      const savedId = localStorage.getItem("pervade_saved_id");
      if (savedId) {
        setIdentifier(savedId);
        setRememberId(true);
      }
    } catch (e) {}
  }, []);

  // Social Auth Modal State
  const [socialModalProvider, setSocialModalProvider] = useState<"KAKAO" | "NAVER" | "GOOGLE" | null>(null);
  const [socialEmail, setSocialEmail] = useState("");
  const [socialName, setSocialName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert("아이디 또는 이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

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
        const data = await response.json();
        if (data.user) {
          try {
            localStorage.removeItem("pervade_user");
            sessionStorage.setItem("pervade_user", JSON.stringify(data.user));
            
            // Save or clear Remember ID
            if (rememberId) {
              localStorage.setItem("pervade_saved_id", identifier);
            } else {
              localStorage.removeItem("pervade_saved_id");
            }
          } catch (e) {}
        }
        alert("🎉 로그인되었습니다.");
        const isAdmin = data.user?.role === "ADMIN" || data.user?.role === "SUPER_ADMIN" || data.user?.role?.startsWith("MANAGER") || data.user?.loginId === "admin";
        const destination = redirectUrl || (isAdmin ? "/admin" : "/");
        window.location.href = destination;
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

  // Open Social Auth Consent Window
  const openSocialAuthModal = (provider: "KAKAO" | "NAVER" | "GOOGLE") => {
    const statePayload = encodeURIComponent(JSON.stringify({ redirect: redirectUrl || "/" }));

    if (provider === "NAVER") {
      // Official Naver 1-second Instant OAuth Login
      const redirectUri = encodeURIComponent("https://www.pervade.co.kr/api/auth/callback/naver");
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=eXWsUTMyQs5043_PJBu5&redirect_uri=${redirectUri}&state=${statePayload}`;
      window.location.href = naverAuthUrl;
      return;
    }

    if (provider === "KAKAO") {
      // Official Kakao 1-second Instant OAuth Login
      const redirectUri = encodeURIComponent("https://www.pervade.co.kr/api/auth/callback/kakao");
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=969600098ed590f4f84f68fce837fe8a&redirect_uri=${redirectUri}&response_type=code&state=${statePayload}`;
      window.location.href = kakaoAuthUrl;
      return;
    }

    if (provider === "GOOGLE") {
      // Official Google 1-second Instant OAuth Login
      window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl || "/")}`;
      return;
    }

    setSocialModalProvider(provider);
    setSocialName("소셜 고객");
    setSocialEmail("customer@example.com");
  };

  // Submit Social Login
  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialModalProvider || !socialEmail.trim() || !socialName.trim()) {
      alert("이름과 이메일을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const provider = socialModalProvider;
    const mockSocialId = `soc_${provider.toLowerCase()}_${socialEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;

    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          email: socialEmail.trim(),
          name: socialName.trim(),
          socialId: mockSocialId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          try {
            localStorage.removeItem("pervade_user");
            sessionStorage.setItem("pervade_user", JSON.stringify(data.user));
          } catch (e) {}
        }
        alert(`✅ ${provider} 간편 로그인 완료! (${data.user?.name || socialName}님 환영합니다)`);
        setSocialModalProvider(null);
        window.location.href = redirectUrl || "/";
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
              💡 <strong>간편 SNS 로그인 작동 프로세스:</strong><br />
              카카오/네이버/구글 아이콘을 누르면 <strong>공식 OAuth 약관 동의 및 프로필 연동 화면</strong>이 실행됩니다. 기존 회원은 비밀번호 없이 바로 로그인되며, 처음 이용하시는 고객은 별도 복잡한 가입 절차 없이 1초 만에 계정이 자동 연결됩니다.
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => openSocialAuthModal("KAKAO")}
              disabled={isSubmitting}
              className="py-2.5 px-1.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="font-black text-sm">K</span> 카카오 로그인
            </button>
            <button
              type="button"
              onClick={() => openSocialAuthModal("NAVER")}
              disabled={isSubmitting}
              className="py-2.5 px-1.5 bg-[#03C75A] hover:bg-[#02B150] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="font-black text-sm">N</span> 네이버 로그인
            </button>
            <button
              type="button"
              onClick={() => openSocialAuthModal("GOOGLE")}
              disabled={isSubmitting}
              className="py-2.5 px-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="text-red-500 font-black text-sm">G</span> 구글 로그인
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
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">아이디 또는 이메일</label>
            <input 
              type="text" 
              required
              autoComplete="username"
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
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono" 
              placeholder="••••••••"
            />
          </div>

          {/* Remember ID & Remember Me Toggles */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberId}
                onChange={e => setRememberId(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900 cursor-pointer"
              />
              <span className="font-medium text-zinc-700">
                아이디 저장
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900 cursor-pointer"
              />
              <span className="text-zinc-500">
                로그인 상태 유지
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? "로그인 중..." : "로그인하기"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t flex items-center justify-center gap-1">
          <span>아직 회원이 아니신가요?</span>
          <Link href="/signup" className="font-bold text-zinc-950 hover:underline">
            회원가입
          </Link>
        </div>
      </div>

      {/* Social OAuth Consent & Authorization Window */}
      {socialModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border">
            
            {/* Header with Provider Branding */}
            <div className={`p-6 text-center ${
              socialModalProvider === "KAKAO" 
                ? "bg-[#FEE500] text-[#191919]" 
                : socialModalProvider === "NAVER" 
                ? "bg-[#03C75A] text-white" 
                : "bg-zinc-900 text-white"
            }`}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md mb-2 font-black text-xl text-zinc-900">
                {socialModalProvider === "KAKAO" ? "K" : socialModalProvider === "NAVER" ? "N" : "G"}
              </div>
              <h2 className="text-base font-black">
                {socialModalProvider === "KAKAO" ? "카카오" : socialModalProvider === "NAVER" ? "네이버" : "구글"} 계정 간편 로그인
              </h2>
              <p className="text-[11px] opacity-80 mt-0.5">PERVADE 공식 스토어와 안전하게 연동합니다</p>
            </div>

            {/* Body */}
            <form onSubmit={handleSocialSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 border rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>제공 동의 항목 (필수)</span>
                </div>
                <div className="text-[10px] text-zinc-500 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-700">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>프로필 정보 (닉네임/이름)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-700">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>카카오/네이버 계정 이메일</span>
                  </div>
                </div>
              </div>

              {/* Editable Profile Inputs to test custom accounts */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">SNS 닉네임 / 성명</label>
                  <input
                    type="text"
                    required
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">SNS 연동 이메일</label>
                  <input
                    type="email"
                    required
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSocialModalProvider(null)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 font-black rounded-xl shadow-md transition-colors cursor-pointer ${
                    socialModalProvider === "KAKAO"
                      ? "bg-[#FEE500] hover:bg-[#FDD835] text-[#191919]"
                      : socialModalProvider === "NAVER"
                      ? "bg-[#03C75A] hover:bg-[#02B150] text-white"
                      : "bg-zinc-950 hover:bg-zinc-800 text-white"
                  }`}
                >
                  {isSubmitting ? "연동 처리 중..." : "동의하고 로그인"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-zinc-400 font-bold text-xs">페이지를 불러오는 중입니다...</div>}>
      <LoginForm />
    </Suspense>
  );
}

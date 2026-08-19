"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  
  // Normal Signup States
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [consent, setConsent] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId,
          name,
          email,
          password,
          phone,
          birthDate,
          address,
          consent
        }),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        router.push("/mypage");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "회원가입에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulated Social Signups (Google, Naver, Kakao)
  const handleSocialSignup = async (provider: "GOOGLE" | "NAVER" | "KAKAO") => {
    setIsSubmitting(true);
    
    // Mock user details based on provider
    const mockEmail = `social_${provider.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}@example.com`;
    const mockName = `${provider.charAt(0) + provider.slice(1).toLowerCase()} 유저`;
    const mockSocialId = `id_${Math.floor(1000000000 + Math.random() * 9000000000)}`;

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
        alert(`${provider} 간편 가입 및 로그인이 완료되었습니다!`);
        router.push("/mypage");
        router.refresh();
      } else {
        alert(`${provider} 간편 가입에 실패했습니다.`);
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-zinc-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">회원가입</h1>
          <p className="text-xs text-zinc-500">퍼베이드 회원이 되어 프리미엄 가치를 경험해 보세요.</p>
        </div>

        {/* Social Signups */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
            간편 회원가입 / 로그인
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSocialSignup("GOOGLE")}
              disabled={isSubmitting}
              className="py-2.5 px-2 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-lg text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="text-red-500 font-extrabold text-sm">G</span> Google
            </button>
            <button
              onClick={() => handleSocialSignup("NAVER")}
              disabled={isSubmitting}
              className="py-2.5 px-2 bg-[#03C75A] text-white font-bold rounded-lg text-xs hover:bg-[#02B14F] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="font-extrabold text-sm">N</span> Naver
            </button>
            <button
              onClick={() => handleSocialSignup("KAKAO")}
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
          <span className="relative bg-white px-4 text-xs font-bold text-zinc-400 uppercase">또는 일반가입</span>
        </div>
        
        {/* Regular Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">아이디 *</label>
              <input 
                type="text" 
                required
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
                placeholder="id_pervade"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">이름 *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
                placeholder="홍길동"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">이메일 *</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">비밀번호 *</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">연락처</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">생년월일</label>
              <input 
                type="date" 
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">주소</label>
            <input 
              type="text" 
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800" 
              placeholder="예: 서울시 강남구 테헤란로 123 (상세주소 포함)"
            />
          </div>
          
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
              <input 
                type="checkbox" 
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="w-4 h-4 text-zinc-800 rounded border-zinc-300 focus:ring-zinc-800"
              />
              <span className="text-xs font-medium text-zinc-600">마케팅 정보 수신 동의 (알림톡, 문자, 이메일)</span>
            </label>
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors mt-6 disabled:opacity-50"
          >
            {isSubmitting ? "가입 처리 중..." : "가입하기"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요? <Link href="/login" className="text-zinc-950 font-bold hover:underline">로그인</Link>
        </div>
      </div>
    </div>
  );
}

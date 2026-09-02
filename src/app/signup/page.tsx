"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertCircle, ShieldCheck, UserCheck, Lock, Mail, Phone, MapPin, Calendar, HelpCircle, Info } from "lucide-react";
import { AddressSearch } from "@/components/common/AddressSearch";
import { BirthDateSelect } from "@/components/common/BirthDateSelect";

export default function SignupPage() {
  const router = useRouter();
  
  // Form States
  const [loginId, setLoginId] = useState("");
  const [idCheckStatus, setIdCheckStatus] = useState<{ checked: boolean; available?: boolean; message?: string }>({
    checked: false
  });
  const [isCheckingId, setIsCheckingId] = useState(false);

  const [name, setName] = useState("");
  
  const [email, setEmail] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState<{ checked: boolean; available?: boolean; message?: string }>({
    checked: false
  });
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [consent, setConsent] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialAuthHelp, setShowSocialAuthHelp] = useState(false);

  // 1. ID Check logic
  const handleCheckId = async () => {
    if (!loginId.trim()) {
      setIdCheckStatus({ checked: true, available: false, message: "아이디를 입력해주세요." });
      return;
    }

    const idRegex = /^[a-zA-Z0-9_-]{4,20}$/;
    if (!idRegex.test(loginId.trim())) {
      setIdCheckStatus({ 
        checked: true, 
        available: false, 
        message: "아이디는 4~20자의 영문, 숫자, 특수문자(_,-)만 사용 가능합니다." 
      });
      return;
    }

    setIsCheckingId(true);
    try {
      const res = await fetch("/api/auth/check-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim() }),
      });
      const data = await res.json();
      setIdCheckStatus({ checked: true, available: data.available, message: data.message });
    } catch (e) {
      setIdCheckStatus({ checked: true, available: false, message: "확인 중 오류가 발생했습니다." });
    } finally {
      setIsCheckingId(false);
    }
  };

  // 2. Email Check logic
  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setEmailCheckStatus({ checked: true, available: false, message: "이메일 주소를 입력해주세요." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailCheckStatus({ 
        checked: true, 
        available: false, 
        message: "올바른 이메일 형식(예: name@example.com)을 입력해주세요." 
      });
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setEmailCheckStatus({ checked: true, available: data.available, message: data.message });
    } catch (e) {
      setEmailCheckStatus({ checked: true, available: false, message: "확인 중 오류가 발생했습니다." });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Reset check status when user changes inputs
  useEffect(() => {
    setIdCheckStatus({ checked: false });
  }, [loginId]);

  useEffect(() => {
    setEmailCheckStatus({ checked: false });
  }, [email]);

  // Password matching & strength verification (6 chars or more)
  const isPasswordLongEnough = password.length >= 6;
  const isPasswordAlphaNum = /[a-zA-Z0-9]/.test(password);
  const isPasswordMatched = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm;
  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  // Form Submit
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCheckStatus.checked || !idCheckStatus.available) {
      alert("아이디 중복확인을 진행해주세요.");
      return;
    }

    if (!emailCheckStatus.checked || !emailCheckStatus.available) {
      alert("이메일 유효성 확인을 진행해주세요.");
      return;
    }

    if (!isPasswordLongEnough) {
      alert("비밀번호는 최소 6자 이상 입력해주세요.");
      return;
    }

    if (!isPasswordAlphaNum) {
      alert("비밀번호는 영문(대소문자 구분) 또는 숫자를 포함해야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: loginId.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          birthDate,
          address,
          consent
        }),
      });

      const data = await response.json();
      if (response.ok && !data.error) {
        if (data.user) {
          try {
            localStorage.removeItem("pervade_user");
            sessionStorage.setItem("pervade_user", JSON.stringify(data.user));
          } catch (e) {}
        }
        alert("🎉 퍼베이드 회원가입이 완료되었습니다!\n가입 축하 적립금 3,000P가 지급되었습니다. 마이페이지로 이동합니다.");
        window.location.href = "/mypage";
      } else {
        alert("회원가입 실패: " + (data.error || "알 수 없는 오류가 발생했습니다."));
      }
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Social Signup Handler
  const handleSocialSignup = async (provider: "GOOGLE" | "NAVER" | "KAKAO") => {
    const statePayload = encodeURIComponent(JSON.stringify({ redirect: "/" }));

    if (provider === "NAVER") {
      // Official Naver OAuth with explicit auth_type=reprompt (Forces Naver to display login/consent window)
      const redirectUri = encodeURIComponent("https://www.pervade.co.kr/api/auth/callback/naver");
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=eXWsUTMyQs5043_PJBu5&redirect_uri=${redirectUri}&state=${statePayload}&auth_type=reprompt`;
      window.location.href = naverAuthUrl;
      return;
    }

    if (provider === "KAKAO") {
      // Official Kakao OAuth with prompt=login (Forces Kakao to prompt user for credentials)
      const redirectUri = encodeURIComponent("https://www.pervade.co.kr/api/auth/callback/kakao");
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=969600098ed590f4f84f68fce837fe8a&redirect_uri=${redirectUri}&response_type=code&state=${statePayload}&prompt=login`;
      window.location.href = kakaoAuthUrl;
      return;
    }

    if (provider === "GOOGLE") {
      // Official Google 1-second Instant OAuth Signup & Login
      window.location.href = "/api/auth/google?redirect=/";
      return;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-zinc-50 min-h-[85vh]">
      <div className="w-full max-w-xl bg-white p-6 sm:p-10 rounded-3xl shadow-sm border space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">회원가입</h1>
          <p className="text-xs text-zinc-500">
            퍼베이드 공식 회원이 되시면 신규 가입 웰컴 포인트와 구매 적립 혜택을 받으실 수 있습니다.
          </p>
        </div>

        {/* Real-Name Verification Benefit Notice */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs text-emerald-950 space-y-0.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>💡 본인인증(실명인증) 완료 시 특별 혜택</span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">5% 적립</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
              회원가입 후 [마이페이지] 또는 [주문 결제] 단계에서 <strong>PASS 휴대폰 본인인증(실명인증)</strong>을 완료하시면, 모든 제품 구매 시 <strong>결제 금액의 5% 즉시 포인트 적립</strong> 및 <strong>안전 결제 보호 혜택</strong>이 적용됩니다.
            </p>
          </div>
        </div>

        {/* 1. Social Quick Signup */}
        <div className="space-y-3 bg-zinc-50/80 p-5 rounded-2xl border">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              간편 SNS 회원가입 / 로그인
            </label>
            <button
              type="button"
              onClick={() => setShowSocialAuthHelp(!showSocialAuthHelp)}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>간편인증 안내</span>
            </button>
          </div>

          {showSocialAuthHelp && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed animate-in fade-in">
              💡 <strong>간편로그인 작동 원리:</strong><br />
              카카오/네이버/구글 아이콘 클릭 시 해당 포털의 <strong>공식 로그인/동의 창</strong>이 열리며, 포털에 로그인된 계정 정보를 통해 별도의 복잡한 회원가입 양식 입력 없이 1초 만에 안전하게 자동 가입 및 로그인됩니다.
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialSignup("KAKAO")}
              disabled={isSubmitting}
              className="py-3 px-2 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span className="font-black text-sm">K</span> 카카오 1초 가입
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignup("NAVER")}
              disabled={isSubmitting}
              className="py-3 px-2 bg-[#03C75A] hover:bg-[#02B150] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span className="font-black text-sm">N</span> 네이버 가입
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignup("GOOGLE")}
              disabled={isSubmitting}
              className="py-3 px-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span className="text-red-500 font-black text-sm">G</span> 구글 가입
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold text-zinc-400 uppercase">또는 일반 정보로 가입</span>
        </div>
        
        {/* 2. Regular Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* ID with Duplicate Check */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              아이디 * <span className="text-[10px] text-zinc-400 font-normal">(4~20자 영문, 숫자, 특수문자 _ -)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 ${
                    idCheckStatus.checked 
                      ? idCheckStatus.available ? "border-emerald-500 focus:ring-emerald-500" : "border-rose-500 focus:ring-rose-500"
                      : "focus:ring-zinc-900"
                  }`} 
                  placeholder="예: pervade_user"
                />
              </div>
              <button
                type="button"
                onClick={handleCheckId}
                disabled={isCheckingId || !loginId.trim()}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0 shadow-2xs cursor-pointer"
              >
                {isCheckingId ? "확인중..." : "중복 확인"}
              </button>
            </div>
            {idCheckStatus.checked && (
              <div className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1 ${
                idCheckStatus.available ? "text-emerald-600" : "text-rose-600"
              }`}>
                {idCheckStatus.available ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>{idCheckStatus.message}</span>
              </div>
            )}
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">이름 (실명) *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900" 
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">휴대폰 번호 *</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900" 
                placeholder="010-1234-5678"
              />
            </div>
          </div>

          {/* Email with Regex & Duplicate Check */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              이메일 주소 * <span className="text-[10px] text-zinc-400 font-normal">(주문 내역 및 안내 발송)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 ${
                    emailCheckStatus.checked 
                      ? emailCheckStatus.available ? "border-emerald-500 focus:ring-emerald-500" : "border-rose-500 focus:ring-rose-500"
                      : "focus:ring-zinc-900"
                  }`} 
                  placeholder="name@example.com"
                />
              </div>
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={isCheckingEmail || !email.trim()}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0 shadow-2xs cursor-pointer"
              >
                {isCheckingEmail ? "확인중..." : "이메일 검증"}
              </button>
            </div>
            {emailCheckStatus.checked && (
              <div className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1 ${
                emailCheckStatus.available ? "text-emerald-600" : "text-rose-600"
              }`}>
                {emailCheckStatus.available ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>{emailCheckStatus.message}</span>
              </div>
            )}
          </div>

          {/* Password & Password Confirm (2-Step Verification) */}
          <div className="space-y-3 p-4 bg-zinc-50 rounded-2xl border">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-zinc-700">비밀번호 *</label>
                <span className={`text-[10px] font-semibold ${isPasswordLongEnough ? "text-emerald-600" : "text-zinc-400"}`}>
                  {isPasswordLongEnough ? "✓ 6자 이상 충족" : "6자 이상 입력 필요"}
                </span>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900" 
                placeholder="비밀번호 (영문, 숫자 포함 6자 이상)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">비밀번호 확인 (2회 입력 검증) *</label>
              <input 
                type="password" 
                required
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  isPasswordMatched 
                    ? "border-emerald-500 focus:ring-emerald-500" 
                    : isPasswordMismatch 
                    ? "border-rose-500 focus:ring-rose-500" 
                    : "focus:ring-zinc-900"
                }`} 
                placeholder="비밀번호를 동일하게 다시 입력하세요"
              />
              
              {/* Match Indicator Badge */}
              {isPasswordMatched && (
                <div className="mt-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>비밀번호가 일치합니다.</span>
                </div>
              )}
              {isPasswordMismatch && (
                <div className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  <span>비밀번호가 일치하지 않습니다. 다시 확인해주세요.</span>
                </div>
              )}
            </div>
          </div>

          {/* Birthday 3-Dropdown Select */}
          <BirthDateSelect 
            value={birthDate}
            onChange={(dateStr) => setBirthDate(dateStr)}
          />

          {/* Daum / Kakao Postcode Address Search */}
          <AddressSearch 
            value={address}
            onChange={(fullAddress) => setAddress(fullAddress)}
          />
          
          {/* Consent */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
              <input 
                type="checkbox" 
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900"
              />
              <div className="text-xs">
                <span className="font-bold text-zinc-800">[선택] 마케팅 및 프로모션 혜택 알림 수신 동의</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">신규 가이드 발행 및 회원 전용 특가 쿠폰 정보를 알림톡/문자로 받아봅니다.</p>
              </div>
            </label>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting || !idCheckStatus.available || !emailCheckStatus.available || !isPasswordMatched}
            className="w-full py-4 bg-zinc-950 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "가입 정보 저장 중..." : "퍼베이드 회원가입 완료"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t">
          이미 계정이 있으신가요? <Link href="/login" className="text-zinc-950 font-bold underline ml-1">로그인하기</Link>
        </div>
      </div>
    </div>
  );
}

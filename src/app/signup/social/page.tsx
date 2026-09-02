"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  Gift, 
  ArrowRight,
  HelpCircle,
  Calendar
} from "lucide-react";
import { AddressSearch } from "@/components/common/AddressSearch";
import { BirthDateSelect } from "@/components/common/BirthDateSelect";

function SocialSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const redirectUrl = searchParams.get("redirect") || "";

  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState("");
  
  // Social profile verified state
  const [socialProvider, setSocialProvider] = useState<string>("KAKAO");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  
  // Form fields
  const [loginId, setLoginId] = useState("");
  const [idCheckStatus, setIdCheckStatus] = useState<{ checked: boolean; available?: boolean; message?: string }>({
    checked: false
  });
  const [isCheckingId, setIsCheckingId] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenError("간편인증 정보가 없습니다. 로그인 페이지에서 간편인증을 다시 시도해주세요.");
      setIsLoadingToken(false);
      return;
    }

    async function loadTokenInfo() {
      try {
        const res = await fetch("/api/auth/social/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (res.ok && data.success && data.profile) {
          setSocialProvider(data.profile.socialProvider);
          setVerifiedEmail(data.profile.email || "");
          setName(data.profile.name || "");
          setPhone(data.profile.phone || "");
          setBirthDate(data.profile.birthDate || "");
          
          // Auto-suggest initial loginId from email prefix
          if (data.profile.email) {
            const prefix = data.profile.email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "");
            if (prefix.length >= 4) {
              setLoginId(prefix);
            }
          }
        } else {
          setTokenError(data.error || "간편인증 세션이 만료되었습니다. 다시 시도해주세요.");
        }
      } catch (err) {
        setTokenError("인증 정보를 불러오는 중 통신 오류가 발생했습니다.");
      } finally {
        setIsLoadingToken(false);
      }
    }

    loadTokenInfo();
  }, [token]);

  // 2. ID Check logic
  const handleCheckId = async () => {
    if (!loginId.trim()) {
      setIdCheckStatus({ checked: true, available: false, message: "희망 아이디를 입력해주세요." });
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

  // 3. Select all terms
  const allAgreed = agreeTerms && agreePrivacy && agreeMarketing;
  const toggleAllAgree = () => {
    const nextVal = !allAgreed;
    setAgreeTerms(nextVal);
    setAgreePrivacy(nextVal);
    setAgreeMarketing(nextVal);
  };

  // 4. Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("인증 토큰이 유효하지 않습니다.");
      return;
    }

    if (!idCheckStatus.checked || !idCheckStatus.available) {
      alert("사용자 아이디(ID) 중복 확인을 진행해주세요.");
      return;
    }

    if (!name.trim()) {
      alert("회원명을 입력해주세요.");
      return;
    }

    if (password && password.length < 6) {
      alert("비밀번호는 6자리 이상으로 설정해주세요.");
      return;
    }

    if (password && password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      alert("서비스 이용약관 및 개인정보 처리방침에 모두 동의하셔야 가입이 가능합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          loginId: loginId.trim(),
          name: name.trim(),
          password: password || undefined,
          phone: phone.trim(),
          birthDate: birthDate.trim(),
          address: address.trim(),
          consent: agreeMarketing,
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "🎉 회원가입이 완료되었습니다!");
        if (data.user) {
          try {
            sessionStorage.setItem("pervade_user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("pervade_auth_update"));
          } catch (e) {}
        }
        
        // Redirect to origin menu or /
        const destination = redirectUrl || "/";
        window.location.href = destination;
      } else {
        alert(data.error || "회원가입 처리 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      alert("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingToken) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-zinc-600">간편인증 정보를 안전하게 확인하는 중입니다...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950">간편인증 세션 안내</h2>
        <p className="text-xs text-zinc-600 leading-relaxed">{tokenError}</p>
        <div className="pt-2">
          <Link
            href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="inline-flex items-center justify-center w-full py-3.5 bg-zinc-950 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors"
          >
            로그인 및 간편인증 다시 시도
          </Link>
        </div>
      </div>
    );
  }

  const providerLabel = 
    socialProvider === "KAKAO" ? "카카오 (Kakao)" :
    socialProvider === "NAVER" ? "네이버 (Naver)" :
    socialProvider === "GOOGLE" ? "구글 (Google)" : "간편인증";

  const providerBadgeColor = 
    socialProvider === "KAKAO" ? "bg-amber-100 text-amber-900 border-amber-300" :
    socialProvider === "NAVER" ? "bg-emerald-100 text-emerald-900 border-emerald-300" :
    socialProvider === "GOOGLE" ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-zinc-100 text-zinc-900 border-zinc-300";

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      {/* Top Welcome & Points Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-2xl p-6 sm:p-7 mb-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wide uppercase mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Welcome Bonus
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              신규 회원가입 웰컴 3,000P 지급
            </h1>
            <p className="text-xs text-amber-100 mt-1">
              간편인증이 완료되었습니다. 필수 정보를 확인하시고 즉시 회원가입을 완료해보세요.
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-7">
        
        {/* Verification Status Badge */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${providerBadgeColor}`}>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-current" />
            <div>
              <div className="text-xs font-black">{providerLabel} 본인인증 완료</div>
              <div className="text-[11px] opacity-80">실명확인 및 보안 인증이 정상적으로 완료되었습니다.</div>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/70 shadow-2xs">인증됨</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Login ID with Duplicate Check */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-zinc-900">
                사용자 아이디 (ID) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-500">영문, 숫자 4~20자</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setIdCheckStatus({ checked: false });
                }}
                placeholder="희망 아이디 입력 (예: pervade123)"
                className={`flex-1 p-3.5 bg-zinc-50 border rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 ${
                  idCheckStatus.checked
                    ? idCheckStatus.available
                      ? "border-emerald-500 focus:ring-emerald-500"
                      : "border-red-500 focus:ring-red-500"
                    : "border-zinc-200 focus:ring-amber-600"
                }`}
              />
              <button
                type="button"
                onClick={handleCheckId}
                disabled={isCheckingId || !loginId.trim()}
                className="px-4 py-3.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors shrink-0"
              >
                {isCheckingId ? "확인 중..." : "중복 확인"}
              </button>
            </div>
            {idCheckStatus.checked && (
              <p className={`text-[11px] mt-1.5 flex items-center gap-1 font-bold ${
                idCheckStatus.available ? "text-emerald-600" : "text-red-500"
              }`}>
                {idCheckStatus.available ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {idCheckStatus.message}
              </p>
            )}
          </div>

          {/* 2. User Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-900 mb-1.5">
              회원명 (실명) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
                className="w-full p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <span className="absolute right-3.5 top-3.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                실명 확인
              </span>
            </div>
          </div>

          {/* 3. Password (Optional for General Login) */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <Lock className="w-3.5 h-3.5 text-zinc-700" />
              <span>일반 로그인용 비밀번호 설정 (선택)</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              비밀번호를 설정해두시면 간편로그인 외에도 아이디/비밀번호로 편리하게 로그인하실 수 있습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자리 이상)"
                  className="w-full p-3 bg-white border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                  className="w-full p-3 bg-white border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
            {password && passwordConfirm && (
              <p className={`text-[11px] font-bold ${password === passwordConfirm ? "text-emerald-600" : "text-red-500"}`}>
                {password === passwordConfirm ? "✓ 비밀번호가 일치합니다." : "✕ 비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          {/* 4. Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={verifiedEmail}
                  className="w-full p-3.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-600 cursor-not-allowed"
                />
                <span className="absolute right-3.5 top-3.5 text-[10px] font-bold text-zinc-500">
                  인증완료
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                휴대전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* 5. Address Search */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-zinc-900">
                자택 / 직장 기본 배송지 주소 (선택)
              </label>
              <span className="text-[11px] text-zinc-500">주문 시 자동 입력</span>
            </div>
            <AddressSearch
              value={address}
              onChange={(newAddr) => setAddress(newAddr)}
            />
          </div>

          {/* 6. Birth Date */}
          <div>
            <label className="block text-xs font-bold text-zinc-900 mb-1.5">
              생년월일 (선택)
            </label>
            <BirthDateSelect
              value={birthDate}
              onChange={(date) => setBirthDate(date)}
            />
          </div>

          {/* 7. Terms & Consents */}
          <div className="border border-zinc-200 rounded-xl p-4.5 bg-zinc-50/70 space-y-3 pt-4">
            <label className="flex items-center gap-2.5 cursor-pointer pb-2.5 border-b border-zinc-200">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={toggleAllAgree}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-600"
              />
              <span className="text-xs font-black text-zinc-950">
                약관 전체 동의 (선택 항목 포함)
              </span>
            </label>

            <div className="space-y-2 pl-1">
              <label className="flex items-center justify-between cursor-pointer text-xs text-zinc-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600"
                  />
                  <span>[필수] 퍼베이드 서비스 이용약관 동의</span>
                </div>
                <Link href="/terms" target="_blank" className="text-[11px] text-zinc-400 hover:text-zinc-600 underline">
                  보기
                </Link>
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs text-zinc-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600"
                  />
                  <span>[필수] 개인정보 수집 및 이용 동의</span>
                </div>
                <Link href="/privacy" target="_blank" className="text-[11px] text-zinc-400 hover:text-zinc-600 underline">
                  보기
                </Link>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-amber-600"
                />
                <span>[선택] 이벤트 혜택 및 신상품 소식 알림 수신 동의</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-zinc-950 text-white rounded-xl text-sm font-extrabold hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>회원가입 처리 중...</span>
              </>
            ) : (
              <>
                <span>회원가입 완료 & 웰컴 3,000P 받기</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-zinc-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-bold text-amber-700 hover:underline">
              로그인하기
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SocialSignupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SocialSignupForm />
    </Suspense>
  );
}

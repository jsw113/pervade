"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, PhoneCall, X, Check, Lock, Smartphone } from "lucide-react";

interface RealNameVerifierProps {
  onVerified?: () => void;
  isOpenControlled?: boolean;
  onCloseControlled?: () => void;
  showButton?: boolean;
  buttonText?: string;
}

export function RealNameVerifier({ 
  onVerified, 
  isOpenControlled, 
  onCloseControlled,
  showButton = true,
  buttonText = "실명인증 진행하기"
}: RealNameVerifierProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Input details, 2: Verification code
  
  const [carrier, setCarrier] = useState("SKT");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDateRaw, setBirthDateRaw] = useState(""); // Stores formatted e.g. "1965년 01월 11일"
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onCloseControlled && !val) {
      onCloseControlled();
    }
    setInternalOpen(val);
  };

  // Helper: auto format 8 digit number to "YYYY년 MM월 DD일"
  const handleBirthDateChange = (inputVal: string) => {
    const digits = inputVal.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) {
      setBirthDateRaw(digits);
    } else if (digits.length <= 6) {
      setBirthDateRaw(`${digits.slice(0, 4)}년 ${digits.slice(4)}월`);
    } else {
      setBirthDateRaw(`${digits.slice(0, 4)}년 ${digits.slice(4, 6)}월 ${digits.slice(6, 8)}일`);
    }
  };

  // Helper: auto format phone e.g. "01012345678" -> "010-1234-5678"
  const handlePhoneChange = (inputVal: string) => {
    const digits = inputVal.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) {
      setPhone(digits);
    } else if (digits.length <= 7) {
      setPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    } else {
      setPhone(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`);
    }
  };

  const isBirthDateComplete = birthDateRaw.replace(/\D/g, "").length === 8;

  const handleRequestSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !isBirthDateComplete) {
      alert("이름, 8자리 생년월일, 휴대폰 번호를 모두 올바르게 입력해주세요.");
      return;
    }
    setStep(2);
    alert("📱 PASS 휴대폰 인증번호가 발송되었습니다.\n(테스트 인증코드: 123456)");
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== "123456") {
      alert("인증번호가 일치하지 않습니다. (테스트 코드: 123456)");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify-realname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          phone, 
          birthDate: birthDateRaw 
        })
      });

      if (response.ok) {
        alert("🎉 본인인증(실명인증)이 성공적으로 완료되었습니다!\n회원 5% 포인트 적립 혜택이 적용됩니다.");
        setIsOpen(false);
        setStep(1);
        setName("");
        setPhone("");
        setBirthDateRaw("");
        setCode("");
        if (onVerified) {
          onVerified();
        } else {
          router.refresh();
        }
      } else {
        alert("인증 처리 중 서버 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 통신에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showButton && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {buttonText}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-zinc-950 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="font-black text-sm tracking-tight block">PASS 휴대폰 본인확인 (실명인증)</span>
                  <span className="text-[10px] text-zinc-400">안전한 본인확인 및 회원 적립 혜택</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setStep(1);
                }} 
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input details */}
            {step === 1 ? (
              <form onSubmit={handleRequestSMS} className="p-6 space-y-4">
                {/* Telecom Carrier */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">통신사 선택 *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["SKT", "KT", "LGU+", "알뜰폰"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCarrier(c)}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                          carrier === c 
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-2xs" 
                            : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">성명 (실명) *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="홍길동"
                    />
                  </div>

                  {/* Continuous 8-digit Birthdate Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-zinc-700">생년월일 8자리 *</label>
                      <span className="text-[10px] text-zinc-400 font-mono">예: 19650111 (숫자만 연속 입력)</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={birthDateRaw}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 ${
                        isBirthDateComplete 
                          ? "border-emerald-500 text-zinc-950 focus:ring-emerald-500 bg-emerald-50/30" 
                          : "text-zinc-800 focus:ring-zinc-900"
                      }`}
                      placeholder="19650111 (1965년 01월 11일)"
                    />
                    {isBirthDateComplete && (
                      <div className="mt-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>생년월일 형식 확인 완료</span>
                      </div>
                    )}
                  </div>

                  {/* Phone with Auto Hyphen */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">휴대폰 번호 *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs font-bold font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="01012345678 (숫자 입력 시 자동 하이픈)"
                    />
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border rounded-xl text-[11px] text-zinc-500 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-700">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>개인정보보호 및 본인확인 동의</span>
                  </div>
                  <p>본인인증 서비스 이용을 위해 휴대폰 통신사 본인확인 약관에 동의합니다.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  인증번호 SMS 요청하기
                </button>
              </form>
            ) : (
              /* Step 2: Verification Code */
              <form onSubmit={handleVerifyCode} className="p-6 space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-zinc-900 block">
                    {phone} 번호로 인증번호 6자리를 발송했습니다.
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    휴대폰으로 수신된 6자리 번호를 입력해주세요.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] text-2xl font-black p-3.5 bg-zinc-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
                    placeholder="123456"
                    autoFocus
                  />
                  <span className="block text-center text-[11px] text-zinc-400 mt-2 font-mono">
                    * 테스트 인증코드: <strong className="text-zinc-800">123456</strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    이전으로
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? "인증 확인 중..." : "인증 완료하기"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}

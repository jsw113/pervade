"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, PhoneCall, X, Check } from "lucide-react";

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
  const [birthDate, setBirthDate] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onCloseControlled && !val) {
      onCloseControlled();
    }
    setInternalOpen(val);
  };

  const handleRequestSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !birthDate) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }
    setStep(2);
    alert("인증번호가 모의 발송되었습니다.\n(테스트 인증코드: 123456)");
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== "123456") {
      alert("인증번호가 일치하지 않습니다. (123456을 입력하세요)");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify-realname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, birthDate })
      });

      if (response.ok) {
        alert("본인인증(실명인증)이 성공적으로 완료되었습니다!");
        setIsOpen(false);
        setStep(1);
        setName("");
        setPhone("");
        setBirthDate("");
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
          className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {buttonText}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-zinc-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm tracking-tight">PASS 휴대폰 본인확인 (실명인증)</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setStep(1);
                }} 
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input details */}
            {step === 1 && (
              <form onSubmit={handleRequestSMS} className="p-6 space-y-4 flex-1">
                <div className="text-center py-1">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">통신사 선택</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["SKT", "KT", "LGU+"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCarrier(c)}
                        className={`py-2 text-xs font-bold border rounded-lg transition-all ${
                          carrier === c 
                            ? "border-zinc-900 bg-zinc-900 text-white" 
                            : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">성명 (실명) *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="홍길동"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">생년월일 *</label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">휴대폰 번호 *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-zinc-950 text-white font-bold rounded-xl text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <PhoneCall className="w-4 h-4" />
                  인증번호 전송요청
                </button>
              </form>
            )}

            {/* Step 2: Verification code */}
            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="p-6 space-y-6 flex-1 text-center">
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-zinc-900">인증번호 입력</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    <strong>{phone}</strong> 번호로 발송된 6자리 인증번호를 입력하세요.<br />
                    (모의 테스트코드: <strong className="text-zinc-900 font-bold bg-zinc-100 px-2 py-0.5 rounded">123456</strong>)
                  </p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-2xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-zinc-200 text-zinc-600 font-bold rounded-xl text-sm hover:bg-zinc-50 transition-colors"
                  >
                    이전으로
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-zinc-950 text-white font-bold rounded-xl text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? "인증 확인 중..." : "인증완료"}
                  </button>
                </div>
              </form>
            )}

            {/* Footer Notice */}
            <div className="bg-zinc-50 p-4 border-t text-[10px] text-zinc-400 text-center leading-relaxed">
              본 화면은 PASS/KCB 본인확인 서비스를 시뮬레이션하는 안전한 테스트 환경입니다.<br />
              실명인증 완료 시 포인트 적립 및 안전 결제 혜택이 정상 부여됩니다.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Calendar, Lock, Edit3, X, Check, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

interface ProfileEditorProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    birthDate?: string | null;
    socialProvider?: string | null;
  };
}

export function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [birthDate, setBirthDate] = useState(user.birthDate || "");
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Phone auto format (010-XXXX-XXXX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length <= 3) {
      setPhone(val);
    } else if (val.length <= 7) {
      setPhone(`${val.slice(0, 3)}-${val.slice(3)}`);
    } else {
      setPhone(`${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`);
    }
  };

  // Real-time password validations
  const isPassLengthValid = newPassword.length >= 6;
  const isPassAlphaNumValid = /[a-zA-Z0-9]/.test(newPassword);
  const isPassMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPassMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    // Password validation if user is trying to change password
    if (newPassword.trim().length > 0) {
      if (!currentPassword.trim()) {
        alert("🔒 비밀번호 변경을 위해 기존(현재) 비밀번호를 입력해주세요.");
        return;
      }
      if (!isPassLengthValid) {
        alert("새 비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }
      if (!isPassAlphaNumValid) {
        alert("새 비밀번호는 영문(대소문자) 또는 숫자를 포함해야 합니다.");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          birthDate: birthDate.trim() || null,
          currentPassword: currentPassword ? currentPassword.trim() : undefined,
          newPassword: newPassword ? newPassword.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ 회원 정보가 성공적으로 변경되었습니다!");
        
        // Update active session cache
        try {
          const currentStored = sessionStorage.getItem("pervade_user");
          if (currentStored) {
            const parsed = JSON.parse(currentStored);
            parsed.name = name.trim();
            sessionStorage.setItem("pervade_user", JSON.stringify(parsed));
            window.dispatchEvent(new Event("pervade_auth_update"));
          }
        } catch (e) {}

        setIsOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        alert(`❌ 수정 실패: ${data.error || "알 수 없는 오류"}`);
      }
    } catch (err: any) {
      console.error(err);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
      >
        <Edit3 className="w-3.5 h-3.5 text-zinc-700" />
        <span>회원정보 수정</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-zinc-100 my-8">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                  <User className="w-5 h-5 text-zinc-900" />
                  회원정보 수정
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  이름, 연락처, 생년월일 및 비밀번호를 안전하게 변경합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Email (Readonly) */}
              <div className="space-y-1">
                <label className="block font-bold text-zinc-500">이메일 계정 (변경 불가)</label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-zinc-100 text-zinc-500 rounded-xl border text-xs font-medium cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">이름 / 닉네임 *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">휴대폰 번호</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="010-1234-5678"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* BirthDate */}
              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">생년월일</label>
                <div className="relative">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-3 border-t space-y-3 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-zinc-700" />
                    비밀번호 변경 (선택)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "숨기기" : "비밀번호 보기"}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      기존(현재) 비밀번호 {newPassword.length > 0 && <span className="text-red-500">*필수</span>}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="현재 사용 중인 기존 비밀번호"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      새 비밀번호 (6자 이상 영문/숫자 포함)
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새로 사용할 6자 이상 비밀번호"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 다시 입력"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
                    />
                  </div>

                  {/* Validation Guide Feedback */}
                  {newPassword.length > 0 && (
                    <div className="p-2.5 bg-white rounded-xl border border-zinc-200 text-[10.5px] space-y-1">
                      <div className={`flex items-center gap-1.5 font-bold ${isPassLengthValid && isPassAlphaNumValid ? "text-emerald-600" : "text-zinc-500"}`}>
                        {isPassLengthValid && isPassAlphaNumValid ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-3 h-3 text-center">•</span>}
                        <span>6자 이상 영문(대/소문자 구분) 또는 숫자 포함</span>
                      </div>
                      {confirmPassword.length > 0 && (
                        <div className={`flex items-center gap-1.5 font-bold ${isPassMatch ? "text-emerald-600" : "text-rose-500"}`}>
                          {isPassMatch ? <Check className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-rose-500" />}
                          <span>{isPassMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10.5px] text-zinc-400 font-medium">
                    * 기존 비밀번호를 계속 유지하시려면 위 비밀번호 항목을 비워두시면 됩니다.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSaving ? "저장 중..." : "저장하기"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

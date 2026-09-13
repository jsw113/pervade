"use client";

import { useState, useEffect } from "react";
import { Pin, Calendar, X, Check, Clock, AlertCircle } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemTitle: string;
  currentIsPinned: boolean;
  currentPinUntil?: string | Date | null;
  onSave: (isPinned: boolean, pinUntil: string | null) => Promise<void>;
}

export function PinModal({
  isOpen,
  onClose,
  title,
  itemTitle,
  currentIsPinned,
  currentPinUntil,
  onSave,
}: PinModalProps) {
  const [isPinned, setIsPinned] = useState(currentIsPinned);
  const [pinType, setPinType] = useState<"PERMANENT" | "PERIOD">(
    currentPinUntil ? "PERIOD" : "PERMANENT"
  );
  
  // Format date to YYYY-MM-DD
  const formatDefaultDate = (dateVal?: string | Date | null) => {
    if (!dateVal) {
      const d = new Date();
      d.setDate(d.getDate() + 14); // Default: 2 weeks
      return d.toISOString().split("T")[0];
    }
    const d = new Date(dateVal);
    return d.toISOString().split("T")[0];
  };

  const [pinUntilDate, setPinUntilDate] = useState<string>(
    formatDefaultDate(currentPinUntil)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPinned(currentIsPinned);
      setPinType(currentPinUntil ? "PERIOD" : "PERMANENT");
      setPinUntilDate(formatDefaultDate(currentPinUntil));
    }
  }, [isOpen, currentIsPinned, currentPinUntil]);

  if (!isOpen) return null;

  const handleQuickAddDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setPinType("PERIOD");
    setPinUntilDate(d.toISOString().split("T")[0]);
  };

  const handleEndOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setPinType("PERIOD");
    setPinUntilDate(lastDay.toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!isPinned) {
        await onSave(false, null);
      } else {
        const finalUntil = pinType === "PERIOD" && pinUntilDate ? new Date(`${pinUntilDate}T23:59:59.999Z`).toISOString() : null;
        await onSave(true, finalUntil);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("고정 설정 저장 중 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Pin className="w-5 h-5 fill-amber-600 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">{title}</h3>
              <p className="text-[11px] text-zinc-500 truncate max-w-[260px]">{itemTitle}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Pin Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <div>
              <label className="text-sm font-bold text-zinc-900 block cursor-pointer">
                1순위 상단 고정 (PIN)
              </label>
              <p className="text-xs text-zinc-500 mt-0.5">
                목록 최상단에 우선 노출합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPinned ? "bg-amber-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isPinned ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Period Options (Only visible when isPinned is true) */}
          {isPinned && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-zinc-700">고정 기간 설정</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPinType("PERMANENT")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 ${
                    pinType === "PERMANENT"
                      ? "border-amber-600 bg-amber-50/50 text-amber-950 ring-1 ring-amber-600"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${pinType === "PERMANENT" ? "bg-amber-600" : "bg-zinc-300"}`} />
                    상시 고정
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">종료일 없이 계속 고정</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPinType("PERIOD")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 ${
                    pinType === "PERIOD"
                      ? "border-amber-600 bg-amber-50/50 text-amber-950 ring-1 ring-amber-600"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${pinType === "PERIOD" ? "bg-amber-600" : "bg-zinc-300"}`} />
                    기간 지정 고정
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">설정한 날짜까지 고정</span>
                </button>
              </div>

              {pinType === "PERIOD" && (
                <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      고정 종료 일자 (해당 일자 23:59까지 고정)
                    </label>
                    <input
                      type="date"
                      value={pinUntilDate}
                      onChange={(e) => setPinUntilDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required={pinType === "PERIOD"}
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block mb-1.5">빠른 기간 설정:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAddDays(7)}
                        className="px-2.5 py-1 bg-white hover:bg-zinc-100 border rounded-lg text-[11px] font-semibold text-zinc-700"
                      >
                        +7일
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddDays(14)}
                        className="px-2.5 py-1 bg-white hover:bg-zinc-100 border rounded-lg text-[11px] font-semibold text-zinc-700"
                      >
                        +14일 (2주)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddDays(30)}
                        className="px-2.5 py-1 bg-white hover:bg-zinc-100 border rounded-lg text-[11px] font-semibold text-zinc-700"
                      >
                        +30일 (1달)
                      </button>
                      <button
                        type="button"
                        onClick={handleEndOfMonth}
                        className="px-2.5 py-1 bg-white hover:bg-zinc-100 border rounded-lg text-[11px] font-semibold text-zinc-700"
                      >
                        이번 달 말까지
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>기간이 만료되면 별도 수정 없이 <strong>자동으로 일반 순위로 복귀</strong>합니다.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {isSubmitting ? "저장 중..." : "설정 적용"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, Check, Plus, Home, Sparkles } from "lucide-react";
import { AddressSearch } from "@/components/common/AddressSearch";

interface ShippingAddressSelectorProps {
  defaultAddress?: string | null;
  onAddressChange: (address: string, saveAsDefault: boolean) => void;
  className?: string;
}

export function ShippingAddressSelector({
  defaultAddress = "",
  onAddressChange,
  className = ""
}: ShippingAddressSelectorProps) {
  const hasDefault = !!defaultAddress && defaultAddress.trim() !== "";
  
  // "DEFAULT" or "CUSTOM"
  const [mode, setMode] = useState<"DEFAULT" | "CUSTOM">(hasDefault ? "DEFAULT" : "CUSTOM");
  const [customAddress, setCustomAddress] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  // Sync initial address with parent
  useEffect(() => {
    if (mode === "DEFAULT" && hasDefault) {
      onAddressChange(defaultAddress!, false);
    } else {
      onAddressChange(customAddress, saveAsDefault);
    }
  }, [mode, defaultAddress, customAddress, saveAsDefault]);

  const handleCustomAddressChange = (addr: string) => {
    setCustomAddress(addr);
    onAddressChange(addr, saveAsDefault);
  };

  const handleToggleSaveAsDefault = (checked: boolean) => {
    setSaveAsDefault(checked);
    onAddressChange(customAddress, checked);
  };

  return (
    <div className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 ${className}`}>
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-800">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950">배송지 정보</h3>
            <p className="text-[11px] text-zinc-400">주문하신 상품을 받으실 주소를 선택하세요</p>
          </div>
        </div>
      </div>

      {/* Address Selection Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!hasDefault}
          onClick={() => setMode("DEFAULT")}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === "DEFAULT"
              ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
              : !hasDefault
              ? "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed"
              : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>기본 배송지</span>
          {!hasDefault && <span className="text-[10px] text-zinc-400">(미등록)</span>}
        </button>

        <button
          type="button"
          onClick={() => setMode("CUSTOM")}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === "CUSTOM"
              ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
              : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 배송지 입력 (주소 검색)</span>
        </button>
      </div>

      {/* Mode 1: Default Address Display */}
      {mode === "DEFAULT" && hasDefault ? (
        <div className="p-4 bg-zinc-50 border rounded-2xl space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              기본 배송지
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-900 leading-relaxed">
            {defaultAddress}
          </p>
        </div>
      ) : (
        /* Mode 2: Custom Address Search */
        <div className="space-y-3 pt-1 animate-in fade-in">
          <AddressSearch 
            value={customAddress}
            onChange={handleCustomAddressChange}
          />

          {/* Toggle / Checkbox to save as default */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 bg-zinc-50 border rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => handleToggleSaveAsDefault(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-950"
              />
              <div className="text-xs">
                <span className="font-bold text-zinc-800">이 주소를 나의 '기본 배송지'로 저장 및 업데이트</span>
                <p className="text-[10px] text-zinc-400">다음 주문 시 번거로운 주소 입력 없이 바로 적용됩니다.</p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

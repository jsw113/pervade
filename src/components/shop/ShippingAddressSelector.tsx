"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, Check, Plus, Home, Sparkles, AlertCircle } from "lucide-react";
import { AddressSearch } from "@/components/common/AddressSearch";
import { ShippingAddressItem } from "./ShippingAddressManager";

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
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddressItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("CUSTOM");
  const [customAddress, setCustomAddress] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch("/api/user/shipping-addresses");
      if (res.ok) {
        const data: ShippingAddressItem[] = await res.json();
        setSavedAddresses(data);

        if (data.length > 0) {
          const def = data.find((a) => a.isDefault) || data[0];
          setSelectedId(def.id);
          onAddressChange(def.address, false);
        } else if (defaultAddress) {
          setCustomAddress(defaultAddress);
          onAddressChange(defaultAddress, false);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch shipping addresses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, [defaultAddress]);

  const handleSelectSaved = (addr: ShippingAddressItem) => {
    setSelectedId(addr.id);
    onAddressChange(addr.address, false);
  };

  const handleSelectCustom = () => {
    setSelectedId("CUSTOM");
    onAddressChange(customAddress, saveAsDefault);
  };

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
            <h3 className="text-sm font-bold text-zinc-950">배송지 선택</h3>
            <p className="text-[11px] text-zinc-400">등록된 배송지(최대 3개) 또는 새 주소를 선택하세요</p>
          </div>
        </div>

        {savedAddresses.length > 0 && (
          <span className="text-[11px] font-bold text-zinc-500">
            등록 배송지 {savedAddresses.length}/3개
          </span>
        )}
      </div>

      {/* Saved Addresses List (up to 3) */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-zinc-600">등록된 배송지 선택</label>
          <div className="grid grid-cols-1 gap-2">
            {savedAddresses.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSaved(item)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-900 text-white shadow-xs"
                      : "border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 text-zinc-900"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{item.title}</span>
                      {item.isDefault && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                          isSelected ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}>
                          기본
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                      {item.recipient} · {item.phone}
                    </span>
                  </div>
                  <p className={`text-xs break-all font-semibold ${isSelected ? "text-zinc-100" : "text-zinc-800"}`}>
                    {item.address}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Search Option */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSelectCustom}
          className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedId === "CUSTOM"
              ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
              : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 배송지 검색 및 직접 입력</span>
        </button>

        {selectedId === "CUSTOM" && (
          <div className="mt-3 p-4 bg-zinc-50 border rounded-2xl space-y-3 animate-in fade-in">
            <AddressSearch
              value={customAddress}
              onChange={handleCustomAddressChange}
            />

            {savedAddresses.length < 3 && (
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => handleToggleSaveAsDefault(e.target.checked)}
                  className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900"
                />
                <span className="text-xs font-bold text-zinc-800">
                  이 주소를 나의 '기본 배송지'로 저장 및 업데이트 (등록 {savedAddresses.length + 1}/3개)
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

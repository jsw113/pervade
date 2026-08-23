"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Check } from "lucide-react";

declare global {
  interface Window {
    daum?: any;
  }
}

interface AddressSearchProps {
  value?: string;
  onChange: (fullAddress: string) => void;
}

export function AddressSearch({ value = "", onChange }: AddressSearchProps) {
  const [zonecode, setZonecode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Daum Postcode Script
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.daum && window.daum.Postcode) {
        setIsScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  // Parse initial value if given e.g. "[06134] 서울 강남구 테헤란로 123, 101호"
  useEffect(() => {
    if (value && !baseAddress) {
      const match = value.match(/^\[(.*?)\]\s*(.*?)(?:,\s*(.*))?$/);
      if (match) {
        setZonecode(match[1] || "");
        setBaseAddress(match[2] || "");
        setDetailAddress(match[3] || "");
      } else {
        setBaseAddress(value);
      }
    }
  }, [value]);

  const handleOpenPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        let addr = ""; // Address variable
        let extraAddr = ""; // Extra address (bname, buildingName)

        // Road address or Jibun address
        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        // Additional information for road address
        if (data.userSelectedType === "R") {
          if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName !== "" && data.apartment === "Y") {
            extraAddr += extraAddr !== "" ? `, ${data.buildingName}` : data.buildingName;
          }
          if (extraAddr !== "") {
            extraAddr = ` (${extraAddr})`;
          }
        }

        const selectedBase = `${addr}${extraAddr}`;
        setZonecode(data.zonecode);
        setBaseAddress(selectedBase);

        const full = `[${data.zonecode}] ${selectedBase}${detailAddress ? `, ${detailAddress}` : ""}`;
        onChange(full);

        // Auto-focus detail address
        setTimeout(() => {
          document.getElementById("detail-address-input")?.focus();
        }, 100);
      },
    }).open();
  };

  const handleDetailChange = (detail: string) => {
    setDetailAddress(detail);
    const full = zonecode 
      ? `[${zonecode}] ${baseAddress}${detail ? `, ${detail}` : ""}`
      : `${baseAddress}${detail ? ` ${detail}` : ""}`;
    onChange(full);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-zinc-700">배송지 주소 (도로명/지번 검색)</label>
        <span className="text-[10px] text-zinc-400">카카오/다음 주소 검색 연동</span>
      </div>

      {/* Row 1: Zipcode + Search Button */}
      <div className="flex gap-2">
        <div className="relative w-32 shrink-0">
          <input
            type="text"
            readOnly
            value={zonecode}
            placeholder="우편번호"
            className="w-full px-3 py-2.5 bg-zinc-100/80 border rounded-xl text-xs font-mono font-bold text-zinc-800 focus:outline-none cursor-not-allowed text-center"
          />
        </div>
        <button
          type="button"
          onClick={handleOpenPostcode}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          우편번호 검색
        </button>
      </div>

      {/* Row 2: Base Road/Jibun Address */}
      <div>
        <input
          type="text"
          readOnly
          value={baseAddress}
          onClick={handleOpenPostcode}
          placeholder="우편번호 검색 버튼을 눌러 기본 주소를 입력하세요"
          className="w-full px-3.5 py-2.5 bg-zinc-100/80 border rounded-xl text-xs font-medium text-zinc-900 focus:outline-none cursor-pointer"
        />
      </div>

      {/* Row 3: Detail Address */}
      {baseAddress && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            id="detail-address-input"
            type="text"
            value={detailAddress}
            onChange={(e) => handleDetailChange(e.target.value)}
            placeholder="상세주소 입력 (예: 101동 202호 / 3층)"
            className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
          />
        </div>
      )}
    </div>
  );
}

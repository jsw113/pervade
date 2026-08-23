"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Edit3, Check, X, Search } from "lucide-react";
import { AddressSearch } from "@/components/common/AddressSearch";

interface MyPageAddressEditorProps {
  currentAddress?: string | null;
}

export function MyPageAddressEditor({ currentAddress = "" }: MyPageAddressEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(currentAddress || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!address.trim()) {
      alert("배송지 주소를 검색하여 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/address", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });

      if (res.ok) {
        alert("기본 배송지가 성공적으로 저장되었습니다!");
        setIsEditing(false);
        router.refresh();
      } else {
        alert("배송지 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-28 text-zinc-500 font-bold flex-shrink-0">기본 배송 주소</span>
          {!isEditing && (
            <span className="text-zinc-950 font-bold text-xs">
              {currentAddress || "미등록 (주소 검색 후 등록해주세요)"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-zinc-900 hover:text-zinc-600 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? "취소" : currentAddress ? "배송지 변경" : "배송지 등록"}</span>
        </button>
      </div>

      {/* Editing Area */}
      {isEditing && (
        <div className="p-4 bg-zinc-50 border rounded-2xl space-y-4 animate-in fade-in">
          <AddressSearch 
            value={address}
            onChange={(newAddr) => setAddress(newAddr)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !address.trim()}
              className="px-5 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? "저장 중..." : "기본 배송지로 저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

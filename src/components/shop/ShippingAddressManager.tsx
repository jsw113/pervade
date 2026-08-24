"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, Star, AlertCircle, X, Home, Briefcase, Building } from "lucide-react";
import { AddressSearch } from "@/components/common/AddressSearch";

export interface ShippingAddressItem {
  id: string;
  title: string;
  recipient: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

interface ShippingAddressManagerProps {
  onSelectAddress?: (address: ShippingAddressItem) => void;
  selectedId?: string;
  isCompact?: boolean; // For checkout modal
}

export function ShippingAddressManager({
  onSelectAddress,
  selectedId,
  isCompact = false,
}: ShippingAddressManagerProps) {
  const [addresses, setAddresses] = useState<ShippingAddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor modal/inline state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = new
  const [formTitle, setFormTitle] = useState("우리집");
  const [formRecipient, setFormRecipient] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/shipping-addresses");
      if (res.ok) {
        const data: ShippingAddressItem[] = await res.json();
        setAddresses(data);
        // If onSelectAddress is provided and no address is selected yet, select default
        if (onSelectAddress && data.length > 0) {
          const def = data.find((a) => a.isDefault) || data[0];
          onSelectAddress(def);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddForm = () => {
    if (addresses.length >= 3) {
      alert("배송지는 최대 3개까지만 등록할 수 있습니다.\n기존 배송지를 수정하거나 삭제한 후 등록해주세요.");
      return;
    }
    setEditingId(null);
    setFormTitle(addresses.length === 0 ? "우리집" : addresses.length === 1 ? "회사" : "기타 배송지");
    setFormRecipient("");
    setFormPhone("");
    setFormAddress("");
    setFormIsDefault(addresses.length === 0);
    setIsEditing(true);
  };

  const openEditForm = (item: ShippingAddressItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormRecipient(item.recipient);
    setFormPhone(item.phone);
    setFormAddress(item.address);
    setFormIsDefault(item.isDefault);
    setIsEditing(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRecipient.trim() || !formPhone.trim() || !formAddress.trim()) {
      alert("받는 사람, 연락처, 배송지 주소를 모두 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/shipping-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: formTitle,
          recipient: formRecipient,
          phone: formPhone,
          address: formAddress,
          isDefault: formIsDefault,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        setIsEditing(false);
        if (onSelectAddress) {
          const current = data.addresses.find((a: any) => formIsDefault ? a.isDefault : a.address === formAddress) || data.addresses[0];
          if (current) onSelectAddress(current);
        }
      } else {
        alert(data.error || "배송지 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string, title: string) => {
    if (!confirm(`'${title}' 배송지를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/user/shipping-addresses?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        if (onSelectAddress && data.addresses.length > 0) {
          const def = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
          onSelectAddress(def);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch("/api/user/shipping-addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultId: id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        if (onSelectAddress) {
          const def = data.addresses.find((a: any) => a.id === id);
          if (def) onSelectAddress(def);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-xs text-zinc-400 py-3">배송지 정보를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header & Max 3 Counter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-zinc-700" />
          <span className="font-bold text-xs text-zinc-900">
            나의 배송지 목록 <span className="text-zinc-500 font-normal">({addresses.length}/3개 운용)</span>
          </span>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={openAddForm}
            disabled={addresses.length >= 3}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-colors cursor-pointer ${
              addresses.length >= 3
                ? "border-zinc-200 text-zinc-300 bg-zinc-50 cursor-not-allowed"
                : "border-zinc-900 bg-zinc-950 text-white hover:bg-zinc-800 shadow-2xs"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 배송지 추가 {addresses.length >= 3 ? "(최대 3개 도달)" : ""}</span>
          </button>
        )}
      </div>

      {/* Address List */}
      {!isEditing && (
        <div className="space-y-2.5">
          {addresses.length === 0 ? (
            <div className="p-6 border border-dashed rounded-2xl text-center space-y-2 bg-zinc-50/50">
              <MapPin className="w-6 h-6 text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-500">등록된 배송지가 없습니다.</p>
              <button
                type="button"
                onClick={openAddForm}
                className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                첫 번째 배송지 등록하기
              </button>
            </div>
          ) : (
            addresses.map((item) => {
              const isSelected = selectedId ? selectedId === item.id : item.isDefault;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAddress && onSelectAddress(item)}
                  className={`p-4 rounded-2xl border transition-all ${
                    onSelectAddress ? "cursor-pointer" : ""
                  } ${
                    isSelected && onSelectAddress
                      ? "border-zinc-950 bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{item.title}</span>
                        {item.isDefault && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            isSelected && onSelectAddress
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            기본 배송지
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium ${isSelected && onSelectAddress ? "text-zinc-300" : "text-zinc-600"}`}>
                        {item.recipient} · {item.phone}
                      </p>
                      <p className={`text-xs font-semibold break-all pt-0.5 ${isSelected && onSelectAddress ? "text-white" : "text-zinc-950"}`}>
                        {item.address}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!item.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(item.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            isSelected && onSelectAddress
                              ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                              : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                          }`}
                          title="기본 배송지로 지정"
                        >
                          기본 설정
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isSelected && onSelectAddress
                            ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            : "border-zinc-200 text-zinc-500 hover:bg-zinc-100"
                        }`}
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(item.id, item.title)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isSelected && onSelectAddress
                              ? "border-zinc-700 text-rose-400 hover:bg-zinc-800"
                              : "border-zinc-200 text-rose-600 hover:bg-rose-50"
                          }`}
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Editor Form (Inline) */}
      {isEditing && (
        <form onSubmit={handleSaveAddress} className="p-5 bg-zinc-50 border rounded-2xl space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-bold text-xs text-zinc-950">
              {editingId ? "배송지 정보 수정" : `새 배송지 등록 (${addresses.length + 1}/3)`}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">배송지 별칭</label>
              <div className="flex gap-1.5 mb-1.5">
                {["우리집", "회사", "부모님댁"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormTitle(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      formTitle === t ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="예: 우리집, 회사"
                className="w-full p-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">받는 분 성명</label>
              <input
                type="text"
                required
                value={formRecipient}
                onChange={(e) => setFormRecipient(e.target.value)}
                placeholder="홍길동"
                className="w-full p-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 mt-7 sm:mt-6"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">받는 분 연락처</label>
            <input
              type="tel"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full p-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
            />
          </div>

          {/* Postcode & Address Search */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-700">배송지 주소 검색</label>
            <AddressSearch
              value={formAddress}
              onChange={(addr) => setFormAddress(addr)}
            />
          </div>

          {/* Set as default checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formIsDefault}
              onChange={(e) => setFormIsDefault(e.target.checked)}
              className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-900"
            />
            <span className="text-xs font-bold text-zinc-800">이 배송지를 '기본 배송지'로 설정</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving || !formAddress.trim()}
              className="px-5 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? "저장 중..." : "배송지 저장"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, Image as ImageIcon, Star, Check, Link2, Layers, AlertCircle, Package } from "lucide-react";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { optimizeImageFile, optimizeDetailImageFile, optimizeDataUrl } from "@/lib/utils/imageOptimizer";

export type ProductOption = {
  id: string;
  name: string;
  extraPrice: number;
  isSoldOut?: boolean;
};

export function ProductEditForm({ product }: { product: any }) {
  const router = useRouter();
  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [category, setCategory] = useState(product.category || "세정제류");
  const [subCategory, setSubCategory] = useState(product.subCategory || "다목적/올인원");
  const [price, setPrice] = useState(product.price || "");
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice || "");
  const [stock, setStock] = useState(product.stock !== undefined ? product.stock : "100");
  const [safetyStock, setSafetyStock] = useState(product.safetyStock !== undefined ? product.safetyStock : "10");
  const [shippingFee, setShippingFee] = useState(product.shippingFee !== undefined ? product.shippingFee : "3000");
  const [isVisible, setIsVisible] = useState(product.isVisible !== false);

  // Images state
  let parsedImages: string[] = [];
  try {
    if (product.images) parsedImages = JSON.parse(product.images);
    else if (product.imageUrl) parsedImages = [product.imageUrl];
  } catch (e) {
    if (product.imageUrl) parsedImages = [product.imageUrl];
  }

  let parsedDetailImages: string[] = [];
  try {
    if (product.detailImages) parsedDetailImages = JSON.parse(product.detailImages);
  } catch (e) {
    parsedDetailImages = [];
  }

  // Options state (can be empty array if no options)
  let parsedOptions: ProductOption[] = [];
  try {
    if (product.options) {
      const opts = JSON.parse(product.options);
      if (Array.isArray(opts)) {
        parsedOptions = opts;
      }
    }
  } catch (e) {
    parsedOptions = [];
  }

  let parsedLegalInfo: any = {};
  try {
    if (product.legalInfo) {
      parsedLegalInfo = typeof product.legalInfo === "string" ? JSON.parse(product.legalInfo) : product.legalInfo;
    }
  } catch (e) {
    parsedLegalInfo = {};
  }

  const [images, setImages] = useState<string[]>(parsedImages);
  const [detailContent, setDetailContent] = useState(product.detailContent || "");
  const [detailImages, setDetailImages] = useState<string[]>(parsedDetailImages);
  const [options, setOptions] = useState<ProductOption[]>(parsedOptions);

  // Legal Disclosure State (안전확인대상 생활화학제품 필수 표기 정보)
  const [legalUsageForm, setLegalUsageForm] = useState(parsedLegalInfo.legalUsageForm || "예) 일반방향·탈취제품 > 탈취제 > 일반용 (물체용)방향·탈취제품 > 탈취제 > 자동차용(실내용) > 특수목적용·세정제품 > 세정제 > 일반용 (건물 바닥용)세정제품 > 세정제 > 일반용 (렌지후드용)세정제품 > 세정제 > 일반용 (변기용)세정제품 > 세정제 > 일반용 (오븐용)세정제품 > 세정제 > 일반용 (욕실용)용 (실내공간용), 자동차용 (실내용) / 액체형 (라벨 & 상세이미지와 동일하게 기재)");
  const [legalExpiryDate, setLegalExpiryDate] = useState(parsedLegalInfo.legalExpiryDate || "해당 없음");
  const [legalWeightCapacity, setLegalWeightCapacity] = useState(parsedLegalInfo.legalWeightCapacity || "500ml");
  const [legalEffect, setLegalEffect] = useState(parsedLegalInfo.legalEffect || "상품 상세페이지 참조");
  const [legalManufacturerOrigin, setLegalManufacturerOrigin] = useState(parsedLegalInfo.legalManufacturerOrigin || "제조사 : (주)퍼베이드 / 제조국 : 대한민국");
  const [legalChildProtection, setLegalChildProtection] = useState(parsedLegalInfo.legalChildProtection || "어린이보호포장 비대상");
  const [legalIngredients, setLegalIngredients] = useState(parsedLegalInfo.legalIngredients || "에탄올, 정제수, 천연향료");
  const [legalCautions, setLegalCautions] = useState(parsedLegalInfo.legalCautions || "밀폐된 공간에서 사용 시 환기를 충분히 하시오. 내용물을 마시거나, 내용물이 눈 또는 피부에 닿을 경우 인체에 심각한 손상을 입힐 수 있으니 주의하시오. 어린이 손에 닿지 않는 곳에 보관하시오. 사람 또는 동물에 직접 사용(분사)하지 마시오. 표시사항에 기재된 제품의 용도 외에는 사용하지 마시오. 다른 제품과 섞어 사용할 경우 인체에 치명적인 손상을 입힐 수 있으니 섞어 사용하지 마시오. 공기 소독(연무 소독, 고압분사용 소독장비 활용하는 경우 포함)의 용도 사용을 금지하오니, 물체 표면에만 사용하시오. 어린이보호포장이 적용되지 아니한 제품으로 어린이의 손이 닿지 않는 곳에 보관하시오. 화기를 가까이 하지 마시오. 직사광선을 피하여 보관하시오. 광택이 있는 물체 혹은 섬유에 사용 시 변색, 탈색 테스트 후 사용하십시오. 제품을 세워서 보관하십시오.");
  const [legalSafetyCertNo, setLegalSafetyCertNo] = useState(parsedLegalInfo.legalSafetyCertNo || "CB24-13-0521");
  const [legalCsPhone, setLegalCsPhone] = useState(parsedLegalInfo.legalCsPhone || "070-7756-3668");

  const [isUploading, setIsUploading] = useState(false);
  const [isDetailUploading, setIsDetailUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // URL Input States
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showDetailUrlInput, setShowDetailUrlInput] = useState(false);
  const [detailUrlInput, setDetailUrlInput] = useState("");

  // Handle Multi-Image Upload
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const optimizedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await optimizeImageFile(files[i], 1000, 1000, 0.80);
        optimizedUrls.push(dataUrl);
      }
      setImages((prev) => [...prev, ...optimizedUrls]);
    } catch (err: any) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Handle Detail Description Images Upload
  const handleDetailImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsDetailUploading(true);
    try {
      const optimizedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await optimizeDetailImageFile(files[i], 860, 0.78);
        optimizedUrls.push(dataUrl);
      }
      setDetailImages((prev) => [...prev, ...optimizedUrls]);
    } catch (err: any) {
      console.error(err);
      alert("상세 이미지 처리 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsDetailUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const handleAddDetailImageUrl = () => {
    if (!detailUrlInput.trim()) return;
    setDetailImages((prev) => [...prev, detailUrlInput.trim()]);
    setDetailUrlInput("");
    setShowDetailUrlInput(false);
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveDetailImage = (index: number) => {
    setDetailImages(detailImages.filter((_, i) => i !== index));
  };

  // Option Operations
  const handleAddOption = (name = "새 옵션", extraPrice = 0) => {
    const newOption: ProductOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      extraPrice,
      isSoldOut: false
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleUpdateOption = (index: number, field: keyof ProductOption, value: any) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllOptions = () => {
    if (confirm("모든 옵션을 제거하고 '옵션 없는 단일 상품'으로 설정하시겠습니까?")) {
      setOptions([]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("최소 1개 이상의 제품 이미지를 등록해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // Auto-compress any oversized data URLs before sending
      const compressedGalleryImages: string[] = [];
      for (const imgUrl of images) {
        compressedGalleryImages.push(await optimizeDataUrl(imgUrl, 1000, 0.80));
      }

      const compressedDetailImages: string[] = [];
      for (const dUrl of detailImages) {
        compressedDetailImages.push(await optimizeDataUrl(dUrl, 860, 0.78));
      }

      const payload = { 
        name, 
        description, 
        category,
        subCategory,
        price: parseInt(price), 
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        shippingFee: parseInt(shippingFee) || 0,
        stock: parseInt(stock), 
        safetyStock: parseInt(safetyStock),
        imageUrl: compressedGalleryImages[0], 
        images: compressedGalleryImages,
        detailContent,
        detailImages: compressedDetailImages,
        options: options.length > 0 ? options : null,
        legalInfo: {
          legalUsageForm,
          legalExpiryDate,
          legalWeightCapacity,
          legalEffect,
          legalManufacturerOrigin,
          legalChildProtection,
          legalIngredients,
          legalCautions,
          legalSafetyCertNo,
          legalCsPhone,
        },
        isVisible 
      };

      const payloadStr = JSON.stringify(payload);
      if (payloadStr.length > 3.5 * 1024 * 1024) {
        alert("⚠️ 등록된 상세 이미지 또는 갤러리 이미지 전체 용량이 너무 큽니다 (3.5MB 초과).\n일부 이미지를 웹 URL로 입력하시거나 사진 수를 줄여주세요.");
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: payloadStr,
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { error: response.status === 413 ? "이미지 용량이 서버 허용치(4.5MB)를 초과했습니다." : responseText };
      }

      if (response.ok && !data.error) {
        alert("✅ 제품 정보 및 옵션 설정이 성공적으로 저장되었습니다!");
        router.push("/admin/products");
        router.refresh();
      } else {
        alert("❌ 저장에 실패했습니다: " + (data.error || responseText || "알 수 없는 오류"));
      }
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + (err.message || "네트워크 오류"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 제품을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("제품이 삭제되었습니다.");
        router.push("/admin/products");
        router.refresh();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border shadow-xs">
      {/* 1. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">1. 기본 상품 정보</h3>
        
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">제품명 *</label>
          <input 
            type="text" required 
            value={name} onChange={e => setName(e.target.value)}
            placeholder="예: 퍼베이드 올인원 다목적 세정제 500ml"
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* 2-Depth Category Select */}
        <CategorySelect 
          category={category} 
          subCategory={subCategory} 
          onChangeCategory={(cat: string) => setCategory(cat)}
          onChangeSubCategory={(subCat: string) => setSubCategory(subCat)}
        />

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">간단 제품 요약 설명 *</label>
          <input 
            type="text" required
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="예: 강력한 찌든 때 분해력과 피부 저자극 성분의 프리미엄 홈케어 클리너"
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">판매가 (할인가/실제 결제 기준가) *</label>
            <div className="relative">
              <input 
                type="number" required
                value={price} onChange={e => setPrice(e.target.value)}
                placeholder="예: 18900"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 pr-8"
              />
              <span className="absolute right-3 top-3 text-xs text-zinc-400 font-bold">원</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">정상가 (소비자가 / 할인율 계산용)</label>
            <div className="relative">
              <input 
                type="number"
                value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                placeholder="예: 24000 (할인율 미적용 시 비워둠)"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 pr-8"
              />
              <span className="absolute right-3 top-3 text-xs text-zinc-400 font-bold">원</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">상품 총 재고 수량 (개) *</label>
            <input 
              type="number" required
              value={stock} onChange={e => setStock(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <span className="text-[10px] text-zinc-400 mt-1 block">모든 주문은 상품 총 재고에서 일괄 차감 관리됩니다.</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">안전재고 기준 (개)</label>
            <input 
              type="number" required
              value={safetyStock} onChange={e => setSafetyStock(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-sm text-amber-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-zinc-700">기본 배송비 (택배비 설정)</label>
              <span className="text-[10px] text-zinc-400 font-mono">0원 입력 시 [무료배송] 자동 표기</span>
            </div>
            <div className="relative">
              <input 
                type="number"
                min="0"
                step="500"
                value={shippingFee} 
                onChange={e => setShippingFee(e.target.value)}
                placeholder="예: 3000 (무료배송은 0)"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 pr-8"
              />
              <span className="absolute right-3 top-3 text-xs text-zinc-400 font-bold">원</span>
            </div>
            
            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 font-semibold">퀵설정:</span>
              {[
                { label: "무료배송 (0원)", val: "0" },
                { label: "2,500원", val: "2500" },
                { label: "3,000원", val: "3000" },
                { label: "3,500원", val: "3500" },
                { label: "4,000원", val: "4000" },
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setShippingFee(preset.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    String(shippingFee) === preset.val
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-3 bg-zinc-50 border rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isVisible} 
                  onChange={e => setIsVisible(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 rounded"
                />
                <span className="text-xs font-bold text-zinc-800">쇼핑몰에 상품 즉시 노출 활성화</span>
              </label>
              <p className="text-[10px] text-zinc-400 mt-1 pl-6">
                체크 해제 시 관리자에게만 보이고 쇼핑몰에서는 일시 품절/비노출 처리됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Product Option Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>2. 상품 구매 옵션 관리 (선택 사항)</span>
            </h3>
            <span className="text-xs text-zinc-400">
              세트 구성이나 추가구성 옵션이 있는 경우에만 등록하세요. (옵션 미등록 시 '단일 단품'으로 자동 판매됩니다)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {options.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllOptions}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors"
              >
                옵션 전체 삭제 (단일상품 전환)
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAddOption("새 옵션", 0)}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              옵션 추가하기
            </button>
          </div>
        </div>

        {/* Option Quick Presets */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
          <span className="text-[11px] font-bold text-amber-900 block">⚡ 추천 옵션 세트 원클릭 추가:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "기본 패키지 단품", extraPrice: 0 },
              { name: "본품 + 리필 보틀 500ml 세트", extraPrice: 5000 },
              { name: "리필 2개 실속 세트", extraPrice: 8000 },
              { name: "1+1 본품 2개 특별 기획세트", extraPrice: 15000 },
              { name: "대용량 1,000ml 리필팩", extraPrice: 6000 },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddOption(preset.name, preset.extraPrice)}
                className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-zinc-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors shadow-2xs"
              >
                + {preset.name} ({preset.extraPrice > 0 ? `+${preset.extraPrice.toLocaleString()}원` : "0원"})
              </button>
            ))}
          </div>
        </div>

        {/* Options List or Empty Banner */}
        {options.length > 0 ? (
          <div className="space-y-2.5">
            {options.map((opt, index) => (
              <div 
                key={opt.id || index}
                className="p-3.5 bg-zinc-50 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all hover:border-zinc-300"
              >
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 sm:w-80">
                    <input
                      type="text"
                      required
                      value={opt.name}
                      onChange={(e) => handleUpdateOption(index, "name", e.target.value)}
                      placeholder="옵션명 (예: 본품 + 리필세트)"
                      className="w-full p-2 bg-white border rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-zinc-500 font-semibold shrink-0">추가금:</span>
                    <div className="relative w-32">
                      <input
                        type="number"
                        step="500"
                        value={opt.extraPrice}
                        onChange={(e) => handleUpdateOption(index, "extraPrice", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full p-2 bg-white border rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 pr-6"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-zinc-400 font-bold">원</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateOption(index, "isSoldOut", !opt.isSoldOut)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                      opt.isSoldOut
                        ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {opt.isSoldOut ? "🔴 품절 처리됨" : "🟢 판매중"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                    title="옵션 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed rounded-2xl text-center bg-zinc-50/50 space-y-1">
            <Package className="w-6 h-6 mx-auto text-zinc-400" />
            <div className="text-xs font-bold text-zinc-700">현재 등록된 옵션이 없습니다 (단일 상품)</div>
            <p className="text-[11px] text-zinc-400">
              고객은 옵션 선택 없이 기본 판매가(₩{parseInt(price || "0").toLocaleString()}원)로 상품을 구매하게 됩니다.
            </p>
          </div>
        )}
      </div>

      {/* 3. Multi-Image Gallery */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900">3. 제품 갤러리 이미지</h3>
            <span className="text-xs text-zinc-400">첫 번째 이미지가 대표 썸네일로 사용됩니다</span>
          </div>
        </div>

        {/* Upload and URL Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            {isUploading ? "이미지 최적화 처리 중..." : "PC/스마트폰 사진 파일 업로드 (다중 선택 가능)"}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageFilesUpload} 
              disabled={isUploading}
              className="hidden" 
            />
          </label>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border"
          >
            <Link2 className="w-3.5 h-3.5" />
            웹 이미지 URL 추가
          </button>
        </div>

        {/* URL Input Form */}
        {showUrlInput && (
          <div className="flex items-center gap-2 p-3 bg-zinc-50 border rounded-xl animate-in fade-in">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... 등 이미지 URL을 입력하세요"
              className="flex-1 p-2 bg-white border rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800"
            >
              추가
            </button>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((imgUrl, index) => (
              <div 
                key={index} 
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  index === 0 ? "border-zinc-900 shadow-md" : "border-zinc-200"
                }`}
              >
                <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                
                {/* Main badge */}
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-zinc-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 대표
                  </span>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(index)}
                      className="p-1.5 bg-white text-zinc-900 rounded-lg text-[10px] font-bold hover:bg-amber-100"
                      title="대표 이미지로 설정"
                    >
                      대표
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed rounded-2xl text-center text-zinc-400 text-xs">
            등록된 이미지가 없습니다. 상단 버튼을 눌러 이미지를 추가해주세요.
          </div>
        )}
      </div>

      {/* 4. Detailed Description Content & Detail Images */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">4. 상세페이지 상세 설명 및 안내 이미지</h3>
        
        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">상세페이지 통 이미지 업로드 (카드뉴스/상세페이지용)</label>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-zinc-800 border rounded-xl text-xs font-bold hover:bg-zinc-200 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {isDetailUploading ? "상세 이미지 처리 중..." : "상세 이미지 파일 추가"}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleDetailImageUpload} 
                  disabled={isDetailUploading}
                  className="hidden" 
                />
              </label>

              <button
                type="button"
                onClick={() => setShowDetailUrlInput(!showDetailUrlInput)}
                className="px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border"
              >
                <Link2 className="w-3.5 h-3.5" />
                상세 이미지 URL 추가
              </button>
            </div>

            {showDetailUrlInput && (
              <div className="flex items-center gap-2 p-3 bg-zinc-50 border rounded-xl animate-in fade-in">
                <input
                  type="url"
                  value={detailUrlInput}
                  onChange={(e) => setDetailUrlInput(e.target.value)}
                  placeholder="https://... 상세 이미지 URL을 입력하세요"
                  className="flex-1 p-2 bg-white border rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddDetailImageUrl}
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800"
                >
                  추가
                </button>
              </div>
            )}

            {detailImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {detailImages.map((imgUrl, index) => (
                  <div key={index} className="group relative aspect-[3/4] rounded-xl overflow-hidden border">
                    <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveDetailImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">상세 텍스트 설명 (HTML / 텍스트 지원)</label>
          <textarea 
            rows={8}
            value={detailContent} onChange={e => setDetailContent(e.target.value)}
            placeholder="상세한 제품 특장점, 사용 방법, 주의사항 등을 입력하세요."
            className="w-full p-4 bg-zinc-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
          />
        </div>
      </div>

      {/* Legal Product Disclosure Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <span>📜 상품 필수 표기 정보 (생활화학제품 법정 고시사항)</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            상품 상세설명 하단 필수 표기 정보 테이블에 출력될 제품별 고시 정보입니다. 기본값이 자동 세팅되어 있으며 필요시 수정할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">중량·용량·매수·크기</label>
            <input
              type="text"
              value={legalWeightCapacity}
              onChange={(e) => setLegalWeightCapacity(e.target.value)}
              placeholder="예: 500ml, 1,000ml 리필형"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">제조연월 및 유통기한</label>
            <input
              type="text"
              value={legalExpiryDate}
              onChange={(e) => setLegalExpiryDate(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">효과, 효능 (승인대상 제품에 한함)</label>
            <input
              type="text"
              value={legalEffect}
              onChange={(e) => setLegalEffect(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">수입자, 제조국 및 제조사</label>
            <input
              type="text"
              value={legalManufacturerOrigin}
              onChange={(e) => setLegalManufacturerOrigin(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">어린이보호포장 대상 유무</label>
            <input
              type="text"
              value={legalChildProtection}
              onChange={(e) => setLegalChildProtection(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">안전기준적합확인신고번호</label>
            <input
              type="text"
              value={legalSafetyCertNo}
              onChange={(e) => setLegalSafetyCertNo(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">소비자상담 관련 전화번호</label>
            <input
              type="text"
              value={legalCsPhone}
              onChange={(e) => setLegalCsPhone(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">용도(표백제의 경우 계열을 함께표시) 및 제형</label>
            <textarea
              rows={2}
              value={legalUsageForm}
              onChange={(e) => setLegalUsageForm(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium leading-relaxed"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">제품에 사용된 화학물질 명칭 (주요물질, 보존제 등)</label>
            <input
              type="text"
              value={legalIngredients}
              onChange={(e) => setLegalIngredients(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-1">사용상 주의사항</label>
            <textarea
              rows={3}
              value={legalCautions}
              onChange={(e) => setLegalCautions(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? "삭제 중..." : "제품 삭제"}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2.5 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "저장 중..." : "수정사항 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

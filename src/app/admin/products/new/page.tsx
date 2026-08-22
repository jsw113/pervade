"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Image as ImageIcon, Star, Check, ArrowLeft, Link2, Plus, Layers, Package } from "lucide-react";
import Link from "next/link";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { optimizeImageFile, optimizeDetailImageFile, optimizeDataUrl } from "@/lib/utils/imageOptimizer";

export type ProductOption = {
  id: string;
  name: string;
  extraPrice: number;
  isSoldOut?: boolean;
};

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("세정제류");
  const [subCategory, setSubCategory] = useState("다목적/올인원");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("100");
  const [safetyStock, setSafetyStock] = useState("10");
  const [shippingFee, setShippingFee] = useState("3000");
  const [isVisible, setIsVisible] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [detailContent, setDetailContent] = useState("");
  const [detailImages, setDetailImages] = useState<string[]>([]);

  // Options state (defaults to empty so products are single item by default)
  const [options, setOptions] = useState<ProductOption[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isDetailUploading, setIsDetailUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle Detail Images Upload
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
    setOptions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("최소 1개 이상의 제품 갤러리 이미지를 등록해주세요.");
      return;
    }

    setIsSubmitting(true);
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
        isVisible 
      };

      const payloadStr = JSON.stringify(payload);
      if (payloadStr.length > 3.5 * 1024 * 1024) {
        alert("⚠️ 등록된 상세 이미지 또는 갤러리 이미지 전체 용량이 너무 큽니다 (3.5MB 초과).\n일부 이미지를 웹 URL로 입력하시거나 사진 수를 줄여주세요.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
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
        alert("✅ 신규 제품이 성공적으로 등록되었습니다!");
        router.push("/admin/products");
        router.refresh();
      } else {
        alert("❌ 등록에 실패했습니다: " + (data.error || responseText || "알 수 없는 오류"));
      }
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + (err.message || "네트워크 오류"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/products"
          className="p-2 bg-white border rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
          title="목록으로"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950">새 제품 등록</h2>
          <p className="text-xs text-zinc-500">쇼핑몰에 판매할 새로운 상품과 옵션을 등록합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border shadow-xs">
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

        {/* Actions */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2.5 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? "등록 중..." : "신규 제품 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}

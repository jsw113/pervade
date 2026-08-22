"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Image as ImageIcon, Star, Check, ArrowLeft, Link2 } from "lucide-react";
import Link from "next/link";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { optimizeImageFile } from "@/lib/utils/imageOptimizer";

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

  const [isUploading, setIsUploading] = useState(false);
  const [isDetailUploading, setIsDetailUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL Input States
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showDetailUrlInput, setShowDetailUrlInput] = useState(false);
  const [detailUrlInput, setDetailUrlInput] = useState("");

  // Handle Multi-Image Upload (Client-side optimized & resilient)
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const optimizedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await optimizeImageFile(files[i], 1600, 1600, 0.85);
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
        const dataUrl = await optimizeImageFile(files[i], 1600, 2400, 0.85);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("최소 1개 이상의 제품 갤러리 이미지를 등록해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          category,
          subCategory,
          price: parseInt(price), 
          originalPrice: originalPrice ? parseInt(originalPrice) : null,
          shippingFee: parseInt(shippingFee) || 0,
          stock: parseInt(stock), 
          safetyStock: parseInt(safetyStock),
          imageUrl: images[0], 
          images,
          detailContent,
          detailImages,
          isVisible 
        }),
      });

      if (response.ok) {
        alert("신규 제품이 성공적으로 등록되었습니다.");
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await response.json();
        alert("등록에 실패했습니다: " + (data.error || ""));
      }
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + err.message);
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
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">신규 제품 등록</h1>
          <p className="text-xs text-zinc-500">새로운 프리미엄 상품을 등록하고 2단계 카테고리 및 갤러리를 구성합니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border space-y-8 shadow-sm">
        {/* 1. Category 2-Depth Hierarchy */}
        <CategorySelect
          category={category}
          subCategory={subCategory}
          onChangeCategory={setCategory}
          onChangeSubCategory={setSubCategory}
        />

        {/* 2. Basic Info */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-900 border-b pb-2">1. 기본 제품 정보</h3>
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">제품명 *</label>
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              placeholder="예: 퍼베이드 올인원 프리미엄 다목적 세정제 500ml"
              className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">간략 요약 설명 *</label>
            <textarea 
              required
              rows={3}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="쇼핑몰 목록 및 카드에 노출될 1~2줄 제품 소개를 입력하세요."
              className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">판매가 (원) *</label>
              <input 
                type="number" required
                value={price} onChange={e => setPrice(e.target.value)}
                placeholder="18900"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">정상가/할인전 (원)</label>
              <input 
                type="number"
                value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                placeholder="23000"
                className="w-full p-3 bg-zinc-50 border rounded-xl text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">초기 재고 (개)</label>
              <input 
                type="number" required
                value={stock} onChange={e => setStock(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">안전재고 기준 (개)</label>
              <input 
                type="number" required
                value={safetyStock} onChange={e => setSafetyStock(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-sm text-amber-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">기본 배송비 (원)</label>
              <input 
                type="number"
                value={shippingFee} onChange={e => setShippingFee(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer pt-4">
                <input 
                  type="checkbox" 
                  checked={isVisible} 
                  onChange={e => setIsVisible(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 rounded"
                />
                <span className="text-xs font-bold text-zinc-700">쇼핑몰에 상품 즉시 노출 활성화</span>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Multi-Image Gallery */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="text-base font-bold text-zinc-900">2. 제품 갤러리 이미지</h3>
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
                  
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-zinc-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 대표
                    </span>
                  )}

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
          <h3 className="text-base font-bold text-zinc-900 border-b pb-2">3. 상세페이지 상세 설명 및 안내 이미지</h3>
          
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
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? "등록 중..." : "신규 제품 등록 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}

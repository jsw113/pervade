"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, Image as ImageIcon, Star, Check } from "lucide-react";
import { CategorySelect } from "@/components/admin/CategorySelect";

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
  } catch (e) {}

  const [images, setImages] = useState<string[]>(parsedImages);
  const [detailContent, setDetailContent] = useState(product.detailContent || "");
  const [detailImages, setDetailImages] = useState<string[]>(parsedDetailImages);

  const [isUploading, setIsUploading] = useState(false);
  const [isDetailUploading, setIsDetailUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Multi-Image Upload
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/admin/products/upload-images", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, ...data.urls]);
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Detail Description Images Upload
  const handleDetailImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsDetailUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/admin/products/upload-images", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDetailImages((prev) => [...prev, ...data.urls]);
      } else {
        alert("상세 이미지 업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsDetailUploading(false);
    }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("최소 1개 이상의 제품 이미지를 등록해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
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
        alert("제품 정보가 성공적으로 수정되었습니다.");
        router.push("/admin/products");
        router.refresh();
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
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
    <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border space-y-8 shadow-sm">
      {/* 1. Category 2-Depth Hierarchy */}
      <CategorySelect
        category={category}
        subCategory={subCategory}
        onChangeCategory={setCategory}
        onChangeSubCategory={setSubCategory}
      />

      {/* 2. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">기본 제품 정보</h3>
        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">제품명 *</label>
          <input 
            type="text" required
            value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">간략 요약 설명 *</label>
          <textarea 
            required
            rows={3}
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">판매가 (원) *</label>
            <input 
              type="number" required
              value={price} onChange={e => setPrice(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">정상가/할인전 (원)</label>
            <input 
              type="number"
              value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
              className="w-full p-3 bg-zinc-50 border rounded-xl text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">현재 재고 (개)</label>
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
          <h3 className="text-base font-bold text-zinc-900">2. 제품 갤러리 이미지</h3>
          <span className="text-xs text-zinc-400">첫 번째 이미지가 대표 썸네일로 사용됩니다</span>
        </div>

        {/* Upload Button */}
        <div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            {isUploading ? "이미지 업로드 중..." : "이미지 추가 업로드 (다중 선택 가능)"}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageFilesUpload} 
              disabled={isUploading}
              className="hidden" 
            />
          </label>
        </div>

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
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">3. 상세페이지 상세 설명 및 안내 이미지</h3>
        
        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">상세페이지 통 이미지 업로드 (카드뉴스/상세페이지용)</label>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-zinc-800 border rounded-xl text-xs font-bold hover:bg-zinc-200 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {isDetailUploading ? "상세 이미지 업로드 중..." : "상세 이미지 추가"}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleDetailImageUpload} 
                disabled={isDetailUploading}
                className="hidden" 
              />
            </label>

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

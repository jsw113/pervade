"use client";

import { useState, useEffect } from "react";
import { PRODUCT_CATEGORIES, getSubCategoriesByMainCategory } from "@/lib/constants/categories";
import { Layers, Tag, Plus, Check } from "lucide-react";

interface CategorySelectProps {
  category: string;
  subCategory: string;
  onChangeCategory: (category: string) => void;
  onChangeSubCategory: (subCategory: string) => void;
}

export function CategorySelect({
  category,
  subCategory,
  onChangeCategory,
  onChangeSubCategory,
}: CategorySelectProps) {
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [customSubCategoryInput, setCustomSubCategoryInput] = useState("");

  useEffect(() => {
    const currentSubs = getSubCategoriesByMainCategory(category || "세정제류");
    setAvailableSubCategories(currentSubs);

    // If current subCategory is not in presets and not empty, it's custom
    if (subCategory && !currentSubs.includes(subCategory)) {
      setIsCustomSubCategory(true);
      setCustomSubCategoryInput(subCategory);
    }
  }, [category, subCategory]);

  const handleMainCategoryChange = (newCat: string) => {
    onChangeCategory(newCat);
    const newSubs = getSubCategoriesByMainCategory(newCat);
    setAvailableSubCategories(newSubs);
    // Set default subcategory to first preset
    if (newSubs.length > 0) {
      onChangeSubCategory(newSubs[0]);
      setIsCustomSubCategory(false);
    }
  };

  const handleSubCategorySelect = (sub: string) => {
    setIsCustomSubCategory(false);
    onChangeSubCategory(sub);
  };

  const handleCustomSubCategoryApply = () => {
    if (customSubCategoryInput.trim()) {
      onChangeSubCategory(customSubCategoryInput.trim());
    }
  };

  return (
    <div className="bg-zinc-50/80 p-5 rounded-2xl border space-y-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-zinc-900">제품 계열 및 용처 2단계 분류 (Category Depth)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs font-extrabold text-zinc-800 shadow-2xs">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          <span>{category || "세정제류"}</span>
          <span className="text-zinc-400">&gt;</span>
          <span className="text-amber-700">{subCategory || "다목적/올인원"}</span>
        </div>
      </div>

      {/* 1st Depth: 대분류 (제품 계열) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-700">
          1단계: 제품 대분류 (계열 선택) *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleMainCategoryChange(cat.name)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                    : "bg-white text-zinc-700 hover:bg-zinc-100/80 border-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2nd Depth: 중/소분류 (용처별 세부 용도) */}
      <div className="space-y-2 pt-1 border-t border-zinc-200/60">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-zinc-700">
            2단계: 용처별 중/소분류 (세부 용도 선택) *
          </label>
          <span className="text-[11px] text-zinc-500">
            선택된 계열: <strong className="text-zinc-800">{category || "세정제류"}</strong>
          </span>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {availableSubCategories.map((sub) => {
            const isSelected = !isCustomSubCategory && subCategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => handleSubCategorySelect(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {sub}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setIsCustomSubCategory(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
              isCustomSubCategory
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-dashed"
            }`}
          >
            <Plus className="w-3 h-3" /> 직접 입력
          </button>
        </div>

        {/* Custom Input when active */}
        {isCustomSubCategory && (
          <div className="flex items-center gap-2 pt-2 animate-in fade-in">
            <input
              type="text"
              value={customSubCategoryInput}
              onChange={(e) => setCustomSubCategoryInput(e.target.value)}
              onBlur={handleCustomSubCategoryApply}
              placeholder="직접 입력할 세부 용처를 입력하세요 (예: 가죽소파 케어, 스텐 연마)"
              className="flex-1 p-2.5 bg-white border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={handleCustomSubCategoryApply}
              className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800"
            >
              적용
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, Trash2, Edit2, Check, ArrowUp, ArrowDown, RefreshCw, Save, Tag, Sparkles, AlertCircle } from "lucide-react";
import { CategoryDefinition } from "@/lib/constants/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [subCategoryCounts, setSubCategoryCounts] = useState<Record<string, Record<string, number>>>({});
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // New Subcategory input
  const [newSubInput, setNewSubInput] = useState("");

  // Edit Main Category Modal/Inline
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.categories || []);
      if (Array.isArray(list) && list.length > 0) {
        setCategories(list);
        setSelectedCatId(list[0].id);
      }
      if (data.productCounts) {
        setProductCounts(data.productCounts);
      }
      if (data.subCategoryCounts) {
        setSubCategoryCounts(data.subCategoryCounts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (updatedList = categories) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedList }),
      });
      if (res.ok) {
        alert("카테고리 마스터 설정이 성공적으로 저장되었습니다.");
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (e: any) {
      alert("오류 발생: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("모든 카테고리를 표준 기본값(세정제류, 탈취제류, 살균제류 등)으로 초기화하시겠습니까?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { method: "DELETE" });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        setSelectedCatId(data.categories[0].id);
        alert("표준 기본 분류로 초기화되었습니다.");
      }
    } catch (e: any) {
      alert("초기화 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Add 1st Depth (대분류)
  const handleAddMainCategory = () => {
    if (!newCatName.trim()) {
      alert("대분류 이름을 입력해주세요.");
      return;
    }

    const newCategory: CategoryDefinition = {
      id: "cat_" + Date.now(),
      name: newCatName.trim(),
      description: newCatDesc.trim() || `${newCatName.trim()} 전용 라인업`,
      subCategories: ["기본/일반용"],
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    setSelectedCatId(newCategory.id);
    setNewCatName("");
    setNewCatDesc("");
    setShowAddCatModal(false);
  };

  // Edit 1st Depth
  const startEditCategory = (cat: CategoryDefinition) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description);
  };

  const saveEditCategory = (id: string) => {
    if (!editName.trim()) return;
    const updated = categories.map((c) =>
      c.id === id ? { ...c, name: editName.trim(), description: editDesc.trim() } : c
    );
    setCategories(updated);
    setEditingCatId(null);
  };

  // Delete 1st Depth
  const handleDeleteCategory = (id: string, name: string) => {
    if (categories.length <= 1) {
      alert("최소 1개 이상의 대분류가 유지되어야 합니다.");
      return;
    }
    if (!confirm(`'${name}' 대분류와 하위 용처 목록을 삭제하시겠습니까?`)) return;

    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    if (selectedCatId === id) {
      setSelectedCatId(updated[0].id);
    }
  };

  // Move category up/down
  const moveCategory = (index: number, direction: "UP" | "DOWN") => {
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setCategories(updated);
  };

  // Add 2nd Depth (중/소분류)
  const handleAddSubCategory = (catId: string) => {
    if (!newSubInput.trim()) return;
    const subName = newSubInput.trim();

    const updated = categories.map((c) => {
      if (c.id === catId) {
        if (c.subCategories.includes(subName)) {
          alert("이미 존재하는 용처 분류입니다.");
          return c;
        }
        return { ...c, subCategories: [...c.subCategories, subName] };
      }
      return c;
    });

    setCategories(updated);
    setNewSubInput("");
  };

  // Delete 2nd Depth
  const handleDeleteSubCategory = (catId: string, subIndex: number) => {
    const updated = categories.map((c) => {
      if (c.id === catId) {
        if (c.subCategories.length <= 1) {
          alert("최소 1개 이상의 세부 용처가 필요합니다.");
          return c;
        }
        const filtered = c.subCategories.filter((_, idx) => idx !== subIndex);
        return { ...c, subCategories: filtered };
      }
      return c;
    });
    setCategories(updated);
  };

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
              Category Hierarchy Master
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">제품 카테고리 계층 마스터 관리</h1>
          <p className="text-xs text-zinc-500 mt-1">
            쇼핑몰의 대분류(제품 계열)와 중/소분류(용처 및 세부 용도) 2단계 구조를 자유롭게 추가, 수정, 삭제합니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={loading || saving}
            className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            기본값 초기화
          </button>
          <button
            type="button"
            onClick={() => handleSaveAll(categories)}
            disabled={saving || loading}
            className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "저장 중..." : "전체 변경사항 저장"}
          </button>
        </div>
      </div>

      {/* PG Inspection Rule Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="text-xs text-blue-950 space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>🛡️ 토스페이먼츠 및 카드사 PG 심사 규정 준수 시스템 적용</span>
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">자동 심사 보호</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            고객 및 PG 심사관이 빈 카테고리를 클릭하여 <em>'등록된 상품이 없습니다'</em> 페이지를 보는 것을 방지하기 위해, <strong>실제 판매 상품이 1개 이상 등록된 카테고리만 쇼핑몰(`/shop`)에 자동으로 노출</strong>됩니다. 상품 관리에서 해당 카테고리로 상품을 등록하시면 즉시 쇼핑몰 탭에 자동 활성화됩니다.
          </p>
        </div>
      </div>

      {/* Grid Layout: 1st Depth (Left) & 2nd Depth (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: 1st Depth (대분류) Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex justify-between items-center bg-zinc-900 text-white p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider">1단계: 대분류 (제품 계열)</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCatModal(true)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 대분류 추가
            </button>
          </div>

          {/* Add Category Inline Box */}
          {showAddCatModal && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-amber-900">신규 대분류 생성</span>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-700"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="대분류명 (예: 차량용 케어, 펫 전용)"
                className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="간략 설명 (예: 프리미엄 자동차 내외장 관리)"
                className="w-full p-2.5 bg-white border rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleAddMainCategory}
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800"
                >
                  추가하기
                </button>
              </div>
            </div>
          )}

          {/* Main Category Cards */}
          <div className="space-y-2">
            {categories.map((cat, index) => {
              const isSelected = selectedCatId === cat.id;
              const isEditing = editingCatId === cat.id;
              const count = productCounts[cat.name] || 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => !isEditing && setSelectedCatId(cat.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-white border-zinc-950 shadow-md ring-2 ring-zinc-950/10"
                      : "bg-white/80 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 bg-zinc-50 border rounded-lg text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full p-2 bg-zinc-50 border rounded-lg text-[11px]"
                      />
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2.5 py-1 border rounded text-[10px] font-bold text-zinc-600"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditCategory(cat.id)}
                          className="px-3 py-1 bg-zinc-950 text-white rounded text-[10px] font-bold"
                        >
                          완료
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-sm ${isSelected ? "text-zinc-950" : "text-zinc-800"}`}>
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                            {cat.subCategories.length}개 용처
                          </span>
                          {count > 0 ? (
                            <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                              🟢 쇼핑몰 노출 ({count}개)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full border border-zinc-200">
                              ⚪ 미노출 (0개)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">{cat.description}</p>
                      </div>

                      {/* Reorder and action buttons */}
                      <div className="flex items-center gap-1 pl-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveCategory(index, "UP")}
                          className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-20"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === categories.length - 1}
                          onClick={() => moveCategory(index, "DOWN")}
                          className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-20"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className="p-1 text-zinc-400 hover:text-zinc-950"
                          title="이름/설명 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="대분류 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 2nd Depth (중/소분류 - 용처별) Column */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Selected Category
                </span>
                <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2 mt-0.5">
                  <Tag className="w-4 h-4 text-amber-600" />
                  {selectedCategory?.name}
                  <span className="text-xs font-normal text-zinc-500">
                    ({selectedCategory?.description})
                  </span>
                </h3>
              </div>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                2단계 세부 용처 관리
              </span>
            </div>

            {/* Subcategory Tags List */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-700">
                등록된 세부 용처 및 중/소분류 태그:
              </label>
              
              <div className="flex flex-wrap gap-2.5 min-h-[100px] p-4 bg-zinc-50 border rounded-2xl">
                {selectedCategory?.subCategories.map((sub, sIdx) => {
                  const subCount = subCategoryCounts[selectedCategory?.name || ""]?.[sub] || 0;
                  return (
                    <div
                      key={sIdx}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs border transition-colors ${
                        subCount > 0
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                          : "bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400"
                      }`}
                    >
                      <span>{sub}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        subCount > 0 ? "bg-emerald-200 text-emerald-900" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {subCount}개
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubCategory(selectedCategory.id, sIdx)}
                        className="text-zinc-400 hover:text-red-600 rounded p-0.5 transition-colors ml-0.5"
                        title="용처 태그 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Subcategory Form */}
            <div className="space-y-2 pt-2 border-t">
              <label className="block text-xs font-bold text-zinc-700">
                새로운 세부 용처 추가 (Enter 키 또는 추가 버튼):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubInput}
                  onChange={(e) => setNewSubInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubCategory(selectedCategory.id);
                    }
                  }}
                  placeholder="예: 가죽소파/가죽의류, 텀블러/식기세정, 아기장난감"
                  className="flex-1 p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubCategory(selectedCategory.id)}
                  className="px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> 용처 추가
                </button>
              </div>
            </div>

            {/* Live Customer Preview */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <h4 className="text-xs font-black text-amber-950">쇼핑몰 고객 화면 실시간 노출 프리뷰</h4>
              </div>
              <p className="text-[11px] text-zinc-600">
                고객이 쇼핑몰(`/shop`)에서 <strong>[{selectedCategory?.name}]</strong>을 클릭했을 때 나타나는 서브 칩입니다:
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-600 text-white">전체</span>
                {selectedCategory?.subCategories.map((sub, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-zinc-200 text-zinc-700">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

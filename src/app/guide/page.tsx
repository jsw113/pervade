"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Sparkles, ArrowRight, Eye, Tag, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GuideHubPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedProduct, setSelectedProduct] = useState("전체");

  useEffect(() => {
    // Fetch Products for filter
    fetch("/api/admin/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error(err));

    // Fetch Guides
    fetchGuides();
  }, []);

  const fetchGuides = async (cat: string = selectedCategory, prod: string = selectedProduct) => {
    setLoading(true);
    try {
      let url = `/api/guides?`;
      if (cat !== "전체") url += `category=${encodeURIComponent(cat)}&`;
      if (prod !== "전체") url += `productId=${encodeURIComponent(prod)}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchGuides(cat, selectedProduct);
  };

  const handleProductChange = (prod: string) => {
    setSelectedProduct(prod);
    fetchGuides(selectedCategory, prod);
  };

  const filteredGuides = guides.filter(g => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.title?.toLowerCase().includes(q) ||
      g.summary?.toLowerCase().includes(q) ||
      g.content?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl min-h-[75vh]">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest inline-flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-zinc-500" />
          Pervade Living Guide & Journal
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
          제품별 공식 사용 가이드
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          공간과 오염 유형에 맞춘 전문가의 청소 루틴과 제품별 세정 노하우를 만나보세요.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-2 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="공간 또는 청소 고민 검색 (예: 인덕션, 물때, 가죽)"
            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
        </div>
      </div>

      {/* Filter Tabs & Product Select */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 border-b pb-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {["전체", "주방", "욕실", "리빙/가구", "유리/거울", "다목적"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Package className="w-4 h-4 text-zinc-400" />
          <select
            value={selectedProduct}
            onChange={(e) => handleProductChange(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="전체">모든 제품 가이드</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guide Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-zinc-400 text-sm">
          사용 가이드 콘텐츠를 불러오는 중...
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="py-24 text-center space-y-3 bg-zinc-50 rounded-2xl border">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-base text-zinc-800">해당 조건의 가이드가 없습니다</h3>
          <p className="text-xs text-zinc-500">다른 카테고리나 검색어로 확인해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => (
            <Link
              href={`/guide/${guide.id}`}
              key={guide.id}
              className="group bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/10] bg-zinc-100 relative overflow-hidden">
                {guide.thumbnailUrl ? (
                  <img
                    src={guide.thumbnailUrl}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <BookOpen className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {guide.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {guide.product && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {guide.product.name}
                    </span>
                  )}
                  <h3 className="font-bold text-lg text-zinc-950 group-hover:text-zinc-600 transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {guide.summary || guide.content?.replace(/[#*`]/g, '')}
                  </p>
                </div>

                <div className="pt-4 border-t flex justify-between items-center text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {guide.viewCount}
                    </span>
                  </div>
                  <span className="font-bold text-zinc-950 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    읽기 <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

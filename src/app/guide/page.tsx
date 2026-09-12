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
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 min-h-[75vh] space-y-12 sm:space-y-16">
      {/* Clean Luxury Header (Matching PRODUCTS) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200/70 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-950 tracking-tight uppercase">
            GUIDE
          </h1>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="공간 또는 청소 고민 검색"
            className="w-full pl-8 pr-3 py-2 bg-transparent border-b border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-1 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs & Product Select */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Category Tabs */}
        <div className="flex gap-4 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 text-xs">
          {["전체", "주방", "욕실", "리빙/가구", "유리/거울", "다목적"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`pb-1 transition-colors shrink-0 font-medium ${
                selectedCategory === cat
                  ? "text-zinc-950 border-b border-zinc-950"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 text-xs text-zinc-500">
          <select
            value={selectedProduct}
            onChange={(e) => handleProductChange(e.target.value)}
            className="py-1 bg-transparent border-b border-zinc-200 text-xs text-zinc-700 focus:outline-none focus:border-zinc-900 cursor-pointer"
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
        <div className="py-24 text-center text-zinc-400 text-xs">
          가이드 콘텐츠를 불러오는 중...
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <h3 className="text-sm font-medium text-zinc-800">해당 조건의 가이드가 없습니다</h3>
          <p className="text-xs text-zinc-400">다른 카테고리나 검색어로 확인해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {filteredGuides.map((guide) => (
            <article key={guide.id} className="group flex flex-col justify-between space-y-5">
              <Link href={`/guide/${guide.id}`} className="block space-y-5">
                {/* Sharp Editorial Image */}
                <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative">
                  {guide.thumbnailUrl ? (
                    <img
                      src={guide.thumbnailUrl}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono tracking-wider">
                    <span>{guide.category}</span>
                    {guide.product && (
                      <>
                        <span>·</span>
                        <span className="text-zinc-600 font-medium">{guide.product.name}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif font-normal text-xl sm:text-2xl text-zinc-950 group-hover:text-zinc-600 transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-light line-clamp-2 leading-relaxed">
                    {guide.summary || guide.content?.replace(/[#*`]/g, '')}
                  </p>
                </div>
              </Link>

              <div className="pt-1">
                <Link
                  href={`/guide/${guide.id}`}
                  className="text-xs font-semibold tracking-wider uppercase text-zinc-900 group-hover:text-zinc-500 inline-flex items-center gap-1.5 transition-colors"
                >
                  가이드 읽기
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

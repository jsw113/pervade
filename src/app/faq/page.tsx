"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

const defaultFaqs = [
  {
    id: "def-1",
    category: "상품",
    title: "퍼베이드 다목적 세정제는 어떤 재질에 사용할 수 있나요?",
    body: "주방 인덕션, 가스레인지, 싱크대, 타일, 화장실 욕조 및 세면대, 가구 표면, 유리창 등 대부분의 일상 생활 공간에 안전하게 사용 가능합니다. 단, 천연 대리석이나 무코팅 원목 등 특수 흡수성 재질의 경우 눈에 띄지 않는 작은 부위에 먼저 테스트 후 사용을 권장합니다."
  },
  {
    id: "def-2",
    category: "상품",
    title: "피부에 닿아도 안전한 성분인가요?",
    body: "퍼베이드 세정제는 유해 화학물질(CMIT/MIT, 형광증백제, 인공색소 등)을 배제하고 식물 유래 계면활성제와 순한 세정 성분으로 포뮬러되었습니다. 피부 자극 테스트를 완료하여 안심하고 사용하실 수 있습니다."
  },
  {
    id: "def-3",
    category: "배송",
    title: "배송은 얼마나 걸리나요?",
    body: "평일 오후 2시 이전 결제 완료 건은 당일 출고되며, 일반 택배 기준 평균 1~2영업일 이내에 수령하실 수 있습니다. (도서산간 지역의 경우 1~2일 추가 소요될 수 있습니다.)"
  },
  {
    id: "def-4",
    category: "배송",
    title: "무료배송 기준은 얼마인가요?",
    body: "기본 배송비는 3,000원이며, 30,000원 이상 구매 시 무료배송 혜택이 자동 적용됩니다. 신규 회원 가입 시 첫 구매 무료배송 쿠폰이 제공됩니다."
  },
  {
    id: "def-5",
    category: "교환/반품",
    title: "교환 및 반품 신청은 어떻게 하나요?",
    body: "상품 수령 후 7일 이내에 [마이페이지] 또는 [1:1 Q&A]를 통해 접수해 주시면 됩니다. 단순 변심에 의한 반품의 경우 왕복 택배비(6,000원)가 발생하며, 제품 하자나 오배송의 경우 배송비는 전액 본사에서 부담합니다."
  },
  {
    id: "def-6",
    category: "주문/결제",
    title: "실명인증(본인인증)은 왜 필요한가요?",
    body: "안전하고 투명한 전자상거래 질서 확립과 부정 주문/도용 방지를 위해 본인확인 절차를 도입하고 있습니다. 실명인증을 완료하신 회원님께는 추천인 리워드 적립 및 VIP 승급 혜택이 적용됩니다."
  }
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [expandedId, setExpandedId] = useState<string | null>("def-1");

  useEffect(() => {
    fetch("/api/contents?category=FAQ")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(defaultFaqs);
        }
      })
      .catch(() => setFaqs(defaultFaqs))
      .finally(() => setLoading(false));
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "전체" || faq.category === selectedCategory;
    const matchesSearch = 
      faq.title.toLowerCase().includes(search.toLowerCase()) || 
      faq.body.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Customer Help Center</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">자주 묻는 질문 (FAQ)</h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          고객님들께서 가장 자주 문의하시는 내용을 모았습니다.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="궁금한 키워드를 검색해보세요 (예: 배송, 성분, 환불)"
            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 mt-2" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
        {["전체", "상품", "배송", "교환/반품", "주문/결제"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm divide-y">
        {filteredFaqs.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-sm">
            검색 결과와 일치하는 자주 묻는 질문이 없습니다.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div key={faq.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[11px] font-bold shrink-0">
                      {faq.category || "일반"}
                    </span>
                    <span className="font-bold text-sm text-zinc-900 leading-snug">
                      {faq.title}
                    </span>
                  </div>
                  <div className="text-zinc-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-1 text-xs text-zinc-600 leading-relaxed whitespace-pre-line bg-zinc-50/50 border-t">
                    {faq.body}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direct 1:1 Inquire Banner */}
      <div className="mt-12 bg-zinc-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-base">원하시는 답변을 찾지 못하셨나요?</h3>
          <p className="text-xs text-zinc-400">
            1:1 Q&A 게시판에 문의글을 남겨주시면 전담 상담원이 빠르게 안내해 드립니다.
          </p>
        </div>
        <Link
          href="/qna"
          className="px-6 py-3 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          1:1 문의 남기기
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

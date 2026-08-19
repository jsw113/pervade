"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Lock, CheckCircle2, Clock, ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QnaPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<any | null>(null);

  // Write Modal
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("상품");
  const [isSecret, setIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAuthAndQuestions = async () => {
    setLoading(true);
    try {
      // Auth
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.loggedIn) setUser(authData.user);
        else setUser(null);
      } else {
        setUser(null);
      }

      // Questions
      const res = await fetch("/api/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthAndQuestions();
  }, []);

  const handleOpenWriteModal = () => {
    if (!user) {
      if (confirm("1:1 문의를 작성하시려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }
    setIsWriteOpen(true);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, isSecret }),
      });

      if (res.ok) {
        alert("문의가 성공적으로 등록되었습니다. 담당자가 확인 후 신속히 답변드리겠습니다.");
        setIsWriteOpen(false);
        setTitle("");
        setContent("");
        setIsSecret(false);
        fetchAuthAndQuestions();
      } else {
        const err = await res.json();
        alert(err.error || "문의 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (selectedCategory === "전체") return true;
    return q.category === selectedCategory;
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-8 mb-8">
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Customer Support</span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 mt-1">1:1 Q&A 게시판</h1>
          <p className="text-sm text-zinc-500 mt-2">
            제품 사용법, 주문/배송, 교환 및 환불 등 궁금한 점을 남겨주시면 정성껏 답변해 드립니다.
          </p>
        </div>

        <button
          onClick={handleOpenWriteModal}
          className="px-5 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          문의글 작성하기
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["전체", "상품", "배송", "교환/반품", "일반"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
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

      {/* Questions Board List */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm divide-y">
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">
            문의 목록을 불러오는 중...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto" />
            <p className="text-zinc-500 font-medium text-sm">등록된 문의 내역이 없습니다.</p>
            <p className="text-zinc-400 text-xs">궁금하신 사항이 있으시면 첫 문의를 남겨보세요!</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const hasAnswer = !!q.answer;

            return (
              <div key={q.id} className="transition-colors">
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[11px] font-bold shrink-0">
                      {q.category || "일반"}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      {q.isSecret && <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                      <span className="font-semibold text-sm text-zinc-900 truncate">
                        {q.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-zinc-400">{q.userName}</span>
                      <span className="text-zinc-300 mx-1.5">·</span>
                      <span className="text-[11px] text-zinc-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      {hasAnswer ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 답변완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> 답변대기
                        </span>
                      )}
                    </div>

                    <button className="text-zinc-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 py-5 bg-zinc-50/50 border-t space-y-4 text-xs">
                    {/* Question Body */}
                    <div className="bg-white p-4 rounded-xl border space-y-2">
                      <div className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                        Q. 고객 문의 내용
                      </div>
                      <p className="text-zinc-800 text-sm whitespace-pre-line leading-relaxed">
                        {q.content}
                      </p>
                    </div>

                    {/* Admin Answer Box */}
                    {hasAnswer ? (
                      <div className="bg-zinc-900 text-white p-5 rounded-xl space-y-3 shadow-sm border border-zinc-800">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>PERVADE 고객센터 공식 답변</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">CS 전담팀</span>
                        </div>
                        <p className="text-zinc-200 text-xs whitespace-pre-line leading-relaxed font-light">
                          {q.answer}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-100/70 rounded-xl text-center text-zinc-500 text-xs">
                        담당자가 문의 내용을 확인하고 있습니다. 빠른 시일 내에 친절히 답변드리겠습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Write Modal */}
      {isWriteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">1:1 문의글 작성</span>
              </div>
              <button 
                onClick={() => setIsWriteOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">문의 유형 *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="상품">상품 관련 문의</option>
                  <option value="배송">배송 및 일정 문의</option>
                  <option value="교환/반품">교환 / 반품 / 취소 문의</option>
                  <option value="일반">기타 일반 문의</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문의 제목을 간결하게 입력해주세요"
                  className="w-full px-3 py-2.5 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">문의 내용 *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="궁금하신 내용을 구체적으로 작성해주시면 더욱 정확한 안내가 가능합니다."
                  className="w-full px-3 py-2.5 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-zinc-50 rounded-xl border">
                  <input
                    type="checkbox"
                    checked={isSecret}
                    onChange={(e) => setIsSecret(e.target.checked)}
                    className="w-4 h-4 text-zinc-900 rounded focus:ring-zinc-900"
                  />
                  <span className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    비밀글로 등록 (작성자 본인과 관리자만 열람)
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsWriteOpen(false)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "등록 중..." : "문의 등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Search, Mail, MessageSquare, Send, CheckCircle, RefreshCw, Star, Trash2, Reply, Check } from "lucide-react";

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<"CRM" | "QA" | "REVIEW">("CRM");
  
  // Real Users for CRM
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<"KAKAO" | "SMS" | "EMAIL">("KAKAO");
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Q&A States
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  // Review States
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [answeringReviewId, setAnsweringReviewId] = useState<string | null>(null);
  const [reviewAnswerText, setReviewAnswerText] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users for CRM:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await fetch("/api/admin/questions");
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch("/api/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === "CRM") {
      fetchUsers();
    } else if (activeTab === "QA") {
      fetchQuestions();
    } else if (activeTab === "REVIEW") {
      fetchReviews();
    }
  }, [activeTab]);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uId) => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0) {
      alert("메시지를 발송할 회원을 1명 이상 선택해주세요.");
      return;
    }
    if (!messageContent.trim()) {
      alert("발송할 메시지 내용을 입력해주세요.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/admin/crm/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUsers,
          type: messageType,
          content: messageContent,
        }),
      });

      if (response.ok) {
        alert(`${selectedUsers.length}명의 고객에게 메시지가 성공적으로 발송되었습니다.`);
        setMessageContent("");
        setSelectedUsers([]);
      } else {
        alert("메시지 발송에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("발송 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // Submit Q&A Answer
  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText }),
      });

      if (response.ok) {
        alert("답변이 성공적으로 등록되었습니다.");
        setAnsweringId(null);
        setAnswerText("");
        fetchQuestions();
      } else {
        alert("답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // Delete Q&A Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("정말로 이 문의를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("문의가 삭제되었습니다.");
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Review Reply Comment
  const handleReviewCommentSubmit = async (reviewId: string) => {
    if (!reviewAnswerText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reviewAnswerText }),
      });

      if (response.ok) {
        alert("리뷰 관리자 댓글이 성공적으로 등록되었습니다.");
        setAnsweringReviewId(null);
        setReviewAnswerText("");
        fetchReviews();
      } else {
        alert("댓글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM & 고객 관리 센터</h1>
          <p className="text-sm text-zinc-500 mt-1">
            실시간 등록 회원 타겟 마케팅 메시지 발송, 1:1 Q&A 문의 답변 및 리뷰 댓글을 통합 관리합니다.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("CRM")}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "CRM"
              ? "border-black text-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Mail className="w-4 h-4" />
          고객 메시지 발송 (CRM)
        </button>
        <button
          onClick={() => setActiveTab("QA")}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "QA"
              ? "border-black text-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          1:1 Q&A 문의 답변 ({questions.filter((q) => !q.answer).length}건 대기)
        </button>
        <button
          onClick={() => setActiveTab("REVIEW")}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "REVIEW"
              ? "border-black text-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Star className="w-4 h-4" />
          리뷰 댓글 관리 ({reviews.filter((r) => !r.comment).length}건 대기)
        </button>
      </div>

      {/* 1. CRM Tab */}
      {activeTab === "CRM" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-zinc-50 border-b flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-600">
                  전체 DB 회원 목록 ({users.length}명)
                </span>
                <button
                  onClick={fetchUsers}
                  className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors"
                  title="새로고침"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b text-zinc-500 font-bold sticky top-0">
                    <tr>
                      <th className="p-4">
                        <input
                          type="checkbox"
                          checked={users.length > 0 && selectedUsers.length === users.length}
                          onChange={handleSelectAll}
                          className="rounded text-zinc-900 focus:ring-zinc-900"
                        />
                      </th>
                      <th className="py-3 px-4">고객명 / 이메일</th>
                      <th className="py-3 px-4">전화번호</th>
                      <th className="py-3 px-4">총 구매액</th>
                      <th className="py-3 px-4">등급 / 마케팅동의</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          실시간 DB 회원 정보를 불러오는 중...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          등록된 회원이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const isSelected = selectedUsers.includes(user.id);
                        const isVip = user.totalPurchases >= 500000;
                        return (
                          <tr
                            key={user.id}
                            className={`hover:bg-zinc-50 transition-colors cursor-pointer ${
                              isSelected ? "bg-zinc-50/80" : ""
                            }`}
                            onClick={() => handleSelectUser(user.id)}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectUser(user.id)}
                                className="rounded text-zinc-900 focus:ring-zinc-900"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-zinc-900">{user.name}</div>
                              <div className="text-[11px] text-zinc-400">{user.email}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-zinc-700">
                              {user.phone || "-"}
                            </td>
                            <td className="py-3 px-4 font-bold text-blue-600">
                              ₩{(user.totalPurchases || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${
                                isVip ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-600"
                              }`}>
                                {isVip ? "VIP" : "일반"}
                              </span>
                              <span className={`text-[10px] font-medium ${
                                user.marketingConsent ? "text-emerald-600" : "text-zinc-400"
                              }`}>
                                {user.marketingConsent ? "동의완료" : "미동의"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Message Composition Panel */}
          <div className="space-y-4">
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-zinc-600" />
                마케팅 & 알림 메시지 발송
              </h2>

              <div className="p-3 bg-zinc-50 rounded-xl border text-xs text-zinc-600 flex justify-between items-center">
                <span>선택된 대상 고객</span>
                <span className="font-bold text-zinc-900">{selectedUsers.length}명</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2">발송 채널</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["KAKAO", "SMS", "EMAIL"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMessageType(type)}
                      className={`py-2 text-xs font-bold border rounded-xl transition-all ${
                        messageType === type
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {type === "KAKAO" ? "알림톡" : type === "SMS" ? "SMS 문자" : "이메일"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2">메시지 본문</label>
                <textarea
                  rows={6}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="고객에게 전달할 혜택, 재입고 알림, 쿠폰 안내 메시지를 입력하세요."
                  className="w-full p-3 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isSending || selectedUsers.length === 0}
                className="w-full py-3.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSending ? "발송 중..." : `${selectedUsers.length}명에게 즉시 발송`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Q&A Tab */}
      {activeTab === "QA" && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm divide-y">
          <div className="p-4 bg-zinc-50 border-b flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-600">
              전체 1:1 Q&A 문의 내역 ({questions.length}건)
            </span>
            <button
              onClick={fetchQuestions}
              className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingQuestions ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              문의 내역을 불러오는 중...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              등록된 Q&A 문의가 없습니다.
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold">
                        {q.category || "일반"}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-900">{q.title}</h3>
                      {q.isSecret && (
                        <span className="text-[10px] text-zinc-400 font-medium">🔒 비밀글</span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400">
                      작성자: {q.user?.name} ({q.user?.email}) · {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {q.answer ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                        답변 완료
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                        답변 대기중
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 rounded"
                      title="문의 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-700 whitespace-pre-line border">
                  {q.content}
                </div>

                {/* Existing Answer or Answer Form */}
                {q.answer && answeringId !== q.id ? (
                  <div className="bg-zinc-900 text-white p-4 rounded-xl text-xs space-y-2 border border-zinc-800">
                    <div className="flex justify-between items-center text-amber-300 font-bold text-[11px]">
                      <span>공식 관리자 답변</span>
                      <button
                        onClick={() => {
                          setAnsweringId(q.id);
                          setAnswerText(q.answer);
                        }}
                        className="text-zinc-400 hover:text-white underline text-[10px]"
                      >
                        수정하기
                      </button>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-zinc-200">{q.answer}</p>
                  </div>
                ) : answeringId === q.id ? (
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border">
                    <label className="block text-xs font-bold text-zinc-700">관리자 공식 답변 작성</label>
                    <textarea
                      rows={4}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="고객에게 전달할 공식 답변을 친절하게 작성해주세요."
                      className="w-full p-3 bg-white border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setAnsweringId(null);
                          setAnswerText("");
                        }}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleAnswerSubmit(q.id)}
                        className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        답변 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        setAnsweringId(q.id);
                        setAnswerText("");
                      }}
                      className="px-3 py-1.5 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 flex items-center gap-1.5"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      답변 작성하기
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. Review Tab */}
      {activeTab === "REVIEW" && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm divide-y">
          <div className="p-4 bg-zinc-50 border-b flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-600">
              전체 고객 후기/리뷰 목록 ({reviews.length}건)
            </span>
            <button
              onClick={fetchReviews}
              className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReviews ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingReviews ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              리뷰 목록을 불러오는 중...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              등록된 리뷰가 없습니다.
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400" : "text-zinc-200"}`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-zinc-800">
                        {r.product?.name || "상품 후기"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      작성자: {r.user?.name} · {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    {r.comment ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                        댓글 완료
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-bold">
                        댓글 대기
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-700 whitespace-pre-line border">
                  {r.content}
                </div>

                {/* Existing Reply Comment or Comment Form */}
                {r.comment && answeringReviewId !== r.id ? (
                  <div className="bg-zinc-900 text-white p-4 rounded-xl text-xs space-y-2 border border-zinc-800">
                    <div className="flex justify-between items-center text-amber-300 font-bold text-[11px]">
                      <span>공식 브랜드 감사 댓글</span>
                      <button
                        onClick={() => {
                          setAnsweringReviewId(r.id);
                          setReviewAnswerText(r.comment);
                        }}
                        className="text-zinc-400 hover:text-white underline text-[10px]"
                      >
                        수정
                      </button>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-zinc-200">{r.comment}</p>
                  </div>
                ) : answeringReviewId === r.id ? (
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border">
                    <label className="block text-xs font-bold text-zinc-700">관리자 감사/응대 댓글 작성</label>
                    <textarea
                      rows={3}
                      value={reviewAnswerText}
                      onChange={(e) => setReviewAnswerText(e.target.value)}
                      placeholder="소중한 후기에 대한 감사 인사를 남겨주세요."
                      className="w-full p-3 bg-white border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setAnsweringReviewId(null);
                          setReviewAnswerText("");
                        }}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleReviewCommentSubmit(r.id)}
                        className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        댓글 등록
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        setAnsweringReviewId(r.id);
                        setReviewAnswerText("");
                      }}
                      className="px-3 py-1.5 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 flex items-center gap-1.5"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      댓글 달기
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

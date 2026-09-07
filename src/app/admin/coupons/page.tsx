"use client";

import { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Percent,
  DollarSign,
  Tag,
  Copy,
  Layers
} from "lucide-react";

interface Coupon {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  validFrom: string;
  validUntil: string | null;
  totalQuantity: number | null;
  issuedQuantity: number;
  usedQuantity: number;
  issueType: "ALL_USERS" | "MANUAL" | "CODE_REGISTER" | "CHANNEL" | "SIGNUP";
  targetChannel: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    userCoupons: number;
    orders: number;
  };
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
  loginId: string | null;
  phone: string | null;
  role: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FIXED" | "PERCENT">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "OUT_OF_STOCK">("ALL");

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(5000);
  const [formMinOrder, setFormMinOrder] = useState<number>(0);
  const [formMaxDiscount, setFormMaxDiscount] = useState<string>("");
  const [formValidFrom, setFormValidFrom] = useState<string>("");
  const [formValidUntil, setFormValidUntil] = useState<string>("");
  const [formTotalQuantity, setFormTotalQuantity] = useState<string>("");
  const [formIssueType, setFormIssueType] = useState<"ALL_USERS" | "MANUAL" | "CODE_REGISTER" | "CHANNEL" | "SIGNUP">("MANUAL");
  const [formTargetChannel, setFormTargetChannel] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Target User Issue Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueTargetCoupon, setIssueTargetCoupon] = useState<Coupon | null>(null);
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [issueToAll, setIssueToAll] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoupons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersForIssue = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormName("");
    setFormCode("");
    setFormDesc("");
    setFormDiscountType("FIXED");
    setFormDiscountValue(5000);
    setFormMinOrder(0);
    setFormMaxDiscount("");
    const todayStr = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFormValidFrom(todayStr);
    setFormValidUntil(nextMonth);
    setFormTotalQuantity("");
    setFormIssueType("MANUAL");
    setFormTargetChannel("");
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormName(c.name);
    setFormCode(c.code || "");
    setFormDesc(c.description || "");
    setFormDiscountType(c.discountType);
    setFormDiscountValue(c.discountValue);
    setFormMinOrder(c.minOrderAmount || 0);
    setFormMaxDiscount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : "");
    setFormValidFrom(c.validFrom ? c.validFrom.split("T")[0] : "");
    setFormValidUntil(c.validUntil ? c.validUntil.split("T")[0] : "");
    setFormTotalQuantity(c.totalQuantity ? String(c.totalQuantity) : "");
    setFormIssueType(c.issueType);
    setFormTargetChannel(c.targetChannel || "");
    setFormIsActive(c.isActive);
    setShowModal(true);
  };

  const handleGenerateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "PV-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormCode(code);
  };

  const handleSubmitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formDiscountValue <= 0) {
      alert("쿠폰명과 유효한 할인 금액/할인율을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        code: formCode.trim() || null,
        description: formDesc.trim() || null,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        minOrderAmount: Number(formMinOrder || 0),
        maxDiscountAmount: formMaxDiscount ? Number(formMaxDiscount) : null,
        validFrom: formValidFrom ? new Date(formValidFrom).toISOString() : new Date().toISOString(),
        validUntil: formValidUntil ? new Date(formValidUntil + "T23:59:59").toISOString() : null,
        totalQuantity: formTotalQuantity ? Number(formTotalQuantity) : null,
        issueType: formIssueType,
        targetChannel: formTargetChannel.trim() || null,
        isActive: formIsActive
      };

      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(editingCoupon ? "쿠폰이 성공적으로 수정되었습니다." : "신규 쿠폰이 성공적으로 발행되었습니다.");
        setShowModal(false);
        fetchCoupons();
      } else {
        alert("오류: " + (data.error || "저장에 실패했습니다."));
      }
    } catch (err: any) {
      alert("오류 발생: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive })
      });
      if (res.ok) {
        fetchCoupons();
      } else {
        const data = await res.json();
        alert("상태 변경 실패: " + data.error);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  const handleDeleteCoupon = async (c: Coupon) => {
    if (!confirm(`'${c.name}' 쿠폰을 정말 삭제하시겠습니까? 관련 발급 및 사용 내역도 정리됩니다.`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("쿠폰이 삭제되었습니다.");
        fetchCoupons();
      } else {
        const data = await res.json();
        alert("삭제 실패: " + data.error);
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    }
  };

  // Issue modal open
  const handleOpenIssueModal = (c: Coupon) => {
    setIssueTargetCoupon(c);
    setSelectedUserIds([]);
    setIssueToAll(false);
    setUserSearch("");
    setShowIssueModal(true);
    fetchUsersForIssue();
  };

  const handleExecuteIssue = async () => {
    if (!issueTargetCoupon) return;
    if (!issueToAll && selectedUserIds.length === 0) {
      alert("지급할 대상을 1명 이상 선택해주세요.");
      return;
    }

    const confirmMsg = issueToAll
      ? `전체 등록 회원에게 '${issueTargetCoupon.name}' 쿠폰을 일괄 지급하시겠습니까?`
      : `선택한 ${selectedUserIds.length}명의 회원에게 '${issueTargetCoupon.name}' 쿠폰을 지급하시겠습니까?`;

    if (!confirm(confirmMsg)) return;

    setIsIssuing(true);
    try {
      const res = await fetch(`/api/admin/coupons/${issueTargetCoupon.id}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueToAll,
          userIds: selectedUserIds
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`쿠폰이 성공적으로 지급되었습니다!\n(성공: ${data.issuedCount}명, 중복 제외: ${data.skippedCount || 0}명)`);
        setShowIssueModal(false);
        fetchCoupons();
      } else {
        alert("지급 실패: " + (data.error || "오류가 발생했습니다."));
      }
    } catch (e: any) {
      alert("오류: " + e.message);
    } finally {
      setIsIssuing(false);
    }
  };

  // Stats calculation
  const totalCouponsCount = coupons.length;
  const totalIssuedCount = coupons.reduce((acc, c) => acc + c.issuedQuantity, 0);
  const totalUsedCount = coupons.reduce((acc, c) => acc + c.usedQuantity, 0);
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;

  // Filtered coupons
  const now = Date.now();
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.targetChannel && c.targetChannel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === "ALL" || c.discountType === filterType;

    const isExpired = c.validUntil ? new Date(c.validUntil).getTime() < now : false;
    const isOutOfStock = c.totalQuantity ? c.issuedQuantity >= c.totalQuantity : false;

    let matchesStatus = true;
    if (filterStatus === "ACTIVE") matchesStatus = c.isActive && !isExpired && !isOutOfStock;
    if (filterStatus === "EXPIRED") matchesStatus = isExpired;
    if (filterStatus === "OUT_OF_STOCK") matchesStatus = isOutOfStock;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest">
              Coupon Master &amp; Inventory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 mt-1">
            쿠폰 마스터 발행 및 재고 관리
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            정액/정률 할인, 최소주문금액, 유효기간, 선착순 재고 한도 및 타겟별(전체/지정/채널/이벤트) 쿠폰을 통합 운영합니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCoupons}
            className="p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors shadow-2xs"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            신규 쿠폰 발행하기
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold">운영 중인 쿠폰</span>
            <Ticket className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950">{activeCouponsCount}</span>
            <span className="text-xs text-zinc-400 font-bold">/ 총 {totalCouponsCount}종</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold">총 발급 수량</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950">{totalIssuedCount.toLocaleString()}</span>
            <span className="text-xs text-zinc-400 font-bold">장 발급됨</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold">실제 결제 사용</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalUsedCount.toLocaleString()}</span>
            <span className="text-xs text-zinc-400 font-bold">장 사용 완료</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-bold">쿠폰 사용 전환율</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950">
              {totalIssuedCount > 0 ? ((totalUsedCount / totalIssuedCount) * 100).toFixed(1) : "0.0"}%
            </span>
            <span className="text-xs text-zinc-400 font-bold">전환</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-white border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="쿠폰명, 쿠폰 코드, 유입 채널 검색..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Discount Type Filter */}
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="p-2 bg-zinc-50 border rounded-xl text-xs font-bold text-zinc-700"
          >
            <option value="ALL">모든 할인 유형</option>
            <option value="FIXED">정액 할인 (원)</option>
            <option value="PERCENT">정률 할인 (%)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            className="p-2 bg-zinc-50 border rounded-xl text-xs font-bold text-zinc-700"
          >
            <option value="ALL">모든 상태</option>
            <option value="ACTIVE">활성 (사용 가능)</option>
            <option value="EXPIRED">기간 만료</option>
            <option value="OUT_OF_STOCK">재고 소진</option>
          </select>
        </div>
      </div>

      {/* 4. Coupons Table */}
      <div className="bg-white border rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b text-zinc-500 font-bold uppercase text-[11px]">
                <th className="py-3.5 px-4">쿠폰명 / 코드</th>
                <th className="py-3.5 px-4">할인 혜택</th>
                <th className="py-3.5 px-4">사용 조건</th>
                <th className="py-3.5 px-4">유효기간</th>
                <th className="py-3.5 px-4">발행 수량 &amp; 재고</th>
                <th className="py-3.5 px-4">발급 방식</th>
                <th className="py-3.5 px-4">상태</th>
                <th className="py-3.5 px-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-300" />
                    쿠폰 목록을 불러오는 중입니다...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
                    등록된 쿠폰이 없습니다. 상단의 '+ 신규 쿠폰 발행하기' 버튼을 눌러보세요.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isExpired = c.validUntil ? new Date(c.validUntil).getTime() < now : false;
                  const isOutOfStock = c.totalQuantity ? c.issuedQuantity >= c.totalQuantity : false;
                  const remaining = c.totalQuantity ? Math.max(0, c.totalQuantity - c.issuedQuantity) : null;
                  const stockPercent = c.totalQuantity ? Math.min(100, Math.round((c.issuedQuantity / c.totalQuantity) * 100)) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Name & Code */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-extrabold text-zinc-950 text-sm">{c.name}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {c.code ? (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                              CODE: {c.code}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-medium">(코드 없음 / 계정 직접 지급)</span>
                          )}
                          {c.targetChannel && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                              채널: {c.targetChannel}
                            </span>
                          )}
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{c.description}</p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4 font-bold">
                        {c.discountType === "FIXED" ? (
                          <div className="text-amber-700 font-black text-sm">
                            {c.discountValue.toLocaleString()}원 할인
                          </div>
                        ) : (
                          <div>
                            <div className="text-purple-700 font-black text-sm">{c.discountValue}% 할인</div>
                            {c.maxDiscountAmount && (
                              <div className="text-[10px] text-zinc-500 font-medium">
                                최대 {c.maxDiscountAmount.toLocaleString()}원까지
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Conditions */}
                      <td className="py-4 px-4 font-medium text-zinc-600">
                        {c.minOrderAmount > 0 ? (
                          <span>{c.minOrderAmount.toLocaleString()}원 이상 구매 시</span>
                        ) : (
                          <span className="text-zinc-400">조건 없음 (전 품목)</span>
                        )}
                      </td>

                      {/* Validity Period */}
                      <td className="py-4 px-4 text-zinc-600">
                        <div className="font-medium">
                          {c.validFrom ? c.validFrom.split("T")[0] : "즉시"} ~ {c.validUntil ? c.validUntil.split("T")[0] : "무제한"}
                        </div>
                        {isExpired && (
                          <span className="text-[10px] text-red-600 font-bold">기간 만료됨</span>
                        )}
                      </td>

                      {/* Quantity & Stock Gauge */}
                      <td className="py-4 px-4 space-y-1.5 min-w-[140px]">
                        <div className="flex justify-between items-center text-[11px] font-bold text-zinc-700">
                          <span>발급: {c.issuedQuantity.toLocaleString()}장</span>
                          <span>사용: {c.usedQuantity.toLocaleString()}장</span>
                        </div>
                        {c.totalQuantity ? (
                          <div>
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  stockPercent >= 100 ? "bg-red-500" : stockPercent >= 80 ? "bg-amber-500" : "bg-zinc-900"
                                }`}
                                style={{ width: `${stockPercent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                              <span>총 {c.totalQuantity.toLocaleString()}장 한정</span>
                              <span className={remaining === 0 ? "text-red-500 font-bold" : "text-zinc-600 font-bold"}>
                                잔여 {remaining?.toLocaleString()}장
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            무제한 발행
                          </span>
                        )}
                      </td>

                      {/* Issue Type */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold border bg-zinc-50 border-zinc-200 text-zinc-700">
                          {c.issueType === "ALL_USERS" && "전체 회원 일괄"}
                          {c.issueType === "MANUAL" && "개별/선택 지급"}
                          {c.issueType === "CODE_REGISTER" && "코드 직접 등록"}
                          {c.issueType === "CHANNEL" && "채널 프로모션"}
                          {c.issueType === "SIGNUP" && "신규가입 자동"}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
                            !c.isActive
                              ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                              : isExpired
                              ? "bg-red-50 border-red-200 text-red-700"
                              : isOutOfStock
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}
                        >
                          {!c.isActive ? "비활성 (중단)" : isExpired ? "기간 만료" : isOutOfStock ? "재고 소진" : "🟢 정상 운영"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenIssueModal(c)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            title="회원에게 쿠폰 지급하기"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">회원지급</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 rounded-lg transition-colors"
                            title="쿠폰 수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c)}
                            className="p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                            title="쿠폰 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create / Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                  {editingCoupon ? "Edit Coupon" : "New Coupon Issuance"}
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1">
                  {editingCoupon ? "쿠폰 마스터 정보 수정" : "신규 쿠폰 마스터 발행"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCoupon} className="space-y-4 text-xs font-bold text-zinc-800">
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-700">쿠폰명 (고객 노출명) *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="예: [신규가입] 전 품목 5,000원 할인쿠폰"
                    className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-zinc-700">쿠폰 코드 (선택)</label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="text-[11px] text-amber-700 font-bold hover:underline"
                    >
                      랜덤 생성
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="예: WELCOME2026, INSTA10"
                    className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-zinc-700">상세 설명 / 유의사항 (선택)</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="예: 실명인증 완료 회원에 한하여 1회 사용 가능"
                  className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="p-4 bg-zinc-50 border rounded-2xl space-y-4">
                <span className="text-xs font-black text-zinc-900 block">할인 방식 및 혜택 설정</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600">할인 유형</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormDiscountType("FIXED")}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          formDiscountType === "FIXED"
                            ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                            : "bg-white text-zinc-600 border-zinc-200"
                        }`}
                      >
                        정액 할인 (원)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormDiscountType("PERCENT")}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          formDiscountType === "PERCENT"
                            ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                            : "bg-white text-zinc-600 border-zinc-200"
                        }`}
                      >
                        정률 할인 (%)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-zinc-600">
                      {formDiscountType === "FIXED" ? "할인 금액 (원) *" : "할인율 (% / 1~100) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formDiscountType === "PERCENT" ? 100 : 1000000}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      placeholder={formDiscountType === "FIXED" ? "5000" : "10"}
                      className="w-full p-2.5 bg-white border rounded-xl text-xs font-black text-amber-700 focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/60">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-600">최소 주문 금액 (원, 0이면 무제한)</label>
                    <input
                      type="number"
                      min={0}
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(Number(e.target.value))}
                      placeholder="예: 25000"
                      className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
                    />
                  </div>

                  {formDiscountType === "PERCENT" && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="block text-zinc-600">최대 할인 한도 금액 (원, 선택)</label>
                      <input
                        type="number"
                        min={0}
                        value={formMaxDiscount}
                        onChange={(e) => setFormMaxDiscount(e.target.value)}
                        placeholder="예: 10000 (최대 1만원까지만 할인)"
                        className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Validity & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-700">시작일</label>
                  <input
                    type="date"
                    value={formValidFrom}
                    onChange={(e) => setFormValidFrom(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-700">만료일 (비워두면 무제한)</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-700">총 발행 재고 (선착순 N장, 공란은 무제한)</label>
                  <input
                    type="number"
                    min={1}
                    value={formTotalQuantity}
                    onChange={(e) => setFormTotalQuantity(e.target.value)}
                    placeholder="예: 100"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Issue Type & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-700">쿠폰 발급 방식</label>
                  <select
                    value={formIssueType}
                    onChange={(e: any) => setFormIssueType(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="MANUAL">관리자 개별/선택 지급</option>
                    <option value="ALL_USERS">전체 회원 즉시 일괄 지급</option>
                    <option value="CODE_REGISTER">쿠폰 코드 직접 등록형</option>
                    <option value="CHANNEL">외부 유입 채널 전용</option>
                    <option value="SIGNUP">신규 회원가입 시 자동 지급</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-700">유입 채널 / 프로모션명 (선택)</label>
                  <input
                    type="text"
                    value={formTargetChannel}
                    onChange={(e) => setFormTargetChannel(e.target.value)}
                    placeholder="예: INSTAGRAM, YOUTUBE, 성수동팝업"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-zinc-800 cursor-pointer">
                  쿠폰 활성화 (체크 해제 시 즉시 사용 중단)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "저장 중..." : editingCoupon ? "수정 완료" : "쿠폰 발행하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Target User Issue Modal */}
      {showIssueModal && issueTargetCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                  Target Member Issuance
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1">
                  '{issueTargetCoupon.name}' 회원 쿠폰 지급
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Option: Issue to All vs Select Users */}
              <div className="p-4 bg-zinc-50 border rounded-2xl space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800">
                    <input
                      type="radio"
                      name="issueTarget"
                      checked={!issueToAll}
                      onChange={() => setIssueToAll(false)}
                      className="w-4 h-4"
                    />
                    <span>회원 직접 선택 지급 (이벤트 당첨자/개별)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800">
                    <input
                      type="radio"
                      name="issueTarget"
                      checked={issueToAll}
                      onChange={() => setIssueToAll(true)}
                      className="w-4 h-4"
                    />
                    <span>전체 회원 일괄 지급 ({usersList.length}명)</span>
                  </label>
                </div>
              </div>

              {!issueToAll && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="회원 이름, 이메일, 아이디 검색..."
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <span className="text-xs font-bold text-blue-700 shrink-0">
                      선택됨: {selectedUserIds.length}명
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-2xl divide-y divide-zinc-100 p-1">
                    {usersList
                      .filter(
                        (u) =>
                          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.loginId && u.loginId.toLowerCase().includes(userSearch.toLowerCase()))
                      )
                      .map((u) => {
                        const isSelected = selectedUserIds.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                              } else {
                                setSelectedUserIds([...selectedUserIds, u.id]);
                              }
                            }}
                            className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50/80 border border-blue-200" : "hover:bg-zinc-50"
                            }`}
                          >
                            <div className="space-y-0.5 text-xs">
                              <div className="font-black text-zinc-950 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.loginId && (
                                  <span className="text-[10px] text-zinc-400 font-mono">({u.loginId})</span>
                                )}
                              </div>
                              <div className="text-zinc-500 text-[11px]">{u.email}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleExecuteIssue}
                  disabled={isIssuing}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isIssuing ? "발급 중..." : issueToAll ? "전체 회원 일괄 지급" : `${selectedUserIds.length}명에게 지급하기`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

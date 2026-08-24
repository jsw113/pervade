"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Edit, Trash2, ShieldCheck, ShieldAlert, RefreshCw, X, Check, Award, MapPin } from "lucide-react";
import { calculateUserTier } from "@/lib/userTier";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null); // null means create new
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    loginId: "",
    address: "",
    birthDate: "",
    role: "USER",
    totalPurchases: 0,
    referralPoints: 0,
    realNameVerified: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsersAndPolicies = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/policies")
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        const map: Record<string, string> = {};
        if (Array.isArray(pData)) {
          pData.forEach((p: any) => { map[p.key] = p.value; });
        }
        setPolicies(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndPolicies();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      loginId: "",
      address: "",
      birthDate: "",
      role: "USER",
      totalPurchases: 0,
      referralPoints: 3000,
      realNameVerified: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      loginId: user.loginId || "",
      address: user.address || "",
      birthDate: user.birthDate || "",
      role: user.role || "USER",
      totalPurchases: user.totalPurchases || 0,
      referralPoints: user.referralPoints || 0,
      realNameVerified: !!user.realNameVerified
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`정말로 회원 '${user.name} (${user.email})' 님을 강제 탈퇴(삭제) 처리하시겠습니까?\n이 작업은 되돌릴 수 없으며 연관된 주문/문의 내역이 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("회원이 성공적으로 강제 탈퇴 처리되었습니다.");
        fetchUsersAndPolicies();
      } else {
        alert("탈퇴 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Edit existing
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          alert("회원 정보가 성공적으로 수정되었습니다.");
          setIsModalOpen(false);
          fetchUsersAndPolicies();
        } else {
          alert("수정에 실패했습니다.");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          alert("신규 회원이 성공적으로 등록되었습니다.");
          setIsModalOpen(false);
          fetchUsersAndPolicies();
        } else {
          const errData = await res.json();
          alert(errData.error || "등록에 실패했습니다.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search) ||
      user.loginId?.toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    const userTier = calculateUserTier(
      { totalPurchases: user.totalPurchases, realNameVerified: user.realNameVerified },
      user._count?.orders || 0,
      policies
    );

    const matchesTier = tierFilter === "ALL" || userTier.tier === tierFilter;

    return matchesSearch && matchesRole && matchesTier;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">회원 및 등급 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">
            4단계 회원 등급(일반/재구매/우수/VIP) 자동 산정, 회원 정보 및 배송지 관리, 포인트 조정을 수행합니다.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsersAndPolicies}
            className="p-2.5 border rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            신규 회원 수동 등록
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 이메일, 전화번호, 아이디 검색..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Role Filter */}
          <div className="flex gap-1.5 w-full sm:w-auto">
            {["ALL", "USER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-zinc-900 text-white shadow-2xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {r === "ALL" ? "전체 권한" : r === "ADMIN" ? "관리자 (ADMIN)" : "일반 회원 (USER)"}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Tier Grade Filter */}
        <div className="flex items-center gap-2 pt-2 border-t text-xs">
          <span className="font-bold text-zinc-500 flex items-center gap-1 shrink-0">
            <Award className="w-3.5 h-3.5 text-purple-600" /> 등급별 필터:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: "ALL", label: "전체 등급" },
              { id: "일반", label: "일반 (가입+인증)" },
              { id: "재구매", label: "재구매 (2회↑)" },
              { id: "우수", label: "우수 (10만원↑)" },
              { id: "VIP", label: "VIP (30만원↑)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  tierFilter === t.id
                    ? "bg-purple-900 text-white shadow-2xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b text-zinc-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">회원 기본 정보</th>
                <th className="px-6 py-4">아이디 / 실명인증</th>
                <th className="px-6 py-4">회원주소 / 배송지(최대 3개)</th>
                <th className="px-6 py-4">구매실적 (주문횟수/누적액)</th>
                <th className="px-6 py-4">4단계 회원등급</th>
                <th className="px-6 py-4 text-right">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    회원 목록을 실시간 로드하는 중...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    조건에 일치하는 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const orderCount = user._count?.orders || 0;
                  const userTier = calculateUserTier(
                    { totalPurchases: user.totalPurchases, realNameVerified: user.realNameVerified },
                    orderCount,
                    policies
                  );

                  let shippingCount = 0;
                  if (user.shippingAddresses) {
                    try {
                      const parsed = JSON.parse(user.shippingAddresses);
                      if (Array.isArray(parsed)) shippingCount = parsed.length;
                    } catch (e) {}
                  }

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-zinc-900">{user.name}</div>
                        <div className="text-zinc-500 text-[11px]">{user.email}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          가입일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                          {user.socialProvider && ` (${user.socialProvider} 간편가입)`}
                        </div>
                      </td>

                      {/* Login ID & Real Name */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-zinc-800">
                          {user.loginId || "미설정"}
                        </div>
                        <div className="mt-1">
                          {user.realNameVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> 실명인증 완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-500" /> 미인증
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Member Address vs Delivery Address */}
                      <td className="px-6 py-4 max-w-xs space-y-1">
                        <div className="text-zinc-800 font-medium flex items-center gap-1">
                          <span>{user.phone || "-"}</span>
                        </div>
                        <div className="text-[11px] text-zinc-600 truncate" title={user.address || ""}>
                          <span className="font-bold text-zinc-400">회원주소:</span> {user.address || "미등록"}
                        </div>
                        <div className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>등록 배송지: {shippingCount}/3개</span>
                        </div>
                      </td>

                      {/* Order Count & Purchases & Points */}
                      <td className="px-6 py-4">
                        <div className="font-black text-zinc-950 text-xs">
                          ₩{(user.totalPurchases || 0).toLocaleString()}원
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">
                          총 <strong>{orderCount}회</strong> 결제
                        </div>
                        <div className="font-bold text-purple-700 text-[11px] mt-0.5">
                          적립금 {(user.referralPoints || 0).toLocaleString()} P
                        </div>
                      </td>

                      {/* 4-Tier Membership Badge */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 shadow-2xs ${userTier.badgeColor}`}>
                            <Award className="w-3 h-3" />
                            {userTier.tier} 회원
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            적립률 {(userTier.rewardRate * 100).toFixed(0)}%
                          </span>
                          {user.role === "ADMIN" && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              관리자 (ADMIN)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black rounded-lg transition-colors border cursor-pointer"
                            title="회원정보 편집"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors border cursor-pointer"
                            title="회원 강제 탈퇴"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Edit / Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border my-8">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold">
                {editingUser ? `'${editingUser.name}' 회원 정보 수정` : "신규 회원 수동 등록"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">이름 / 실명 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">아이디 (ID) *</label>
                  <input
                    type="text"
                    required
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">이메일 계정 *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">연락처</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl"
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">생년월일</label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl"
                    placeholder="1990-01-01"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">회원 등록 기본 주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">누적 결제금액 (원)</label>
                  <input
                    type="number"
                    value={formData.totalPurchases}
                    onChange={(e) => setFormData({ ...formData, totalPurchases: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">보유 적립 포인트 (P)</label>
                  <input
                    type="number"
                    value={formData.referralPoints}
                    onChange={(e) => setFormData({ ...formData, referralPoints: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">계정 권한</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-bold"
                  >
                    <option value="USER">일반 회원 (USER)</option>
                    <option value="ADMIN">관리자 (ADMIN)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">실명인증 상태</label>
                  <select
                    value={formData.realNameVerified ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, realNameVerified: e.target.value === "true" })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl font-bold"
                  >
                    <option value="true">실명인증 완료</option>
                    <option value="false">실명인증 미완료</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "처리 중..." : editingUser ? "수정사항 저장" : "신규 회원 생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

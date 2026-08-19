"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Edit, Trash2, ShieldCheck, ShieldAlert, RefreshCw, X, Check } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
        fetchUsers();
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
          fetchUsers();
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
          fetchUsers();
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

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">회원 및 권한 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">
            등록된 실사용자 계정 조회, 회원 정보 편집, 등급/포인트 조정 및 강제 탈퇴를 관리합니다.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 border rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            신규 회원 수동 등록
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
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

        <div className="flex gap-2 w-full sm:w-auto">
          {["ALL", "USER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === r
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {r === "ALL" ? "전체 회원" : r === "ADMIN" ? "관리자 (ADMIN)" : "일반 회원 (USER)"}
            </button>
          ))}
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
                <th className="px-6 py-4">연락처 / 배송주소</th>
                <th className="px-6 py-4">누적 구매액 / 포인트</th>
                <th className="px-6 py-4">권한 / 등급</th>
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
                  const isVip = user.totalPurchases >= 500000;
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-zinc-900">{user.name}</div>
                        <div className="text-zinc-500 text-[11px]">{user.email}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          가입일: {new Date(user.createdAt).toLocaleDateString()}
                          {user.socialProvider && ` (${user.socialProvider} 가입)`}
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                              <ShieldAlert className="w-3 h-3 text-red-500" /> 미인증
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone & Address */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-zinc-800 font-medium">{user.phone || "-"}</div>
                        <div className="text-[11px] text-zinc-500 truncate" title={user.address || ""}>
                          {user.address || "주소 미등록"}
                        </div>
                      </td>

                      {/* Purchases & Points */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-600">
                          ₩{(user.totalPurchases || 0).toLocaleString()}
                        </div>
                        <div className="font-medium text-emerald-600 text-[11px]">
                          {(user.referralPoints || 0).toLocaleString()} P
                        </div>
                      </td>

                      {/* Role & Grade */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            user.role === "ADMIN" 
                              ? "bg-amber-100 text-amber-800 border border-amber-300" 
                              : "bg-zinc-100 text-zinc-700"
                          }`}>
                            {user.role === "ADMIN" ? "관리자 (ADMIN)" : "일반 회원"}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isVip ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {isVip ? "VIP 등급" : "일반 등급"}
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black rounded-lg transition-colors border"
                            title="회원정보 편집"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors border"
                            title="강제 탈퇴 (삭제)"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingUser ? `회원 정보 수정 - ${editingUser.name}` : "신규 회원 수동 등록"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">성명 (실명) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">로그인 아이디</label>
                  <input
                    type="text"
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="user_12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">이메일 *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">휴대폰 번호</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">생년월일</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">계정 권한</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 font-bold"
                  >
                    <option value="USER">일반 회원 (USER)</option>
                    <option value="ADMIN">관리자 (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">배송지 주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  placeholder="서울시 강남구 테헤란로 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">누적 결제금액 (원)</label>
                  <input
                    type="number"
                    value={formData.totalPurchases}
                    onChange={(e) => setFormData({ ...formData, totalPurchases: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">적립 포인트 (P)</label>
                  <input
                    type="number"
                    value={formData.referralPoints}
                    onChange={(e) => setFormData({ ...formData, referralPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-zinc-50 rounded-xl border">
                  <input
                    type="checkbox"
                    checked={formData.realNameVerified}
                    onChange={(e) => setFormData({ ...formData, realNameVerified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    본인확인(실명인증) 완료 상태로 설정
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? "저장 중..." : editingUser ? "정보 수정 완료" : "회원 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

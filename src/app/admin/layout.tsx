import Link from "next/link";
import { LayoutDashboard, FileText, Users, Settings, Package, Palette, MessageSquare, HelpCircle, ExternalLink, BookOpen, Megaphone, Layers, ShieldCheck, LogOut, Award, Key } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUser, ensureDefaultAdminExists, hasPermission } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Ensure default super admin exists
  await ensureDefaultAdminExists();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login?redirect=/admin&error=admin_only");
  }

  const canManageProducts = hasPermission(admin, "PRODUCTS");
  const canManageUsers = hasPermission(admin, "USERS");
  const canManageContents = hasPermission(admin, "CONTENTS");
  const canManagePolicies = hasPermission(admin, "POLICIES");

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b font-bold text-base tracking-tight text-zinc-950">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${admin.isSuperAdmin ? "bg-purple-500 ring-4 ring-purple-100" : "bg-emerald-500 ring-4 ring-emerald-100"}`}></div>
            <span>PERVADE {admin.isSuperAdmin ? "최고관리" : "업무관리"}</span>
          </div>
          <Link href="/" target="_blank" className="text-zinc-400 hover:text-black p-1" title="쇼핑몰 메인으로 이동">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3 text-xs font-semibold">
            <li>
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                대시보드 홈
              </Link>
            </li>

            {/* 1. Products & Inventory Group */}
            {canManageProducts && (
              <>
                <li className="pt-3 text-[10px] uppercase font-bold text-zinc-400 px-3">📦 상품 및 재고</li>
                <li>
                  <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Settings className="w-4 h-4 text-zinc-500" />
                    제품 및 구매옵션 관리
                  </Link>
                </li>
                <li>
                  <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Layers className="w-4 h-4 text-amber-600" />
                    카테고리 마스터 관리
                  </Link>
                </li>
                <li>
                  <Link href="/admin/inventory" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Package className="w-4 h-4 text-zinc-500" />
                    통합 재고 관리
                  </Link>
                </li>
              </>
            )}

            {/* 2. Members & CRM Group */}
            {canManageUsers && (
              <>
                <li className="pt-3 text-[10px] uppercase font-bold text-zinc-400 px-3">👥 회원 및 CRM</li>
                <li>
                  <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Users className="w-4 h-4 text-zinc-500" />
                    회원 및 관리자 권한 배정
                  </Link>
                </li>
                <li>
                  <Link href="/admin/crm" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <MessageSquare className="w-4 h-4 text-zinc-500" />
                    고객 CRM & Q&A/리뷰
                  </Link>
                </li>
              </>
            )}

            {/* 3. Contents & Site CMS Group */}
            {canManageContents && (
              <>
                <li className="pt-3 text-[10px] uppercase font-bold text-zinc-400 px-3">✍️ 콘텐츠 및 사이트</li>
                <li>
                  <Link href="/admin/promotions" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Megaphone className="w-4 h-4 text-zinc-500" />
                    프로모션 & 이벤트 관리
                  </Link>
                </li>
                <li>
                  <Link href="/admin/guides" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <BookOpen className="w-4 h-4 text-zinc-500" />
                    사용가이드 블로그 관리
                  </Link>
                </li>
                <li>
                  <Link href="/admin/contents" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <HelpCircle className="w-4 h-4 text-zinc-500" />
                    고객센터 CMS (FAQ/안내)
                  </Link>
                </li>
                <li>
                  <Link href="/admin/posts" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    브랜드스토리 &amp; 저널 관리
                  </Link>
                </li>
                <li>
                  <Link href="/admin/theme" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Palette className="w-4 h-4 text-zinc-500" />
                    테마 & 메인 배너 설정
                  </Link>
                </li>
              </>
            )}

            {/* 4. Policies & System Operations Group */}
            {canManagePolicies && (
              <>
                <li className="pt-3 text-[10px] uppercase font-bold text-zinc-400 px-3">⚙️ 운영 및 정책</li>
                <li>
                  <Link href="/admin/policies" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                    <Settings className="w-4 h-4 text-zinc-500" />
                    운영 및 리워드 정책
                  </Link>
                </li>
              </>
            )}

            <li className="pt-3 text-[10px] uppercase font-bold text-zinc-400 px-3">시스템 매뉴얼</li>
            <li>
              <a
                href="/PERVADE_Admin_ERP_Manual.pdf"
                download="PERVADE_통합_백오피스_ERP_공식운영매뉴얼.pdf"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors font-bold"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                📥 PDF 사용설명서 다운로드
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-900">통합 어드민 콘솔</h1>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
              admin.isSuperAdmin
                ? "bg-purple-900 text-white border-purple-950"
                : "bg-emerald-100 text-emerald-800 border-emerald-300"
            }`}>
              {admin.isSuperAdmin ? "👑 수퍼유저 (전체 접근)" : "👤 업무별 관리자"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-2 pr-2 border-r">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-zinc-800">{admin.name} ({admin.loginId})님</span>
            </div>
            <a
              href="/PERVADE_Admin_ERP_Manual.pdf"
              download="PERVADE_통합_백오피스_ERP_공식운영매뉴얼.pdf"
              target="_blank"
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold transition-all flex items-center gap-1.5 text-[11px]"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              PDF 매뉴얼
            </a>
            <Link
              href="/api/auth/logout"
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

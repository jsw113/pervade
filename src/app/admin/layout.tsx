import Link from "next/link";
import { LayoutDashboard, FileText, Users, Settings, Package, Palette, MessageSquare, HelpCircle, ExternalLink, BookOpen, Megaphone, Layers } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b font-bold text-base tracking-tight text-zinc-950">
          <span>PERVADE 관리자</span>
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
            <li className="pt-2 text-[10px] uppercase font-bold text-zinc-400 px-3">상품 및 재고</li>
            <li>
              <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Settings className="w-4 h-4 text-zinc-500" />
                제품 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Layers className="w-4 h-4 text-amber-600" />
                카테고리 마스터 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Package className="w-4 h-4 text-zinc-500" />
                통합 재고 관리
              </Link>
            </li>
            <li className="pt-2 text-[10px] uppercase font-bold text-zinc-400 px-3">회원 및 CRM</li>
            <li>
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Users className="w-4 h-4 text-zinc-500" />
                회원 및 권한 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/crm" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                고객 CRM & Q&A/리뷰
              </Link>
            </li>
            <li className="pt-2 text-[10px] uppercase font-bold text-zinc-400 px-3">콘텐츠 및 사이트</li>
            <li>
              <Link href="/admin/promotions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Megaphone className="w-4 h-4 text-zinc-500" />
                프로모션 & 이벤트 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/guides" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <BookOpen className="w-4 h-4 text-zinc-500" />
                사용가이드 블로그 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/contents" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <HelpCircle className="w-4 h-4 text-zinc-500" />
                고객센터 CMS (FAQ/안내)
              </Link>
            </li>
            <li>
              <Link href="/admin/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <FileText className="w-4 h-4 text-zinc-500" />
                저널 / 블로그 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/theme" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Palette className="w-4 h-4 text-zinc-500" />
                테마 & 메인 배너 설정
              </Link>
            </li>
            <li>
              <Link href="/admin/policies" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors">
                <Settings className="w-4 h-4 text-zinc-500" />
                운영 및 리워드 정책
              </Link>
            </li>
            <li className="pt-2 text-[10px] uppercase font-bold text-zinc-400 px-3">시스템 매뉴얼</li>
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
          <h1 className="text-base font-bold text-zinc-900">통합 어드민 콘솔</h1>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <a
              href="/PERVADE_Admin_ERP_Manual.pdf"
              download="PERVADE_통합_백오피스_ERP_공식운영매뉴얼.pdf"
              target="_blank"
              className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 text-[11px]"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              공식 PDF 운영매뉴얼 다운로드
            </a>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>시스템 정상 작동 중</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

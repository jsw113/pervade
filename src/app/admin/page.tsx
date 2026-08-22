import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Users, Megaphone, BookOpen, Settings, Palette, HelpCircle, ArrowRight, TrendingUp, Layers, FileText } from "lucide-react";
import { SeedButton } from "@/components/admin/SeedButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const guideCount = await prisma.guidePost.count();
  const promoCount = await prisma.promotion.count({ where: { isActive: true } });
  
  const orders = await prisma.order.findMany({
    select: { totalAmount: true }
  });
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const quickLinks = [
    { title: "제품 관리", desc: "제품 등록, 다중 이미지 및 가격 설정", href: "/admin/products", icon: Package, count: `${productCount}개 등록` },
    { title: "카테고리 마스터 관리", desc: "2단계 대분류/용처별 분류 생성 및 편집", href: "/admin/categories", icon: Layers, count: "실시간 반영" },
    { title: "통합 재고 & ERP", desc: "네이버/쿠팡 주문, CJ택배, 세금계산서", href: "/admin/inventory", icon: Settings, count: "옴니채널 연동" },
    { title: "프로모션 & 이벤트", desc: "메인 배너 할인 페스티벌 & 지난 이벤트", href: "/admin/promotions", icon: Megaphone, count: `${promoCount}개 진행중` },
    { title: "사용가이드 블로그", desc: "제품별 청소 팁 & 매거진 아티클 CMS", href: "/admin/guides", icon: BookOpen, count: `${guideCount}개 발행` },
    { title: "회원 및 권한 관리", desc: "실명인증 회원, 포인트, 등급 수정", href: "/admin/users", icon: Users, count: `${userCount}명 가입` },
    { title: "테마 & 메인 배너", desc: "배경 동영상/이미지 업로드, 로고 폰트", href: "/admin/theme", icon: Palette, count: "실시간 렌더링" },
    { title: "고객센터 CMS", desc: "자주 묻는 질문(FAQ), 배송안내, 약관", href: "/admin/contents", icon: HelpCircle, count: "공식 고지 관리" },
    { title: "공식 PDF 운영매뉴얼", desc: "백오피스 & ERP 통합 사용설명서 다운로드", href: "/PERVADE_Admin_ERP_Manual.pdf", icon: FileText, count: "PDF 다운로드" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-zinc-950 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
            PERVADE ADMIN CONSOLE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">퍼베이드 통합 관리자 백오피스</h2>
          <p className="text-xs text-zinc-400">쇼핑몰 운영, 제품, 재고, 프로모션 및 회원을 통합 제어합니다.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SeedButton />
          <Link
            href="/"
            target="_blank"
            className="px-5 py-2 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors shrink-0 shadow-md flex items-center gap-1.5"
          >
            쇼핑몰 메인 바로가기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500">총 등록 회원수</span>
          <p className="text-2xl font-black text-zinc-950">{userCount}명</p>
          <span className="text-[10px] text-emerald-600 font-bold">실시간 DB 동기화</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500">총 등록 상품</span>
          <p className="text-2xl font-black text-zinc-950">{productCount}개</p>
          <span className="text-[10px] text-zinc-400">판매 노출 관리중</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500">발행된 사용가이드</span>
          <p className="text-2xl font-black text-zinc-950">{guideCount}편</p>
          <span className="text-[10px] text-amber-600 font-bold">블로그 매거진 CMS</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-500">누적 결제 주문액</span>
          <p className="text-2xl font-black text-zinc-950">₩{totalRevenue.toLocaleString()}원</p>
          <span className="text-[10px] text-blue-600 font-bold">주문 {orders.length}건</span>
        </div>
      </div>

      {/* Quick Action Management Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-950">주요 관리 메뉴 바로가기</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white p-6 rounded-2xl border shadow-xs hover:shadow-lg hover:border-zinc-900 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-between items-center text-[10px] text-zinc-400">
                  <span className="font-bold text-zinc-700">{item.count}</span>
                  <span className="text-zinc-900 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    이동 &gt;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { MessageCircle, HelpCircle, MessageSquare, Truck, Building2, Phone, Mail, Clock, ArrowRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "고객센터 | PERVADE Customer Center",
  description: "퍼베이드 공식 고객지원 센터. 카카오톡 1:1 상담, FAQ, Q&A 문의, 배송/교환/반품 및 제휴문의 안내",
};

export default async function CustomerCenterHubPage() {
  let policies: Record<string, string> = {};
  try {
    const dbPolicies = await prisma.policy.findMany({
      where: {
        key: {
          in: ["CS_PHONE", "CS_HOURS", "CS_EMAIL", "COMPANY_NAME"]
        }
      }
    });
    dbPolicies.forEach((p) => {
      policies[p.key] = p.value;
    });
  } catch (e) {}

  const csPhone = policies.CS_PHONE || "02-1234-5678";
  const csHours = policies.CS_HOURS || "평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00 / 주말·공휴일 휴무)";
  const csEmail = policies.CS_EMAIL || "support@pervade.co.kr";

  const supportChannels = [
    {
      title: "카카오톡 1:1 상담",
      engTitle: "KAKAO TALK CHAT",
      desc: "실시간 상담원과 가장 빠르고 편리하게 상담할 수 있는 공식 카카오톡 채널입니다.",
      href: "https://pf.kakao.com/@pervade/chat",
      isExternal: true,
      badge: "가장 빠른 답변",
      icon: MessageCircle,
      actionText: "카카오톡 상담 시작하기",
      bgClass: "bg-amber-50/40 border-amber-200/80 hover:border-amber-400",
      iconBg: "bg-[#FEE500] text-stone-900",
    },
    {
      title: "자주 묻는 질문 (FAQ)",
      engTitle: "FREQUENTLY ASKED",
      desc: "주문, 결제, 배송, 상품 사용법 등 고객님들께서 자주 문의하시는 내용을 모았습니다.",
      href: "/faq",
      isExternal: false,
      badge: "빠른 해결",
      icon: HelpCircle,
      actionText: "자주 묻는 질문 바로가기",
      bgClass: "bg-white border-zinc-200 hover:border-zinc-900",
      iconBg: "bg-zinc-100 text-zinc-900",
    },
    {
      title: "1:1 문의 게시판 (Q&A)",
      engTitle: "1:1 INQUIRY BOARD",
      desc: "개별 주문건 조회, 상품 상세 문의, 맞춤 상담 글을 남겨주시면 전문 상담원이 답변드립니다.",
      href: "/qna",
      isExternal: false,
      badge: "게시판 상담",
      icon: MessageSquare,
      actionText: "1:1 문의 작성하기",
      bgClass: "bg-white border-zinc-200 hover:border-zinc-900",
      iconBg: "bg-zinc-100 text-zinc-900",
    },
    {
      title: "배송 / 교환 / 반품 안내",
      engTitle: "SHIPPING & RETURNS",
      desc: "배송 마감시간, 택배사 정보, 단순 변심 및 상품 불량에 따른 반품/교환 규정을 안내합니다.",
      href: "/shipping",
      isExternal: false,
      badge: "안내 가이드",
      icon: Truck,
      actionText: "배송 및 교환 규정 보기",
      bgClass: "bg-white border-zinc-200 hover:border-zinc-900",
      iconBg: "bg-zinc-100 text-zinc-900",
    },
    {
      title: "대량구매 & 제휴문의",
      engTitle: "B2B & PARTNERSHIP",
      desc: "기업 특판, 단체 선물, 브랜드 콜라보레이션 및 입점/유통 제휴 관련 문의 창구입니다.",
      href: "/contact",
      isExternal: false,
      badge: "기업 / 제휴",
      icon: Building2,
      actionText: "제휴 문의 접수하기",
      bgClass: "bg-white border-zinc-200 hover:border-zinc-900",
      iconBg: "bg-zinc-100 text-zinc-900",
    },
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 space-y-12 sm:space-y-16">
      {/* Clean Luxury Header (Matching PRODUCTS / JOURNAL) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200/70 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-950 tracking-tight uppercase">
            CUSTOMER CENTER
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-light mt-2">
            퍼베이드 고객지원 센터입니다. 원하시는 서비스 채널을 선택해 주세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-none text-xs tracking-wider font-bold bg-zinc-950 text-white uppercase">
            SUPPORT HUB
          </span>
        </div>
      </div>

      {/* Main 5 Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {supportChannels.map((ch, idx) => {
          const Icon = ch.icon;
          return (
            <div
              key={idx}
              className={`p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between space-y-6 ${ch.bgClass}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-none flex items-center justify-center font-bold shadow-2xs ${ch.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-none bg-zinc-100 text-zinc-800 text-[10px] font-bold tracking-wider uppercase border border-zinc-200">
                    {ch.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
                    {ch.engTitle}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 font-normal tracking-tight">
                    {ch.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                  {ch.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100">
                {ch.isExternal ? (
                  <a
                    href={ch.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-2xs group"
                  >
                    <span>{ch.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <Link
                    href={ch.href}
                    className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-2xs group"
                  >
                    <span>{ch.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {/* Operating Hours & Direct Call Card */}
        <div className="p-6 sm:p-8 bg-[#F6F4EE] border border-[#E7E2D8] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-none bg-stone-900 text-white flex items-center justify-center font-bold shadow-2xs">
                <Phone className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-none bg-stone-200/80 text-stone-900 text-[10px] font-bold tracking-wider uppercase">
                DIRECT CONTACT
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase block">
                CUSTOMER SERVICE
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-serif tracking-tight">
                {csPhone}
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-700 font-light pt-2">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>{csHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>{csEmail}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E2D8]">
            <a
              href={`tel:${csPhone.replace(/[^0-9]/g, "")}`}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-none text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>전화 상담 연결</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

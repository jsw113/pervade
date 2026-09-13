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
      icon: MessageCircle,
      actionText: "카카오톡 상담 시작하기",
    },
    {
      title: "자주 묻는 질문 (FAQ)",
      engTitle: "FREQUENTLY ASKED",
      desc: "주문, 결제, 배송, 상품 사용법 등 고객님들께서 자주 문의하시는 내용을 모았습니다.",
      href: "/faq",
      isExternal: false,
      icon: HelpCircle,
      actionText: "자주 묻는 질문 바로가기",
    },
    {
      title: "1:1 문의 게시판 (Q&A)",
      engTitle: "1:1 INQUIRY BOARD",
      desc: "개별 주문건 조회, 상품 상세 문의, 맞춤 상담 글을 남겨주시면 전문 상담원이 답변드립니다.",
      href: "/qna",
      isExternal: false,
      icon: MessageSquare,
      actionText: "1:1 문의 작성하기",
    },
    {
      title: "배송 / 교환 / 반품 안내",
      engTitle: "SHIPPING & RETURNS",
      desc: "배송 마감시간, 택배사 정보, 단순 변심 및 상품 불량에 따른 반품/교환 규정을 안내합니다.",
      href: "/shipping",
      isExternal: false,
      icon: Truck,
      actionText: "배송 및 교환 규정 보기",
    },
    {
      title: "대량구매 & 제휴문의",
      engTitle: "B2B & PARTNERSHIP",
      desc: "기업 특판, 단체 선물, 브랜드 콜라보레이션 및 입점/유통 제휴 관련 문의 창구입니다.",
      href: "/contact",
      isExternal: false,
      icon: Building2,
      actionText: "제휴 문의 접수하기",
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
        </div>
      </div>

      {/* Main 5 Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
        {supportChannels.map((ch, idx) => {
          const Icon = ch.icon;
          return (
            <div
              key={idx}
              className="p-8 bg-white border border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-none bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
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
                    className="text-xs font-semibold tracking-wider uppercase text-zinc-900 hover:text-zinc-500 inline-flex items-center gap-1.5 transition-colors group"
                  >
                    <span>{ch.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <Link
                    href={ch.href}
                    className="text-xs font-semibold tracking-wider uppercase text-zinc-900 hover:text-zinc-500 inline-flex items-center gap-1.5 transition-colors group"
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
        <div className="p-8 bg-white border border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-none bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
                CUSTOMER SERVICE
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-serif tracking-tight">
                {csPhone}
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 font-light pt-1">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>{csHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{csEmail}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <a
              href={`tel:${csPhone.replace(/[^0-9]/g, "")}`}
              className="text-xs font-semibold tracking-wider uppercase text-zinc-900 hover:text-zinc-500 inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>전화 상담 연결</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

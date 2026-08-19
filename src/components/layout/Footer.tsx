"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";

export function Footer() {
  const [policies, setPolicies] = useState<Record<string, string>>({
    COMPANY_NAME: "(주)퍼베이드 (PERVADE Corp.)",
    CEO_NAME: "홍길동",
    COMPANY_ADDRESS: "서울특별시 강남구 테헤란로 123, 퍼베이드타워 4층",
    BIZ_REG_NUMBER: "123-45-67890",
    ECOMMERCE_NUMBER: "2026-서울강남-1234호",
    PRIVACY_OFFICER: "홍길동 (privacy@pervade.co.kr)",
    CS_PHONE: "02-1234-5678",
    CS_HOURS: "평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00 / 주말·공휴일 휴무)",
    CS_EMAIL: "support@pervade.co.kr",
    HOSTING_PROVIDER: "(주)퍼베이드",
    ESCROW_INFO: "토스페이먼츠 구매안전(에스크로) 서비스",
  });

  useEffect(() => {
    fetch("/api/policies")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setPolicies((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Footer policy load error:", err));
  }, []);

  const rawBizNum = policies.BIZ_REG_NUMBER ? policies.BIZ_REG_NUMBER.replace(/[^0-9]/g, "") : "1234567890";

  return (
    <footer className="border-t bg-zinc-900 text-zinc-300 pt-16 pb-12 text-xs">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Top Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800">
          <div className="md:col-span-1 space-y-3">
            <h3 className="font-bold text-lg text-white tracking-tight">PERVADE</h3>
            <p className="text-zinc-400 leading-relaxed text-xs">
              프리미엄 친환경 다목적 세정 솔루션. <br />
              일상의 공간을 더 안전하고 아름답게 만듭니다.
            </p>
            <div className="pt-2 text-zinc-400">
              <span className="block text-[11px] text-zinc-500 font-bold uppercase">Customer Support</span>
              <span className="text-base font-extrabold text-white">{policies.CS_PHONE}</span>
              <span className="block text-[11px] text-zinc-400">{policies.CS_HOURS}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Shop & Guide</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/shop" className="hover:text-white transition-colors">전체 상품 라인업</Link></li>
              <li><Link href="/guide" className="hover:text-white transition-colors font-semibold text-amber-300">공식 사용 가이드 (블로그)</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">브랜드 스토리</Link></li>
              <li><Link href="/journal" className="hover:text-white transition-colors">리빙 저널</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">자주 묻는 질문 (FAQ)</Link></li>
              <li><Link href="/qna" className="hover:text-white transition-colors">1:1 문의 게시판</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">배송 / 교환 / 반품 안내</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">대량구매 & 제휴문의</Link></li>
              <li><Link href="/admin" className="hover:text-amber-300 transition-colors font-bold text-amber-400 flex items-center gap-1 pt-1">⚙️ 관리자 백오피스</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Terms & Policy</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/terms" className="hover:text-white transition-colors font-medium">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors font-bold text-white underline">개인정보처리방침</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">안전거래센터</Link></li>
            </ul>
          </div>
        </div>

        {/* Business & Legal Required Information (전자상거래 등에서의 소비자보호에 관한 법률 제10조 제1항 준수) */}
        <div className="space-y-4 text-zinc-400 text-[11px] leading-relaxed">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>상호명:</strong> {policies.COMPANY_NAME}</span>
            <span>|</span>
            <span><strong>대표자:</strong> {policies.CEO_NAME}</span>
            <span>|</span>
            <span><strong>사업장 소재지:</strong> {policies.COMPANY_ADDRESS}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>사업자등록번호:</strong> {policies.BIZ_REG_NUMBER}</span>
            <a 
              href={`https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${rawBizNum}`}
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-300 underline inline-flex items-center gap-1 hover:text-white"
            >
              [사업자정보확인 <ExternalLink className="w-3 h-3" />]
            </a>
            <span>|</span>
            <span><strong>통신판매업신고번호:</strong> {policies.ECOMMERCE_NUMBER}</span>
            <span>|</span>
            <span><strong>개인정보보호책임자:</strong> {policies.PRIVACY_OFFICER}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>대표이메일:</strong> {policies.CS_EMAIL}</span>
            <span>|</span>
            <span><strong>고객센터:</strong> {policies.CS_PHONE}</span>
            <span>|</span>
            <span><strong>호스팅서비스 제공자:</strong> {policies.HOSTING_PROVIDER}</span>
          </div>

          {/* Escrow Purchase Safety Service Notice (전자상거래법 제24조 제2항) */}
          <div className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-zinc-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>구매안전(에스크로) 서비스 안내:</strong> 고객님의 안전거래를 위해 현금 등으로 결제 시 저희 쇼핑몰에서 가입한 {policies.ESCROW_INFO}를 이용하실 수 있습니다.
              </span>
            </div>
            <a
              href="https://pg.tosspayments.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-[10px] font-bold text-white shrink-0 transition-colors"
            >
              서비스 가입사실 확인
            </a>
          </div>

          <div className="pt-2 text-zinc-500 text-[10px] space-y-1">
            <p>· 전자상거래법 제17조에 따라 소비자는 상품을 수령한 날로부터 7일 이내에 청약철회(반품/환불)를 요청할 수 있습니다.</p>
            <p>· 미성년자가 법정대리인의 동의 없이 체결한 계약은 미성년자 본인 또는 법정대리인이 취소할 수 있습니다.</p>
            <p className="pt-2">&copy; {new Date().getFullYear()} {policies.COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

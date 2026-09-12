"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ExternalLink } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
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

  if (pathname?.startsWith("/editorial-preview")) {
    return null;
  }

  const rawBizNum = policies.BIZ_REG_NUMBER ? policies.BIZ_REG_NUMBER.replace(/[^0-9]/g, "") : "1234567890";

  return (
    <footer className="w-full bg-[#F6F4EE] border-t border-[#E7E2D8] py-12 sm:py-16 md:py-20 text-xs text-stone-800">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8 sm:space-y-12">
        {/* Top Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-8 border-b border-[#E7E2D8]">
          <div className="md:col-span-1 space-y-3">
            <h3 className="font-bold text-lg text-stone-950 tracking-tight">PERVADE</h3>
            <p className="text-stone-600 leading-relaxed text-xs">
              프리미엄 친환경 다목적 세정 솔루션. <br />
              일상의 공간을 더 안전하고 아름답게 만듭니다.
            </p>
            <div className="pt-2 text-stone-600">
              <span className="block text-[11px] text-stone-500 font-bold uppercase">Customer Support</span>
              <span className="text-base font-extrabold text-stone-950">{policies.CS_PHONE}</span>
              <span className="block text-[11px] text-stone-500">{policies.CS_HOURS}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-stone-950 mb-3 text-xs uppercase tracking-wider">Shop &amp; Guide</h4>
            <ul className="space-y-2 text-stone-600">
              <li><Link href="/shop" className="hover:text-stone-950 transition-colors">전체상품</Link></li>
              <li><Link href="/guide" className="hover:text-stone-950 transition-colors">사용가이드</Link></li>
              <li><Link href="/about" className="hover:text-stone-950 transition-colors">브랜드스토리</Link></li>
              <li><Link href="/journal" className="hover:text-stone-950 transition-colors">저널</Link></li>
              <li><Link href="/journal?type=NOTICE" className="hover:text-stone-950 transition-colors">공지및뉴스</Link></li>
              <li>
                <a 
                  href="https://www.instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-stone-950 transition-colors inline-flex items-center gap-1 font-medium text-stone-700 pt-0.5"
                >
                  <span>공식인스타그램</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-stone-950 mb-3 text-xs uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-stone-600">
              <li>
                <a 
                  href="https://pf.kakao.com/@pervade/chat" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:opacity-90 transition-opacity inline-flex items-center gap-1 font-bold text-stone-900 bg-[#FEE500] px-2 py-0.5"
                >
                  <span>💬 카카오톡 1:1 상담 (@pervade)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><Link href="/faq" className="hover:text-stone-950 transition-colors">자주 묻는 질문 (FAQ)</Link></li>
              <li><Link href="/qna" className="hover:text-stone-950 transition-colors">1:1 문의 게시판</Link></li>
              <li><Link href="/shipping" className="hover:text-stone-950 transition-colors">배송 / 교환 / 반품 안내</Link></li>
              <li><Link href="/contact" className="hover:text-stone-950 transition-colors">대량구매 & 제휴문의</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-stone-950 mb-3 text-xs uppercase tracking-wider">Terms & Policy</h4>
            <ul className="space-y-2 text-stone-600">
              <li><Link href="/terms" className="hover:text-stone-950 transition-colors font-medium">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-stone-950 transition-colors font-bold text-stone-950 underline">개인정보처리방침</Link></li>
              <li><Link href="/shipping" className="hover:text-stone-950 transition-colors">안전거래센터</Link></li>
            </ul>
          </div>
        </div>

        {/* Business & Legal Required Information (전자상거래 등에서의 소비자보호에 관한 법률 제10조 제1항 준수) */}
        <div className="space-y-4 text-stone-600 text-[11px] leading-relaxed">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong className="text-stone-800">상호명:</strong> {policies.COMPANY_NAME}</span>
            <span className="text-stone-400">|</span>
            <span><strong className="text-stone-800">대표자:</strong> {policies.CEO_NAME}</span>
            <span className="text-stone-400">|</span>
            <span><strong className="text-stone-800">사업장 소재지:</strong> {policies.COMPANY_ADDRESS}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong className="text-stone-800">사업자등록번호:</strong> {policies.BIZ_REG_NUMBER}</span>
            <a 
              href={`https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${rawBizNum}`}
              target="_blank" 
              rel="noreferrer"
              className="text-stone-800 underline inline-flex items-center gap-1 hover:text-stone-950 font-medium"
            >
              [사업자정보확인 <ExternalLink className="w-3 h-3" />]
            </a>
            <span className="text-stone-400">|</span>
            <span><strong className="text-stone-800">통신판매업신고번호:</strong> {policies.ECOMMERCE_NUMBER}</span>
            <span className="text-stone-400">|</span>
            <span><strong className="text-stone-800">개인정보보호책임자:</strong> {policies.PRIVACY_OFFICER}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong className="text-stone-800">대표이메일:</strong> {policies.CS_EMAIL}</span>
            <span className="text-stone-400">|</span>
            <span><strong className="text-stone-800">고객센터:</strong> {policies.CS_PHONE}</span>
            <span className="text-stone-400">|</span>
            <span><strong className="text-stone-800">호스팅서비스 제공자:</strong> {policies.HOSTING_PROVIDER}</span>
          </div>

          {/* Escrow Purchase Safety Service Notice (전자상거래법 제24조 제2항) */}
          <div className="p-4 bg-[#ECE8E0]/70 border border-[#DDD7CD] rounded-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-stone-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                <strong className="text-stone-900">구매안전(에스크로) 서비스 안내:</strong> 고객님의 안전거래를 위해 현금 등으로 결제 시 저희 쇼핑몰에서 가입한 {policies.ESCROW_INFO}를 이용하실 수 있습니다.
              </span>
            </div>
            <a
              href="https://pg.tosspayments.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 rounded-none text-[10px] font-bold text-white shrink-0 transition-colors"
            >
              서비스 가입사실 확인
            </a>
          </div>

          <div className="pt-2 text-stone-500 text-[10px] space-y-1">
            <p>· 전자상거래법 제17조에 따라 소비자는 상품을 수령한 날로부터 7일 이내에 청약철회(반품/환불)를 요청할 수 있습니다.</p>
            <p>· 미성년자가 법정대리인의 동의 없이 체결한 계약은 미성년자 본인 또는 법정대리인이 취소할 수 있습니다.</p>
            <p className="pt-2">&copy; {new Date().getFullYear()} {policies.COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

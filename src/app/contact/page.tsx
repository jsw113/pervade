import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mail, Phone, MapPin, Building2, Briefcase, Clock, MessageSquare, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  // 1. Fetch live dynamic operational policies from DB
  const policies = await prisma.policy.findMany();
  const getPolicy = (key: string, defaultValue: string) =>
    policies.find((p) => p.key === key)?.value || defaultValue;

  const companyName = getPolicy("COMPANY_NAME", "(주)퍼베이드 (PERVADE Corp.)");
  const ceoName = getPolicy("CEO_NAME", "홍길동");
  const companyAddress = getPolicy("COMPANY_ADDRESS", "서울특별시 강남구 테헤란로 123, 퍼베이드타워 4층");
  const bizRegNumber = getPolicy("BIZ_REG_NUMBER", "123-45-67890");
  const csPhone = getPolicy("CS_PHONE", "02-1234-5678");
  const csHours = getPolicy("CS_HOURS", "평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00 / 주말·공휴일 휴무)");
  const csEmail = getPolicy("CS_EMAIL", "support@pervade.co.kr");

  // 2. Fetch Recent Q&A Questions
  const questions = await prisma.question.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <Briefcase className="w-3.5 h-3.5" />
          B2B &amp; Customer Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">대량구매 &amp; 제휴문의 / 고객센터</h1>
        <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
          기업/기관 대량 구매, B2B 납품 견적, 온·오프라인 유통 입점 및 제휴 문의를 환영합니다.<br className="hidden sm:inline"/>
          퍼베이드 담당자가 확인 후 신속하고 친절하게 안내해 드립니다.
        </p>
      </div>

      {/* B2B Partnership Banner */}
      <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Business Solution</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">호텔, 오피스, 매장 및 공간 케어 전문 B2B 납품</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              정기 납품 및 대용량 규격, 기업 맞춤형 선물세트 구성이 가능합니다. 사업자 등록증과 함께 이메일 또는 1:1 게시판으로 문의주시면 전담 매니저가 즉시 견적을 회신합니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href={`mailto:${csEmail}?subject=${encodeURIComponent("[대량구매/제휴문의] 기업명/담당자명")}`}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl transition-colors text-center shadow-md flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              이메일로 제휴·견적 문의
            </a>
            <Link
              href="/qna"
              className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-colors text-center border border-zinc-700 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              1:1 온라인 문의 작성
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info (Live DB Policies) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-50 p-6 sm:p-8 rounded-3xl border space-y-6">
            <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-800" />
              공식 연락처 안내
            </h3>
            
            <div className="space-y-5 text-xs">
              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-white rounded-xl border text-zinc-700 shadow-2xs mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-zinc-900">이메일 문의 (대량구매 &amp; CS)</p>
                  <a 
                    href={`mailto:${csEmail}`} 
                    className="text-zinc-600 hover:text-zinc-950 font-medium break-all underline decoration-zinc-300 underline-offset-2"
                  >
                    {csEmail}
                  </a>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-white rounded-xl border text-zinc-700 shadow-2xs mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-zinc-900">고객센터 (전화상담)</p>
                  <p className="text-base font-black text-zinc-950">{csPhone}</p>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 pt-0.5">
                    <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{csHours}</span>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-start gap-3.5 pt-2 border-t">
                <div className="p-2 bg-white rounded-xl border text-zinc-700 shadow-2xs mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-zinc-900">오시는 길 (본사/사업장)</p>
                  <p className="text-zinc-600 leading-relaxed">
                    <strong>{companyName}</strong><br />
                    {companyAddress}
                  </p>
                  <a
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(companyAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 pt-1"
                  >
                    <span>네이버 지도에서 보기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Legal Info */}
              <div className="pt-3 border-t text-[11px] text-zinc-500 space-y-1">
                <p>· 상호명: {companyName}</p>
                <p>· 대표자: {ceoName} | 사업자등록번호: {bizRegNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Board & FAQ Direct Link */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-zinc-950">최근 1:1 고객 문의 게시판</h3>
              <p className="text-xs text-zinc-500">배송, 결제, 상품 관련 실시간 문의 내역입니다.</p>
            </div>
            <Link 
              href="/qna" 
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              문의 작성하기
            </Link>
          </div>
          
          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b text-zinc-500 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">문의 제목</th>
                    <th className="px-4 py-3.5 w-24">작성자</th>
                    <th className="px-4 py-3.5 w-28">작성일</th>
                    <th className="px-4 py-3.5 w-24 text-center">처리상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                        등록된 1:1 문의가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    questions.map((q) => (
                      <tr key={q.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-zinc-900">
                          <Link href="/qna" className="hover:underline flex items-center gap-1.5">
                            {q.isSecret && <span className="text-zinc-400">🔒</span>}
                            <span>{q.isSecret ? "비밀글로 등록된 문의입니다." : q.title}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500">
                          {q.user?.name ? `${q.user.name.charAt(0)}**` : "고객"}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-400 font-mono">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.8 rounded-md text-[10px] font-bold ${
                            q.answer ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                          }`}>
                            {q.answer ? "답변완료" : "답변대기"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick FAQ Helper Box */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                자주 묻는 질문(FAQ)을 먼저 확인해 보세요
              </h4>
              <p className="text-[11px] text-amber-800">
                배송 일정, 반품/교환 절차, 제품 사용법에 대한 답변이 FAQ에 등록되어 있습니다.
              </p>
            </div>
            <Link
              href="/faq"
              className="px-4 py-2 bg-white text-zinc-950 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100/50 transition-colors shrink-0 shadow-2xs flex items-center gap-1"
            >
              FAQ 바로가기
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mail, Phone, MapPin, Lock } from "lucide-react";

export default async function ContactPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">고객 센터</h1>
        <p className="text-muted-foreground text-lg">궁금한 점이 있으신가요? 퍼베이드가 도와드리겠습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-zinc-50 p-8 rounded-2xl border">
            <h3 className="font-bold text-xl mb-6">Contact Us</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">이메일 문의</p>
                  <a href="mailto:support@pervade.com" className="text-muted-foreground hover:text-black">support@pervade.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">고객센터 (전화)</p>
                  <p className="text-muted-foreground">02-1234-5678</p>
                  <p className="text-sm text-muted-foreground mt-1">평일 10:00 - 17:00 (점심시간 12:00 - 13:00)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">오시는 길</p>
                  <p className="text-muted-foreground">서울특별시 강남구 테헤란로 123<br/>퍼베이드 빌딩 4층</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Board */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">Q&A 게시판</h3>
            <Link 
              href="/contact/new" 
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-black/90 transition-colors"
            >
              문의하기
            </Link>
          </div>
          
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">제목</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground w-24">작성자</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground w-32">작성일</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground w-24">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      등록된 문의가 없습니다.
                    </td>
                  </tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id} className="hover:bg-zinc-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        {q.isSecret && <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                        {q.isSecret ? "비밀글입니다." : q.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {q.user.name.charAt(0)}**
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${q.answer ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'}`}>
                          {q.answer ? '답변완료' : '답변대기'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

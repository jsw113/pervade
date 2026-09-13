import { prisma } from "@/lib/prisma";
import { GuideEditor } from "@/components/admin/GuideEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const guide = await prisma.guidePost.findUnique({
    where: { id }
  });

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">가이드를 찾을 수 없습니다.</h2>
        <Link href="/admin/posts?type=GUIDE" className="text-xs font-bold text-blue-600 underline">
          가이드 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/posts?type=GUIDE" 
          className="p-2 bg-white border rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
          title="목록으로"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
            Guide Editor
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mt-0.5">사용가이드 아티클 수정</h2>
        </div>
      </div>

      <GuideEditor initialData={JSON.parse(JSON.stringify(guide))} />
    </div>
  );
}

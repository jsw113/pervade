import { prisma } from "@/lib/prisma";
import { GuideEditor } from "@/components/admin/GuideEditor";
import Link from "next/link";

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
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">가이드를 찾을 수 없습니다.</h2>
        <Link href="/admin/guides" className="text-xs font-bold underline">
          가이드 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GuideEditor initialData={JSON.parse(JSON.stringify(guide))} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { PromotionEditor } from "@/components/admin/PromotionEditor";
import Link from "next/link";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promo = await prisma.promotion.findUnique({
    where: { id },
  });

  if (!promo) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">프로모션을 찾을 수 없습니다.</h2>
        <Link href="/admin/promotions" className="text-xs font-bold underline">
          프로모션 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PromotionEditor initialData={JSON.parse(JSON.stringify(promo))} />
    </div>
  );
}

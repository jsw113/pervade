import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductEditForm } from "@/components/admin/ProductEditForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findFirst({
    where: { id }
  });

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-12 text-center">
        <h2 className="text-xl font-bold">제품을 찾을 수 없습니다.</h2>
        <Link href="/admin/products" className="text-blue-600 hover:underline">제품 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 bg-white border rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
              Product &amp; Option Editor
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mt-0.5">제품 정보 및 구매 옵션 수정</h2>
        </div>
      </div>
      
      <ProductEditForm product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}

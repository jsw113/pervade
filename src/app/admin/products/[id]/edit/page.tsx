import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductEditForm } from "@/components/admin/ProductEditForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findFirst({
    where: { id }
  });

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 text-center">
        <h2 className="text-xl font-bold">제품을 찾을 수 없습니다.</h2>
        <Link href="/admin/products" className="text-blue-600 hover:underline">제품 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold">제품 수정</h2>
      </div>
      
      <ProductEditForm product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}

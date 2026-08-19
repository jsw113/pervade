import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">제품 관리</h2>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-black/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 제품 등록
        </Link>
      </div>
      
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">이미지</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">제품명</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">가격</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">재고</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">상태</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">등록일</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  등록된 제품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-zinc-200 rounded overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">No Img</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.price.toLocaleString()}원</td>
                  <td className="px-6 py-4">{product.stock}개</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.isVisible ? 'bg-blue-100 text-blue-800' : 'bg-zinc-100 text-zinc-600'}`}>
                      {product.isVisible ? '노출 중' : '숨김'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:underline">수정</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ProductsIntroPage() {
  const posts = await prisma.post.findMany({
    where: { type: "PRODUCT", published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">제품 가이드</h1>
        <p className="text-muted-foreground text-lg">퍼베이드 세정제의 놀라운 효과와 다양한 활용법을 소개합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-20 border rounded-2xl bg-zinc-50">
            아직 작성된 제품 소개가 없습니다.
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="border rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-2xl font-semibold mb-3">{post.title}</h2>
              <time className="text-sm text-muted-foreground mb-4">
                {new Date(post.createdAt).toLocaleDateString()}
              </time>
              
              <div className="line-clamp-4 text-zinc-600 mb-6 flex-1">
                {post.content}
              </div>
              
              <Link 
                href={`/products/${post.id}`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline mt-auto"
              >
                자세히 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))
        )}
      </div>
      
      <div className="mt-16 text-center">
        <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-black/80 transition-colors">
          바로 구매하러 가기
        </Link>
      </div>
    </div>
  );
}

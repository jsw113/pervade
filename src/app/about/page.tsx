import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const posts = await prisma.post.findMany({
    where: { type: "ABOUT", published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">브랜드 스토리</h1>
        <p className="text-muted-foreground text-lg">퍼베이드가 만들어가는 새로운 일상의 기준</p>
      </div>

      <div className="space-y-16">
        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 border rounded-2xl bg-zinc-50">
            아직 작성된 브랜드 스토리가 없습니다.
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="prose prose-zinc max-w-none">
              <h2 className="text-3xl font-semibold mb-2">{post.title}</h2>
              <time className="text-sm text-muted-foreground block mb-8">
                {new Date(post.createdAt).toLocaleDateString()}
              </time>
              
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-700">
                {post.content}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const posts = await prisma.post.findMany({
    where: { type: "JOURNAL", published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Journal</h1>
        <p className="text-muted-foreground text-lg">퍼베이드가 공유하는 일상의 영감과 라이프스타일 스토리</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-20 border rounded-2xl bg-zinc-50">
            아직 작성된 저널이 없습니다.
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="group border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] bg-zinc-100 flex items-center justify-center text-zinc-400 font-medium">
                [Journal Image]
              </div>
              <div className="p-6">
                <time className="text-xs text-muted-foreground block mb-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                  {post.content.replace(/[#*`]/g, '')}
                </p>
                <Link 
                  href={`/journal/${post.id}`} 
                  className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 hover:text-zinc-600 hover:border-zinc-600 transition-colors inline-block"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

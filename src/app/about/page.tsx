import { prisma } from "@/lib/prisma";
import { ShareButtons } from "@/components/common/ShareButtons";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const posts = await prisma.post.findMany({
    where: { type: "ABOUT", published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black tracking-tight mb-4 text-zinc-950">브랜드 스토리</h1>
        <p className="text-muted-foreground text-lg font-medium">퍼베이드가 만들어가는 새로운 일상의 기준</p>
      </div>

      <div className="space-y-16">
        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 border rounded-2xl bg-zinc-50">
            아직 작성된 브랜드 스토리가 없습니다.
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="prose prose-zinc max-w-none">
              <h2 className="text-3xl font-black mb-2 text-zinc-950">{post.title}</h2>
              <time className="text-xs text-zinc-400 block mb-8">
                발행일: {new Date(post.createdAt).toLocaleDateString()} · PERVADE Brand Editorial
              </time>
              
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 text-base sm:text-lg">
                {post.content}
              </div>
            </article>
          ))
        )}

        {/* Social Share Buttons */}
        <div className="mt-16 pt-8 border-t">
          <ShareButtons 
            title="PERVADE 브랜드 스토리 | 프리미엄 다목적 세정제"
            description="퍼베이드가 만들어가는 새로운 일상의 기준과 브랜드 스토리"
          />
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await prisma.post.findFirst({
    where: { id, type: "JOURNAL" }
  });

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">저널을 찾을 수 없습니다</h1>
        <Link href="/journal" className="text-blue-600 hover:underline">저널 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/journal" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </Link>
      
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 leading-tight">
          {post.title}
        </h1>
        <time className="text-sm text-muted-foreground block mb-8">
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
        
        <div className="aspect-[2/1] bg-zinc-100 rounded-2xl mb-8 flex items-center justify-center text-zinc-400 font-medium">
          [Journal Detail Image]
        </div>

        <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 text-lg">
          {post.content}
        </div>
      </article>
    </div>
  );
}

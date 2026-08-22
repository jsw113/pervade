import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ShareButtons } from "@/components/common/ShareButtons";

export const dynamic = "force-dynamic";

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
      <Link href="/journal" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 text-xs font-bold mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 저널 목록으로 돌아가기
      </Link>
      
      <article className="prose prose-zinc max-w-none">
        <div className="space-y-3 border-b pb-6 mb-8">
          <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-xs font-bold">
            PERVADE Journal
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950 leading-tight">
            {post.title}
          </h1>
          <time className="text-xs text-zinc-400 block">
            발행일: {new Date(post.createdAt).toLocaleDateString()} · PERVADE Editorial
          </time>
        </div>

        <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 text-base sm:text-lg mb-10">
          {post.content}
        </div>

        {/* Social Share Buttons */}
        <div className="mt-12 not-prose">
          <ShareButtons 
            title={post.title}
            description={post.content.substring(0, 100)}
          />
        </div>
      </article>
    </div>
  );
}

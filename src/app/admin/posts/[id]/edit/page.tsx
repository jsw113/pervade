import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/admin/PostEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">콘텐츠를 찾을 수 없습니다.</h2>
        <Link href="/admin/posts" className="text-xs font-bold text-blue-600 underline">
          콘텐츠 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/posts" 
          className="p-2 bg-white border rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
          title="목록으로"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
            Content Editor
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mt-0.5">
            {post.type === "ABOUT" ? "브랜드 스토리 수정" : post.type === "JOURNAL" ? "저널 / 블로그 수정" : "콘텐츠 수정"}
          </h2>
        </div>
      </div>

      <PostEditor initialData={JSON.parse(JSON.stringify(post))} />
    </div>
  );
}

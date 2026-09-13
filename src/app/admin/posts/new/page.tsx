import { PostEditor } from "@/components/admin/PostEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const resolved = await searchParams;
  const defaultType = resolved?.type || "ABOUT";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Link 
          href={`/admin/posts?type=${defaultType}`} 
          className="p-2 bg-white border rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
          title="목록으로"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
            New Content
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mt-0.5">새 콘텐츠 작성</h2>
        </div>
      </div>
      
      <PostEditor defaultType={defaultType} />
    </div>
  );
}


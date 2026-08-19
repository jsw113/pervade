import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Server component to fetch posts
export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">콘텐츠 관리 (CMS)</h2>
        <Link 
          href="/admin/posts/new" 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-black/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 글 작성
        </Link>
      </div>
      
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">제목</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">분류</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">상태</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">작성일</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  등록된 콘텐츠가 없습니다.
                </td>
              </tr>
            ) : (
              posts.map(post => (
                <tr key={post.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{post.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-100 text-zinc-800 px-2 py-1 rounded text-xs font-medium">
                      {post.type === "ABOUT" ? "브랜드 소개" : post.type === "PRODUCT" ? "제품 설명" : post.type === "JOURNAL" ? "저널" : post.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {post.published ? '발행됨' : '임시저장'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:underline">수정</Link>
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

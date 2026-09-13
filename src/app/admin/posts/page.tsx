import { prisma } from "@/lib/prisma";
import { AdminPostsTable } from "@/components/admin/AdminPostsTable";
import { sortPinnableContents } from "@/lib/contentSort";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const resolved = await searchParams;
  const rawType = resolved?.type?.toUpperCase();
  const validTypes = ["ABOUT", "JOURNAL", "NOTICE", "GUIDE"];
  const activeType = validTypes.includes(rawType || "") ? (rawType as string) : "ABOUT";

  // Fetch all posts and guides in parallel on initial server load
  const [rawPosts, rawGuides] = await Promise.all([
    prisma.post.findMany({
      orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: { author: true }
    }),
    prisma.guidePost.findMany({
      orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    }),
  ]);

  const posts = sortPinnableContents(rawPosts);
  const guides = sortPinnableContents(rawGuides);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* High-Performance Interactive Table with 0ms Instant Tab Switch */}
      <AdminPostsTable
        initialPosts={posts as any}
        initialGuides={guides as any}
        initialType={activeType}
      />
    </div>
  );
}



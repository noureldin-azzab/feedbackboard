import { db } from "@/lib/db";
import PostCard from "@/components/PostCard";
import SearchFilter from "@/components/SearchFilter";
import Link from "next/link";

export const dynamic = "force-dynamic";
// MIGRATION NOTE: ISR revalidation (revalidate = 60) works on Vercel's edge.
// On self-hosted AWS without a custom cache handler it won't work as expected.
export const revalidate = 60;

type SearchParams = {
  search?: string;
  category?: string;
  status?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { search, category, status } = params;

  let query = db
    .from("Post")
    .select("*, _count:Comment(count)")
    .order("votes", { ascending: false });

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data: rawPosts } = await query;

  const posts = (rawPosts || []).map((p: Record<string, unknown>) => ({
    ...p,
    _count: { comments: (p._count as { count: number }[])?.[0]?.count ?? 0 },
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Board</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vote for features you want, report bugs, or ask questions.
        </p>
      </div>

      <SearchFilter />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
          {search && ` matching "${search}"`}
        </p>
        <Link href="/new" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
          + Submit feedback
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-sm">No posts found.</p>
          <Link href="/new" className="mt-3 inline-block text-indigo-600 font-medium text-sm hover:underline">
            Be the first to submit feedback →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={(post as Record<string, unknown>).id as string}
              post={post as Parameters<typeof PostCard>[0]["post"]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

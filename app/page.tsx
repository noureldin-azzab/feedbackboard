import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import SearchFilter from "@/components/SearchFilter";
import Link from "next/link";
import { Category, Status } from "@prisma/client";

// This page is revalidated every 60 seconds.
// MIGRATION NOTE: Next.js ISR revalidation is handled by Vercel's edge infrastructure.
// On self-hosted AWS (EC2/ECS), you lose this behaviour unless you use a custom cache
// handler or add Redis-backed revalidation. On AWS Lambda (SST/OpenNext) it works
// differently. Something to address in the migration.
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

  const posts = await prisma.post.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category: category as Category } : {},
        status ? { status: status as Status } : {},
      ],
    },
    include: {
      _count: { select: { comments: true } },
    },
    orderBy: { votes: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Board</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vote for features you want, report bugs, or ask questions.
        </p>
      </div>

      {/* Search & Filter */}
      <SearchFilter />

      {/* Post count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
          {search && ` matching "${search}"`}
        </p>
        <Link
          href="/new"
          className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
        >
          + Submit feedback
        </Link>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-sm">No posts found.</p>
          <Link
            href="/new"
            className="mt-3 inline-block text-indigo-600 font-medium text-sm hover:underline"
          >
            Be the first to submit feedback →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                createdAt: post.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

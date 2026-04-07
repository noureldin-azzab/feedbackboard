import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Category, Status } from "@prisma/client";

export const metadata: Metadata = {
  title: "Dashboard — FeedbackBoard",
};

// MIGRATION NOTE: This page fetches stats directly from the DB on the server.
// The revalidate below means Next.js caches and re-generates it every 30s on Vercel.
// On a self-hosted AWS deployment without proper cache infrastructure, every visitor
// hits the DB fresh — or the page is stale indefinitely depending on the setup.
export const revalidate = 30;
export const dynamic = "force-dynamic";

const CATEGORY_ICON: Record<Category, string> = {
  FEATURE: "✨",
  BUG: "🐛",
  IMPROVEMENT: "⚡",
  QUESTION: "❓",
};

export default async function DashboardPage() {
  const [
    totalPosts,
    openPosts,
    inProgressPosts,
    resolvedPosts,
    closedPosts,
    totalVotesAgg,
    categoryCounts,
    recentPosts,
    topPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: Status.OPEN } }),
    prisma.post.count({ where: { status: Status.IN_PROGRESS } }),
    prisma.post.count({ where: { status: Status.RESOLVED } }),
    prisma.post.count({ where: { status: Status.CLOSED } }),
    prisma.post.aggregate({ _sum: { votes: true } }),
    prisma.post.groupBy({ by: ["category"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true, votes: true, status: true, category: true },
    }),
    prisma.post.findMany({
      orderBy: { votes: "desc" },
      take: 5,
      select: { id: true, title: true, votes: true, status: true, category: true },
    }),
  ]);

  const totalVotes = totalVotesAgg._sum.votes ?? 0;

  const stats = [
    { label: "Total Posts", value: totalPosts, color: "bg-indigo-50 text-indigo-700" },
    { label: "Open", value: openPosts, color: "bg-blue-50 text-blue-700" },
    { label: "In Progress", value: inProgressPosts, color: "bg-yellow-50 text-yellow-700" },
    { label: "Resolved", value: resolvedPosts, color: "bg-green-50 text-green-700" },
    { label: "Closed", value: closedPosts, color: "bg-gray-100 text-gray-600" },
    { label: "Total Votes", value: totalVotes, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all feedback activity.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl p-4 ${s.color}`}
          >
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">By Category</h2>
          <div className="space-y-3">
            {categoryCounts.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICON[c.category]}</span>
                  <span className="text-sm text-gray-700">
                    {CATEGORY_LABELS[c.category]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${Math.round((c._count.id / totalPosts) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-6 text-right">
                    {c._count.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top voted */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Voted Posts</h2>
          <div className="space-y-2">
            {topPosts.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">{STATUS_LABELS[post.status]}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">{post.votes} ▲</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{CATEGORY_ICON[post.category]}</span>
                  <p className="text-sm text-gray-800">{post.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-medium text-indigo-600">{post.votes} ▲</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

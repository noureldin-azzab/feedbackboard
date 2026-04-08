import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard — FeedbackBoard" };

export const dynamic = "force-dynamic";
// MIGRATION NOTE: revalidate = 30 works on Vercel edge; breaks on self-hosted AWS
// without a Redis-backed cache handler.
export const revalidate = 30;

type Category = "FEATURE" | "BUG" | "IMPROVEMENT" | "QUESTION";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

const CATEGORY_ICON: Record<Category, string> = {
  FEATURE: "✨", BUG: "🐛", IMPROVEMENT: "⚡", QUESTION: "❓",
};

export default async function DashboardPage() {
  const { data: rawPosts } = await db.from("Post").select("*");
  const posts = rawPosts ?? [];

  const totalPosts = posts.length;
  const openPosts = posts.filter((p) => p.status === "OPEN").length;
  const inProgressPosts = posts.filter((p) => p.status === "IN_PROGRESS").length;
  const resolvedPosts = posts.filter((p) => p.status === "RESOLVED").length;
  const closedPosts = posts.filter((p) => p.status === "CLOSED").length;
  const totalVotes = posts.reduce((s, p) => s + (p.votes || 0), 0);

  const categoryMap: Record<string, number> = {};
  posts.forEach((p) => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
  const categoryCounts = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, _count: { id: count } }))
    .sort((a, b) => b._count.id - a._count.id);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topPosts = [...posts].sort((a, b) => b.votes - a.votes).slice(0, 5);

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">By Category</h2>
          <div className="space-y-3">
            {categoryCounts.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICON[c.category as Category]}</span>
                  <span className="text-sm text-gray-700">{CATEGORY_LABELS[c.category as Category]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round((c._count.id / totalPosts) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-6 text-right">{c._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Voted Posts</h2>
          <div className="space-y-2">
            {topPosts.map((post, i) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">{STATUS_LABELS[post.status as Status]}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">{post.votes} ▲</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm">{CATEGORY_ICON[post.category as Category]}</span>
                  <p className="text-sm text-gray-800">{post.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
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


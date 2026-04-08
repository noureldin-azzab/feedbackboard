import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { data: posts, error } = await db.from("Post").select("*");
    if (error) throw error;

    const totalPosts = posts.length;
    const openPosts = posts.filter((p) => p.status === "OPEN").length;
    const inProgressPosts = posts.filter((p) => p.status === "IN_PROGRESS").length;
    const resolvedPosts = posts.filter((p) => p.status === "RESOLVED").length;
    const totalVotes = posts.reduce((sum, p) => sum + (p.votes || 0), 0);

    const categoryMap: Record<string, number> = {};
    posts.forEach((p) => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    });
    const categoryCounts = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      _count: { id: count },
    }));

    const recentPosts = [...posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((p) => ({ id: p.id, title: p.title, createdAt: p.createdAt, votes: p.votes, status: p.status, category: p.category }));

    const topPosts = [...posts]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5)
      .map((p) => ({ id: p.id, title: p.title, votes: p.votes, status: p.status, category: p.category }));

    return NextResponse.json({
      totalPosts,
      openPosts,
      inProgressPosts,
      resolvedPosts,
      totalVotes,
      categoryCounts,
      recentPosts,
      topPosts,
    });
  } catch (error) {
    console.error("Stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

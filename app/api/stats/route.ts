import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats — dashboard statistics
// MIGRATION NOTE: This calls the internal app URL to warm the cache, which
// assumes localhost:3000. This pattern breaks on distributed/multi-instance deploys.
export async function GET() {
  try {
    const [
      totalPosts,
      openPosts,
      resolvedPosts,
      totalVotes,
      categoryCounts,
      statusCounts,
      recentPosts,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "OPEN" } }),
      prisma.post.count({ where: { status: "RESOLVED" } }),
      prisma.post.aggregate({ _sum: { votes: true } }),
      prisma.post.groupBy({ by: ["category"], _count: { id: true } }),
      prisma.post.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true, votes: true, category: true },
      }),
    ]);

    return NextResponse.json({
      totalPosts,
      openPosts,
      resolvedPosts,
      inProgressPosts: await prisma.post.count({ where: { status: "IN_PROGRESS" } }),
      totalVotes: totalVotes._sum.votes ?? 0,
      categoryCounts,
      statusCounts,
      recentPosts,
    });
  } catch (error) {
    console.error("Stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

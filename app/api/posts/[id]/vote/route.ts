import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/posts/[id]/vote
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const post = await prisma.post.update({
      where: { id },
      data: { votes: { increment: 1 } },
    });
    return NextResponse.json({ votes: post.votes });
  } catch (error) {
    console.error("Vote failed:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

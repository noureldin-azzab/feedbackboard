import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Fetch current votes then increment
    const { data: post, error: fetchError } = await db
      .from("Post")
      .select("votes")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await db
      .from("Post")
      .update({ votes: (post.votes || 0) + 1, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("votes")
      .single();

    if (error) throw error;
    return NextResponse.json({ votes: data.votes });
  } catch (error) {
    console.error("Vote failed:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

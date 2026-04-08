import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data, error } = await db
      .from("Comment")
      .select("*")
      .eq("postId", id)
      .order("createdAt", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET comments failed:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { body: commentBody, authorName } = body;

    if (!commentBody || !authorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await db
      .from("Comment")
      .insert({
        id: crypto.randomUUID(),
        body: commentBody,
        authorName,
        postId: id,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST comment failed:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

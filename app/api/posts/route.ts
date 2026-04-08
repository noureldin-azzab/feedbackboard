import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";

  try {
    let query = db
      .from("Post")
      .select(`*, comment_count:Comment(count)`)
      .order("votes", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    // Normalize comment count
    const posts = (data || []).map((p: Record<string, unknown>) => ({
      ...p,
      _count: { comments: (p.comment_count as { count: number }[])?.[0]?.count ?? 0 },
      comment_count: undefined,
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts failed:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, authorName, authorEmail, imageUrl } = body;

    if (!title || !description || !authorName || !authorEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await db
      .from("Post")
      .insert({
        id: crypto.randomUUID(),
        title,
        description,
        category: category || "FEATURE",
        status: "OPEN",
        votes: 0,
        authorName,
        authorEmail,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts failed:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

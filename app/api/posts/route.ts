import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category, Status } from "@prisma/client";

// GET /api/posts — list posts with optional search/filter
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") as Category | null;
  const status = searchParams.get("status") as Status | null;

  try {
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
          category ? { category } : {},
          status ? { status } : {},
        ],
      },
      include: {
        _count: { select: { comments: true } },
      },
      orderBy: { votes: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    // Minimal error logging — no structured logging or alerting
    console.error("GET /api/posts failed:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts — create a new post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, authorName, authorEmail, imageUrl } = body;

    if (!title || !description || !authorName || !authorEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        description,
        category: category || Category.FEATURE,
        authorName,
        authorEmail,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts failed:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

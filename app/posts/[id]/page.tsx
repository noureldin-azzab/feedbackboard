import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";

type Category = "FEATURE" | "BUG" | "IMPROVEMENT" | "QUESTION";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: post } = await db.from("Post").select("title").eq("id", id).single();
  return { title: post ? `${post.title} — FeedbackBoard` : "Post Not Found" };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: post }, { data: comments }] = await Promise.all([
    db.from("Post").select("*").eq("id", id).single(),
    db.from("Comment").select("*").eq("postId", id).order("createdAt", { ascending: true }),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">
        ← Back to posts
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mt-4 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[post.category as Category]}`}>
              {CATEGORY_LABELS[post.category as Category]}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[post.status as Status]}`}>
              {STATUS_LABELS[post.status as Status]}
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.description}</p>

        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden relative w-full h-64">
            <Image src={post.imageUrl} alt="Post attachment" fill className="object-cover" unoptimized />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            <span className="font-medium text-gray-600">{post.authorName}</span>{" "}
            &middot; {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-semibold">{post.votes} votes</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <CommentSection
          postId={post.id}
          initialComments={(comments || []).map((c) => ({
            id: c.id,
            body: c.body,
            authorName: c.authorName,
            createdAt: c.createdAt,
          }))}
        />
      </div>
    </div>
  );
}

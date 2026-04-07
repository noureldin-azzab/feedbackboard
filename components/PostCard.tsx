"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";

type Post = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number;
  imageUrl: string | null;
  authorName: string;
  createdAt: string;
  _count?: { comments: number };
};

export default function PostCard({ post }: { post: Post }) {
  const [votes, setVotes] = useState(post.votes);
  const [voting, setVoting] = useState(false);

  async function handleVote(e: React.MouseEvent) {
    e.preventDefault();
    if (voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setVotes(data.votes);
    } finally {
      setVoting(false);
    }
  }

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* Vote button */}
          <div className="flex flex-col items-center gap-1 pt-1 min-w-[48px]">
            <button
              onClick={handleVote}
              disabled={voting}
              className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
              title="Upvote"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="text-sm font-semibold">{votes}</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-base leading-snug">
                {post.title}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category as keyof typeof CATEGORY_COLORS]}`}
                >
                  {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS]}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status as keyof typeof STATUS_COLORS]}`}
                >
                  {STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.description}</p>

            {post.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden w-24 h-16 relative">
                <Image
                  src={post.imageUrl}
                  alt="Post attachment"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>by {post.authorName}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              {post._count !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {post._count.comments}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

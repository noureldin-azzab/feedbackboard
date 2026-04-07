-- FeedbackBoard schema — paste this into Supabase SQL Editor and click Run

CREATE TYPE "Category" AS ENUM ('FEATURE', 'BUG', 'IMPROVEMENT', 'QUESTION');
CREATE TYPE "Status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE "Post" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category"    "Category" NOT NULL DEFAULT 'FEATURE',
  "status"      "Status" NOT NULL DEFAULT 'OPEN',
  "votes"       INTEGER NOT NULL DEFAULT 0,
  "imageUrl"    TEXT,
  "authorName"  TEXT NOT NULL,
  "authorEmail" TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
  "id"         TEXT NOT NULL,
  "body"       TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "postId"     TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

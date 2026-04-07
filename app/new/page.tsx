import type { Metadata } from "next";
import NewPostForm from "@/components/NewPostForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Submit Feedback — FeedbackBoard",
};

export default function NewPostPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to posts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Submit Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share a feature request, report a bug, or ask a question.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <NewPostForm />
      </div>
    </div>
  );
}

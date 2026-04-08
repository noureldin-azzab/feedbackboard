export type Category = "FEATURE" | "BUG" | "IMPROVEMENT" | "QUESTION";
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export const CATEGORY_LABELS: Record<Category, string> = {
  FEATURE: "Feature Request",
  BUG: "Bug Report",
  IMPROVEMENT: "Improvement",
  QUESTION: "Question",
};

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const STATUS_COLORS: Record<Status, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  FEATURE: "bg-purple-100 text-purple-800",
  BUG: "bg-red-100 text-red-800",
  IMPROVEMENT: "bg-orange-100 text-orange-800",
  QUESTION: "bg-teal-100 text-teal-800",
};

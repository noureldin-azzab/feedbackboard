import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Category, Status } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const posts = [
  {
    title: "Dark mode support",
    description:
      "Would love to have a dark mode option. Many users prefer low-light interfaces, especially at night. This would really improve the overall user experience.",
    category: Category.FEATURE,
    status: Status.OPEN,
    votes: 42,
    authorName: "Alice Johnson",
    authorEmail: "alice@example.com",
  },
  {
    title: "Search results are slow",
    description:
      "When I type in the search box, results take over 3 seconds to appear. This is quite frustrating when trying to find older feedback quickly.",
    category: Category.BUG,
    status: Status.IN_PROGRESS,
    votes: 31,
    authorName: "Bob Martinez",
    authorEmail: "bob@example.com",
  },
  {
    title: "Export feedback to CSV",
    description:
      "We need to be able to export all feedback posts to a CSV file for our weekly team reviews. Currently we copy-paste everything manually.",
    category: Category.FEATURE,
    status: Status.OPEN,
    votes: 28,
    authorName: "Carol White",
    authorEmail: "carol@example.com",
  },
  {
    title: "Email notifications for status changes",
    description:
      "Please send an email when the status of my submitted feedback changes. I currently have to check manually every day.",
    category: Category.IMPROVEMENT,
    status: Status.OPEN,
    votes: 24,
    authorName: "David Kim",
    authorEmail: "david@example.com",
  },
  {
    title: "Login page crashes on Safari 16",
    description:
      "The login page throws a JavaScript error on Safari 16.x (macOS Ventura). Other browsers work fine. Console shows: 'Cannot read properties of undefined (reading map)'.",
    category: Category.BUG,
    status: Status.RESOLVED,
    votes: 19,
    authorName: "Emma Davis",
    authorEmail: "emma@example.com",
  },
  {
    title: "Keyboard shortcut to vote",
    description:
      "Add a keyboard shortcut (e.g. 'v') to quickly upvote a post while browsing. Power users would really appreciate this workflow improvement.",
    category: Category.IMPROVEMENT,
    status: Status.OPEN,
    votes: 15,
    authorName: "Frank Brown",
    authorEmail: "frank@example.com",
  },
  {
    title: "How do I change my email address?",
    description:
      "I changed jobs and need to update the email associated with my account. I can't find this option anywhere in settings.",
    category: Category.QUESTION,
    status: Status.RESOLVED,
    votes: 12,
    authorName: "Grace Lee",
    authorEmail: "grace@example.com",
  },
  {
    title: "Pagination on the feedback list",
    description:
      "The homepage loads all posts at once. With hundreds of posts, this is slow and hard to navigate. Please add pagination or infinite scroll.",
    category: Category.IMPROVEMENT,
    status: Status.IN_PROGRESS,
    votes: 35,
    authorName: "Henry Wilson",
    authorEmail: "henry@example.com",
  },
  {
    title: "Duplicate posts should be merged",
    description:
      "There are many duplicate feature requests cluttering the board. An admin tool to merge similar posts and consolidate their votes would be very helpful.",
    category: Category.FEATURE,
    status: Status.OPEN,
    votes: 22,
    authorName: "Iris Chen",
    authorEmail: "iris@example.com",
  },
  {
    title: "API rate limiting too aggressive",
    description:
      "Our integration keeps hitting 429 errors even with moderate usage. The current rate limit of 60 requests/minute is way too low for teams.",
    category: Category.BUG,
    status: Status.OPEN,
    votes: 18,
    authorName: "James Taylor",
    authorEmail: "james@example.com",
  },
  {
    title: "Add labels / tags to posts",
    description:
      "Allow users to add custom tags to posts so teams can organize feedback by product area (e.g., billing, onboarding, mobile).",
    category: Category.FEATURE,
    status: Status.OPEN,
    votes: 29,
    authorName: "Karen Anderson",
    authorEmail: "karen@example.com",
  },
  {
    title: "Mobile layout is broken on small screens",
    description:
      "On phones with screens narrower than 375px, the card layout overflows horizontally. Tested on iPhone SE and older Android devices.",
    category: Category.BUG,
    status: Status.IN_PROGRESS,
    votes: 16,
    authorName: "Liam Thomas",
    authorEmail: "liam@example.com",
  },
  {
    title: "Show vote count on dashboard",
    description:
      "The admin dashboard should show total votes across all posts to help prioritize what to work on next.",
    category: Category.IMPROVEMENT,
    status: Status.OPEN,
    votes: 11,
    authorName: "Mia Jackson",
    authorEmail: "mia@example.com",
  },
  {
    title: "What are the SLA commitments?",
    description:
      "Can you clarify the response time commitments for bug reports vs feature requests? We're evaluating this for enterprise use.",
    category: Category.QUESTION,
    status: Status.CLOSED,
    votes: 8,
    authorName: "Noah Harris",
    authorEmail: "noah@example.com",
  },
  {
    title: "Integrate with Slack for team updates",
    description:
      "Send a Slack notification whenever a post's status changes or when a new post gets more than 10 votes. This would keep our team in sync without logging in.",
    category: Category.FEATURE,
    status: Status.OPEN,
    votes: 47,
    authorName: "Olivia Martin",
    authorEmail: "olivia@example.com",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  for (const post of posts) {
    const created = await prisma.post.create({ data: post });

    // Add a sample comment to some posts
    if (post.votes > 20) {
      await prisma.comment.create({
        data: {
          body: "This is a great point — we've been waiting for this too!",
          authorName: "Team Member",
          postId: created.id,
        },
      });
    }
  }

  const count = await prisma.post.count();
  console.log(`✅ Seeded ${count} posts`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

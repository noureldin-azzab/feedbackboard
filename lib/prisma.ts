import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// NOTE: This is the standard singleton pattern for Next.js + Prisma.
// In production under load (serverless or long-lived), a single PrismaClient
// instance may not be enough — connection pool exhaustion is a known issue
// when scaling horizontally (e.g., many Lambda/container instances each holding
// their own pool). Consider PgBouncer or Prisma Accelerate for production.
//
// MIGRATION NOTE: Prisma 7 requires a driver adapter for direct PostgreSQL
// connections. On AWS, you'd likely use RDS Proxy + PgBouncer here instead.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: ["error"], // minimal logging — no query tracing
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


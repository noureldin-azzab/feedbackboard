import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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
  // Parse and reconstruct the connection string to handle special characters
  // in passwords (e.g. !, @) that can get double-encoded in some environments.
  const url = new URL(connectionString);
  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port || "5432"),
    database: url.pathname.replace("/", ""),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    max: 1,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;



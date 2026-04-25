import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Prisma client wired to Neon's HTTP driver. The HTTP adapter avoids
 * the per-cold-start TCP/TLS handshake (300-800ms on Vercel serverless)
 * that the default `pg` driver pays each time. Big perf win on Hobby /
 * free-tier deployments.
 *
 * Connection string is the *pooled* DATABASE_URL on Vercel.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

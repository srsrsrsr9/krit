import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaWarmed?: boolean };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Eager-connect on module load. Cuts ~150-300ms off the first query
// per cold serverless function instance.
if (!globalForPrisma.prismaWarmed) {
  globalForPrisma.prismaWarmed = true;
  void db.$connect().catch(() => {});
}

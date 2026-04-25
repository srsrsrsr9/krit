import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint that measures the *real* per-query DB latency
 * from the Vercel function. If queryMs is in triple digits the function
 * region and the Neon region are not co-located.
 */
export async function GET() {
  const t0 = Date.now();
  const region = process.env.VERCEL_REGION ?? "unknown";

  // 5 trivial queries serially to measure round-trip cost.
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    const s = Date.now();
    await db.$queryRaw`SELECT 1`;
    samples.push(Date.now() - s);
  }

  const total = Date.now() - t0;
  const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
  const min = Math.min(...samples);
  const max = Math.max(...samples);

  return NextResponse.json({
    ok: true,
    region,
    db: {
      samples,
      avgMs: avg,
      minMs: min,
      maxMs: max,
    },
    totalMs: total,
    note:
      avg > 100
        ? "Query latency is high — check that Vercel function region matches Neon region."
        : "Query latency looks healthy.",
  });
}

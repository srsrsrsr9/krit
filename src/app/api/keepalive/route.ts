import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Hit every 5 minutes by Vercel cron. Keeps the serverless function
 * warm AND keeps the Neon database from going cold (Neon free tier
 * suspends after ~5 min of inactivity, costing ~500ms to wake on the
 * next query).
 *
 * Cheap query — count workspaces — just to touch the DB pool.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    const n = await db.workspace.count();
    return NextResponse.json({
      ok: true,
      workspaces: n,
      tookMs: Date.now() - start,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      tookMs: Date.now() - start,
    }, { status: 500 });
  }
}

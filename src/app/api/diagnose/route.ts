import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pretends to load a typical learner page and reports where every
 * millisecond goes. Hit this from the deployed app and paste the JSON
 * back. Removes guesswork about whether perf is server, network, or
 * client.
 */
export async function GET() {
  const region = process.env.VERCEL_REGION ?? "unknown";
  const t = (label: string, fn: () => Promise<unknown>) => {
    const s = Date.now();
    return fn().then((v) => ({ label, ms: Date.now() - s, ok: true as const, sample: previewValue(v) }))
      .catch((e) => ({ label, ms: Date.now() - s, ok: false as const, error: e instanceof Error ? e.message : String(e) }));
  };

  const start = Date.now();

  // 1. Single ping — measures network RTT to Neon.
  const ping1 = await t("ping1", () => db.$queryRaw`SELECT 1`);
  const ping2 = await t("ping2", () => db.$queryRaw`SELECT 1`);
  const ping3 = await t("ping3", () => db.$queryRaw`SELECT 1`);

  // 2. Realistic lesson-page workload, sequential to expose RTT.
  const seqStart = Date.now();
  const seqUser = await t("seq_user", () => db.user.findFirst({ select: { id: true } }));
  const seqWorkspace = await t("seq_workspace", () => db.workspace.findFirst({ select: { id: true } }));
  const seqPath = await t("seq_path", () => db.path.findFirst({
    where: { status: "PUBLISHED" },
    include: { items: { include: { lesson: true, assessment: true, project: true } } },
  }));
  const seqLesson = await t("seq_lesson", () => db.lesson.findFirst({
    include: { skills: { include: { skill: true } } },
  }));
  const seqTotal = Date.now() - seqStart;

  // 3. Same workload, parallelized — what well-batched code looks like.
  const parStart = Date.now();
  const par = await Promise.all([
    t("par_user", () => db.user.findFirst({ select: { id: true } })),
    t("par_workspace", () => db.workspace.findFirst({ select: { id: true } })),
    t("par_path", () => db.path.findFirst({ where: { status: "PUBLISHED" }, include: { items: true } })),
    t("par_lesson", () => db.lesson.findFirst({ include: { skills: true } })),
  ]);
  const parTotal = Date.now() - parStart;

  return NextResponse.json({
    region,
    expectations: {
      "if region == sin1 (matches Neon)": "ping should be 5-15ms each",
      "if region == iad1 (cross-Pacific)": "ping should be 220-280ms each",
    },
    pings: [ping1, ping2, ping3],
    sequential_4_queries: {
      total_ms: seqTotal,
      breakdown: [seqUser, seqWorkspace, seqPath, seqLesson],
    },
    parallel_4_queries: {
      total_ms: parTotal,
      breakdown: par,
    },
    total_ms: Date.now() - start,
  });
}

function previewValue(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (Array.isArray(v)) return `[${v.length} rows]`;
  if (typeof v === "object") return `{${Object.keys(v as object).slice(0, 3).join(", ")}, …}`;
  return String(v).slice(0, 50);
}

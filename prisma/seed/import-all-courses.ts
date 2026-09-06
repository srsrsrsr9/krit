/**
 * Bulk-import every course JSON under courses/*.json into the DB.
 *
 * Idempotent: re-running updates existing rows in place.
 *
 * Usage:
 *   npm run db:import-all
 *
 * Errors per file are collected and reported at the end; one bad file
 * doesn't stop the run.
 */

import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { importCourseFile } from "./import-course";

const db = new PrismaClient();
const ROOT = resolve(process.cwd());
const COURSES_DIR = join(ROOT, "courses");

async function main() {
  const wsSlug = process.argv[2] ?? "krit-academy";

  const ws = await db.workspace.findUnique({ where: { slug: wsSlug } });
  if (!ws) {
    console.error(`✗ Workspace '${wsSlug}' not found. Run npm run db:seed first.`);
    process.exit(1);
  }

  const files = readdirSync(COURSES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join("courses", f))
    .sort();

  console.log(`→ Importing ${files.length} courses into workspace ${ws.name}…\n`);

  const results: Array<{ file: string; status: "ok" | "fail"; detail: string }> = [];
  for (const file of files) {
    try {
      const slug = await importCourseFile(file, wsSlug, db);
      console.log(`✓ ${file} → /learn/${slug}`);
      results.push({ file, status: "ok", detail: slug });
    } catch (e) {
      const msg = ((e as Error).message.split("\n")[0] ?? "unknown error").slice(0, 200);
      console.error(`✗ ${file}: ${msg}`);
      results.push({ file, status: "fail", detail: msg });
    }
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const fail = results.filter((r) => r.status === "fail").length;
  console.log(`\n→ Done. ${ok} imported, ${fail} failed.`);
  if (fail > 0) {
    console.log("\nFailures:");
    results.filter((r) => r.status === "fail").forEach((r) => {
      console.log(`  ${r.file}: ${r.detail}`);
    });
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("✗ Bulk import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

/**
 * Bulk-import every showcase course JSON under courses/showcase/*.json.
 *
 * Spawns the existing showcase-course-import.ts CLI once per file with
 * --yes so prompts are skipped. Runs sequentially with execSync so each
 * import finishes (including its DB writes) before the next starts.
 *
 * Errors per file don't stop the run.
 *
 * Usage:
 *   npm run db:import-showcase
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const ROOT = resolve(process.cwd());
const SHOWCASE_DIR = join(ROOT, "courses/showcase");

// Only files that look like a full Course (have `slug` + `lessons` at the
// root). Other showcase files are standalone lessons / fragments and should
// not be sent through the course importer.
function isFullCourse(filePath: string): boolean {
  try {
    const json = JSON.parse(readFileSync(filePath, "utf-8"));
    return typeof json?.slug === "string" && Array.isArray(json?.lessons);
  } catch {
    return false;
  }
}

const files = readdirSync(SHOWCASE_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => join("courses/showcase", f))
  .filter((rel) => isFullCourse(join(ROOT, rel)))
  .sort();

console.log(`→ Importing ${files.length} showcase courses…\n`);

const results: Array<{ file: string; status: "ok" | "fail" }> = [];
for (const file of files) {
  try {
    console.log(`\n──── ${file} ────`);
    execSync(`npx tsx prisma/seed/showcase-course-import.ts ${file} --yes`, {
      cwd: ROOT,
      stdio: "inherit",
    });
    results.push({ file, status: "ok" });
  } catch {
    results.push({ file, status: "fail" });
  }
}

const ok = results.filter((r) => r.status === "ok").length;
const fail = results.filter((r) => r.status === "fail").length;
console.log(`\n→ Done. ${ok} imported, ${fail} failed.`);
if (fail > 0) {
  console.log("\nFailures:");
  results.filter((r) => r.status === "fail").forEach((r) => console.log(`  ${r.file}`));
  process.exit(1);
}

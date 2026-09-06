/**
 * Audit: in every course, every lesson — assert that no anim-lab embed
 * appears AFTER the lesson's keyTakeaways or reflect block.
 *
 * Outputs the order of {a01, a02, i01, i02} per lesson + flags any case
 * where an anim-lab embed sits past the lesson-closing blocks.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const COURSES_DIR = join(ROOT, "courses");

const files = readdirSync(COURSES_DIR).filter((f) => f.endsWith(".json")).sort();
let errors = 0;
let lessonsAudited = 0;

for (const file of files) {
  const json = JSON.parse(readFileSync(join(COURSES_DIR, file), "utf-8"));
  if (!Array.isArray(json.lessons)) continue;
  for (const lesson of json.lessons) {
    if (!Array.isArray(lesson.blocks)) continue;
    lessonsAudited++;
    const ktIdx = lesson.blocks.findIndex((b) => b?.type === "keyTakeaways");
    const reflectIdx = lesson.blocks.findIndex((b) => b?.type === "reflect");
    const cutoff = [ktIdx, reflectIdx].filter((i) => i !== -1);
    const minClose = cutoff.length ? Math.min(...cutoff) : Infinity;
    const animLabIndices = lesson.blocks
      .map((b, i) => ({ i, b }))
      .filter((x) => x.b?.type === "embedAnimation" && typeof x.b.src === "string" && x.b.src.startsWith("/anim-lab/"));
    const offenders = animLabIndices.filter((x) => x.i > minClose);
    if (offenders.length > 0) {
      console.log(`✗ ${file} / ${lesson.slug}: ${offenders.length} anim-lab embed(s) AFTER keyTakeaways/reflect (positions: ${offenders.map((o) => o.i).join(", ")}, cutoff: ${minClose})`);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log(`✓ ${lessonsAudited} lessons audited. No anim-lab embeds appear after keyTakeaways or reflect.`);
} else {
  console.log(`\n${errors} lesson(s) have late embeds. Re-run scripts/integrate-anim-lab.mjs to fix.`);
  process.exit(1);
}

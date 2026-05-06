// Splice bonus content (fieldNotes + bossBattle) from courses/bonus/<slug>/<lesson-slug>.json
// into each course's main JSON, inserting both blocks immediately before keyTakeaways.
// Idempotent: if blocks already present (matching titles), skip insertion.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const COURSES = [
  "the-science-of-well-being",
  "sql-foundations",
  "python-foundations",
  "money-fundamentals",
  "ai-fundamentals",
];

// Map course-file-slug → bonus-dir-slug (well-being uses different naming)
const BONUS_DIR = {
  "the-science-of-well-being": "science-of-well-being",
};

let coursesUpdated = 0;
let lessonsUpdated = 0;
const missing = [];

for (const courseSlug of COURSES) {
  const coursePath = `courses/${courseSlug}.json`;
  const bonusDir = `courses/bonus/${BONUS_DIR[courseSlug] ?? courseSlug}`;
  if (!existsSync(coursePath)) {
    console.warn(`  ⚠ missing course file: ${coursePath}`);
    continue;
  }
  if (!existsSync(bonusDir)) {
    console.warn(`  ⚠ missing bonus dir: ${bonusDir}`);
    continue;
  }
  const j = JSON.parse(readFileSync(coursePath, "utf-8"));
  let updated = 0;
  for (const lesson of j.lessons) {
    const bonusFile = resolve(bonusDir, `${lesson.slug}.json`);
    if (!existsSync(bonusFile)) {
      missing.push(bonusFile);
      continue;
    }
    const bonus = JSON.parse(readFileSync(bonusFile, "utf-8"));
    const fn = bonus.fieldNotes;
    const bb = bonus.bossBattle;
    if (!fn || !bb) {
      console.warn(`  ⚠ ${lesson.slug}: bonus file missing fieldNotes or bossBattle`);
      continue;
    }
    // Skip if already present (idempotency by title)
    const has = (type, title) =>
      lesson.blocks.some((b) => b.type === type && b.title === title);
    if (has("fieldNotes", fn.title) && has("bossBattle", bb.title)) {
      continue;
    }
    // Find insertion point: just before first keyTakeaways block
    const ktIdx = lesson.blocks.findIndex((b) => b.type === "keyTakeaways");
    const insertAt = ktIdx === -1 ? lesson.blocks.length : ktIdx;
    // Strip any pre-existing instances first (re-runs)
    lesson.blocks = lesson.blocks.filter(
      (b) =>
        !(b.type === "fieldNotes" && b.title === fn.title) &&
        !(b.type === "bossBattle" && b.title === bb.title),
    );
    const newKtIdx = lesson.blocks.findIndex((b) => b.type === "keyTakeaways");
    const finalInsertAt = newKtIdx === -1 ? lesson.blocks.length : newKtIdx;
    lesson.blocks.splice(finalInsertAt, 0, fn, bb);
    updated++;
    lessonsUpdated++;
  }
  if (updated > 0) {
    writeFileSync(coursePath, JSON.stringify(j, null, 2));
    console.log(`  ✓ ${courseSlug}: spliced into ${updated}/${j.lessons.length} lessons`);
    coursesUpdated++;
  } else {
    console.log(`  · ${courseSlug}: no changes needed`);
  }
}

console.log("");
console.log(`Done — ${coursesUpdated} course(s) updated, ${lessonsUpdated} lesson(s) total.`);
if (missing.length > 0) {
  console.log(`Missing bonus files (${missing.length}):`);
  for (const m of missing.slice(0, 10)) console.log(`  - ${m}`);
}

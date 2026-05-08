// Assemble a course from courses/parts/<slug>/path.json + lesson-1..5.json
// into a single courses/<slug>.json file.
//
// Usage: node scripts/assemble-course.mjs <slug>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/assemble-course.mjs <slug>");
  process.exit(1);
}

const partsDir = resolve(`courses/parts/${slug}`);
const out = resolve(`courses/${slug}.json`);

const pathFile = resolve(partsDir, "path.json");
if (!existsSync(pathFile)) {
  console.error(`✗ missing ${pathFile}`);
  process.exit(1);
}
const frame = JSON.parse(readFileSync(pathFile, "utf-8"));

const lessons = [];
for (let i = 1; i <= 5; i++) {
  const f = resolve(partsDir, `lesson-${i}.json`);
  if (!existsSync(f)) {
    console.error(`✗ missing ${f}`);
    process.exit(1);
  }
  let raw = JSON.parse(readFileSync(f, "utf-8"));
  // Some agents wrap each lesson in { "lesson": {...} }; unwrap if so.
  if (raw.lesson && !raw.blocks) raw = raw.lesson;
  lessons.push(raw);
}

const course = {
  path: frame.path,
  skills: frame.skills,
  skillPrerequisites: frame.skillPrerequisites ?? [],
  lessons,
  assessment: frame.assessment,
  project: frame.project,
  credential: frame.credential,
};

writeFileSync(out, JSON.stringify(course, null, 2));
console.log(`✓ assembled ${out}`);
console.log(`  ${lessons.length} lessons, blocks/lesson:`, lessons.map((l) => l.blocks.length).join(","));
console.log(`  ${frame.assessment?.questions?.length ?? 0} assessment questions`);

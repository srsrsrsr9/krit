// For each course, scan public/courses/<slug>/anim/ for trap-<lesson-slug>.html
// files. Where one exists, insert an embedAnimation block just BEFORE the
// first callout(warn) block in the matching lesson. Idempotent.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const COURSES = [
  "the-science-of-well-being",
  "sql-foundations",
  "python-foundations",
  "money-fundamentals",
  "ai-fundamentals",
  "ui-ux-design",
  "product-management",
  "ai-for-accounting",
  "claude-pro",
  "testing-with-playwright",
  "ai-for-teachers",
  "ai-for-leaders",
  "data-science-and-analysis",
  "leadership-in-age-of-ai",
  "digital-marketing-with-ai",
];

// Course-file-slug → public-asset-slug (well-being uses different naming)
const ASSET_DIR = {
  "the-science-of-well-being": "science-of-well-being",
};

let coursesUpdated = 0;
let lessonsTouched = 0;

for (const courseSlug of COURSES) {
  const coursePath = `courses/${courseSlug}.json`;
  const animDir = `public/courses/${ASSET_DIR[courseSlug] ?? courseSlug}/anim`;
  if (!existsSync(coursePath)) continue;
  const j = JSON.parse(readFileSync(coursePath, "utf-8"));
  let touched = 0;
  for (const lesson of j.lessons) {
    const trapFile = resolve(animDir, `trap-${lesson.slug}.html`);
    if (!existsSync(trapFile)) continue;
    const src = `/courses/${ASSET_DIR[courseSlug] ?? courseSlug}/anim/trap-${lesson.slug}.html`;
    // Skip if this trap embedAnimation is already present (idempotency).
    const alreadyHas = lesson.blocks.some(
      (b) => b.type === "embedAnimation" && b.src === src,
    );
    if (alreadyHas) continue;
    // Insert position: just before the first callout(warn).
    const trapIdx = lesson.blocks.findIndex(
      (b) => b.type === "callout" && b.tone === "warn",
    );
    const insertAt = trapIdx === -1 ? lesson.blocks.length - 2 : trapIdx;
    const block = {
      type: "embedAnimation",
      src,
      height: 420,
      caption: "Watch the trap happen live — and the fix at the end.",
    };
    lesson.blocks.splice(insertAt, 0, block);
    touched++;
    lessonsTouched++;
  }
  if (touched > 0) {
    writeFileSync(coursePath, JSON.stringify(j, null, 2));
    console.log(`  ✓ ${courseSlug}: spliced trap animation into ${touched}/${j.lessons.length} lessons`);
    coursesUpdated++;
  }
}

console.log("");
console.log(`Done — ${coursesUpdated} course(s) updated, ${lessonsTouched} lesson(s) total.`);

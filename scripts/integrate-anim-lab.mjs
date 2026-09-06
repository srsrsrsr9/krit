/**
 * Thread anim-lab artifacts through each course's lessons.
 *
 * For every courses/*.json:
 *   - Find the matching gallery at public/anim-lab/<basename>.html
 *   - For each of the first 5 lessons (L1..L5), insert 4 embedAnimation
 *     blocks (a01, i01, a02, i02) at strategic positions:
 *       • Before the *2nd* `heading` block if there is one (closes section 1)
 *       • Before the *3rd* `heading` if present (closes section 2)
 *       • Before the *4th* `heading` if present (closes section 3)
 *       • Before `keyTakeaways` / at end of blocks (closes the lesson)
 *
 * Re-running the script is idempotent: existing anim-lab embeds are
 * detected (by src prefix "/anim-lab/") and stripped before re-insertion.
 *
 * Usage:
 *   node scripts/integrate-anim-lab.mjs              # all courses
 *   node scripts/integrate-anim-lab.mjs <slug.json>  # one course
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const COURSES_DIR = join(ROOT, "courses");
const ANIM_LAB_DIR = join(ROOT, "public/anim-lab");

const ARG = process.argv[2];

function eligibleCourses() {
  const files = readdirSync(COURSES_DIR).filter((f) => f.endsWith(".json"));
  if (ARG) return files.filter((f) => f === ARG || f.startsWith(ARG.replace(".json", "")));
  return files;
}

function buildEmbedBlock(galleryBase, lessonNum, artifactId, caption) {
  return {
    type: "embedAnimation",
    src: `/anim-lab/${galleryBase}.html?solo=1#L${lessonNum}-${artifactId}`,
    height: 640,
    caption,
  };
}

/**
 * Parse a gallery HTML file's inline JS to extract per-artifact metadata.
 * Looks for `{ id:'L1-a01', type:'anim', ..., title:'...', what:'...', ... }`
 * objects in the ART array. Returns a map of artifactId → { title, what, type }.
 */
function extractGalleryArtifacts(galleryPath) {
  const html = readFileSync(galleryPath, "utf-8");
  const items = new Map();
  // Title + what are single-quoted JS strings that may contain unescaped
  // double quotes. The negated class therefore excludes only the closing
  // single quote and backslash; backslash-escape sequences pass through.
  const re = /id\s*:\s*'([Ll]\d+-[ai]\d+)'\s*,\s*type\s*:\s*'([^']+)'\s*,\s*lesson\s*:\s*'[^']+'\s*,\s*title\s*:\s*'((?:[^'\\]|\\.)*)'\s*,\s*what\s*:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, id, type, title, what] = m;
    items.set(id, { type, title: title.replace(/\\'/g, "'").replace(/\\"/g, '"'), what: what.replace(/\\'/g, "'").replace(/\\"/g, '"') });
  }
  return items;
}

function stripPriorAnimLab(blocks) {
  return blocks.filter((b) => {
    if (b?.type !== "embedAnimation") return true;
    return !(typeof b.src === "string" && b.src.startsWith("/anim-lab/"));
  });
}

function findInsertPositions(blocks) {
  // Per Learning + Psychology Pass-3 review: NEVER insert after keyTakeaways
  // or reflect — that's "curtain call after the curtain dropped." Cap the
  // entire insertion window at the earliest of {keyTakeaways, reflect}.
  const ktIdx = blocks.findIndex((b) => b?.type === "keyTakeaways");
  const reflectIdx = blocks.findIndex((b) => b?.type === "reflect");
  const candidates = [ktIdx, reflectIdx].filter((i) => i !== -1);
  const cutoff = candidates.length ? Math.min(...candidates) : blocks.length;

  // Within the [0, cutoff] window, prefer 4 positions in scaffold order:
  //   slot 0 (a01, scaffold-1): after the lessonMeta + first markdown intro
  //   slot 1 (a02, scaffold-1): before second heading (start of section 2)
  //   slot 2 (i01, scaffold-3): before third heading (start of section 3) or
  //                              before the first chatScenario/bossBattle
  //   slot 3 (i02, scaffold-4): immediately before cutoff (so reflect can
  //                              reference the learner's solo commitment)
  const window = blocks.slice(0, cutoff);
  const headingIdx = [];
  for (let i = 0; i < window.length; i++) {
    if (window[i]?.type === "heading") headingIdx.push(i);
  }
  const scenarioIdx = window.findIndex((b) =>
    b?.type === "chatScenario" || b?.type === "bossBattle" || b?.type === "branchScenario"
  );
  const firstMdIdx = window.findIndex((b) => b?.type === "markdown");

  const a01Pos = headingIdx[0] !== undefined && headingIdx[0] > 0
    ? headingIdx[0]
    : firstMdIdx !== -1
      ? firstMdIdx + 1
      : 1;
  const a02Pos = headingIdx[1] ?? Math.min(cutoff, a01Pos + 4);
  const i01Pos = headingIdx[2] ?? (scenarioIdx !== -1 ? scenarioIdx : Math.min(cutoff, a02Pos + 4));
  const i02Pos = cutoff; // Before keyTakeaways/reflect — the solo commitment.

  // Sort ascending and dedupe — caller will splice in reverse.
  const positions = [a01Pos, a02Pos, i01Pos, i02Pos];
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] <= positions[i - 1]) positions[i] = positions[i - 1] + 1;
    if (positions[i] > cutoff) positions[i] = cutoff;
  }
  return positions;
}

/**
 * Slot order is now scaffold-monotonic: a01 → a02 (both scaffold-1 anims) →
 * i01 (scaffold-2-3 interactive) → i02 (scaffold-4 solo). This corrects the
 * Pass-3 finding that the previous [a01, i01, a02, i02] order had a regression
 * at slot 2 (hard interactive → easy anim).
 */
const SLOT_DEFS = [
  { id: "a01", label: "Watch", verb: "Watch the pattern before you predict." },
  { id: "a02", label: "Watch", verb: "Watch the same pattern at a different scale." },
  { id: "i01", label: "Try", verb: "Commit to a guess before you check." },
  { id: "i02", label: "Try", verb: "Apply this on your own data before the lesson closes." },
];

/**
 * Approximate runtime label for the caption: 30s for anims, 60s for inters.
 * Galleries also carry a `runtime` field but it's typed loosely ("<30s",
 * "30-60s") so we synthesise a clean phrase here.
 */
function runtimeLabel(type) {
  return type === "anim" ? "~30s" : "~60s";
}

/**
 * Build a single embedAnimation caption following the Pass-3 spec:
 *   "<Verb> (~60s) · <artifact title> — <one-line setup>"
 * Falls back gracefully if the artifact's `what` field is missing/short.
 */
function buildCaption(slot, meta) {
  const verb = slot.label; // "Watch" or "Try"
  const rt = runtimeLabel(meta.type);
  // Use the artifact's own `what` line as the setup — it's already authored
  // to be a curiosity-gap one-liner. Strip the leading "Watch:" / "Try:"
  // because we're adding our own verb prefix.
  const setup = (meta.what || "")
    .replace(/^\s*(Watch|Try)\s*:\s*/i, "")
    .trim();
  const tail = setup ? ` — ${setup}` : "";
  return `${verb} (${rt}) · ${meta.title}${tail}`;
}

function integrateOneLesson(blocks, galleryBase, lessonNum, galleryItems) {
  const cleaned = stripPriorAnimLab(blocks);
  // Only include slots that actually exist in this gallery (some draft
  // galleries are missing one artifact per lesson).
  const validSlots = SLOT_DEFS.filter((slot) => galleryItems.has(`L${lessonNum}-${slot.id}`));
  if (validSlots.length === 0) return cleaned;
  const positions = findInsertPositions(cleaned).slice(0, validSlots.length);
  // Insert from highest position down so earlier indices don't shift.
  const ordered = positions
    .map((p, i) => ({ pos: p, slotIdx: i }))
    .sort((a, b) => b.pos - a.pos);
  for (const { pos, slotIdx } of ordered) {
    const slot = validSlots[slotIdx];
    const id = `L${lessonNum}-${slot.id}`;
    const meta = galleryItems.get(id);
    const caption = buildCaption(slot, meta);
    cleaned.splice(pos, 0, buildEmbedBlock(galleryBase, lessonNum, slot.id, caption));
  }
  return cleaned;
}

function processCourse(filename) {
  const courseBase = filename.replace(/\.json$/, "");
  const galleryPath = join(ANIM_LAB_DIR, `${courseBase}.html`);
  if (!existsSync(galleryPath)) {
    console.log(`⊘ ${filename}: no matching anim-lab gallery (expected ${courseBase}.html) — skipped`);
    return { ok: false, reason: "no-gallery" };
  }
  const galleryItems = extractGalleryArtifacts(galleryPath);
  const fullPath = join(COURSES_DIR, filename);
  const raw = readFileSync(fullPath, "utf-8");
  const json = JSON.parse(raw);
  if (!json.lessons || !Array.isArray(json.lessons)) {
    return { ok: false, reason: "no-lessons" };
  }
  for (let i = 0; i < Math.min(5, json.lessons.length); i++) {
    const lesson = json.lessons[i];
    if (!Array.isArray(lesson.blocks)) continue;
    lesson.blocks = integrateOneLesson(lesson.blocks, courseBase, i + 1, galleryItems);
  }
  writeFileSync(fullPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  return { ok: true, lessonsTouched: Math.min(5, json.lessons.length), embedsAfter: 4 * Math.min(5, json.lessons.length), galleryItems: galleryItems.size };
}

const files = eligibleCourses();
console.log(`→ Integrating anim-lab into ${files.length} course${files.length === 1 ? "" : "s"}…\n`);
const summary = [];
for (const f of files) {
  const r = processCourse(f);
  if (r.ok) {
    console.log(`✓ ${f}: ${r.lessonsTouched} lessons × 4 embeds = ${r.embedsAfter} (parsed ${r.galleryItems} gallery items)`);
    summary.push({ file: f, ok: true });
  } else {
    summary.push({ file: f, ok: false, reason: r.reason });
  }
}
const ok = summary.filter((s) => s.ok).length;
console.log(`\n→ Done. ${ok}/${files.length} courses updated. Re-validate with: npm run course:validate`);

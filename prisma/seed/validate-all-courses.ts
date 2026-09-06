/**
 * Validate every course JSON under courses/*.json without touching the DB.
 *
 * Useful as a CI gate, and as a pre-flight before db:import-all to catch
 * schema drift early.
 *
 * Usage:
 *   npm run course:validate
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import { LessonBlocks } from "../../lib/content/blocks";

// Same schema as import-course.ts, kept local so we don't pull a DB client.
const Skill = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  name: z.string().min(1),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  decayDays: z.number().int().min(0).nullable().optional(),
});
const SkillPrereq = z.object({ skill: z.string(), requires: z.string() });
const Question = z.object({
  kind: z.enum(["MCQ_SINGLE", "MCQ_MULTI"]),
  stem: z.string().min(1),
  points: z.number().int().min(1).max(20).default(1),
  explanation: z.string().nullable().optional(),
  skillSlug: z.string().nullable().optional(),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    correct: z.boolean(),
    explanation: z.string().nullable().optional(),
  })).min(2),
});
const RubricLevel = z.object({ label: z.string(), points: z.number().int().min(0) });
const RubricCriterion = z.object({ criterion: z.string(), levels: z.array(RubricLevel).min(2) });
const CourseFile = z.object({
  path: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    kind: z.enum(["PATH", "COLLECTION", "COHORT", "COMPLIANCE"]).default("PATH"),
    level: z.enum(["NOVICE", "WORKING", "PROFICIENT", "EXPERT"]).default("NOVICE"),
    estimatedMinutes: z.number().int().min(1).optional(),
  }),
  skills: z.array(Skill).min(1),
  skillPrerequisites: z.array(SkillPrereq).default([]),
  lessons: z.array(z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().nullable().optional(),
    estimatedMinutes: z.number().int().min(1).default(8),
    skills: z.array(z.string()).default([]),
    blocks: LessonBlocks,
  })).min(1),
  assessment: z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    passThreshold: z.number().int().min(0).max(100).default(70),
    timeLimitSec: z.number().int().nullable().optional(),
    attemptsAllowed: z.number().int().min(1).default(3),
    skills: z.array(z.string()).default([]),
    questions: z.array(Question).min(1),
  }),
  project: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    prompt: z.string().min(20),
    rubric: z.array(RubricCriterion).min(1),
  }),
  credential: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    issuerName: z.string().default("Krit Academy"),
  }),
});

const ROOT = resolve(process.cwd());
const COURSES_DIR = join(ROOT, "courses");

const files = readdirSync(COURSES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => join("courses", f))
  .sort();

console.log(`→ Validating ${files.length} courses…\n`);

const results: Array<{ file: string; status: "ok" | "fail"; details: string[] }> = [];
for (const file of files) {
  const result: { file: string; status: "ok" | "fail"; details: string[] } = { file, status: "ok", details: [] };
  try {
    let text = readFileSync(resolve(ROOT, file), "utf-8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const raw = JSON.parse(text);
    const parsed = CourseFile.safeParse(raw);
    if (!parsed.success) {
      result.status = "fail";
      result.details = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    } else {
      // Cross-ref checks
      const c = parsed.data;
      const skillSlugs = new Set(c.skills.map((s) => s.slug));
      for (const p of c.skillPrerequisites) {
        if (!skillSlugs.has(p.skill)) result.details.push(`prereq.skill unknown: ${p.skill}`);
        if (!skillSlugs.has(p.requires)) result.details.push(`prereq.requires unknown: ${p.requires}`);
      }
      for (const l of c.lessons) {
        for (const s of l.skills) {
          if (!skillSlugs.has(s)) result.details.push(`lesson ${l.slug} references unknown skill: ${s}`);
        }
      }
      for (const q of c.assessment.questions) {
        const correct = q.choices.filter((ch) => ch.correct).length;
        if (correct < 1) result.details.push(`question with no correct: "${q.stem.slice(0, 40)}…"`);
        if (q.kind === "MCQ_SINGLE" && correct !== 1) result.details.push(`single-answer has ${correct} correct: "${q.stem.slice(0, 40)}…"`);
      }
      if (result.details.length > 0) result.status = "fail";
    }
  } catch (e) {
    result.status = "fail";
    result.details = [((e as Error).message.split("\n")[0] ?? "unknown error").slice(0, 200)];
  }
  results.push(result);
  const lbl = result.status === "ok" ? "✓" : "✗";
  console.log(`${lbl} ${file}${result.status === "fail" ? " — " + result.details[0] : ""}`);
}

const ok = results.filter((r) => r.status === "ok").length;
const fail = results.filter((r) => r.status === "fail").length;
console.log(`\n→ ${ok}/${files.length} valid · ${fail} failed`);

if (fail > 0) {
  console.log("\nFailure details:");
  for (const r of results.filter((r) => r.status === "fail")) {
    console.log(`\n  ${r.file}:`);
    for (const d of r.details) console.log(`    - ${d}`);
  }
  process.exit(1);
}

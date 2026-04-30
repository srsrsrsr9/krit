/**
 * Import a course from a JSON file produced by the COURSE_PROMPT prompt.
 *
 * Usage:
 *   npx tsx prisma/seed/import-course.ts ./prisma/seed/output/my-course.json
 *
 * The JSON must conform to the shape described in docs/COURSE_PROMPT.md.
 * Validation runs Zod on every block — malformed output fails loudly.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import cuid from "cuid";
import { PrismaClient, type Prisma } from "@prisma/client";
import { z } from "zod";
import { LessonBlocks } from "../../lib/content/blocks";

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

const db = new PrismaClient();

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: tsx prisma/seed/import-course.ts <path-to-course.json> [workspace-slug]");
    process.exit(1);
  }
  const wsSlug = process.argv[3] ?? "krit-academy";

  // Strip UTF-8 BOM and any wrapping ``` fences if the LLM left them.
  let text = readFileSync(resolve(process.cwd(), fileArg), "utf-8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

  // First attempt: strict parse. If that fails, repair common LLM JSON
  // bugs and try again — most often this is unescaped inner double quotes
  // inside string values, which is invalid JSON but extremely common.
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    const repaired = repairJson(text);
    try {
      raw = JSON.parse(repaired);
      console.log("⚠ Repaired malformed JSON (escaped inner quotes). Original error:", (e as Error).message);
    } catch (e2) {
      console.error("✗ Could not parse JSON, even after repair.");
      console.error("  First failure:", (e as Error).message);
      console.error("  Second failure:", (e2 as Error).message);
      process.exit(1);
    }
  }
  const parsed = CourseFile.safeParse(raw);
  if (!parsed.success) {
    console.error("✗ Validation failed.");
    for (const issue of parsed.error.issues.slice(0, 20)) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  const course = parsed.data;

  // Cross-reference checks the schema can't catch.
  const skillSlugs = new Set(course.skills.map((s) => s.slug));
  for (const p of course.skillPrerequisites) {
    if (!skillSlugs.has(p.skill)) throw new Error(`Prereq references unknown skill: ${p.skill}`);
    if (!skillSlugs.has(p.requires)) throw new Error(`Prereq requires unknown skill: ${p.requires}`);
  }
  for (const l of course.lessons) {
    for (const s of l.skills) {
      if (!skillSlugs.has(s)) throw new Error(`Lesson ${l.slug} references unknown skill: ${s}`);
    }
  }
  for (const q of course.assessment.questions) {
    const correct = q.choices.filter((c) => c.correct).length;
    if (correct < 1) throw new Error(`Question "${q.stem.slice(0, 40)}…" has no correct choice`);
    if (q.kind === "MCQ_SINGLE" && correct !== 1)
      throw new Error(`Single-answer question must have exactly one correct choice: "${q.stem.slice(0, 40)}…"`);
  }

  const ws = await db.workspace.findUnique({ where: { slug: wsSlug } });
  if (!ws) throw new Error(`Workspace '${wsSlug}' not found. Run npm run db:seed first.`);

  console.log(`✓ Course validated. Importing into workspace ${ws.name}…`);

  // Skills (skip if slug already exists in this workspace)
  const slugToId: Record<string, string> = {};
  for (const s of course.skills) {
    const existing = await db.skill.findFirst({ where: { workspaceId: ws.id, slug: s.slug } });
    if (existing) {
      slugToId[s.slug] = existing.id;
      continue;
    }
    const id = cuid();
    await db.skill.create({
      data: {
        id,
        workspaceId: ws.id,
        slug: s.slug,
        name: s.name,
        category: s.category ?? null,
        description: s.description ?? null,
        decayDays: s.decayDays ?? null,
      },
    });
    slugToId[s.slug] = id;
  }
  for (const p of course.skillPrerequisites) {
    await db.skillPrerequisite.upsert({
      where: { skillId_prereqId: { skillId: slugToId[p.skill]!, prereqId: slugToId[p.requires]! } },
      create: { id: cuid(), skillId: slugToId[p.skill]!, prereqId: slugToId[p.requires]! },
      update: {},
    });
  }

  // Lessons
  const lessonIds: Record<string, string> = {};
  for (const l of course.lessons) {
    const existing = await db.lesson.findFirst({ where: { workspaceId: ws.id, slug: l.slug } });
    const id = existing?.id ?? cuid();
    if (existing) {
      await db.lesson.update({
        where: { id },
        data: {
          title: l.title,
          subtitle: l.subtitle ?? null,
          estimatedMinutes: l.estimatedMinutes,
          blocks: l.blocks as unknown as Prisma.InputJsonValue,
        },
      });
      await db.lessonSkill.deleteMany({ where: { lessonId: id } });
    } else {
      await db.lesson.create({
        data: {
          id,
          workspaceId: ws.id,
          slug: l.slug,
          title: l.title,
          subtitle: l.subtitle ?? null,
          estimatedMinutes: l.estimatedMinutes,
          blocks: l.blocks as unknown as Prisma.InputJsonValue,
        },
      });
    }
    for (const s of l.skills) {
      await db.lessonSkill.create({ data: { id: cuid(), lessonId: id, skillId: slugToId[s]! } });
    }
    lessonIds[l.slug] = id;
  }

  // Assessment
  const assessSlug = `${course.path.slug}-assessment`;
  const existingAssess = await db.assessment.findFirst({ where: { workspaceId: ws.id, slug: assessSlug } });
  const assessId = existingAssess?.id ?? cuid();
  if (existingAssess) {
    await db.question.deleteMany({ where: { assessmentId: assessId } });
    await db.assessmentSkill.deleteMany({ where: { assessmentId: assessId } });
    await db.assessment.update({
      where: { id: assessId },
      data: {
        title: course.assessment.title,
        description: course.assessment.description ?? null,
        passThreshold: course.assessment.passThreshold,
        timeLimitSec: course.assessment.timeLimitSec ?? null,
        attemptsAllowed: course.assessment.attemptsAllowed,
      },
    });
  } else {
    await db.assessment.create({
      data: {
        id: assessId,
        workspaceId: ws.id,
        slug: assessSlug,
        title: course.assessment.title,
        description: course.assessment.description ?? null,
        mode: "GRADED",
        passThreshold: course.assessment.passThreshold,
        timeLimitSec: course.assessment.timeLimitSec ?? null,
        attemptsAllowed: course.assessment.attemptsAllowed,
        shuffleQuestions: true,
      },
    });
  }
  for (const skillSlug of course.assessment.skills) {
    await db.assessmentSkill.create({
      data: {
        id: cuid(),
        assessmentId: assessId,
        skillId: slugToId[skillSlug]!,
        awardsAtLevel: "WORKING",
        weight: 1.0,
      },
    });
  }
  for (let i = 0; i < course.assessment.questions.length; i++) {
    const q = course.assessment.questions[i]!;
    await db.question.create({
      data: {
        id: cuid(),
        assessmentId: assessId,
        order: i + 1,
        kind: q.kind,
        stem: q.stem,
        payload: { choices: q.choices } as unknown as Prisma.InputJsonValue,
        points: q.points,
        explanation: q.explanation ?? null,
        skillSlug: q.skillSlug ?? null,
      },
    });
  }

  // Project
  const existingProject = await db.projectBrief.findFirst({ where: { workspaceId: ws.id, slug: course.project.slug } });
  const projectId = existingProject?.id ?? cuid();
  if (existingProject) {
    await db.projectBrief.update({
      where: { id: projectId },
      data: {
        title: course.project.title,
        prompt: course.project.prompt,
        rubric: course.project.rubric as unknown as Prisma.InputJsonValue,
      },
    });
  } else {
    await db.projectBrief.create({
      data: {
        id: projectId,
        workspaceId: ws.id,
        slug: course.project.slug,
        title: course.project.title,
        prompt: course.project.prompt,
        rubric: course.project.rubric as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // Path
  const existingPath = await db.path.findFirst({ where: { workspaceId: ws.id, slug: course.path.slug } });
  const pathId = existingPath?.id ?? cuid();
  const totalMinutes =
    course.path.estimatedMinutes ??
    course.lessons.reduce((s, l) => s + l.estimatedMinutes, 0) + 60;
  if (existingPath) {
    await db.pathItem.deleteMany({ where: { pathId } });
    await db.path.update({
      where: { id: pathId },
      data: {
        title: course.path.title,
        subtitle: course.path.subtitle ?? null,
        summary: course.path.summary ?? null,
        kind: course.path.kind,
        level: course.path.level,
        estimatedMinutes: totalMinutes,
        status: "PUBLISHED",
        publishedAt: existingPath.publishedAt ?? new Date(),
      },
    });
  } else {
    await db.path.create({
      data: {
        id: pathId,
        workspaceId: ws.id,
        slug: course.path.slug,
        title: course.path.title,
        subtitle: course.path.subtitle ?? null,
        summary: course.path.summary ?? null,
        kind: course.path.kind,
        level: course.path.level,
        estimatedMinutes: totalMinutes,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }
  let order = 1;
  for (const l of course.lessons) {
    await db.pathItem.create({
      data: {
        id: cuid(),
        pathId,
        order: order++,
        kind: "LESSON",
        lessonId: lessonIds[l.slug]!,
        title: l.title,
      },
    });
  }
  await db.pathItem.create({
    data: { id: cuid(), pathId, order: order++, kind: "ASSESSMENT", assessmentId: assessId, title: course.assessment.title },
  });
  await db.pathItem.create({
    data: { id: cuid(), pathId, order: order++, kind: "PROJECT", projectId, title: course.project.title },
  });

  // Credential
  const existingCred = await db.credential.findFirst({ where: { workspaceId: ws.id, slug: course.credential.slug } });
  if (existingCred) {
    await db.credential.update({
      where: { id: existingCred.id },
      data: {
        title: course.credential.title,
        description: course.credential.description ?? null,
        issuerName: course.credential.issuerName,
        pathId,
      },
    });
  } else {
    await db.credential.create({
      data: {
        id: cuid(),
        workspaceId: ws.id,
        pathId,
        slug: course.credential.slug,
        title: course.credential.title,
        description: course.credential.description ?? null,
        issuerName: course.credential.issuerName,
      },
    });
  }

  console.log(`✓ Imported "${course.path.title}" — ${course.lessons.length} lessons, ${course.assessment.questions.length} questions, capstone, credential.`);
  console.log(`  Visit: /learn/${course.path.slug}`);
}

/**
 * Walk the text char-by-char tracking string state. Inside a string, any
 * `"` that is NOT followed by a structural delimiter (`,` `}` `]` `:` or EOF)
 * is treated as an unescaped inner quote and gets escaped. This handles the
 * single most common LLM JSON bug: inline quoted phrases.
 */
function repairJson(text: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (esc) {
      out += c;
      esc = false;
      continue;
    }
    if (c === "\\") {
      out += c;
      esc = true;
      continue;
    }
    if (c === '"') {
      if (!inStr) {
        inStr = true;
        out += c;
        continue;
      }
      // Inside a string. Peek past whitespace at the next non-ws char.
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j]!)) j++;
      const next = text[j];
      if (next === undefined || next === "," || next === "}" || next === "]" || next === ":") {
        inStr = false;
        out += c;
      } else {
        out += '\\"';
      }
      continue;
    }
    out += c;
  }
  return out;
}

main()
  .catch((e) => {
    console.error("✗ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

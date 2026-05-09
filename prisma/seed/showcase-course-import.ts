/**
 * Import a Story Mode course into the production LMS (Path + Lessons).
 *
 * Usage: npm run course:import courses/showcase/<slug>.json
 *
 * STRICT mode: fails fast on anything that could break the rendered lesson.
 *   1. Zod schema validation
 *   2. Referential-integrity checks (chat buckets, branch nodes, drag bins,
 *      slider band ranges, quiz/skillProof/bossBattle correctness)
 *   3. Animation HTML files exist on disk (where embedAnimation is referenced)
 *   4. skillHints all match the curated catalog OR an existing DB skill
 *   5. Catalog skills not yet in DB are auto-created
 *
 * Soft-delete: the importer NEVER hard-deletes Lessons or Paths. PathItems
 * (join rows, no progress data) are rebuilt on each import. To remove a
 * course: npm run course:archive <slug>.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import cuid from "cuid";
import { PrismaClient } from "@prisma/client";
import { Course, type Course as CourseT, type CourseLesson } from "../../lib/content/course";
import { findCatalogSkill } from "./skill-catalog";

const ROOT = resolve(process.cwd());
const prisma = new PrismaClient();

async function ask(rl: ReturnType<typeof createInterface>, q: string, def = "") {
  const hint = def ? ` (${def})` : "";
  const ans = (await rl.question(`${q}${hint}: `)).trim();
  return ans || def;
}

interface IssueReport {
  errors: string[];
  warnings: string[];
}

// ── Referential-integrity checks (strict) ────────────────────────────────────
function checkIntegrity(course: CourseT): IssueReport {
  const report: IssueReport = { errors: [], warnings: [] };
  const seenLessonSlugs = new Set<string>();

  for (const lesson of course.lessons) {
    if (seenLessonSlugs.has(lesson.slug)) {
      report.errors.push(`Lesson slug "${lesson.slug}" appears more than once in this course. Slugs must be unique within a course.`);
    }
    seenLessonSlugs.add(lesson.slug);

    if (lesson.blocks.length === 0) {
      report.errors.push(`Lesson "${lesson.slug}" has zero blocks. At least one card is required.`);
      continue;
    }

    checkLessonBlocks(lesson, report);
  }
  return report;
}

function checkLessonBlocks(lesson: CourseLesson, report: IssueReport) {
  const lid = lesson.slug;
  for (const [bi, block] of lesson.blocks.entries()) {
    const at = `${lid} · block ${bi + 1} (${block.type})`;

    if (block.type === "chatScenario") {
      const validBuckets = new Set(block.buckets.map((b) => b.id));
      for (const sc of block.scenarios) {
        if (!validBuckets.has(sc.correctBucketId)) {
          report.errors.push(
            `${at}: scenario "${sc.id}" references bucket "${sc.correctBucketId}" which doesn't exist. Available bucket ids: ${[...validBuckets].join(", ") || "(none)"}`,
          );
        }
      }
    }

    if (block.type === "branchScenario") {
      const validNodes = new Set(block.nodes.map((n) => n.id));
      if (!validNodes.has(block.startNodeId)) {
        report.errors.push(
          `${at}: startNodeId "${block.startNodeId}" doesn't exist in nodes. Available: ${[...validNodes].join(", ")}`,
        );
      }
      for (const node of block.nodes) {
        for (const c of node.choices) {
          if (c.nextNodeId && !validNodes.has(c.nextNodeId)) {
            report.errors.push(
              `${at}: node "${node.id}" → choice "${c.id}" → nextNodeId "${c.nextNodeId}" doesn't exist. Either fix or use 'outcome' for terminal.`,
            );
          }
          if (!c.nextNodeId && !c.outcome) {
            report.errors.push(
              `${at}: node "${node.id}" → choice "${c.id}" has neither nextNodeId nor outcome. Terminal choices need outcome text.`,
            );
          }
        }
      }
    }

    if (block.type === "dragClassify") {
      const validBins = new Set(block.bins.map((b) => b.id));
      for (const item of block.items) {
        if (!validBins.has(item.correctBinId)) {
          report.errors.push(
            `${at}: item "${item.id}" → correctBinId "${item.correctBinId}" doesn't match any bin. Available: ${[...validBins].join(", ")}`,
          );
        }
      }
    }

    if (block.type === "scaleSlider") {
      for (const band of block.bands) {
        if (band.lo < block.min || band.hi > block.max || band.lo > band.hi) {
          report.errors.push(
            `${at}: band "${band.title}" range [${band.lo}–${band.hi}] is invalid for slider [${block.min}–${block.max}].`,
          );
        }
      }
      if (block.startValue < block.min || block.startValue > block.max) {
        report.errors.push(
          `${at}: startValue ${block.startValue} is outside slider range [${block.min}–${block.max}].`,
        );
      }
    }

    if (block.type === "quiz" || block.type === "timedChallenge") {
      if (!block.choices.some((c) => c.correct)) {
        report.errors.push(`${at}: no choice is marked correct. At least one must be.`);
      }
    }

    if (block.type === "skillProof" && block.choices && block.choices.length > 0) {
      if (!block.choices.some((c) => c.correct)) {
        report.errors.push(`${at}: no choice is marked correct.`);
      }
    }
    if (block.type === "skillProof" && (!block.choices || block.choices.length === 0) && !block.evalPattern) {
      report.errors.push(
        `${at}: skillProof needs either 'choices' (multi-choice mode) or 'evalPattern' (free-text mode). Both empty → no way to evaluate.`,
      );
    }

    if (block.type === "bossBattle") {
      for (const stage of block.stages) {
        if (!stage.options.some((o) => o.correct)) {
          report.errors.push(`${at}: stage "${stage.id}" has no correct option.`);
        }
      }
    }

    if (block.type === "cardSwipe") {
      // Should have at least one of each side, otherwise the deck is one-note.
      const hasLeft = block.cards.some((c) => c.correctSide === "left");
      const hasRight = block.cards.some((c) => c.correctSide === "right");
      if (!hasLeft || !hasRight) {
        report.warnings.push(
          `${at}: every card has the same correctSide. The deck is one-directional — consider mixing.`,
        );
      }
    }

    if (block.type === "keyTakeaways") {
      if (block.points.length < 3 || block.points.length > 5) {
        report.warnings.push(
          `${at}: ${block.points.length} takeaways. Style guide is 3–5.`,
        );
      }
    }
  }

  // Lesson-level style checks (warnings only — they don't break rendering)
  const blockTypes = lesson.blocks.map((b) => b.type);
  if (!blockTypes.includes("reflect")) {
    report.warnings.push(`${lid}: no 'reflect' card. Style guide recommends one per lesson.`);
  }
  if (!blockTypes.includes("keyTakeaways")) {
    report.warnings.push(`${lid}: no 'keyTakeaways' card. Style guide says always end with one.`);
  }
  if (lesson.blocks.length < 6 || lesson.blocks.length > 14) {
    report.warnings.push(
      `${lid}: ${lesson.blocks.length} cards. Style guide target is 8–12; under 6 feels thin, over 14 feels long.`,
    );
  }
}

// ── Animation file checks (strict) ───────────────────────────────────────────
function checkAnimations(course: CourseT, report: IssueReport) {
  for (const lesson of course.lessons) {
    for (const [bi, block] of lesson.blocks.entries()) {
      if (block.type !== "embedAnimation") continue;
      const animPath = resolve(ROOT, "public", block.src.replace(/^\//, ""));
      if (!existsSync(animPath)) {
        report.errors.push(
          `${lesson.slug} · block ${bi + 1} (embedAnimation): file not found at ${block.src} — would render as broken iframe. Generate the HTML or remove the block.`,
        );
      }
    }
  }
}

// ── Skill-hint resolution (catalog-aware) ────────────────────────────────────
async function resolveSkills(
  course: CourseT,
  workspaceId: string,
  report: IssueReport,
): Promise<{ slugToSkillId: Map<string, string>; createdCount: number }> {
  const allHints = Array.from(new Set(course.lessons.flatMap((l) => l.skillHints)));
  const dbSkills = await prisma.skill.findMany({
    where: {
      slug: { in: allHints },
      OR: [{ workspaceId: null }, { workspaceId }],
    },
  });
  const dbSlugs = new Set(dbSkills.map((s) => s.slug));
  const slugToSkillId = new Map(dbSkills.map((s) => [s.slug, s.id] as const));
  let createdCount = 0;

  for (const slug of allHints) {
    if (dbSlugs.has(slug)) continue;
    const catalog = findCatalogSkill(slug);
    if (catalog) {
      // Auto-create catalog skill (workspace-scoped to keep tenants tidy)
      const created = await prisma.skill.create({
        data: {
          id: cuid(),
          workspaceId,
          slug: catalog.slug,
          name: catalog.name,
          category: catalog.category,
          description: catalog.description ?? null,
        },
      });
      slugToSkillId.set(catalog.slug, created.id);
      createdCount++;
    } else {
      report.errors.push(
        `skillHint "${slug}" is not in the curated catalog AND not in the DB.\n         → Add it to prisma/seed/skill-catalog.ts (and re-import) OR use a slug from the catalog.`,
      );
    }
  }
  return { slugToSkillId, createdCount };
}

// ── Pretty-print + abort ──────────────────────────────────────────────────────
function printReport(report: IssueReport) {
  if (report.errors.length > 0) {
    console.error("\n┄ ERRORS · these will break the rendered lesson, fix them first ┄\n");
    report.errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  }
  if (report.warnings.length > 0) {
    console.warn("\n┄ WARNINGS · style-guide nudges, won't block import ┄\n");
    report.warnings.forEach((w, i) => console.warn(`  ${i + 1}. ${w}`));
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: npm run course:import <path-to-course.json>");
    process.exit(1);
  }
  const file = resolve(ROOT, args[0]!);
  if (!existsSync(file)) { console.error("Not found:", file); process.exit(1); }

  // ── 1. Zod ───────────────────────────────────────────────────────────
  const raw = JSON.parse(readFileSync(file, "utf-8"));
  const result = Course.safeParse(raw);
  if (!result.success) {
    console.error("\n✗ Course JSON failed Zod validation. Fix these and try again:\n");
    for (const issue of result.error.issues) {
      console.error(`  • ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }
  const course = result.data;

  // ── 2. Resolve workspace (single-workspace assumption) ─────────────────
  const workspace = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!workspace) {
    console.error("✗ No workspace found in DB. Seed a workspace first (npm run db:seed).");
    process.exit(1);
  }

  // ── 3. Integrity + animation + skill checks ────────────────────────────
  const report: IssueReport = { errors: [], warnings: [] };
  const integrity = checkIntegrity(course);
  report.errors.push(...integrity.errors);
  report.warnings.push(...integrity.warnings);
  checkAnimations(course, report);

  const { slugToSkillId, createdCount } = await resolveSkills(course, workspace.id, report);

  if (report.errors.length > 0) {
    printReport(report);
    console.error("\n✗ Import blocked. Fix the errors above and re-run.\n");
    await prisma.$disconnect();
    process.exit(1);
  }
  if (report.warnings.length > 0) {
    printReport(report);
  }

  // ── 4. Preview ─────────────────────────────────────────────────────────
  console.log("\n┄ Course preview ┄\n");
  console.log(`  Title:         ${course.title}`);
  console.log(`  Slug:          ${course.slug}`);
  console.log(`  Workspace:     ${workspace.name} (${workspace.slug})`);
  console.log(`  Audience:      ${course.audience ?? "—"}`);
  console.log(`  Estimated:     ${course.estimatedMinutes} min total`);
  console.log(`  Lessons:`);
  course.lessons.forEach((l, i) => {
    console.log(`    ${String(i + 1).padStart(2, "0")}. ${l.title}  (${l.blocks.length} cards · ${l.estimatedMinutes} min)`);
  });
  if (createdCount > 0) {
    console.log(`\n  ✓ ${createdCount} catalog skill(s) auto-created in this workspace.`);
  }

  // ── 5. Confirm ─────────────────────────────────────────────────────────
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ans = await ask(rl, "\nProceed with import? (y/N)", "N");
  rl.close();
  if (ans.toLowerCase() !== "y") {
    console.log("Aborted.");
    await prisma.$disconnect();
    return;
  }

  // ── 6. Upsert Path ─────────────────────────────────────────────────────
  const existingPath = await prisma.path.findFirst({
    where: { workspaceId: workspace.id, slug: course.slug },
  });
  const path = existingPath
    ? await prisma.path.update({
        where: { id: existingPath.id },
        data: {
          title: course.title,
          subtitle: course.subtitle ?? null,
          summary: course.audience ?? null,
          estimatedMinutes: course.estimatedMinutes,
          status: existingPath.status === "ARCHIVED" ? "DRAFT" : existingPath.status,
        },
      })
    : await prisma.path.create({
        data: {
          id: cuid(),
          workspaceId: workspace.id,
          slug: course.slug,
          title: course.title,
          subtitle: course.subtitle ?? null,
          summary: course.audience ?? null,
          estimatedMinutes: course.estimatedMinutes,
        },
      });

  // ── 7. Upsert Lessons + rebuild PathItems ──────────────────────────────
  // PathItems are join rows with no learner-progress attached → safe to clear
  // and rebuild in the new order. Lessons themselves upsert by slug so
  // LessonProgress / Reflection rows stay attached.
  await prisma.pathItem.deleteMany({ where: { pathId: path.id } });

  for (const [i, lesson] of course.lessons.entries()) {
    const existingLesson = await prisma.lesson.findFirst({
      where: { workspaceId: workspace.id, slug: lesson.slug },
    });
    const lessonRow = existingLesson
      ? await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            title: lesson.title,
            subtitle: lesson.subtitle ?? null,
            estimatedMinutes: lesson.estimatedMinutes,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blocks: lesson.blocks as any,
          },
        })
      : await prisma.lesson.create({
          data: {
            id: cuid(),
            workspaceId: workspace.id,
            slug: lesson.slug,
            title: lesson.title,
            subtitle: lesson.subtitle ?? null,
            estimatedMinutes: lesson.estimatedMinutes,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blocks: lesson.blocks as any,
          },
        });

    await prisma.pathItem.create({
      data: {
        id: cuid(),
        pathId: path.id,
        order: i + 1,
        kind: "LESSON",
        lessonId: lessonRow.id,
        title: lesson.title,
        required: true,
      },
    });

    // Reset + reattach LessonSkill links for this lesson.
    await prisma.lessonSkill.deleteMany({ where: { lessonId: lessonRow.id } });
    for (const hint of lesson.skillHints) {
      const skillId = slugToSkillId.get(hint);
      if (!skillId) continue;
      await prisma.lessonSkill.create({
        data: { id: cuid(), lessonId: lessonRow.id, skillId },
      });
    }
  }

  console.log(`\n✓ Imported "${course.title}"`);
  console.log(`  Path: ${path.slug}  (${course.lessons.length} lessons linked in order)`);
  console.log(`  Live in production at:  /learn/${path.slug}`);
  console.log(`  Story Mode preview at:  /showcase/course/${course.slug}\n`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());

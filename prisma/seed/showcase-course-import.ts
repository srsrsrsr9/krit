/**
 * Import a Story Mode course into the production LMS (Path + Lessons).
 *
 * Usage: npm run course:import courses/showcase/<slug>.json [--workspace <slug>]
 *
 * What it does:
 *   1. Validates the JSON against the Course Zod schema
 *   2. Checks every embedAnimation path exists on disk
 *   3. Reports any skillHints that don't resolve to existing Skill rows
 *   4. Shows a preview, asks for confirmation
 *   5. Upserts a Path + N Lessons + N PathItems
 *   6. Course also remains available as a standalone showcase JSON
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import cuid from "cuid";
import { PrismaClient } from "@prisma/client";
import { Course } from "../../lib/content/course";

const ROOT = resolve(process.cwd());
const prisma = new PrismaClient();

async function ask(rl: ReturnType<typeof createInterface>, q: string, def = "") {
  const hint = def ? ` (${def})` : "";
  const ans = (await rl.question(`${q}${hint}: `)).trim();
  return ans || def;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: npm run course:import <path-to-course.json> [--workspace <slug>]");
    process.exit(1);
  }
  const file = resolve(ROOT, args[0]!);
  if (!existsSync(file)) { console.error("Not found:", file); process.exit(1); }

  // ── 1. Parse + Zod-validate ─────────────────────────────────────────
  const raw = JSON.parse(readFileSync(file, "utf-8"));
  const result = Course.safeParse(raw);
  if (!result.success) {
    console.error("\n✗ Course JSON failed validation:\n");
    console.error(JSON.stringify(result.error.issues, null, 2));
    process.exit(1);
  }
  const course = result.data;

  // ── 2. Resolve workspace ─────────────────────────────────────────────
  const wsArgIdx = args.indexOf("--workspace");
  const wsSlug = wsArgIdx >= 0 ? args[wsArgIdx + 1] : undefined;
  const workspace = wsSlug
    ? await prisma.workspace.findFirst({ where: { slug: wsSlug } })
    : await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!workspace) {
    console.error("✗ No workspace found. Pass --workspace <slug> or seed a workspace first.");
    process.exit(1);
  }

  // ── 3. Check animation paths ─────────────────────────────────────────
  const missingAnims: string[] = [];
  for (const lesson of course.lessons) {
    for (const block of lesson.blocks) {
      if (block.type === "embedAnimation") {
        const animPath = resolve(ROOT, "public", block.src.replace(/^\//, ""));
        if (!existsSync(animPath)) missingAnims.push(`${lesson.slug} → ${block.src}`);
      }
    }
  }

  // ── 4. Resolve skill hints to Skill rows ─────────────────────────────
  const allHints = Array.from(new Set(course.lessons.flatMap((l) => l.skillHints)));
  const knownSkills = await prisma.skill.findMany({
    where: { slug: { in: allHints }, OR: [{ workspaceId: null }, { workspaceId: workspace.id }] },
  });
  const knownSlugs = new Set(knownSkills.map((s) => s.slug));
  const unmatchedHints = allHints.filter((h) => !knownSlugs.has(h));

  // ── 5. Preview ───────────────────────────────────────────────────────
  console.log("\n┄ Course preview ┄\n");
  console.log(`  Title:            ${course.title}`);
  console.log(`  Slug:             ${course.slug}`);
  console.log(`  Workspace:        ${workspace.name} (${workspace.slug})`);
  console.log(`  Audience:         ${course.audience ?? "—"}`);
  console.log(`  Estimated:        ${course.estimatedMinutes} min total`);
  console.log(`  Lessons:`);
  course.lessons.forEach((l, i) => {
    console.log(`    ${String(i + 1).padStart(2, "0")}. ${l.title}  (${l.blocks.length} cards · ${l.estimatedMinutes} min)`);
  });
  if (missingAnims.length > 0) {
    console.log(`\n  ⚠ Missing animations (${missingAnims.length}):`);
    missingAnims.forEach((m) => console.log(`     • ${m}`));
    console.log(`     The lessons will render with broken iframes until you drop the HTML files in.`);
  }
  if (unmatchedHints.length > 0) {
    console.log(`\n  ⚠ skillHints with no matching Skill row in DB:`);
    unmatchedHints.forEach((s) => console.log(`     • ${s}`));
    console.log(`     These won't be linked. Add them via your skill-seed script if needed.`);
  }

  // ── 6. Confirm ───────────────────────────────────────────────────────
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ans = await ask(rl, "\nProceed with import? (y/N)", "N");
  rl.close();
  if (ans.toLowerCase() !== "y") {
    console.log("Aborted."); await prisma.$disconnect(); process.exit(0);
  }

  // ── 7. Upsert Path ───────────────────────────────────────────────────
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

  // ── 8. Upsert Lessons + PathItems ────────────────────────────────────
  // Clear stale items (we'll recreate in correct order). Lessons themselves
  // upsert by (workspaceId, slug) so progress stays attached.
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

    // Wire skill hints that resolved to known skills (best-effort; idempotent).
    for (const hint of lesson.skillHints) {
      const skill = knownSkills.find((s) => s.slug === hint);
      if (!skill) continue;
      const existing = await prisma.lessonSkill.findFirst({
        where: { lessonId: lessonRow.id, skillId: skill.id },
      });
      if (!existing) {
        await prisma.lessonSkill.create({
          data: { id: cuid(), lessonId: lessonRow.id, skillId: skill.id },
        });
      }
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

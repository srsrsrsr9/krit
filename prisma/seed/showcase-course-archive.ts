/**
 * Soft-archive or restore a Story Mode course.
 *
 * Usage:
 *   npm run course:archive <slug>   # set Path.status = ARCHIVED
 *   npm run course:restore <slug>   # set Path.status = DRAFT
 *
 * Never hard-deletes. Lessons, learner progress, reflections, evidence —
 * all stay intact. To bring a course back, run course:restore.
 */

import { PrismaClient, type PathStatus } from "@prisma/client";

const prisma = new PrismaClient();

const MODE = (process.argv[2] ?? "") as "archive" | "restore";
const SLUG = process.argv[3];

async function main() {
  if (!["archive", "restore"].includes(MODE) || !SLUG) {
    console.error("Usage: npm run course:archive <slug>  |  npm run course:restore <slug>");
    process.exit(1);
  }
  const workspace = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!workspace) { console.error("✗ No workspace found."); process.exit(1); }

  const path = await prisma.path.findFirst({
    where: { workspaceId: workspace.id, slug: SLUG },
    include: { items: { include: { lesson: true } } },
  });
  if (!path) { console.error(`✗ No course with slug "${SLUG}" in workspace "${workspace.slug}".`); process.exit(1); }

  const newStatus: PathStatus = MODE === "archive" ? "ARCHIVED" : "DRAFT";
  if (path.status === newStatus) {
    console.log(`Course "${SLUG}" is already ${newStatus}. Nothing to do.`);
    await prisma.$disconnect();
    return;
  }

  await prisma.path.update({
    where: { id: path.id },
    data: { status: newStatus },
  });

  const verb = MODE === "archive" ? "Archived" : "Restored";
  console.log(`\n✓ ${verb} "${path.title}" (${SLUG})`);
  console.log(`  Status: ${path.status} → ${newStatus}`);
  console.log(`  ${path.items.length} lesson(s) untouched. Learner progress preserved.`);
  if (MODE === "archive") {
    console.log(`  To bring it back:    npm run course:restore ${SLUG}`);
  } else {
    console.log(`  To re-archive:       npm run course:archive ${SLUG}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

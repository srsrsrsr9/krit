/**
 * Diagnostic: list all paths in the DB and promote any showcase paths
 * still stuck in DRAFT to PUBLISHED.
 *
 * Usage: npx tsx prisma/seed/list-courses.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
(async () => {
  const promoted = await db.path.updateMany({
    where: { status: "DRAFT", slug: { in: ["ai-for-developers", "leaders-ai-os"] } },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  if (promoted.count > 0) console.log(`→ Promoted ${promoted.count} showcase path(s) to PUBLISHED.\n`);

  const paths = await db.path.findMany({
    orderBy: { title: "asc" },
    select: { slug: true, title: true, level: true, status: true, _count: { select: { items: true } } },
  });
  console.log(`${paths.length} courses in DB:\n`);
  for (const p of paths) {
    const mark = p.status === "PUBLISHED" ? "✓" : "○";
    console.log(`  ${mark} /learn/${p.slug.padEnd(30)} ${p.title}  (${p._count.items} items, ${p.level})`);
  }
  await db.$disconnect();
})();

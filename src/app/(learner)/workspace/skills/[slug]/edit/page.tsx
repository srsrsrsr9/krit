import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { SkillForm } from "@/components/author/skill-form";

export default async function EditSkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");

  const skill = await db.skill.findFirst({
    where: { slug, workspaceId: m.workspaceId },
    include: { prerequisites: true },
  });
  if (!skill) notFound();

  const allSkills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/workspace/skills" className="text-xs text-muted-foreground hover:text-foreground">← Skills</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Edit skill</h1>
      <SkillForm
        initial={{
          id: skill.id,
          slug: skill.slug,
          name: skill.name,
          description: skill.description,
          category: skill.category,
          decayDays: skill.decayDays,
          prerequisiteIds: skill.prerequisites.map((p) => p.prereqId),
        }}
        allSkills={allSkills}
      />
    </div>
  );
}

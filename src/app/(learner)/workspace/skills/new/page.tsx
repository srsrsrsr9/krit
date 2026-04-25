import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { SkillForm } from "@/components/author/skill-form";

export default async function NewSkillPage() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");

  const allSkills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/workspace/skills" className="text-xs text-muted-foreground hover:text-foreground">← Skills</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New skill</h1>
      <SkillForm allSkills={allSkills} />
    </div>
  );
}

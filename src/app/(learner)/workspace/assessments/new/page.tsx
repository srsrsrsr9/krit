import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { AssessmentForm } from "@/components/author/assessment-form";

export default async function NewAssessment() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/assessments" className="text-xs text-muted-foreground hover:text-foreground">← Assessments</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New assessment</h1>
      <AssessmentForm skills={skills} />
    </div>
  );
}

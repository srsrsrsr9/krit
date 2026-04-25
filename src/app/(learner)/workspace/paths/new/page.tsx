import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { PathForm } from "@/components/author/path-form";

export default async function NewPath() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const [lessons, assessments, projects] = await Promise.all([
    db.lesson.findMany({ where: { workspaceId: m.workspaceId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.assessment.findMany({ where: { workspaceId: m.workspaceId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.projectBrief.findMany({ where: { workspaceId: m.workspaceId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/paths" className="text-xs text-muted-foreground hover:text-foreground">← Paths</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New path</h1>
      <PathForm catalog={{ lessons, assessments, projects }} />
    </div>
  );
}

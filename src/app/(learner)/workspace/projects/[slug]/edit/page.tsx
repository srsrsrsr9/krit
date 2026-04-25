import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { ProjectForm } from "@/components/author/project-form";

interface RubricLevel { label: string; points: number; }
interface RubricCriterion { criterion: string; levels: RubricLevel[]; }

export default async function EditProject({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const p = await db.projectBrief.findFirst({ where: { slug, workspaceId: m.workspaceId } });
  if (!p) notFound();
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/projects" className="text-xs text-muted-foreground hover:text-foreground">← Projects</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Edit project</h1>
      <ProjectForm initial={{
        id: p.id,
        slug: p.slug,
        title: p.title,
        prompt: p.prompt,
        rubric: (p.rubric as unknown as RubricCriterion[]) ?? [],
      }} />
    </div>
  );
}

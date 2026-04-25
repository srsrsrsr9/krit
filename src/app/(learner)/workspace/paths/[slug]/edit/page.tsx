import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { PathForm } from "@/components/author/path-form";

export default async function EditPath({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const path = await db.path.findFirst({
    where: { slug, workspaceId: m.workspaceId },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!path) notFound();
  const [lessons, assessments, projects] = await Promise.all([
    db.lesson.findMany({ where: { workspaceId: m.workspaceId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.assessment.findMany({ where: { workspaceId: m.workspaceId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.projectBrief.findMany({ where: { workspaceId: m.workspaceId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/paths" className="text-xs text-muted-foreground hover:text-foreground">← Paths</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Edit path</h1>
      <PathForm
        catalog={{ lessons, assessments, projects }}
        initial={{
          id: path.id,
          slug: path.slug,
          title: path.title,
          subtitle: path.subtitle,
          summary: path.summary,
          kind: path.kind,
          status: path.status,
          level: path.level,
          estimatedMinutes: path.estimatedMinutes,
          items: path.items.map((it) => ({
            kind: it.kind === "ASSESSMENT" ? "ASSESSMENT" : it.kind === "PROJECT" ? "PROJECT" : "LESSON",
            refId: (it.lessonId ?? it.assessmentId ?? it.projectId)!,
            title: it.title,
            required: it.required,
          })),
        }}
      />
    </div>
  );
}

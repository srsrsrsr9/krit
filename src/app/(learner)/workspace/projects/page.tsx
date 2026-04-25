import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function ProjectsList() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const projects = await db.projectBrief.findMany({
    where: { workspaceId: m.workspaceId },
    include: { _count: { select: { submissions: true, items: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Project briefs with rubric-based scoring.</p>
        <Link href="/workspace/projects/new"><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New project</Button></Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/workspace/projects/${p.slug}/edit`} className="block">
            <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="font-medium">{p.title}</div>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>{p._count.items} path{p._count.items === 1 ? "" : "s"}</span>
                <span>{p._count.submissions} submission{p._count.submissions === 1 ? "" : "s"}</span>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && <div className="md:col-span-2 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No projects yet.</div>}
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

export default async function LessonsList() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");

  const lessons = await db.lesson.findMany({
    where: { workspaceId: m.workspaceId },
    include: {
      skills: { include: { skill: true } },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Lessons are reusable across paths.</p>
        <Link href="/workspace/lessons/new">
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New lesson</Button>
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Skills</th>
              <th className="px-4 py-2 font-medium">Used in</th>
              <th className="px-4 py-2 font-medium">Updated</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-accent/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{l.title}</div>
                  {l.subtitle && <div className="text-xs text-muted-foreground">{l.subtitle}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {l.skills.map((s) => (
                      <Badge key={s.id} variant="secondary">{s.skill.name}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{l._count.items} path{l._count.items === 1 ? "" : "s"}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.updatedAt.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/workspace/lessons/${l.slug}/edit`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No lessons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

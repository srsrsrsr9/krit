import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

export default async function AssessmentsList() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");

  const assessments = await db.assessment.findMany({
    where: { workspaceId: m.workspaceId },
    include: {
      skills: { include: { skill: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Assessments hold versioned question banks tied to skills.</p>
        <Link href="/workspace/assessments/new"><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New assessment</Button></Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Skills</th>
              <th className="px-4 py-2 font-medium">Questions</th>
              <th className="px-4 py-2 font-medium">Attempts</th>
              <th className="px-4 py-2 font-medium">Mode</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{a.skills.map((s) => <Badge key={s.id} variant="secondary">{s.skill.name}</Badge>)}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{a._count.questions}</td>
                <td className="px-4 py-3 text-muted-foreground">{a._count.attempts}</td>
                <td className="px-4 py-3"><Badge variant="outline">{a.mode}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/workspace/assessments/${a.slug}/edit`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Pencil className="h-3.5 w-3.5" />Edit</Link>
                </td>
              </tr>
            ))}
            {assessments.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No assessments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AUTHOR_ROLES } from "@/lib/roles";
import { Plus, Pencil } from "lucide-react";

export default async function WorkspaceSkills() {
  const m = await currentMembership();
  if (!m) return null;
  const workspaceId = m.workspaceId;

  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId }, { workspaceId: null }] },
    include: {
      prerequisites: { include: { prereq: true } },
      _count: { select: { evidence: true, lessonSkills: true, assessmentSkills: true } },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const byCategory = new Map<string, typeof skills>();
  for (const s of skills) {
    const c = s.category ?? "General";
    if (!byCategory.has(c)) byCategory.set(c, []);
    byCategory.get(c)!.push(s);
  }

  const canAuthor = AUTHOR_ROLES.includes(m.role);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          The skill graph. Each skill ties content, assessments, evidence, and role profiles together.
        </p>
        {canAuthor && (
          <Link href="/workspace/skills/new">
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New skill</Button>
          </Link>
        )}
      </div>
      {[...byCategory.entries()].map(([cat, group]) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {group.map((s) => (
              <Card key={s.id}>
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{s.name}</div>
                    <div className="flex items-center gap-2">
                      {s.decayDays && <Badge variant="warn">Re-verify {s.decayDays}d</Badge>}
                      {canAuthor && s.workspaceId && (
                        <Link href={`/workspace/skills/${s.slug}/edit`} className="text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                    <span>{s._count.lessonSkills} lessons</span>
                    <span>{s._count.assessmentSkills} assessments</span>
                    <span>{s._count.evidence} evidence rows</span>
                  </div>
                  {s.prerequisites.length > 0 && (
                    <div className="pt-2 text-xs">
                      <span className="text-muted-foreground">Requires: </span>
                      {s.prerequisites.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 && ", "}
                          <span className="text-foreground">{p.prereq.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

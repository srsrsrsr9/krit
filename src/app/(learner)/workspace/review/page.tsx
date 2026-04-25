import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRole, INSTRUCTOR_ROLES } from "@/lib/roles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ReviewQueue() {
  const m = await checkRole(INSTRUCTOR_ROLES);
  if (!m) redirect("/workspace");

  const submissions = await db.submission.findMany({
    where: {
      project: { workspaceId: m.workspaceId },
      status: { in: ["SUBMITTED", "REVIEWING", "REVISION_REQUESTED"] },
    },
    include: { project: true, user: true },
    orderBy: [{ status: "asc" }, { submittedAt: "asc" }],
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Open submissions awaiting review. Score against the rubric to mark complete and award skill evidence.</p>
      <div className="grid gap-3">
        {submissions.map((s) => (
          <Link key={s.id} href={`/workspace/review/${s.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-sm font-medium">{s.user.name} · {s.project.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.submittedAt ? `Submitted ${s.submittedAt.toLocaleDateString()}` : "Draft"}
                  </div>
                </div>
                <Badge variant={s.status === "SUBMITTED" ? "default" : s.status === "REVIEWING" ? "outline" : "warn"}>{s.status}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        {submissions.length === 0 && <p className="text-sm text-muted-foreground">Nothing in queue.</p>}
      </div>
    </div>
  );
}

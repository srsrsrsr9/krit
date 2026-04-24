import { currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function WorkspaceAnalytics() {
  const m = await currentMembership();
  if (!m) return null;
  const workspaceId = m.workspaceId;

  // Verb distribution (last 30 days)
  const events = await db.lrsEvent.findMany({
    where: { workspaceId, occurredAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
    select: { verb: true, objectType: true },
  });
  const verbCounts = new Map<string, number>();
  for (const e of events) verbCounts.set(e.verb, (verbCounts.get(e.verb) ?? 0) + 1);
  const totalEvents = events.length;

  // Path enrollment breakdown
  const paths = await db.path.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { enrollments: true } },
      enrollments: { select: { status: true } },
    },
  });

  // Attempt pass rate by assessment
  const assessments = await db.assessment.findMany({
    where: { workspaceId },
    include: { attempts: { select: { passed: true, status: true } } },
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Activity verbs · last 30 days
        </h2>
        <Card>
          <CardContent className="space-y-3 p-5">
            {totalEvents === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              [...verbCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([verb, n]) => (
                  <div key={verb}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{verb}</span>
                      <span className="text-muted-foreground">{n}</span>
                    </div>
                    <Progress value={(n / totalEvents) * 100} />
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Path performance
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {paths.map((p) => {
            const completed = p.enrollments.filter((e) => e.status === "COMPLETED").length;
            const completion = p._count.enrollments > 0 ? Math.round((completed / p._count.enrollments) * 100) : 0;
            return (
              <Card key={p.id}>
                <CardContent className="space-y-2 p-5">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {completed} / {p._count.enrollments} completed
                  </div>
                  <Progress value={completion} />
                </CardContent>
              </Card>
            );
          })}
          {paths.length === 0 && <p className="text-sm text-muted-foreground">No paths yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Assessment pass rates
        </h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Assessment</th>
                  <th className="px-4 py-2 font-medium">Attempts</th>
                  <th className="px-4 py-2 font-medium">Pass rate</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const submitted = a.attempts.filter((at) => at.status === "SUBMITTED");
                  const passed = submitted.filter((at) => at.passed).length;
                  const rate = submitted.length > 0 ? Math.round((passed / submitted.length) * 100) : 0;
                  return (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-4 py-3">{a.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{submitted.length}</td>
                      <td className="px-4 py-3 text-muted-foreground">{submitted.length === 0 ? "—" : `${rate}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

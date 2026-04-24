import { currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users2, BookOpen, Trophy, AlertTriangle, TrendingUp } from "lucide-react";

export default async function WorkspaceOverview() {
  const m = await currentMembership();
  if (!m) return null;
  const workspaceId = m.workspaceId;

  const [peopleCount, pathCount, credentialsIssued, overdueAssignments, last7dEvidence, topSkills] = await Promise.all([
    db.membership.count({ where: { workspaceId } }),
    db.path.count({ where: { workspaceId, status: "PUBLISHED" } }),
    db.issuedCredential.count({
      where: { credential: { workspaceId }, revokedAt: null },
    }),
    db.assignment.count({
      where: { workspaceId, status: { in: ["PENDING", "ACTIVE"] }, dueAt: { lt: new Date() } },
    }),
    db.lrsEvent.count({
      where: { workspaceId, occurredAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
    }),
    db.evidence.groupBy({
      by: ["skillId"],
      _count: true,
      orderBy: { _count: { skillId: "desc" } },
      take: 5,
      where: { skill: { workspaceId } },
    }),
  ]);

  const skillNames = await db.skill.findMany({
    where: { id: { in: topSkills.map((s) => s.skillId) } },
  });
  const nameById = Object.fromEntries(skillNames.map((s) => [s.id, s.name]));

  const recentActivity = await db.lrsEvent.findMany({
    where: { workspaceId },
    orderBy: { occurredAt: "desc" },
    take: 12,
    include: { user: true },
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={Users2} label="People" value={String(peopleCount)} />
        <Stat icon={BookOpen} label="Published paths" value={String(pathCount)} />
        <Stat icon={Trophy} label="Credentials issued" value={String(credentialsIssued)} />
        <Stat icon={TrendingUp} label="Events this week" value={String(last7dEvidence)} />
        <Stat
          icon={AlertTriangle}
          label="Overdue assignments"
          value={String(overdueAssignments)}
          tone={overdueAssignments > 0 ? "warn" : undefined}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="text-sm font-semibold">Top skills by evidence</div>
            {topSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No evidence yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topSkills.map((s) => (
                  <li key={s.skillId} className="flex items-center justify-between">
                    <span>{nameById[s.skillId] ?? s.skillId}</span>
                    <Badge variant="secondary">{s._count} events</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="text-sm font-semibold">Recent activity</div>
            <ul className="space-y-2 text-sm">
              {recentActivity.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-xs">
                  <span>
                    <span className="font-medium text-foreground">{e.user.name}</span>{" "}
                    <span className="text-muted-foreground">
                      {e.verb} {e.objectType}
                    </span>
                  </span>
                  <span className="text-muted-foreground">{new Date(e.occurredAt).toLocaleString()}</span>
                </li>
              ))}
              {recentActivity.length === 0 && <p className="text-muted-foreground">Nothing yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${tone === "warn" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

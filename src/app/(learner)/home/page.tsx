import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { computePathProgress, LEVEL_COLOR, LEVEL_LABEL } from "@/lib/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, Trophy, ArrowRight, Flame } from "lucide-react";
import { cn, formatMinutes, pct } from "@/lib/utils";

export default async function HomePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const membership = await currentMembership();

  // All the independent queries fire in parallel — big perceived-perf win.
  const [enrollments, skillStates, assignments, credentials, totalEvidence, last7dEvidence] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      include: { path: true },
      orderBy: { lastActivityAt: { sort: "desc", nulls: "last" } },
    }),
    db.skillState.findMany({
      where: { userId: user.id },
      include: { skill: true },
      orderBy: { lastEvidenceAt: { sort: "desc", nulls: "last" } },
      take: 8,
    }),
    membership
      ? db.assignment.findMany({
          where: { assignedToId: user.id, workspaceId: membership.workspaceId, status: { in: ["PENDING", "ACTIVE"] } },
          include: { path: true, assignedBy: true },
          orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }],
          take: 5,
        })
      : Promise.resolve([]),
    db.issuedCredential.findMany({
      where: { userId: user.id, revokedAt: null },
      include: { credential: true },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
    db.evidence.count({ where: { userId: user.id } }),
    db.evidence.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
    }),
  ]);

  // Parallel across enrollments too.
  const progressByEnrollment = Object.fromEntries(
    await Promise.all(enrollments.map(async (e) => [e.id, await computePathProgress(e.id)] as const)),
  );

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Hi, {user.name.split(" ")[0]}.</h1>
        <p className="mt-1 text-muted-foreground">
          {skillStates.length === 0
            ? "Let's build your first skill. Pick a path below to get started."
            : `You've added evidence against ${skillStates.length} skill${skillStates.length === 1 ? "" : "s"} so far.`}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <Stat icon={Flame} label="Evidence this week" value={String(last7dEvidence)} />
        <Stat icon={Target} label="Skills in progress" value={String(skillStates.length)} />
        <Stat icon={BookOpen} label="Active paths" value={String(enrollments.length)} />
        <Stat icon={Trophy} label="Credentials earned" value={String(credentials.length)} />
      </section>

      {assignments.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Assigned by your team
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {assignments.map((a) => (
              <Card key={a.id} className="border-primary/30">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant={a.compliance ? "warn" : "default"}>
                        {a.compliance ? "Compliance" : "Assigned"}
                      </Badge>
                      {a.dueAt && (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(a.dueAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Link href={`/learn/${a.path.slug}`} className="font-medium hover:underline">
                      {a.path.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      by {a.assignedBy.name} · {a.reason ?? "Assigned learning"}
                    </p>
                  </div>
                  <Link href={`/learn/${a.path.slug}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Continue learning</h2>
          <Link href="/catalog" className="text-xs text-muted-foreground hover:text-foreground">
            Browse catalog →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {enrollments.map((e) => {
            const p = progressByEnrollment[e.id]!;
            return (
              <Card key={e.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{e.path.title}</CardTitle>
                      {e.path.subtitle && <CardDescription>{e.path.subtitle}</CardDescription>}
                    </div>
                    <Badge variant="secondary">{LEVEL_LABEL[e.path.level]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {p.completed} / {p.total} items
                    </span>
                    <span>{p.pct}%</span>
                  </div>
                  <Progress value={p.pct} />
                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {e.path.estimatedMinutes ? formatMinutes(e.path.estimatedMinutes) : "—"}
                    </span>
                    <Link href={`/learn/${e.path.slug}`}>
                      <Button size="sm" className="gap-1">
                        Continue <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {enrollments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No active paths yet.</p>
                <Link href="/catalog">
                  <Button>Browse catalog</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {skillStates.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your skill profile</h2>
            <Link href="/skills" className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {skillStates.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium">{s.skill.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Confidence {pct(s.confidence, 1)}%
                  </div>
                </div>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", LEVEL_COLOR[s.level])}>
                  {LEVEL_LABEL[s.level]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {totalEvidence === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Start your first lesson to collect evidence against your skill profile.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
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

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import cuid from "cuid";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { computePathProgress, LEVEL_COLOR, LEVEL_LABEL } from "@/lib/progress";
import { recordEvent } from "@/lib/lrs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatMinutes } from "@/lib/utils";
import { BookOpen, ClipboardCheck, Clock, FolderOpen, Target, CheckCircle2, CircleDashed } from "lucide-react";

export default async function PathPage({ params }: { params: Promise<{ pathSlug: string }> }) {
  const { pathSlug } = await params;
  const [user, m] = await Promise.all([currentUser(), currentMembership()]);
  if (!user) redirect("/sign-in");

  const path = await db.path.findFirst({
    where: { slug: pathSlug, ...(m ? { workspaceId: m.workspaceId } : {}) },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { lesson: { include: { skills: { include: { skill: true } } } }, assessment: true, project: true },
      },
      credential: true,
    },
  });
  if (!path) notFound();

  let enrollment = await db.enrollment.findUnique({
    where: { userId_pathId: { userId: user.id, pathId: path.id } },
  });

  if (!enrollment) {
    enrollment = await db.enrollment.create({
      data: { id: cuid(), userId: user.id, pathId: path.id, lastActivityAt: new Date() },
    });
    await recordEvent({
      userId: user.id,
      workspaceId: path.workspaceId,
      verb: "enrolled",
      objectType: "path",
      objectId: path.id,
    });
  }

  const [progress, lessonProgress, attempts, submissions] = await Promise.all([
    computePathProgress(enrollment.id),
    db.lessonProgress.findMany({ where: { enrollmentId: enrollment.id } }),
    db.attempt.findMany({ where: { userId: user.id, assessmentId: { in: path.items.filter((i) => i.assessmentId).map((i) => i.assessmentId!) } } }),
    db.submission.findMany({ where: { userId: user.id, projectId: { in: path.items.filter((i) => i.projectId).map((i) => i.projectId!) } } }),
  ]);

  const skillSet = new Map<string, { id: string; name: string; category: string | null }>();
  for (const i of path.items) {
    if (i.lesson) for (const ls of i.lesson.skills) skillSet.set(ls.skill.id, ls.skill);
  }

  type PathItem = NonNullable<typeof path>["items"][number];
  function itemStatus(item: PathItem) {
    if (item.kind === "LESSON" && item.lessonId) {
      const lp = lessonProgress.find((p) => p.lessonId === item.lessonId);
      if (lp?.completedAt) return "done" as const;
      if (lp) return "in_progress" as const;
    }
    if (item.kind === "ASSESSMENT" && item.assessmentId) {
      const passed = attempts.find((a) => a.assessmentId === item.assessmentId && a.passed);
      if (passed) return "done" as const;
      const inProg = attempts.find((a) => a.assessmentId === item.assessmentId && a.status === "IN_PROGRESS");
      if (inProg) return "in_progress" as const;
    }
    if (item.kind === "PROJECT" && item.projectId) {
      const s = submissions.find((x) => x.projectId === item.projectId);
      if (s?.status === "REVIEWED") return "done" as const;
      if (s) return "in_progress" as const;
    }
    return "todo" as const;
  }

  const nextItem = path.items.find((i) => itemStatus(i) !== "done");

  return (
    <div className="space-y-8">
      <Link href="/home" className="text-xs text-muted-foreground hover:text-foreground">
        ← Home
      </Link>

      <header className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{LEVEL_LABEL[path.level]}</Badge>
            {path.kind === "COMPLIANCE" && <Badge variant="warn">Compliance</Badge>}
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">{path.title}</h1>
          {path.subtitle && <p className="text-lg text-muted-foreground">{path.subtitle}</p>}
          {path.summary && <p className="text-balance text-muted-foreground">{path.summary}</p>}
          {nextItem && (
            <div>
              <Link href={linkForItem(nextItem, path.slug)}>
                <Button size="lg" className="gap-2">
                  {progress.completed === 0 ? "Start path" : "Continue"} · {nextItem.title}
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Your progress</span>
                <span>{progress.pct}%</span>
              </div>
              <Progress value={progress.pct} />
              <div className="mt-1 text-xs text-muted-foreground">
                {progress.completed} of {progress.total} items complete
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {path.estimatedMinutes ? formatMinutes(path.estimatedMinutes) : "—"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                {skillSet.size} skill{skillSet.size === 1 ? "" : "s"}
              </div>
              {path.credential && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ClipboardCheck className="h-4 w-4" />
                  Earns <span className="text-foreground">{path.credential.title}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </header>

      {skillSet.size > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills you'll build</h2>
          <div className="flex flex-wrap gap-2">
            {[...skillSet.values()].map((s) => (
              <span key={s.id} className={cn("rounded-full border px-3 py-1 text-xs", LEVEL_COLOR.WORKING)}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Curriculum</h2>
        <div className="space-y-2">
          {path.items.map((item, i) => {
            const status = itemStatus(item);
            return (
              <Link key={item.id} href={linkForItem(item, path.slug)} className="block">
                <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <div className="flex h-8 w-8 items-center justify-center">
                    {status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-skill-proficient" />
                    ) : status === "in_progress" ? (
                      <CircleDashed className="h-5 w-5 animate-pulse text-skill-working" />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    )}
                  </div>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <ItemIcon kind={item.kind} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {labelForKind(item.kind)}
                      {item.lesson && ` · ${formatMinutes(item.lesson.estimatedMinutes)}`}
                    </div>
                  </div>
                  {!item.required && <Badge variant="outline">Optional</Badge>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function linkForItem(
  item: { kind: string; lesson?: { slug: string } | null; assessment?: { slug: string } | null; project?: { slug: string } | null },
  pathSlug: string,
): string {
  if (item.kind === "LESSON" && item.lesson) return `/learn/${pathSlug}/${item.lesson.slug}`;
  if (item.kind === "ASSESSMENT" && item.assessment) return `/assess/${item.assessment.slug}?from=${pathSlug}`;
  if (item.kind === "PROJECT" && item.project) return `/projects/${item.project.slug}?from=${pathSlug}`;
  return `/learn/${pathSlug}`;
}

function ItemIcon({ kind }: { kind: string }) {
  if (kind === "LESSON") return <BookOpen className="h-4 w-4" />;
  if (kind === "ASSESSMENT") return <ClipboardCheck className="h-4 w-4" />;
  if (kind === "PROJECT") return <FolderOpen className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
}

function labelForKind(kind: string): string {
  if (kind === "LESSON") return "Lesson";
  if (kind === "ASSESSMENT") return "Assessment";
  if (kind === "PROJECT") return "Project";
  if (kind === "LIVE_SESSION") return "Live session";
  return kind;
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import cuid from "cuid";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/lrs";
import { AssessmentRunner } from "@/components/assessment/runner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Target, XCircle } from "lucide-react";

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ assessmentSlug: string }>;
  searchParams: Promise<{ from?: string; attempt?: string }>;
}) {
  const { assessmentSlug } = await params;
  const sp = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const m = await currentMembership();

  const assessment = await db.assessment.findFirst({
    where: { slug: assessmentSlug, ...(m ? { workspaceId: m.workspaceId } : {}) },
    include: {
      questions: { orderBy: { order: "asc" } },
      skills: { include: { skill: true } },
    },
  });
  if (!assessment) notFound();

  const priorAttempts = await db.attempt.findMany({
    where: { userId: user.id, assessmentId: assessment.id },
    orderBy: { startedAt: "desc" },
  });
  const bestPassed = priorAttempts.find((a) => a.passed);
  const attemptsLeft = Math.max(0, assessment.attemptsAllowed - priorAttempts.length);

  // If attempt query param or first time → create or resume IN_PROGRESS attempt.
  let attempt = priorAttempts.find((a) => a.status === "IN_PROGRESS") ?? null;

  // Intro / result screen state
  const mode = sp.attempt === "start" ? "take" : attempt ? "take" : "intro";

  if (mode === "take" && !attempt) {
    if (attemptsLeft <= 0) {
      return (
        <ResultView
          assessment={assessment}
          attempts={priorAttempts}
          backHref={sp.from ? `/learn/${sp.from}` : "/home"}
          exhausted
        />
      );
    }
    attempt = await db.attempt.create({
      data: {
        id: cuid(),
        userId: user.id,
        assessmentId: assessment.id,
        status: "IN_PROGRESS",
      },
    });
    await recordEvent({
      userId: user.id,
      workspaceId: assessment.workspaceId,
      verb: "attempted",
      objectType: "assessment",
      objectId: assessment.id,
      context: { attemptId: attempt.id, from: sp.from },
    });
  }

  if (mode === "take" && attempt) {
    // Shuffle client-side at render time.
    return (
      <div className="space-y-6">
        <Link href={sp.from ? `/learn/${sp.from}` : "/home"} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <AssessmentRunner
          attemptId={attempt.id}
          assessment={{
            id: assessment.id,
            title: assessment.title,
            timeLimitSec: assessment.timeLimitSec,
            passThreshold: assessment.passThreshold,
            shuffle: assessment.shuffleQuestions,
          }}
          questions={assessment.questions.map((q) => ({
            id: q.id,
            kind: q.kind,
            order: q.order,
            stem: q.stem,
            points: q.points,
            payload: q.payload as unknown,
            skillSlug: q.skillSlug ?? null,
          }))}
          fromPathSlug={sp.from ?? null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={sp.from ? `/learn/${sp.from}` : "/home"} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {assessment.skills.map((as) => (
            <Badge key={as.skill.id} variant="secondary">
              {as.skill.name}
            </Badge>
          ))}
          <Badge variant={assessment.mode === "PRACTICE" ? "outline" : "default"}>
            {assessment.mode}
          </Badge>
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{assessment.title}</h1>
        {assessment.description && <p className="text-muted-foreground">{assessment.description}</p>}
      </header>

      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          <Stat icon={Target} label="Questions" value={String(assessment.questions.length)} />
          <Stat
            icon={Clock}
            label="Time limit"
            value={assessment.timeLimitSec ? `${Math.ceil(assessment.timeLimitSec / 60)} min` : "No limit"}
          />
          <Stat icon={CheckCircle2} label="Pass" value={`${assessment.passThreshold}%`} />
        </CardContent>
      </Card>

      {priorAttempts.length > 0 && (
        <Card>
          <CardContent className="space-y-2 p-5">
            <div className="text-sm font-semibold">Previous attempts</div>
            {priorAttempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {new Date(a.startedAt).toLocaleString()} · {a.status}
                </span>
                <span className="flex items-center gap-2">
                  {a.scorePct != null ? `${a.scorePct}%` : "—"}
                  {a.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : a.scorePct != null ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : null}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Link href={`?from=${sp.from ?? ""}&attempt=start`}>
          <Button size="lg" disabled={attemptsLeft <= 0 && !bestPassed}>
            {priorAttempts.length === 0 ? "Start assessment" : bestPassed ? "Retake for practice" : "Try again"}
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground">
          {attemptsLeft} of {assessment.attemptsAllowed} attempts remaining
        </span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function ResultView({
  assessment,
  attempts,
  backHref,
  exhausted,
}: {
  assessment: { title: string };
  attempts: { scorePct: number | null; passed: boolean | null; id: string }[];
  backHref: string;
  exhausted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8 text-center">
        <h2 className="font-display text-2xl">{assessment.title}</h2>
        <p className="text-muted-foreground">
          {exhausted ? "You've used all your attempts. Review the material and talk to your admin for a reset." : "Nothing to do here."}
        </p>
        <Link href={backHref}>
          <Button>Back</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

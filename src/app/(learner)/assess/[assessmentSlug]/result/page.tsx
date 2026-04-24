import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ assessmentSlug: string }>;
  searchParams: Promise<{ attempt?: string; from?: string }>;
}) {
  const { assessmentSlug } = await params;
  const sp = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const m = await currentMembership();

  const assessment = await db.assessment.findFirst({
    where: { slug: assessmentSlug, ...(m ? { workspaceId: m.workspaceId } : {}) },
    include: {
      skills: { include: { skill: true } },
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!assessment) notFound();

  const attempt = sp.attempt
    ? await db.attempt.findUnique({
        where: { id: sp.attempt },
        include: { answers: { include: { question: true } } },
      })
    : await db.attempt.findFirst({
        where: { userId: user.id, assessmentId: assessment.id, status: "SUBMITTED" },
        orderBy: { submittedAt: "desc" },
        include: { answers: { include: { question: true } } },
      });
  if (!attempt) notFound();

  const totalPoints = assessment.questions.reduce((s, q) => s + q.points, 0);
  const earnedPoints = attempt.answers.reduce((s, a) => s + a.pointsEarned, 0);

  const credentialIssued = attempt.passed
    ? await db.issuedCredential.findFirst({
        where: { userId: user.id, credential: { path: { items: { some: { assessmentId: assessment.id } } } } },
        include: { credential: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <Link
        href={sp.from ? `/learn/${sp.from}` : "/home"}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>

      <Card className={cn("border-2", attempt.passed ? "border-emerald-500/40" : "border-destructive/40")}>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          {attempt.passed ? (
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          ) : (
            <XCircle className="h-14 w-14 text-destructive" />
          )}
          <div>
            <h1 className="font-display text-3xl font-semibold">
              {attempt.passed ? "Nice work — you passed" : "Not there yet"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {assessment.title} · {attempt.scorePct}% ({earnedPoints} / {totalPoints} points)
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {assessment.skills.map((s) => (
              <Badge key={s.skill.id} variant={attempt.passed ? "success" : "secondary"}>
                {s.skill.name}
              </Badge>
            ))}
          </div>
          {credentialIssued && (
            <div className="mt-4 w-full max-w-md rounded-lg border border-primary/30 bg-primary/5 p-4 text-left">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-primary" />
                Credential issued · {credentialIssued.credential.title}
              </div>
              <Link href={`/credentials/${credentialIssued.verificationCode}`} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                View credential <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          <div className="flex gap-2">
            {sp.from && (
              <Link href={`/learn/${sp.from}`}>
                <Button>Back to path</Button>
              </Link>
            )}
            {!attempt.passed && (
              <Link href={`/assess/${assessmentSlug}?from=${sp.from ?? ""}`}>
                <Button variant="outline">Review and retry</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="text-sm font-semibold">Review</div>
          {attempt.answers.map((a) => {
            const payload = a.question.payload as { choices?: { id: string; label: string; correct: boolean; explanation?: string }[] };
            const choices = payload.choices ?? [];
            const resp = (a.response as string[]) ?? [];
            return (
              <div key={a.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Question {a.question.order}</span>
                  <span className={cn(a.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                    {a.isCorrect ? "Correct" : "Incorrect"} · +{a.pointsEarned} / {a.question.points}
                  </span>
                </div>
                <div className="mb-3 text-sm">{a.question.stem}</div>
                <div className="space-y-1.5">
                  {choices.map((c) => {
                    const wasChosen = resp.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                          c.correct ? "border-emerald-500/40 bg-emerald-500/5" : wasChosen ? "border-destructive/40 bg-destructive/5" : "border-border",
                        )}
                      >
                        <span className="mt-0.5">
                          {c.correct ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : wasChosen ? <XCircle className="h-4 w-4 text-destructive" /> : <span className="inline-block h-4 w-4 rounded-full border border-muted-foreground/40" />}
                        </span>
                        <div className="flex-1">
                          <div>{c.label}</div>
                          {c.explanation && (c.correct || wasChosen) && (
                            <div className="mt-1 text-xs text-muted-foreground">{c.explanation}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {a.question.explanation && (
                  <div className="mt-3 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Explanation: </strong>
                    {a.question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

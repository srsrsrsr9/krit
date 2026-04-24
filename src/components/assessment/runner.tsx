"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronLeft, ChevronRight, Flag, Timer } from "lucide-react";

interface Choice {
  id: string;
  label: string;
}

interface Q {
  id: string;
  kind: "MCQ_SINGLE" | "MCQ_MULTI" | "SHORT_ANSWER" | "CODE" | "ORDER";
  order: number;
  stem: string;
  points: number;
  payload: unknown;
  skillSlug: string | null;
}

export function AssessmentRunner({
  attemptId,
  assessment,
  questions,
  fromPathSlug,
}: {
  attemptId: string;
  assessment: {
    id: string;
    title: string;
    timeLimitSec: number | null;
    passThreshold: number;
    shuffle: boolean;
  };
  questions: Q[];
  fromPathSlug: string | null;
}) {
  const router = useRouter();
  const ordered = useMemo(() => {
    const arr = [...questions];
    if (assessment.shuffle) arr.sort(() => Math.random() - 0.5);
    return arr;
  }, [questions, assessment.shuffle]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimitSec ?? 0);

  useEffect(() => {
    if (!assessment.timeLimitSec) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [assessment.timeLimitSec]);

  useEffect(() => {
    if (assessment.timeLimitSec && timeLeft === 0) {
      submit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const q = ordered[idx]!;
  const total = ordered.length;
  const answered = Object.values(answers).filter((a) => a.length > 0).length;

  function toggleChoice(choiceId: string) {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.kind === "MCQ_MULTI") {
        return { ...prev, [q.id]: cur.includes(choiceId) ? cur.filter((c) => c !== choiceId) : [...cur, choiceId] };
      }
      return { ...prev, [q.id]: [choiceId] };
    });
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const n = new Set(prev);
      if (n.has(q.id)) n.delete(q.id);
      else n.add(q.id);
      return n;
    });
  }

  async function submit(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        answers: Object.entries(answers).map(([questionId, response]) => ({ questionId, response })),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Could not submit. Try again.");
      return;
    }
    const data = (await res.json()) as { scorePct: number; passed: boolean; attemptId: string };
    if (auto) toast.warning("Time's up — auto-submitted.");
    router.push(`/assess/${assessmentSlugFromPath()}/result?attempt=${data.attemptId}${fromPathSlug ? `&from=${fromPathSlug}` : ""}`);
    router.refresh();
  }

  function assessmentSlugFromPath(): string {
    if (typeof window === "undefined") return "";
    const m = window.location.pathname.match(/\/assess\/([^/?]+)/);
    return m?.[1] ?? "";
  }

  const choices = (q.payload as { choices?: Choice[] })?.choices ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
      <div className="space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">{assessment.title}</h1>
            <p className="text-xs text-muted-foreground">
              Question {idx + 1} of {total} · {q.points} {q.points === 1 ? "point" : "points"}
            </p>
          </div>
          {assessment.timeLimitSec ? (
            <div className={cn("flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm", timeLeft < 60 && "border-destructive text-destructive")}>
              <Timer className="h-4 w-4" /> {formatTime(timeLeft)}
            </div>
          ) : null}
        </header>

        <Progress value={((idx + 1) / total) * 100} />

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="prose-krit">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.stem}</ReactMarkdown>
            </div>

            <div className="space-y-2">
              {choices.map((c) => {
                const selected = (answers[q.id] ?? []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChoice(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40",
                    )}
                    type="button"
                  >
                    <span className={cn("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center", q.kind === "MCQ_MULTI" ? "rounded" : "rounded-full", "border", selected ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                    </span>
                    <span className="flex-1">{c.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleFlag} className="gap-1">
                  <Flag className={cn("h-4 w-4", flagged.has(q.id) && "fill-amber-400 text-amber-500")} />
                  {flagged.has(q.id) ? "Flagged" : "Flag for review"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                {idx < total - 1 ? (
                  <Button size="sm" onClick={() => setIdx((i) => i + 1)} className="gap-1">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => submit(false)} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit attempt"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-3">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Navigator</div>
            <div className="grid grid-cols-6 gap-1.5">
              {ordered.map((item, i) => {
                const state = answers[item.id]?.length ? "answered" : "todo";
                const isCurrent = i === idx;
                const isFlagged = flagged.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setIdx(i)}
                    className={cn(
                      "relative flex h-8 items-center justify-center rounded-md border text-xs font-medium",
                      state === "answered" ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-background",
                      isCurrent && "ring-2 ring-ring",
                    )}
                    type="button"
                  >
                    {i + 1}
                    {isFlagged && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {answered} / {total} answered
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-2 p-4 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Your answers save when you submit. Leaving the page will lose in-progress answers.</span>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

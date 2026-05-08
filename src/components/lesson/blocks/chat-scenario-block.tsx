"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, XCircle, MessagesSquare, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Bucket {
  id: string;
  label: string;
  tone: "danger" | "neutral" | "safe";
}
interface Scenario {
  id: string;
  situation: string;
  correctBucketId: string;
  explain: string;
}
export interface ChatScenarioBlockProps {
  coach: { name: string; role?: string; avatarSrc?: string };
  intro: string[];
  buckets: Bucket[];
  scenarios: Scenario[];
}

const bucketTone = {
  danger: "border-rose-400/60 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300",
  neutral: "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-500/10 dark:text-slate-300",
  safe: "border-emerald-400/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300",
} as const;

export function ChatScenarioBlock({ coach, intro, buckets, scenarios }: ChatScenarioBlockProps) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const reduced = useReducedMotion();
  const playSound = useGameSound();
  const total = scenarios.length;
  const current = scenarios[step];
  const picked = current ? picks[current.id] : undefined;
  const submitted = picked !== undefined;
  const correct = submitted && picked === current?.correctBucketId;
  const done = step >= total;

  function pick(bucketId: string) {
    if (!current || submitted) return;
    setPicks((p) => ({ ...p, [current.id]: bucketId }));
    playSound(bucketId === current.correctBucketId ? "correct" : "wrong");
  }
  function next() {
    setStep((s) => s + 1);
  }
  function reset() {
    setStep(0);
    setPicks({});
  }

  const score = scenarios.filter((s) => picks[s.id] === s.correctBucketId).length;

  return (
    <div className="not-prose overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-md">
      <header className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-primary/15 to-primary/5 px-5 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary ring-2 ring-primary/40">
          {coach.avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.avatarSrc} alt={coach.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <MessagesSquare className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-display text-sm font-semibold leading-tight">{coach.name}</div>
          {coach.role && <div className="text-xs text-muted-foreground">{coach.role}</div>}
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {done ? `${score}/${total}` : `${step + 1}/${total}`}
        </div>
      </header>

      <div className="space-y-3 bg-[radial-gradient(circle_at_1px_1px,_rgba(15,23,42,0.06)_1px,_transparent_0)] bg-[length:14px_14px] px-5 py-5 dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.06)_1px,_transparent_0)]">
        {intro.map((line, i) => (
          <Bubble key={`intro-${i}`} reduced={reduced} delay={i * 0.06}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{line}</ReactMarkdown>
          </Bubble>
        ))}
        {!done && current && (
          <Bubble reduced={reduced} accent>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Scenario {step + 1}
            </div>
            <div className="text-sm">{current.situation}</div>
          </Bubble>
        )}
        {submitted && current && (
          <Bubble reduced={reduced} side="right">
            <div className="text-sm font-medium">
              You picked: {buckets.find((b) => b.id === picked)?.label}
            </div>
          </Bubble>
        )}
        {submitted && current && (
          <Bubble reduced={reduced} accent>
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
              {correct ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Correct
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-500" /> Almost — the answer is{" "}
                  <span className="text-foreground">
                    {buckets.find((b) => b.id === current.correctBucketId)?.label}
                  </span>
                </>
              )}
            </div>
            <div className="prose-krit prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.explain}</ReactMarkdown>
            </div>
          </Bubble>
        )}
        {done && (
          <Bubble reduced={reduced} accent>
            <div className="text-sm font-semibold">
              Done. You got {score} out of {total}.
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {score === total
                ? "Clean run. The pattern is now in your bones."
                : score >= Math.ceil(total * 0.7)
                ? "Solid. Re-read the explanations on the ones you missed."
                : "Worth a second pass — the explanations are the actual lesson."}
            </div>
          </Bubble>
        )}
      </div>

      <footer className="border-t border-border bg-muted/40 px-5 py-3">
        {!done && current && !submitted && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pick one 👇
            </div>
            <div className="flex flex-wrap gap-2">
              {buckets.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => pick(b.id)}
                  className={cn(
                    "rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-all",
                    bucketTone[b.tone],
                    "hover:scale-[1.02] active:scale-[0.98]",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {!done && submitted && (
          <Button size="sm" type="button" onClick={next} className="gap-1">
            {step + 1 === total ? "See result" : "Next scenario"} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
        {done && (
          <Button size="sm" variant="ghost" type="button" onClick={reset} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Run again
          </Button>
        )}
      </footer>
    </div>
  );
}

function Bubble({
  children,
  reduced,
  delay = 0,
  side = "left",
  accent = false,
}: {
  children: React.ReactNode;
  reduced?: boolean | null;
  delay?: number;
  side?: "left" | "right";
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn("flex", side === "right" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
          side === "right"
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : accent
            ? "rounded-tl-sm border border-primary/30 bg-background"
            : "rounded-tl-sm bg-muted",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

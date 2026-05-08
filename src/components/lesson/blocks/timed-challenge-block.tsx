"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Timer, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";
import { XpMoment } from "./xp-moment";

interface Choice {
  id: string;
  label: string;
  correct: boolean;
  explain?: string;
}
export interface TimedChallengeBlockProps {
  prompt: string;
  choices: Choice[];
  timeLimitSec?: number;
  fastSec?: number;
  fullPoints?: number;
  partialPoints?: number;
}

export function TimedChallengeBlock({
  prompt,
  choices,
  timeLimitSec = 30,
  fastSec = 10,
  fullPoints = 3,
  partialPoints = 1,
}: TimedChallengeBlockProps) {
  const [elapsed, setElapsed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playSound = useGameSound();

  const timeUp = elapsed >= timeLimitSec;
  const remaining = Math.max(0, timeLimitSec - elapsed);
  const pct = (remaining / timeLimitSec) * 100;
  const selected = choices.find((c) => c.id === selectedId);
  const isCorrect = submitted && (selected?.correct ?? false);
  const earnedPoints = isCorrect ? (elapsed <= fastSec ? fullPoints : partialPoints) : 0;

  useEffect(() => {
    if (submitted || timeUp) return;
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [submitted, timeUp]);

  function submit(id: string) {
    if (submitted || timeUp) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSelectedId(id);
    setSubmitted(true);
    const correct = choices.find((c) => c.id === id)?.correct ?? false;
    playSound(correct ? "correct" : "wrong");
    if (correct) setShowXp(true);
  }

  function retry() {
    setElapsed(0);
    setSelectedId(null);
    setSubmitted(false);
    setShowXp(false);
  }

  return (
    <div className="not-prose relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md dark:from-amber-950/30 dark:to-orange-950/20">
      {showXp && (
        <XpMoment xp={earnedPoints} label={elapsed <= fastSec ? "Speed bonus!" : "Correct"} onDone={() => setShowXp(false)} />
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          <Timer className="h-3.5 w-3.5" />
          Timed challenge
        </div>
        <div className={cn("font-mono text-sm font-bold tabular-nums", remaining <= 5 && !submitted && "text-rose-600 dark:text-rose-400")}>
          {submitted ? "—" : `${remaining}s`}
        </div>
      </div>

      {/* Timer bar — inline style justified: dynamic width percentage from state */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900/40">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", submitted ? "bg-muted-foreground/30" : remaining <= 5 ? "bg-rose-500" : "bg-amber-500")}
          style={{ width: submitted ? "100%" : `${pct}%` }}
        />
      </div>

      <p className="mb-4 font-medium text-sm">{prompt}</p>

      <div className="space-y-2">
        {choices.map((c) => {
          const isPicked = selectedId === c.id;
          const reveal = submitted && (c.correct || isPicked);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => submit(c.id)}
              disabled={submitted || timeUp}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                !submitted && "border-amber-300/60 bg-background hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30",
                reveal && c.correct && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                reveal && isPicked && !c.correct && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                submitted && !reveal && "opacity-50",
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {reveal && c.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : reveal && isPicked && !c.correct ? (
                  <XCircle className="h-4 w-4 text-rose-500" />
                ) : (
                  <span className="h-3 w-3 rounded-full border-2 border-amber-400" />
                )}
              </span>
              <span className="flex-1">{c.label}</span>
            </button>
          );
        })}
      </div>

      {(submitted || timeUp) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {timeUp && !submitted && (
            <p className="text-sm font-medium text-rose-600">Time's up!</p>
          )}
          {submitted && (
            <p className={cn("text-sm font-medium", isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600")}>
              {isCorrect
                ? elapsed <= fastSec
                  ? `Fast answer — ${earnedPoints}/${fullPoints} points`
                  : `Correct — ${earnedPoints}/${fullPoints} points (${fullPoints - earnedPoints} docked for time)`
                : "Wrong answer — 0 points"}
            </p>
          )}
          {selected?.explain && (
            <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">{selected.explain}</p>
          )}
          <Button size="sm" variant="ghost" onClick={retry} type="button">Try again</Button>
        </motion.div>
      )}
    </div>
  );
}

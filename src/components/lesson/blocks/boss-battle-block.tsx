"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Swords, Trophy, RefreshCw, ChevronRight, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Option {
  id: string;
  label: string;
  correct: boolean;
  explain: string;
  points: number;
}
interface Stage {
  id: string;
  prompt: string;
  options: Option[];
}
export interface BossBattleBlockProps {
  title: string;
  setup: string;
  coach: { name: string; role?: string; avatarSrc?: string };
  stages: Stage[];
  outcomes: { perfect: string; good: string; learn: string };
}

function letterGrade(pct: number): { letter: "S" | "A" | "B" | "C"; color: string } {
  if (pct >= 0.95) return { letter: "S", color: "text-amber-500" };
  if (pct >= 0.8) return { letter: "A", color: "text-emerald-500" };
  if (pct >= 0.6) return { letter: "B", color: "text-sky-500" };
  return { letter: "C", color: "text-rose-500" };
}

export function BossBattleBlock({ title, setup, coach, stages, outcomes }: BossBattleBlockProps) {
  const [stageIdx, setStageIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();
  const playSound = useGameSound();

  const total = stages.length;
  const done = stageIdx >= total;
  const stage = stages[stageIdx];
  const pickedId = stage ? picks[stage.id] : undefined;
  const pickedOption = stage?.options.find((o) => o.id === pickedId);

  const maxPoints = useMemo(
    () => stages.reduce((s, st) => s + Math.max(...st.options.map((o) => o.points)), 0),
    [stages],
  );
  const earned = useMemo(
    () =>
      stages.reduce((s, st) => {
        const p = picks[st.id];
        const opt = st.options.find((o) => o.id === p);
        return s + (opt?.points ?? 0);
      }, 0),
    [stages, picks],
  );
  const pct = maxPoints > 0 ? earned / maxPoints : 0;
  const grade = letterGrade(pct);
  const outcome = pct >= 0.95 ? outcomes.perfect : pct >= 0.6 ? outcomes.good : outcomes.learn;

  function pick(optionId: string) {
    if (!stage || revealed) return;
    const opt = stage.options.find((o) => o.id === optionId);
    setPicks((p) => ({ ...p, [stage.id]: optionId }));
    setRevealed(true);
    playSound(opt?.correct ? "correct" : "wrong");
  }
  function next() {
    const nextIdx = stageIdx + 1;
    if (nextIdx >= total) playSound("achievement");
    setStageIdx(nextIdx);
    setRevealed(false);
  }
  function reset() {
    setStageIdx(0);
    setPicks({});
    setRevealed(false);
  }

  return (
    <div className="not-prose overflow-hidden rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 shadow-md dark:from-violet-950/40 dark:via-fuchsia-950/30 dark:to-rose-950/30">
      <header className="flex items-center justify-between gap-3 border-b border-violet-300/40 bg-violet-600/10 px-5 py-3 dark:bg-violet-900/30">
        <div className="flex items-center gap-2 text-violet-900 dark:text-violet-200">
          <Swords className="h-5 w-5" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Boss battle</div>
            <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>
          </div>
        </div>
        <div className="text-xs font-mono text-violet-800 dark:text-violet-300">
          {done ? "complete" : `stage ${stageIdx + 1}/${total}`}
        </div>
      </header>

      <div className="border-b border-violet-300/30 bg-white/60 px-5 py-3 dark:bg-violet-950/20">
        <div className="prose-krit prose-sm text-violet-950 dark:text-violet-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{setup}</ReactMarkdown>
        </div>
      </div>

      {/* Coach bar */}
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-200 text-violet-700 ring-2 ring-violet-400/60 dark:bg-violet-800 dark:text-violet-200">
          {coach.avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.avatarSrc} alt={coach.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">{coach.name}</div>
          {coach.role && <div className="text-xs text-muted-foreground">{coach.role}</div>}
        </div>
      </div>

      {/* Stage / outcome */}
      <div className="px-5 pb-5">
        {!done && stage && (
          <motion.div
            key={stage.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="space-y-3"
          >
            <div className="rounded-xl border border-violet-300/50 bg-background p-4 shadow-sm">
              <div className="prose-krit prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{stage.prompt}</ReactMarkdown>
              </div>
            </div>

            <div className="space-y-2">
              {stage.options.map((opt) => {
                const isPicked = pickedId === opt.id;
                const showResult = revealed && (opt.correct || isPicked);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => pick(opt.id)}
                    disabled={revealed}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                      !revealed && "border-violet-300/60 bg-background hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30",
                      showResult && opt.correct && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                      showResult && isPicked && !opt.correct && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                      revealed && !showResult && "opacity-50",
                    )}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
                      {showResult && opt.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : showResult && isPicked && !opt.correct ? (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border-2 border-violet-400" />
                      )}
                    </span>
                    <span className="flex-1 font-medium">{opt.label}</span>
                    {revealed && opt.points > 0 && (
                      <span className="ml-auto rounded-full bg-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-900 dark:bg-violet-800 dark:text-violet-100">
                        +{opt.points}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {revealed && pickedOption && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg border border-violet-300/40 bg-violet-100/50 p-3 text-sm dark:bg-violet-950/30"
              >
                <div className="prose-krit prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{pickedOption.explain}</ReactMarkdown>
                </div>
                <Button
                  size="sm"
                  className="mt-3 gap-1"
                  type="button"
                  onClick={next}
                >
                  {stageIdx + 1 === total ? "See result" : "Next stage"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {done && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.95 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="rounded-2xl border-2 border-violet-400 bg-gradient-to-br from-violet-100 to-fuchsia-100 p-6 text-center shadow-md dark:from-violet-900/40 dark:to-fuchsia-900/30"
          >
            <Trophy className="mx-auto mb-2 h-10 w-10 text-amber-500" />
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
              Battle complete
            </div>
            <div className="mb-3 flex items-baseline justify-center gap-3">
              <span className={cn("font-display text-6xl font-black", grade.color)}>{grade.letter}</span>
              <span className="font-mono text-sm text-muted-foreground">
                {earned}/{maxPoints} pts
              </span>
            </div>
            <div className="prose-krit prose-sm mx-auto max-w-prose text-violet-950 dark:text-violet-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{outcome}</ReactMarkdown>
            </div>
            <Button size="sm" variant="ghost" type="button" onClick={reset} className="mt-4 gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Re-run battle
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

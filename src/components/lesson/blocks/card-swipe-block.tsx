"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Card {
  id: string;
  title: string;
  body: string;
  correctSide: "left" | "right";
  explain: string;
}
export interface CardSwipeBlockProps {
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  cards: Card[];
}

export function CardSwipeBlock({ prompt, leftLabel, rightLabel, cards }: CardSwipeBlockProps) {
  const [idx, setIdx] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, "correct" | "wrong">>({});
  const [exitTo, setExitTo] = useState<"left" | "right" | null>(null);
  const playSound = useGameSound();

  const total = cards.length;
  const done = idx >= total;
  const correctCount = useMemo(
    () => Object.values(verdicts).filter((v) => v === "correct").length,
    [verdicts],
  );

  function decide(side: "left" | "right") {
    if (done || exitTo) return;
    const card = cards[idx]!;
    const correct = card.correctSide === side;
    setVerdicts((v) => ({ ...v, [card.id]: correct ? "correct" : "wrong" }));
    playSound(correct ? "correct" : "wrong");
    setExitTo(side);
    // After exit animation finishes, advance.
    setTimeout(() => {
      setIdx((i) => i + 1);
      setExitTo(null);
    }, 320);
  }

  function reset() {
    setIdx(0);
    setVerdicts({});
    setExitTo(null);
  }

  if (done) {
    return (
      <div className="not-prose">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Swipe deck · complete</span>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">{correctCount} / {total}</span>
        </div>
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <div className="mb-2 font-display text-base font-bold">
            {correctCount === total ? "Clean run." : `${correctCount}/${total} on the first pass.`}
          </div>
          <p className="text-sm text-slate-700">
            Each card had one defensible answer in the AI-leverage frame. Replay to see which ones tripped you up.
          </p>
          <Button size="sm" variant="ghost" onClick={reset} className="mt-3 gap-1" type="button">
            <RotateCcw className="h-3.5 w-3.5" /> Replay
          </Button>
        </div>
      </div>
    );
  }

  const card = cards[idx]!;
  const lastVerdict = idx > 0 ? verdicts[cards[idx - 1]!.id] : undefined;
  const lastCard = idx > 0 ? cards[idx - 1]! : null;

  return (
    <div className="not-prose">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Swipe to decide</span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {idx + 1} / {total}
        </span>
      </div>
      <p className="mb-4 text-base font-semibold leading-snug">{prompt}</p>

      {/* Card stage */}
      <div className="relative h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={
              exitTo
                ? {
                    x: exitTo === "left" ? -280 : 280,
                    rotate: exitTo === "left" ? -16 : 16,
                    opacity: 0,
                    transition: { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] },
                  }
                : { opacity: 1, y: 0, scale: 1, x: 0, rotate: 0 }
            }
            transition={{ duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute inset-0 rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-md"
          >
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Card {idx + 1}
            </div>
            <div className="mb-2 font-display text-lg font-bold leading-tight">{card.title}</div>
            <p className="text-sm leading-snug text-slate-700">{card.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => decide("left")}
          disabled={!!exitTo}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full border-2 border-rose-300 bg-rose-50 font-bold text-rose-700 transition-all",
            "hover:border-rose-500 hover:bg-rose-100 active:scale-[0.97] disabled:opacity-50",
          )}
        >
          <ArrowLeft className="h-4 w-4" /> {leftLabel}
        </button>
        <button
          type="button"
          onClick={() => decide("right")}
          disabled={!!exitTo}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full border-2 border-emerald-300 bg-emerald-50 font-bold text-emerald-700 transition-all",
            "hover:border-emerald-500 hover:bg-emerald-100 active:scale-[0.97] disabled:opacity-50",
          )}
        >
          {rightLabel} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Last verdict feedback */}
      {lastVerdict && lastCard && (
        <motion.div
          key={lastCard.id + "-feedback"}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 rounded-lg border px-3 py-2.5 text-xs",
            lastVerdict === "correct"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-rose-300 bg-rose-50 text-rose-900",
          )}
        >
          <div className="mb-0.5 flex items-center gap-1.5 font-bold">
            {lastVerdict === "correct" ? (
              <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {lastCard.title}</>
            ) : (
              <><XCircle className="h-3.5 w-3.5 text-rose-500" /> {lastCard.title}</>
            )}
          </div>
          <div>{lastCard.explain}</div>
        </motion.div>
      )}
    </div>
  );
}

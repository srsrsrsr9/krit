"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";
import { XpMoment } from "./xp-moment";

export interface SkillProofBlockProps {
  skill: string;
  instruction: string;
  starter?: string;
  evalPattern?: string;
  referenceAnswer?: string;
  badgeLabel?: string;
  lang?: string;
}

function evalAnswer(answer: string, pattern: string): boolean {
  try {
    return new RegExp(pattern, "i").test(answer.trim());
  } catch {
    return false;
  }
}

export function SkillProofBlock({
  skill,
  instruction,
  starter = "",
  evalPattern,
  referenceAnswer,
  badgeLabel = "Skill unlocked",
  lang,
}: SkillProofBlockProps) {
  const [value, setValue] = useState(starter);
  const [status, setStatus] = useState<"idle" | "pass" | "fail">("idle");
  const [showRef, setShowRef] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const playSound = useGameSound();

  function submit() {
    if (evalPattern) {
      const pass = evalAnswer(value, evalPattern);
      setStatus(pass ? "pass" : "fail");
      playSound(pass ? "achievement" : "wrong");
      if (pass) setShowXp(true);
    } else {
      setShowRef(true);
    }
  }

  function retry() {
    setValue(starter);
    setStatus("idle");
    setShowRef(false);
    setShowXp(false);
  }

  return (
    <div className="not-prose relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 shadow-md dark:from-teal-950/30 dark:to-emerald-950/20">
      {showXp && status === "pass" && (
        <XpMoment xp={20} label={badgeLabel} onDone={() => setShowXp(false)} />
      )}

      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300">
            Prove it
          </div>
          <div className="font-display text-sm font-semibold">{skill}</div>
        </div>
      </div>

      <p className="mb-3 text-sm">{instruction}</p>

      <Textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); if (status !== "idle") setStatus("idle"); }}
        className={cn("font-mono text-xs", status === "pass" && "border-emerald-500 ring-emerald-200", status === "fail" && "border-rose-400")}
        spellCheck={false}
        rows={5}
        disabled={status === "pass"}
        data-lang={lang ?? "text"}
        placeholder="Write your answer here…"
      />

      <AnimatePresence>
        {status === "pass" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-100/60 px-4 py-3 dark:bg-emerald-950/30"
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{badgeLabel}</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">You've demonstrated this skill.</div>
            </div>
          </motion.div>
        )}
        {status === "fail" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-rose-600"
          >
            Not quite — check your answer and try again.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status !== "pass" && (
          <Button size="sm" onClick={submit} disabled={!value.trim()} type="button">
            Submit proof
          </Button>
        )}
        {status === "pass" || status === "fail" ? (
          <Button size="sm" variant="ghost" onClick={retry} type="button">
            Reset
          </Button>
        ) : null}
        {referenceAnswer && (
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setShowRef((s) => !s)}
            className="gap-1"
          >
            Reference answer
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showRef && "rotate-180")} />
          </Button>
        )}
      </div>

      {showRef && referenceAnswer && (
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-card p-3 text-xs">
          <code>{referenceAnswer}</code>
        </pre>
      )}
    </div>
  );
}

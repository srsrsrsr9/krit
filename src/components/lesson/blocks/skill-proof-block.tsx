"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";
import { XpMoment } from "./xp-moment";

interface Choice {
  id: string;
  label: string;
  correct: boolean;
  explain?: string;
}

export interface SkillProofBlockProps {
  skill: string;
  instruction: string;
  choices?: Choice[];
  starter?: string;
  evalPattern?: string;
  referenceAnswer?: string;
  badgeLabel?: string;
  lang?: string;
}

function evalAnswer(answer: string, pattern: string): boolean {
  try { return new RegExp(pattern, "i").test(answer.trim()); } catch { return false; }
}

export function SkillProofBlock(props: SkillProofBlockProps) {
  if (props.choices && props.choices.length) return <ChoicesMode {...props} choices={props.choices} />;
  return <TextMode {...props} />;
}

// ── Multi-choice mode (recommended) ─────────────────────────────────────────

function ChoicesMode({
  skill,
  instruction,
  choices,
  badgeLabel = "Skill unlocked",
}: SkillProofBlockProps & { choices: Choice[] }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [showXp, setShowXp] = useState(false);
  const playSound = useGameSound();
  const picked = choices.find((c) => c.id === pickedId);
  const submitted = picked !== undefined;
  const isPass = picked?.correct ?? false;

  function pick(id: string) {
    if (submitted) return;
    const c = choices.find((x) => x.id === id);
    if (!c) return;
    setPickedId(id);
    playSound(c.correct ? "achievement" : "wrong");
    if (c.correct) setShowXp(true);
  }
  function reset() { setPickedId(null); setShowXp(false); }

  return (
    <div className="not-prose relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 shadow-md dark:from-teal-950/30 dark:to-emerald-950/20">
      {showXp && isPass && (
        <XpMoment xp={20} label={badgeLabel} onDone={() => setShowXp(false)} />
      )}

      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300">Prove it</div>
          <div className="font-display text-sm font-semibold">{skill}</div>
        </div>
      </div>

      <p className="mb-3 text-sm">{instruction}</p>

      <div className="space-y-2">
        {choices.map((c) => {
          const isPicked = pickedId === c.id;
          const reveal = submitted && (c.correct || isPicked);
          return (
            <button
              key={c.id}
              type="button"
              onClick={(e) => { pick(c.id); e.currentTarget.blur(); }}
              disabled={submitted}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border-2 px-3.5 py-3 text-left text-sm leading-snug transition-all",
                !submitted && "border-teal-300/60 bg-white hover:border-teal-500 hover:bg-teal-50",
                reveal && c.correct && "border-emerald-500 bg-emerald-50",
                reveal && isPicked && !c.correct && "border-rose-500 bg-rose-50",
                submitted && !reveal && "opacity-50",
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {reveal && c.correct ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                 reveal && isPicked && !c.correct ? <XCircle className="h-4 w-4 text-rose-500" /> :
                 <span className="h-3 w-3 rounded-full border-2 border-teal-400" />}
              </span>
              <span className="flex-1 font-medium">{c.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            {isPass ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-100/60 px-3 py-2 dark:bg-emerald-950/30">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{badgeLabel}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white/70 px-3 py-2 text-xs text-muted-foreground">
                {picked?.explain ?? "Not quite — read the correct option's explanation and try again."}
              </div>
            )}
            {isPass && picked?.explain && (
              <div className="rounded-md bg-white/70 px-3 py-2 text-xs text-muted-foreground">
                {picked.explain}
              </div>
            )}
            <Button size="sm" variant="ghost" type="button" onClick={reset}>Try again</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Free-text mode (legacy) ─────────────────────────────────────────────────

function TextMode({
  skill, instruction,
  starter = "", evalPattern, referenceAnswer,
  badgeLabel = "Skill unlocked", lang,
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
  function retry() { setValue(starter); setStatus("idle"); setShowRef(false); setShowXp(false); }

  return (
    <div className="not-prose relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 shadow-md">
      {showXp && status === "pass" && (
        <XpMoment xp={20} label={badgeLabel} onDone={() => setShowXp(false)} />
      )}
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-teal-600" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Prove it</div>
          <div className="font-display text-sm font-semibold">{skill}</div>
        </div>
      </div>
      <p className="mb-3 text-sm">{instruction}</p>
      <Textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); if (status !== "idle") setStatus("idle"); }}
        className={cn("font-mono text-xs", status === "pass" && "border-emerald-500", status === "fail" && "border-rose-400")}
        spellCheck={false}
        rows={5}
        disabled={status === "pass"}
        data-lang={lang ?? "text"}
        placeholder="Write your answer here…"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status !== "pass" && (
          <Button size="sm" onClick={submit} disabled={!value.trim()} type="button">Submit</Button>
        )}
        {(status === "pass" || status === "fail") && (
          <Button size="sm" variant="ghost" onClick={retry} type="button">Reset</Button>
        )}
        {referenceAnswer && (
          <Button size="sm" variant="outline" type="button" onClick={() => setShowRef((s) => !s)} className="gap-1">
            Reference answer
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showRef && "rotate-180")} />
          </Button>
        )}
      </div>
      {showRef && referenceAnswer && (
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-card p-3 text-xs"><code>{referenceAnswer}</code></pre>
      )}
    </div>
  );
}

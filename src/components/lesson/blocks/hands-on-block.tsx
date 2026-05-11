"use client";

import { useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Step {
  instruction: string;
  command?: string;
  lang?: string;
  expect?: string;
}
export interface HandsOnBlockProps {
  title: string;
  setup?: string;
  steps: Step[];
  verify?: string;
}

export function HandsOnBlock({ title, setup, steps, verify }: HandsOnBlockProps) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const playSound = useGameSound();
  const allDone = done.size === steps.length;

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else {
        next.add(i);
        playSound("click");
        if (next.size === steps.length) playSound("achievement");
      }
      return next;
    });
  }

  return (
    <div className="not-prose">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          <Terminal className="h-3.5 w-3.5" /> Hands-on · run it locally
        </span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {done.size} / {steps.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-emerald-300 bg-emerald-50/40">
        <header className="border-b-2 border-emerald-300 bg-emerald-100/60 px-4 py-3">
          <h3 className="font-display text-base font-bold leading-tight text-emerald-950">{title}</h3>
        </header>

        {setup && (
          <div className="border-b border-emerald-200 bg-white/60 px-4 py-3 text-[13px] leading-snug">
            <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Before you start
            </div>
            <div className="prose-krit prose-sm text-emerald-950 [&_p]:my-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{setup}</ReactMarkdown>
            </div>
          </div>
        )}

        <ol className="divide-y divide-emerald-200">
          {steps.map((step, i) => (
            <StepRow
              key={i}
              step={step}
              index={i + 1}
              isDone={done.has(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </ol>

        {verify && (
          <div className={cn(
            "border-t-2 border-emerald-300 px-4 py-3 transition-colors",
            allDone ? "bg-emerald-200/60" : "bg-emerald-50/60",
          )}>
            <div className="mb-1 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              {allDone ? <Check className="h-3.5 w-3.5" /> : null}
              How to know it worked
            </div>
            <div className="prose-krit prose-sm text-emerald-950 [&_p]:my-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{verify}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepRow({
  step,
  index,
  isDone,
  onToggle,
}: { step: Step; index: number; isDone: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!step.command) return;
    try {
      await navigator.clipboard.writeText(step.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard may be restricted; user can long-press */ }
  }

  return (
    <li className={cn("group bg-white/70 px-4 py-3 transition-colors", isDone && "bg-emerald-100/40")}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={isDone ? `Unmark step ${index}` : `Mark step ${index} done`}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold transition-all",
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-emerald-300 bg-white text-emerald-700 hover:border-emerald-500",
          )}
        >
          {isDone ? <Check className="h-3.5 w-3.5" /> : index}
        </button>

        <div className="min-w-0 flex-1">
          <div className={cn(
            "prose-krit prose-sm text-[13px] leading-snug [&_p]:my-0",
            isDone && "text-emerald-900/70",
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.instruction}</ReactMarkdown>
          </div>

          {step.command && (
            <div className="relative mt-2">
              <pre className="overflow-x-auto rounded-md border border-slate-800 bg-slate-950 px-3 py-2 pr-12 font-mono text-[12px] leading-relaxed text-slate-100">
                <code>{step.command}</code>
              </pre>
              <motion.button
                type="button"
                onClick={copy}
                aria-label="Copy command"
                animate={copied ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute right-2 top-2 flex h-6 items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 font-mono text-[10px] font-bold text-slate-300 hover:border-emerald-400 hover:text-emerald-400"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "OK" : "COPY"}
              </motion.button>
            </div>
          )}

          {step.expect && (
            <div className="mt-2 rounded border border-emerald-200 bg-white px-2.5 py-1.5 text-[12px] italic text-emerald-900">
              <span className="mr-1 font-mono not-italic text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Expect:
              </span>
              {step.expect}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

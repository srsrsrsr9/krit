"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

export interface RevealCardBlockProps {
  front: string;
  back: string;
  hint?: string;
}

export function RevealCardBlock({ front, back, hint }: RevealCardBlockProps) {
  const [flipped, setFlipped] = useState(false);
  const playSound = useGameSound();

  function flip() {
    if (flipped) return;
    setFlipped(true);
    playSound("achievement");
  }

  return (
    <div className="not-prose">
      {hint && !flipped && (
        <p className="mb-2 text-center text-xs text-muted-foreground italic">{hint}</p>
      )}
      {/* perspective container */}
      <div
        className="relative mx-auto h-52 w-full max-w-md cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={flip}
        role="button"
        aria-label={flipped ? "Card revealed" : "Tap to reveal"}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") flip(); }}
      >
        {/* inner — rotates 180° on flip. Inline style justified: dynamic rotateY from state. */}
        <div
          className="relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front face */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center shadow-md",
              "[backface-visibility:hidden]",
            )}
          >
            <Sparkles className="h-5 w-5 text-primary/60" />
            <p className="text-base font-semibold leading-snug">{front}</p>
            <span className="mt-2 rounded-full border border-primary/30 px-3 py-1 text-[11px] font-medium text-primary/70">
              Tap to reveal the truth
            </span>
          </div>

          {/* Back face — rotated 180° so it appears when card flips */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-start justify-center gap-2 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-md dark:from-emerald-950/40 dark:to-teal-950/30",
              "[backface-visibility:hidden]",
            )}
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              The real picture
            </div>
            <div className="prose-krit prose-sm text-emerald-950 dark:text-emerald-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{back}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

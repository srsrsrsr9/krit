"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

export type ComicCharacter = "sam" | "cfo" | "rina" | "kavya" | "trap" | "seedling" | "narrator";
export type ComicExpression =
  | "neutral" | "happy" | "confused" | "tired" | "smug" | "excited" | "wilted" | "frown";

interface Frame {
  character: ComicCharacter;
  expression?: ComicExpression;
  bubble: string;
  caption?: string;
}
export interface ComicStripBlockProps {
  title?: string;
  frames: Frame[];
}

const CHARACTER_NAME: Record<ComicCharacter, string> = {
  sam: "Sam",
  cfo: "CFO",
  rina: "Rina",
  kavya: "Kavya",
  trap: "The Trap",
  seedling: "Seedling",
  narrator: "Narrator",
};

const CHARACTER_BG: Record<ComicCharacter, string> = {
  sam: "bg-sky-100",
  cfo: "bg-violet-100",
  rina: "bg-blue-100",
  kavya: "bg-emerald-100",
  trap: "bg-slate-200",
  seedling: "bg-emerald-50",
  narrator: "bg-amber-100",
};

const BUBBLE_TONE: Record<ComicCharacter, string> = {
  sam: "border-sky-300 bg-sky-50/70",
  cfo: "border-violet-300 bg-violet-50/70",
  rina: "border-blue-300 bg-blue-50/70",
  kavya: "border-emerald-300 bg-emerald-50/70",
  trap: "border-slate-400 bg-slate-100/70",
  seedling: "border-emerald-300 bg-emerald-50/70",
  narrator: "border-amber-300 bg-amber-50/70",
};

export function ComicStripBlock({ title, frames }: ComicStripBlockProps) {
  const [revealed, setRevealed] = useState(1);
  const playSound = useGameSound();
  const total = frames.length;
  const done = revealed >= total;

  function nextFrame() {
    if (revealed < total) {
      setRevealed((r) => r + 1);
      playSound("click");
    }
  }

  function reset() {
    setRevealed(1);
  }

  return (
    <div className="not-prose">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Comic strip</span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {Math.min(revealed, total)} / {total}
        </span>
      </div>

      {title && <p className="mb-4 text-base font-semibold leading-snug">{title}</p>}

      <div className="space-y-3">
        {frames.map((f, i) => (
          <ComicFrameView key={i} frame={f} revealed={i < revealed} />
        ))}
      </div>

      {!done ? (
        <button
          type="button"
          onClick={nextFrame}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 py-3 text-sm font-semibold text-amber-800 transition-colors hover:border-amber-500 hover:bg-amber-100 active:scale-[0.98]"
        >
          <ChevronDown className="h-4 w-4 animate-bounce" />
          Tap to reveal next panel
        </button>
      ) : (
        <Button size="sm" variant="ghost" onClick={reset} className="mt-3 gap-1" type="button">
          <RotateCcw className="h-3.5 w-3.5" /> Replay
        </Button>
      )}
    </div>
  );
}

// ── Single frame ────────────────────────────────────────────────────────────

function ComicFrameView({ frame, revealed }: { frame: Frame; revealed: boolean }) {
  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.36, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex items-start gap-3"
        >
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-2 ring-white", CHARACTER_BG[frame.character])}>
            <CharacterAvatar character={frame.character} expression={frame.expression ?? "neutral"} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {CHARACTER_NAME[frame.character]}
            </div>
            <div className={cn("relative rounded-2xl rounded-tl-sm border-2 px-3.5 py-2.5 text-sm leading-snug", BUBBLE_TONE[frame.character])}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{frame.bubble}</ReactMarkdown>
            </div>
            {frame.caption && (
              <div className="mt-1.5 pl-1 text-[11px] italic text-muted-foreground">
                {frame.caption}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Character avatar dispatcher ─────────────────────────────────────────────

function CharacterAvatar({ character, expression }: { character: ComicCharacter; expression: ComicExpression }) {
  return (
    <svg viewBox="0 0 56 56" width="48" height="48" aria-hidden>
      {character === "sam" && <SamHead expression={expression} />}
      {character === "cfo" && <CfoHead expression={expression} />}
      {character === "rina" && <RinaHead expression={expression} />}
      {character === "kavya" && <KavyaHead expression={expression} />}
      {character === "trap" && <TrapHead expression={expression} />}
      {character === "seedling" && <SeedlingHead expression={expression} />}
      {character === "narrator" && <NarratorHead expression={expression} />}
    </svg>
  );
}

// ── Mouth helpers ───────────────────────────────────────────────────────────

function Mouth({ expression, cx = 28, cy = 32 }: { expression: ComicExpression; cx?: number; cy?: number }) {
  const stroke = "#1f2937";
  const w = 5;
  // Tuned shapes per expression — drawn around (cx,cy)
  switch (expression) {
    case "happy":
    case "excited":
      return <path d={`M${cx - w} ${cy - 1} Q ${cx} ${cy + 4} ${cx + w} ${cy - 1}`} stroke={stroke} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    case "smug":
      return <path d={`M${cx - w} ${cy} Q ${cx + w} ${cy - 2} ${cx + w + 2} ${cy + 1}`} stroke={stroke} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    case "confused":
      return <path d={`M${cx - w} ${cy} L ${cx - 2} ${cy - 2} L ${cx + 1} ${cy + 1} L ${cx + w} ${cy - 1}`} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    case "tired":
    case "wilted":
    case "frown":
      return <path d={`M${cx - w} ${cy + 2} Q ${cx} ${cy - 2} ${cx + w} ${cy + 2}`} stroke={stroke} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    default:
      return <line x1={cx - w} y1={cy} x2={cx + w} y2={cy} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />;
  }
}

// Tiny eye sparkle when "excited"
function Sparkle({ cx, cy }: { cx: number; cy: number }) {
  return <path d={`M${cx} ${cy - 3} L${cx + 1} ${cy - 1} L${cx + 3} ${cy} L${cx + 1} ${cy + 1} L${cx} ${cy + 3} L${cx - 1} ${cy + 1} L${cx - 3} ${cy} L${cx - 1} ${cy - 1} Z`} fill="#f59e0b" />;
}

// ── Sam (engineer) ──────────────────────────────────────────────────────────

function SamHead({ expression }: { expression: ComicExpression }) {
  const tired = expression === "tired" || expression === "wilted";
  return (
    <g>
      {/* head */}
      <circle cx="28" cy="26" r="16" fill="#fcd9b6" />
      {/* hair */}
      <path d="M14 18 Q 20 8 28 9 Q 36 8 42 18 L 42 22 L 14 22 Z" fill="#1f2937" />
      {/* glasses */}
      <circle cx="22" cy="26" r="4.2" fill="white" stroke="#1f2937" strokeWidth="1.4" />
      <circle cx="34" cy="26" r="4.2" fill="white" stroke="#1f2937" strokeWidth="1.4" />
      <line x1="26.2" y1="26" x2="29.8" y2="26" stroke="#1f2937" strokeWidth="1.2" />
      {/* eyes — tired = hollow lines */}
      {tired ? (
        <>
          <line x1="20" y1="26" x2="24" y2="26" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="32" y1="26" x2="36" y2="26" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="22" cy="26" r="1.4" fill="#1f2937" />
          <circle cx="34" cy="26" r="1.4" fill="#1f2937" />
        </>
      )}
      {/* headphones */}
      <path d="M14 16 Q 28 4 42 16" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="14" cy="22" rx="2.2" ry="3.5" fill="#1f2937" />
      <ellipse cx="42" cy="22" rx="2.2" ry="3.5" fill="#1f2937" />
      {/* mouth */}
      <Mouth expression={expression} />
      {/* shirt collar peek */}
      <rect x="18" y="44" width="20" height="8" fill="#3b82f6" />
    </g>
  );
}

// ── CFO (purple, smug) ──────────────────────────────────────────────────────

function CfoHead({ expression }: { expression: ComicExpression }) {
  return (
    <g>
      <circle cx="28" cy="26" r="16" fill="#fcd9b6" />
      {/* combed hair */}
      <path d="M14 18 Q 22 10 28 11 Q 34 10 42 18 L 42 22 L 14 22 Z" fill="#374151" />
      {/* slim glasses */}
      <rect x="17" y="22" width="9" height="6" rx="1.5" fill="white" stroke="#1f2937" strokeWidth="1.2" />
      <rect x="30" y="22" width="9" height="6" rx="1.5" fill="white" stroke="#1f2937" strokeWidth="1.2" />
      <line x1="26" y1="25" x2="30" y2="25" stroke="#1f2937" strokeWidth="1" />
      <circle cx="21.5" cy="25" r="1.2" fill="#1f2937" />
      <circle cx="34.5" cy="25" r="1.2" fill="#1f2937" />
      <Mouth expression={expression === "neutral" ? "smug" : expression} />
      {/* purple suit collar */}
      <rect x="18" y="44" width="20" height="8" fill="#8b5cf6" />
      <path d="M22 44 L 28 50 L 34 44 Z" fill="#fffaf0" />
      {/* tiny tie */}
      <path d="M27 44 L 29 44 L 30 47 L 28 52 L 26 47 Z" fill="#5b21b6" />
    </g>
  );
}

// ── Rina (blue, banker) ─────────────────────────────────────────────────────

function RinaHead({ expression }: { expression: ComicExpression }) {
  return (
    <g>
      <circle cx="28" cy="26" r="16" fill="#fcd9b6" />
      {/* hair bun */}
      <path d="M14 18 Q 22 10 28 11 Q 34 10 42 18 L 42 22 L 14 22 Z" fill="#1f2937" />
      <circle cx="28" cy="9" r="4" fill="#1f2937" />
      {/* eyes */}
      <circle cx="22" cy="26" r="1.4" fill="#1f2937" />
      <circle cx="34" cy="26" r="1.4" fill="#1f2937" />
      <Mouth expression={expression} />
      {/* blue blazer */}
      <rect x="18" y="44" width="20" height="8" fill="#0ea5e9" />
    </g>
  );
}

// ── Kavya (green, gardener) ─────────────────────────────────────────────────

function KavyaHead({ expression }: { expression: ComicExpression }) {
  const excited = expression === "excited";
  return (
    <g>
      <circle cx="28" cy="26" r="16" fill="#fcd9b6" />
      <path d="M14 18 Q 22 10 28 11 Q 34 10 42 18 L 42 24 L 14 24 Z" fill="#0f3a2e" />
      {/* eyes — sparkles when excited */}
      {excited ? (
        <>
          <Sparkle cx={22} cy={26} />
          <Sparkle cx={34} cy={26} />
        </>
      ) : (
        <>
          <circle cx="22" cy="26" r="1.4" fill="#1f2937" />
          <circle cx="34" cy="26" r="1.4" fill="#1f2937" />
        </>
      )}
      <Mouth expression={expression} />
      {/* green apron strap */}
      <rect x="18" y="44" width="20" height="8" fill="#10b981" />
      <path d="M24 44 L 24 52 M 32 44 L 32 52" stroke="#0f3a2e" strokeWidth="1.4" />
    </g>
  );
}

// ── Trap (the personified pit) ──────────────────────────────────────────────

function TrapHead({ expression }: { expression: ComicExpression }) {
  const wide = expression === "smug" || expression === "happy";
  return (
    <g>
      {/* mouth (rim) */}
      <ellipse cx="28" cy="38" rx="22" ry="6" fill="#1f2937" />
      {/* mouth interior */}
      <ellipse cx="28" cy="38" rx="16" ry={wide ? 9 : 5} fill="#0b0d10" />
      {/* zigzag teeth */}
      <path d="M11 36 L 16 40 L 21 36 L 26 40 L 31 36 L 36 40 L 41 36 L 45 40" fill="none" stroke="#fffaf0" strokeWidth="1.4" />
      {/* eyes */}
      <circle cx="18" cy="20" r="6.5" fill="#fffaf0" stroke="#1f2937" strokeWidth="1.2" />
      <circle cx="38" cy="20" r="6.5" fill="#fffaf0" stroke="#1f2937" strokeWidth="1.2" />
      <circle cx={wide ? 20 : 18} cy={wide ? 18 : 20} r="2.6" fill="#1f2937" />
      <circle cx={wide ? 40 : 38} cy={wide ? 18 : 20} r="2.6" fill="#1f2937" />
      {/* tiny purple tie */}
      <path d="M26 28 L 30 28 L 32 33 L 28 42 L 24 33 Z" fill="#8b5cf6" />
    </g>
  );
}

// ── Seedling (plant in pot) ─────────────────────────────────────────────────

function SeedlingHead({ expression }: { expression: ComicExpression }) {
  const wilted = expression === "wilted" || expression === "tired";
  const happy = expression === "happy" || expression === "excited";
  return (
    <g>
      {/* sun */}
      {happy && (
        <>
          <circle cx="44" cy="10" r="3" fill="#fbbf24" />
          <line x1="44" y1="3" x2="44" y2="6" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="50" y1="10" x2="48" y2="10" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {/* pot */}
      <path d="M16 36 L 40 36 L 36 50 L 20 50 Z" fill="#a16207" />
      <ellipse cx="28" cy="36" rx="12" ry="2.5" fill="#92400e" />
      <ellipse cx="28" cy="36" rx="9" ry="1.5" fill="#3f1d10" />
      {/* stem */}
      <line x1="28" y1="36" x2="28" y2={wilted ? 22 : 14} stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" />
      {/* leaves */}
      <ellipse cx={wilted ? 23 : 20} cy={wilted ? 27 : 22} rx={happy ? 8 : 7} ry={happy ? 4 : 3.5} fill={wilted ? "#9ca3af" : "#10b981"} transform={`rotate(${wilted ? -50 : -25} ${wilted ? 23 : 20} ${wilted ? 27 : 22})`} />
      <ellipse cx={wilted ? 33 : 36} cy={wilted ? 26 : 18} rx={happy ? 8 : 7} ry={happy ? 4 : 3.5} fill={wilted ? "#9ca3af" : "#10b981"} transform={`rotate(${wilted ? 50 : 25} ${wilted ? 33 : 36} ${wilted ? 26 : 18})`} />
      {/* tiny face */}
      {happy ? (
        <>
          <circle cx="25" cy="20" r="0.9" fill="#0f3a2e" />
          <circle cx="31" cy="20" r="0.9" fill="#0f3a2e" />
          <path d="M24 23 Q 28 25 32 23" stroke="#0f3a2e" strokeWidth="1" fill="none" strokeLinecap="round" />
        </>
      ) : null}
    </g>
  );
}

// ── Narrator (ink mark / quill) ─────────────────────────────────────────────

function NarratorHead({ expression: _expression }: { expression: ComicExpression }) {
  return (
    <g>
      {/* paper square */}
      <rect x="12" y="14" width="32" height="28" rx="2" fill="#fffaf0" stroke="#1f2937" strokeWidth="1.4" />
      <line x1="16" y1="22" x2="36" y2="22" stroke="#9ca3af" strokeWidth="1" />
      <line x1="16" y1="28" x2="32" y2="28" stroke="#9ca3af" strokeWidth="1" />
      <line x1="16" y1="34" x2="36" y2="34" stroke="#9ca3af" strokeWidth="1" />
      {/* quill */}
      <line x1="36" y1="42" x2="46" y2="14" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 14 Q 48 11 47 18 L 45 17 Z" fill="#f59e0b" />
    </g>
  );
}

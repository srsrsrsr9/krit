"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound, type SoundEvent } from "@/hooks/use-game-sound";

// Match the printed SFX text to a synthesised tone — keeps authoring simple.
function inferSfx(text?: string): SoundEvent | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes("tick"))   return "tick";
  if (t.includes("crack"))  return "crack";
  if (t.includes("thud"))   return "thud";
  if (t.includes("whoosh") || t.includes("woosh") || t.includes("swoosh")) return "whoosh";
  if (t.includes("boom"))   return "boom";
  return "click";
}

type Scene =
  | "handshake" | "boardroom-rina" | "cfo-math"
  | "boardroom-kavya" | "ic-desk" | "ending";
type Speaker = "sam" | "cfo" | "rina" | "kavya";

interface Bubble { speaker?: Speaker; text: string; }
interface Panel {
  scene: Scene;
  narration?: string;
  dialog?: Bubble[];
  sfxAfter?: string;
}

export interface PanelComicBlockProps {
  title?: string;
  panels: Panel[];
}

const SPEAKER_NAME: Record<Speaker, string> = {
  sam: "SAM", cfo: "CFO", rina: "RINA", kavya: "KAVYA",
};

export function PanelComicBlock({ title, panels }: PanelComicBlockProps) {
  const [revealed, setRevealed] = useState(1);
  const playSound = useGameSound();
  const total = panels.length;
  const done = revealed >= total;

  function nextPanel() {
    if (revealed < total) {
      setRevealed((r) => r + 1);
      playSound("click");
    }
  }
  function reset() { setRevealed(1); }

  return (
    <div className="not-prose">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">Comic strip</span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {Math.min(revealed, total)} / {total}
        </span>
      </div>
      {title && (
        <p className="mb-4 font-display text-lg font-black leading-tight tracking-tight">
          {title}
        </p>
      )}

      <div className="space-y-1">
        {panels.map((p, i) => (
          <PanelView key={i} panel={p} revealed={i < revealed} />
        ))}
      </div>

      {!done ? (
        <button
          type="button"
          onClick={nextPanel}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-400 bg-rose-50 py-3 text-sm font-semibold text-rose-800 transition-colors hover:bg-rose-100 active:scale-[0.98]"
        >
          <ChevronDown className="h-4 w-4 animate-bounce" />
          Tap for next panel
        </button>
      ) : (
        <Button size="sm" variant="ghost" onClick={reset} className="mt-3 gap-1" type="button">
          <RotateCcw className="h-3.5 w-3.5" /> Replay
        </Button>
      )}
    </div>
  );
}

// ── One panel: narration box + scene + bubble(s), plus SFX between ──────────

function PanelView({ panel, revealed }: { panel: Panel; revealed: boolean }) {
  const playSound = useGameSound();
  const sfxKey = inferSfx(panel.sfxAfter);

  // When this panel is freshly revealed, fire the matching SFX synth tone in
  // sync with the rotated text springing in (~180 ms after panel mount).
  useEffect(() => {
    if (!revealed || !panel.sfxAfter || !sfxKey) return;
    const t = setTimeout(() => playSound(sfxKey), 220);
    return () => clearTimeout(t);
  }, [revealed, panel.sfxAfter, sfxKey, playSound]);

  return (
    <AnimatePresence>
      {revealed && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 18, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden rounded-md border-[3px] border-slate-900 bg-white shadow-[6px_6px_0_0_rgba(15,23,42,1)]"
          >
            {panel.narration && (
              <div className="border-b-[3px] border-slate-900 bg-amber-300 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-slate-900">
                {panel.narration}
              </div>
            )}

            <div className="relative aspect-[5/4] w-full">
              <SceneRenderer scene={panel.scene} />
              {panel.dialog?.map((b, j) => (
                <SpeechBubble
                  key={j}
                  bubble={b}
                  position={
                    panel.dialog!.length === 1
                      ? "top-left"
                      : j === 0 ? "top-left" : "bottom-right"
                  }
                />
              ))}
            </div>
          </motion.div>

          {panel.sfxAfter && <Sfx text={panel.sfxAfter} />}
        </>
      )}
    </AnimatePresence>
  );
}

// ── Speech bubble with tail ─────────────────────────────────────────────────

function SpeechBubble({
  bubble,
  position,
}: {
  bubble: Bubble;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const isLeft = position.includes("left");
  const isTop = position.includes("top");
  return (
    <div
      className={cn(
        "absolute z-10 max-w-[62%] rounded-2xl border-[2.5px] border-slate-900 bg-white px-2.5 py-1.5 text-[11.5px] leading-tight shadow-[3px_3px_0_0_rgba(15,23,42,0.85)]",
        isLeft ? "left-2.5" : "right-2.5",
        isTop ? "top-2.5" : "bottom-2.5",
      )}
    >
      {bubble.speaker && (
        <div className="mb-0.5 font-mono text-[8.5px] font-bold tracking-[0.16em] text-slate-500">
          {SPEAKER_NAME[bubble.speaker]}
        </div>
      )}
      <div className="prose-krit prose-sm leading-tight [&_p]:my-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{bubble.text}</ReactMarkdown>
      </div>

      {/* Tail — small triangle pointing toward the scene */}
      <span
        aria-hidden
        className={cn(
          "absolute h-2.5 w-2.5 rotate-45 border-[2.5px] bg-white",
          isLeft && isTop && "border-l-0 border-t-0 -bottom-1.5 left-5",
          !isLeft && isTop && "border-l-0 border-t-0 -bottom-1.5 right-5",
          isLeft && !isTop && "border-r-0 border-b-0 -top-1.5 left-5",
          !isLeft && !isTop && "border-r-0 border-b-0 -top-1.5 right-5",
          "border-slate-900",
        )}
      />
    </div>
  );
}

// ── SFX between panels ──────────────────────────────────────────────────────

function Sfx({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -14, y: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -6, y: 0 }}
      transition={{ delay: 0.18, duration: 0.5, type: "spring", stiffness: 180 }}
      className="relative my-2 flex justify-center"
      aria-hidden
    >
      <span
        className="font-display text-3xl font-black leading-none tracking-tight text-rose-600"
        style={{
          textShadow: "2px 2px 0 #1e293b, 4px 4px 0 rgba(15,23,42,0.4)",
          WebkitTextStroke: "1.5px #1e293b",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

// ── Scene renderer — dispatch ───────────────────────────────────────────────

function SceneRenderer({ scene }: { scene: Scene }) {
  switch (scene) {
    case "handshake":        return <SceneHandshake />;
    case "boardroom-rina":   return <SceneBoardroomRina />;
    case "cfo-math":         return <SceneCfoMath />;
    case "boardroom-kavya":  return <SceneBoardroomKavya />;
    case "ic-desk":          return <SceneIcDesk />;
    case "ending":           return <SceneEnding />;
  }
}

// ── Reusable parts ──────────────────────────────────────────────────────────

function HeadRina({ frown = false }: { frown?: boolean }) {
  return (
    <g>
      <circle cx="0" cy="0" r="11" fill="#fcd9b6" />
      <path d="M-9 -5 Q -5 -10 0 -10 Q 5 -10 9 -5 L 9 -2 L -9 -2 Z" fill="#1f2937" />
      <circle cx="0" cy="-12" r="3.5" fill="#1f2937" />
      <circle cx="-3.5" cy="0" r="1" fill="#1f2937" />
      <circle cx="3.5" cy="0" r="1" fill="#1f2937" />
      {frown
        ? <path d="M-3 5 Q 0 2 3 5" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
        : <path d="M-3 5 Q 0 7 3 5" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />}
    </g>
  );
}

function HeadKavya({ excited = false }: { excited?: boolean }) {
  return (
    <g>
      <circle cx="0" cy="0" r="11" fill="#fcd9b6" />
      <path d="M-9 -5 Q -5 -10 0 -10 Q 5 -10 9 -5 L 9 -3 L -9 -3 Z" fill="#0f3a2e" />
      {excited ? (
        <>
          <path d="M-1 -1 L 0 1 L 2 1.5 L 0 2 L -1 4 L -2 2 L -4 1.5 L -2 1 Z" transform="translate(-3, 0)" fill="#f59e0b" />
          <path d="M-1 -1 L 0 1 L 2 1.5 L 0 2 L -1 4 L -2 2 L -4 1.5 L -2 1 Z" transform="translate(3, 0)" fill="#f59e0b" />
        </>
      ) : (
        <>
          <circle cx="-3.5" cy="0" r="1" fill="#1f2937" />
          <circle cx="3.5" cy="0" r="1" fill="#1f2937" />
        </>
      )}
      <path d="M-3 5 Q 0 7 3 5" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function HeadCfo() {
  return (
    <g>
      <circle cx="0" cy="0" r="11" fill="#fcd9b6" />
      <path d="M-9 -5 Q -5 -10 0 -10 Q 5 -10 9 -5 L 9 -2 L -9 -2 Z" fill="#374151" />
      <rect x="-7" y="-2" width="6" height="4" rx="1" fill="white" stroke="#1f2937" strokeWidth="0.8" />
      <rect x="1" y="-2" width="6" height="4" rx="1" fill="white" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="-1" y1="0" x2="1" y2="0" stroke="#1f2937" strokeWidth="0.7" />
      <circle cx="-4" cy="0" r="0.9" fill="#1f2937" />
      <circle cx="4" cy="0" r="0.9" fill="#1f2937" />
      <path d="M-3 5 Q 3 3 4 5" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function HeadSam({ happy = false }: { happy?: boolean }) {
  return (
    <g>
      <circle cx="0" cy="0" r="11" fill="#fcd9b6" />
      <path d="M-9 -5 Q -5 -10 0 -10 Q 5 -10 9 -5 L 9 -2 L -9 -2 Z" fill="#1f2937" />
      <circle cx="-3.5" cy="0" r="3" fill="white" stroke="#1f2937" strokeWidth="1" />
      <circle cx="3.5" cy="0" r="3" fill="white" stroke="#1f2937" strokeWidth="1" />
      <line x1="-0.5" y1="0" x2="0.5" y2="0" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="-3.5" cy="0" r="0.9" fill="#1f2937" />
      <circle cx="3.5" cy="0" r="0.9" fill="#1f2937" />
      {happy
        ? <path d="M-4 5 Q 0 9 4 5" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        : <path d="M-3 5 Q 0 7 3 5" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />}
    </g>
  );
}

// ── Scene 1: Handshake (twelve months ago) ─────────────────────────────────

function SceneHandshake() {
  return (
    <svg viewBox="0 0 200 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-handshake" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#bg-handshake)" />
      {/* horizon line */}
      <line x1="0" y1="120" x2="200" y2="120" stroke="#92400e" strokeWidth="1" />
      {/* dashed divider */}
      <line x1="100" y1="20" x2="100" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

      {/* Rina with bag */}
      <g transform="translate(55, 88)">
        <HeadRina />
        <rect x="-12" y="11" width="24" height="20" fill="#0ea5e9" />
        {/* arms cradling bag */}
        <rect x="-16" y="14" width="6" height="14" rx="2" fill="#0ea5e9" />
        <rect x="10" y="14" width="6" height="14" rx="2" fill="#0ea5e9" />
        {/* money bag */}
        <g transform="translate(0, 24)">
          <path d="M-9 0 Q -11 -7 -7 -10 L 7 -10 Q 11 -7 9 0 L 11 11 Q 11 16 5 16 L -5 16 Q -11 16 -11 11 Z" fill="#d6a25a" stroke="#7c5a2c" strokeWidth="1" />
          <text y="6" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fffaf0" fontFamily="ui-monospace,monospace">$</text>
        </g>
      </g>

      {/* Kavya with seedling */}
      <g transform="translate(145, 88)">
        <HeadKavya />
        <rect x="-12" y="11" width="24" height="20" fill="#10b981" />
        <rect x="-16" y="14" width="6" height="14" rx="2" fill="#10b981" />
        <rect x="10" y="14" width="6" height="14" rx="2" fill="#10b981" />
        {/* pot + seedling */}
        <g transform="translate(0, 26)">
          <path d="M-7 0 L 7 0 L 5 6 L -5 6 Z" fill="#a16207" />
          <ellipse cx="0" cy="0" rx="7" ry="1.4" fill="#92400e" />
          <line x1="0" y1="0" x2="0" y2="-7" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="-3" cy="-5" rx="3.5" ry="1.6" fill="#10b981" transform="rotate(-30 -3 -5)" />
          <ellipse cx="3" cy="-6" rx="3.5" ry="1.6" fill="#10b981" transform="rotate(30 3 -6)" />
        </g>
      </g>
    </svg>
  );
}

// ── Scene 2: Rina's Q4 board (somber) ───────────────────────────────────────

function SceneBoardroomRina() {
  return (
    <svg viewBox="0 0 200 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-rina-board" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#bg-rina-board)" />
      {/* floor */}
      <rect x="0" y="130" width="200" height="30" fill="#94a3b8" />

      {/* screen behind */}
      <rect x="20" y="14" width="100" height="62" fill="#fffaf0" stroke="#1e293b" strokeWidth="1.5" />
      <text x="70" y="28" textAnchor="middle" fontSize="7" letterSpacing="0.18em" fill="#1e293b" fontFamily="ui-monospace,monospace">Q4 RESULTS</text>
      {/* declining line */}
      <polyline points="26,46 38,42 52,44 66,52 80,60 96,68 116,72" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
      <text x="70" y="72" textAnchor="middle" fontSize="6" fill="#ef4444" fontFamily="ui-monospace,monospace">−1 FTE · −1 IC</text>

      {/* podium */}
      <rect x="135" y="92" width="42" height="42" fill="#92400e" />
      <rect x="132" y="89" width="48" height="6" fill="#7c2d12" />
      <line x1="156" y1="92" x2="156" y2="134" stroke="#5b3f1f" strokeWidth="1" />

      {/* Rina at podium */}
      <g transform="translate(156, 78)">
        <HeadRina frown />
        <rect x="-12" y="11" width="24" height="14" fill="#0ea5e9" />
      </g>

      {/* empty chair backs in foreground */}
      <g transform="translate(0, 130)">
        <rect x="14" y="0" width="14" height="22" rx="2" fill="#475569" />
        <rect x="38" y="0" width="14" height="22" rx="2" fill="#475569" />
        <rect x="62" y="0" width="14" height="22" rx="2" fill="#475569" />
        <rect x="86" y="0" width="14" height="22" rx="2" fill="#475569" />
      </g>
    </svg>
  );
}

// ── Scene 3: CFO doing the math ─────────────────────────────────────────────

function SceneCfoMath() {
  return (
    <svg viewBox="0 0 200 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-cfo" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#bg-cfo)" />
      {/* desk */}
      <rect x="0" y="110" width="200" height="6" fill="#5b3f1f" />
      <rect x="0" y="116" width="200" height="44" fill="#7c5a2c" />

      {/* CFO behind desk */}
      <g transform="translate(100, 78)">
        <HeadCfo />
        <rect x="-13" y="11" width="26" height="32" fill="#8b5cf6" />
        <rect x="-22" y="13" width="9" height="20" rx="3" fill="#8b5cf6" />
        <rect x="13" y="13" width="9" height="20" rx="3" fill="#8b5cf6" />
        <path d="M-3 11 L 3 11 L 5 18 L 0 30 L -5 18 Z" fill="#5b21b6" />
      </g>

      {/* clipboard in CFO's hand */}
      <g transform="translate(118, 102)">
        <rect x="0" y="0" width="34" height="40" fill="#fffaf0" stroke="#1f2937" strokeWidth="1.4" />
        <line x1="4" y1="8" x2="30" y2="8" stroke="#9ca3af" strokeWidth="1" />
        <line x1="4" y1="14" x2="22" y2="14" stroke="#9ca3af" strokeWidth="1" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="#9ca3af" strokeWidth="1" />
        <text x="17" y="34" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ef4444" fontFamily="ui-monospace,monospace">~ 0</text>
      </g>

      {/* floating math symbols */}
      <g fill="#7c3aed" opacity="0.6" fontFamily="ui-monospace,monospace" fontSize="11" fontWeight="700">
        <text x="34" y="36">−</text>
        <text x="58" y="22">×</text>
        <text x="170" y="46">=</text>
        <text x="38" y="68">$</text>
      </g>

    </svg>
  );
}

// ── Scene 4: Kavya's Q4 board (warm) ────────────────────────────────────────

function SceneBoardroomKavya() {
  return (
    <svg viewBox="0 0 200 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-kavya-board" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#bg-kavya-board)" />
      <rect x="0" y="130" width="200" height="30" fill="#86efac" />

      {/* screen */}
      <rect x="20" y="14" width="100" height="62" fill="#fffaf0" stroke="#0f3a2e" strokeWidth="1.5" />
      <text x="70" y="28" textAnchor="middle" fontSize="7" letterSpacing="0.18em" fill="#0f3a2e" fontFamily="ui-monospace,monospace">Q4 RESULTS</text>
      {/* rising line + fruit dots */}
      <polyline points="26,68 40,60 56,52 72,42 90,32 110,22 116,18" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="56" cy="52" r="2" fill="#ef4444" />
      <circle cx="80" cy="38" r="2" fill="#ef4444" />
      <circle cx="106" cy="24" r="2" fill="#ef4444" />
      <text x="70" y="72" textAnchor="middle" fontSize="6" fill="#0f3a2e" fontFamily="ui-monospace,monospace">+4 ARTEFACTS · BURNOUT ↓</text>

      {/* podium */}
      <rect x="135" y="92" width="42" height="42" fill="#15803d" />
      <rect x="132" y="89" width="48" height="6" fill="#0f3a2e" />

      {/* Kavya at podium */}
      <g transform="translate(156, 78)">
        <HeadKavya excited />
        <rect x="-12" y="11" width="24" height="14" fill="#10b981" />
      </g>

      {/* heads of board members (engaged) — small circles with hair */}
      <g transform="translate(0, 138)">
        {[18, 42, 66, 90].map((x) => (
          <g key={x} transform={`translate(${x}, 0)`}>
            <circle cx="0" cy="-2" r="6" fill="#fcd9b6" />
            <path d="M-5 -5 Q 0 -8 5 -5 L 5 -3 L -5 -3 Z" fill="#1f2937" />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Scene 5: IC at desk (Sam, casual) ───────────────────────────────────────

function SceneIcDesk() {
  return (
    <svg viewBox="0 0 200 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-ic" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#bg-ic)" />

      {/* window with sunlight */}
      <rect x="14" y="12" width="48" height="36" fill="#fde68a" stroke="#92400e" strokeWidth="1.4" />
      <line x1="38" y1="12" x2="38" y2="48" stroke="#92400e" strokeWidth="1" />
      <line x1="14" y1="30" x2="62" y2="30" stroke="#92400e" strokeWidth="1" />
      {/* sun rays */}
      <circle cx="50" cy="22" r="4" fill="#f59e0b" />

      {/* Sam at desk */}
      <g transform="translate(120, 80)">
        <HeadSam happy />
        <rect x="-13" y="11" width="26" height="22" fill="#3b82f6" />
        {/* arms forward to laptop */}
        <rect x="-22" y="14" width="9" height="14" rx="3" fill="#3b82f6" />
        <rect x="13" y="14" width="9" height="14" rx="3" fill="#3b82f6" />
      </g>

      {/* desk + laptop */}
      <rect x="0" y="118" width="200" height="6" fill="#5b3f1f" />
      <rect x="0" y="124" width="200" height="36" fill="#7c5a2c" />
      {/* laptop */}
      <g transform="translate(110, 96)">
        <rect x="-22" y="0" width="44" height="22" fill="#1f2937" rx="2" />
        <rect x="-18" y="3" width="36" height="16" fill="#10b981" opacity="0.4" />
        <rect x="-26" y="22" width="52" height="3" fill="#475569" />
      </g>
      {/* mug */}
      <g transform="translate(60, 110)">
        <rect x="-6" y="0" width="12" height="10" rx="1" fill="#ef4444" />
        <path d="M6 2 Q 10 5 6 8" stroke="#ef4444" strokeWidth="1.5" fill="none" />
      </g>
      {/* potted plant */}
      <g transform="translate(180, 102)">
        <path d="M-5 0 L 5 0 L 4 8 L -4 8 Z" fill="#a16207" />
        <ellipse cx="0" cy="0" rx="5" ry="1" fill="#92400e" />
        <ellipse cx="-3" cy="-5" rx="3" ry="1.4" fill="#10b981" transform="rotate(-30 -3 -5)" />
        <ellipse cx="3" cy="-6" rx="3" ry="1.4" fill="#10b981" transform="rotate(30 3 -6)" />
      </g>
    </svg>
  );
}

// ── Scene 6: Ending (split: trapped vs reinvested calendars) ────────────────

function SceneEnding() {
  return (
    <svg viewBox="0 0 200 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      {/* split background */}
      <rect x="0" y="0" width="100" height="160" fill="#fee2e2" />
      <rect x="100" y="0" width="100" height="160" fill="#dcfce7" />
      <line x1="100" y1="0" x2="100" y2="160" stroke="#1f2937" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Left: trapped calendar with X marks */}
      <g transform="translate(50, 30)">
        <text x="0" y="-10" textAnchor="middle" fontSize="8" letterSpacing="0.18em" fontWeight="700" fill="#991b1b" fontFamily="ui-monospace,monospace">RINA · YR 1</text>
        <rect x="-30" y="0" width="60" height="80" fill="#fffaf0" stroke="#1f2937" strokeWidth="1.4" />
        {/* week rows */}
        {[0, 1, 2, 3].map((row) => (
          <g key={row} transform={`translate(0, ${row * 20})`}>
            {[0, 1, 2, 3].map((col) => (
              <rect key={col} x={-26 + col * 14} y={4} width="12" height="14" fill="#fee2e2" stroke="#94a3b8" strokeWidth="0.6" />
            ))}
            {/* red X across */}
            <line x1={-26} y1={4} x2={26} y2={18} stroke="#ef4444" strokeWidth="1.2" />
            <line x1={26} y1={4} x2={-26} y2={18} stroke="#ef4444" strokeWidth="1.2" />
          </g>
        ))}
        <text x="0" y="98" textAnchor="middle" fontSize="9" fontWeight="700" fill="#991b1b" fontFamily="ui-monospace,monospace">~ 0 GROWTH</text>
      </g>

      {/* Right: reinvest calendar with green stretch blocks */}
      <g transform="translate(150, 30)">
        <text x="0" y="-10" textAnchor="middle" fontSize="8" letterSpacing="0.18em" fontWeight="700" fill="#15803d" fontFamily="ui-monospace,monospace">KAVYA · YR 1</text>
        <rect x="-30" y="0" width="60" height="80" fill="#fffaf0" stroke="#1f2937" strokeWidth="1.4" />
        {[0, 1, 2, 3].map((row) => (
          <g key={row} transform={`translate(0, ${row * 20})`}>
            {[0, 1, 2, 3].map((col) => (
              <rect key={col} x={-26 + col * 14} y={4} width="12" height="14" fill="#fffaf0" stroke="#94a3b8" strokeWidth="0.6" />
            ))}
            {/* one green block per row — the reinvestment slot */}
            <rect x={-12} y={4} width="12" height="14" fill="#10b981" />
          </g>
        ))}
        <text x="0" y="98" textAnchor="middle" fontSize="9" fontWeight="700" fill="#15803d" fontFamily="ui-monospace,monospace">+4 ARTEFACTS</text>
      </g>

    </svg>
  );
}

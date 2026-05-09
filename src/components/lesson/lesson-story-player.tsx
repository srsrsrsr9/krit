"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronLeft, Volume2, VolumeX, X } from "lucide-react";
import type { ContentBlock } from "@/lib/content/blocks";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/use-swipe";
import { useGameSound, setGlobalMute } from "@/hooks/use-game-sound";
import { BlockRenderer } from "./block-renderer";

type Card = ContentBlock;

// Editorial kickers — monospace, small caps. No emojis.
const CARD_KICKER: Record<string, string> = {
  callout: "HOOK",
  revealCard: "REVEAL",
  markdown: "INSIGHT",
  heading: "SECTION",
  quiz: "QUICK CHECK",
  branchScenario: "CHOICE",
  fieldNotes: "FIELD NOTES",
  timedChallenge: "TIMED",
  bossBattle: "BOSS",
  skillProof: "PROVE IT",
  reflect: "REFLECT",
  keyTakeaways: "TAKEAWAYS",
  hotspotReveal: "EXPLORE",
  chatScenario: "DIALOG",
  embedAnimation: "ANIMATION",
  dragClassify: "SORT IT",
  comicStrip: "COMIC",
  panelComic: "COMIC STRIP",
  scaleSlider: "DIAL IN",
  cardSwipe: "SWIPE DECK",
};

const INTERACTIVE_TYPES = new Set([
  "quiz", "timedChallenge", "branchScenario", "skillProof",
  "bossBattle", "revealCard", "reflect", "chatScenario", "dragClassify",
  "comicStrip", "panelComic", "scaleSlider", "cardSwipe",
]);
const POINTS_PER_INTERACTIVE = 10;

function tinyVibrate(ms: number) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export interface LessonStoryPlayerProps {
  blocks: ContentBlock[];
  lessonTitle: string;
  lessonSubtitle?: string;
  pathTitle?: string;
  closeHref?: string;
  /** Where the win-screen Finish button takes the learner. Defaults to closeHref. */
  nextHref?: string;
  /** Label on the win-screen Finish button (e.g. "Next: Trust Stack →"). */
  nextLabel?: string;
  /** Optional per-lesson notes URL. Surfaced on the win screen as a quiet link. */
  notesHref?: string;
}

export function LessonStoryPlayer({
  blocks,
  lessonTitle,
  lessonSubtitle,
  pathTitle,
  closeHref = "/home",
  nextHref,
  nextLabel,
  notesHref,
}: LessonStoryPlayerProps) {
  const cards: Card[] = useMemo(
    () => blocks.filter((b) => b.type !== "lessonMeta"),
    [blocks],
  );
  const total = cards.length;

  const [idx, setIdx] = useState(-1);
  const [muted, setMuted] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [interactedIds, setInteractedIds] = useState<Set<number>>(new Set());
  const stageRef = useRef<HTMLDivElement>(null);
  const playSound = useGameSound();
  const reduced = useReducedMotion();

  useEffect(() => { setGlobalMute(muted); }, [muted]);

  const isIntro = idx < 0;
  const isWin = idx >= total;
  const card = !isIntro && !isWin ? cards[idx]! : null;

  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; }, [idx]);

  function go(delta: number) {
    setIdx((i) => {
      const next = Math.max(-1, Math.min(total, i + delta));
      if (next !== i) {
        playSound("transition");
        tinyVibrate(8);
        if (delta > 0 && i >= 0 && i < total) {
          const passed = cards[i]!;
          if (INTERACTIVE_TYPES.has(passed.type) && !interactedIds.has(i)) {
            setInteractedIds((s) => new Set(s).add(i));
            setXp((p) => p + POINTS_PER_INTERACTIVE);
            setStreak((s) => s + 1);
          }
        }
      }
      return next;
    });
  }

  useSwipe(stageRef, {
    onSwipeLeft: () => go(1),
    onSwipeRight: () => go(-1),
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") window.location.href = closeHref;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const dotIdx = isIntro ? -1 : Math.min(idx, total - 1);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0b0d10] text-slate-100">
      {/* Subtle grain overlay — almost imperceptible, kills the "flat AI" feel */}
      <GrainBg />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-5 pb-5 pt-3 sm:max-w-lg sm:px-6">
        {/* Hairline progress segments */}
        <div className="mb-4 flex items-center gap-[3px]">
          {cards.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-slate-100/10">
              <motion.div
                className="h-full bg-amber-400"
                initial={false}
                animate={{ width: i <= dotIdx ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>

        {/* Top bar — monospace, restrained, all in one line */}
        <div className="mb-5 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.2em] text-slate-500">
          <a
            href={closeHref}
            aria-label="Exit lesson"
            className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-amber-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </a>

          <div className="min-w-0 flex-1 truncate text-center uppercase">
            {pathTitle ?? "Story"}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="hover:text-amber-400 transition-colors"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <span className="ml-1 flex items-center gap-1.5 text-amber-400">
              <span className="h-1.5 w-1.5 bg-amber-400" aria-hidden />
              <motion.span
                key={xp}
                initial={{ scale: 1.3, color: "#fde68a" }}
                animate={{ scale: 1, color: "#fbbf24" }}
                transition={{ duration: 0.4 }}
              >
                {pad2(xp).padStart(3, "0")}
              </motion.span>
              <span className="text-[9px] text-slate-500">XP</span>
              {streak > 0 && (
                <span className="ml-1 text-[9px] tracking-[0.15em] text-orange-400">
                  ×{streak}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Card stage */}
        <div
          ref={stageRef}
          className="relative flex-1 touch-pan-y overflow-y-auto overscroll-contain"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`card-${idx}`}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -20 }}
              transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex min-h-full flex-col"
            >
              {isIntro && (
                <IntroCard
                  title={lessonTitle}
                  subtitle={lessonSubtitle}
                  totalCards={total}
                  onStart={() => go(1)}
                />
              )}
              {card && (
                <CardChrome
                  stepIndex={idx}
                  total={total}
                  kicker={CARD_KICKER[card.type] ?? "FRAME"}
                >
                  <BlockRenderer blocks={[card]} />
                </CardChrome>
              )}
              {isWin && (
                <WinCard xp={xp} streak={streak} totalCards={total} notesHref={notesHref} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Edge tap zones */}
          {!isIntro && !isWin && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={() => go(-1)}
                className="absolute inset-y-0 left-0 hidden w-8 items-center justify-start text-slate-100/0 hover:text-slate-100/30 sm:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => go(1)}
                className="absolute inset-y-0 right-0 hidden w-8 items-center justify-end text-slate-100/0 hover:text-slate-100/30 sm:flex"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom bar */}
        {!isIntro && (
          <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center border border-slate-100/15 text-slate-400 transition-colors hover:border-amber-400/50 hover:text-amber-400"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {isWin ? (
              <a
                href={nextHref ?? closeHref}
                className="group relative flex h-11 items-center justify-between bg-amber-400 px-5 font-mono text-[11px] font-bold tracking-[0.2em] text-slate-950 transition-transform hover:translate-x-0.5"
              >
                {nextLabel ?? "FINISH"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => go(1)}
                className="group relative flex h-11 items-center justify-between bg-amber-400 px-5 font-mono text-[11px] font-bold tracking-[0.2em] text-slate-950 transition-transform hover:translate-x-0.5 active:translate-x-0"
              >
                {idx + 1 === total ? "FINISH" : "CONTINUE"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Intro card — editorial, asymmetric ──────────────────────────────────────

function IntroCard({
  title,
  subtitle,
  totalCards,
  onStart,
}: {
  title: string;
  subtitle?: string;
  totalCards: number;
  onStart: () => void;
}) {
  return (
    <div className="flex h-full flex-col justify-center">
      {/* small kicker */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-amber-400"
      >
        <span className="h-1.5 w-1.5 bg-amber-400" aria-hidden />
        BRIEFING · A KRIT LESSON
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        className="font-display text-[44px] font-black leading-[0.95] tracking-tight text-slate-100 sm:text-[60px]"
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-5 max-w-md text-base leading-relaxed text-slate-300"
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-8 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-slate-500"
      >
        <span>{pad2(totalCards)} FRAMES</span>
        <span className="h-1 w-1 bg-slate-600" aria-hidden />
        <span>~9 MIN</span>
        <span className="h-1 w-1 bg-slate-600" aria-hidden />
        <span className="hidden sm:inline">SWIPE OR ARROW KEYS</span>
        <span className="sm:hidden">SWIPE</span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
        type="button"
        onClick={onStart}
        className="group mt-12 flex h-12 items-center gap-3 self-start bg-amber-400 px-6 font-mono text-xs font-bold tracking-[0.2em] text-slate-950 transition-transform hover:translate-x-1"
      >
        BEGIN
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
    </div>
  );
}

// ── Card chrome ─────────────────────────────────────────────────────────────

function CardChrome({
  stepIndex,
  total,
  kicker,
  children,
}: {
  stepIndex: number;
  total: number;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-sm bg-[#fbf6ec] text-slate-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
      {/* Massive numeric ornament — sits low-opacity in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-12 select-none font-display text-[180px] font-black leading-none tracking-tighter text-amber-400/[0.10]"
      >
        {pad2(stepIndex + 1)}
      </div>

      {/* Top meta row */}
      <div className="relative flex items-center justify-between border-b border-slate-900/10 px-5 py-3 font-mono text-[10px] tracking-[0.18em] text-slate-500 sm:px-6">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-amber-500" aria-hidden />
          FRAME · {kicker}
        </span>
        <span>{pad2(stepIndex + 1)} / {pad2(total)}</span>
      </div>

      {/* Body */}
      <div className="relative px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
        {children}
      </div>
    </div>
  );
}

// ── Win card — editorial, no confetti ───────────────────────────────────────

function WinCard({
  xp,
  streak,
  totalCards,
  notesHref,
}: {
  xp: number;
  streak: number;
  totalCards: number;
  notesHref?: string;
}) {
  return (
    <div className="flex h-full flex-col justify-center">
      {/* Sam doing a fist-pump — replaces the trophy/confetti cliché */}
      <motion.div
        initial={{ opacity: 0, y: 16, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.55, type: "spring" }}
        className="mb-3 self-start"
      >
        <SamCheering />
      </motion.div>

      {/* Saffron sweep — single deliberate gesture */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, transformOrigin: "left" }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="mb-5 h-[3px] w-32 bg-amber-400"
      />

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-3 font-mono text-[10px] tracking-[0.2em] text-amber-400"
      >
        {pad2(totalCards)} / {pad2(totalCards)} · CLEARED
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="font-display text-[80px] font-black leading-none tracking-tighter text-slate-100 sm:text-[112px]"
      >
        DONE.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-6 max-w-md text-base leading-relaxed text-slate-300"
      >
        Lesson cleared. Tap continue to keep moving — or come back later, the streak holds.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-9 grid max-w-sm grid-cols-3 gap-px bg-slate-100/15"
      >
        <Stat label="XP" value={pad2(xp).padStart(3, "0")} />
        <Stat label="STREAK" value={pad2(streak)} />
        <Stat label="FRAMES" value={pad2(totalCards)} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.9 }}
        className="mt-8 flex items-center gap-5 self-start font-mono text-[10px] tracking-[0.2em] text-slate-400"
      >
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="hover:text-amber-400"
        >
          REPLAY
        </button>
        {notesHref && (
          <a href={notesHref} className="hover:text-amber-400">
            DOWNLOAD NOTES ↓
          </a>
        )}
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0b0d10] px-4 py-4">
      <div className="font-mono text-[9px] tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-1 font-display text-2xl font-black tracking-tight text-amber-400">{value}</div>
    </div>
  );
}

// ── Grain background ────────────────────────────────────────────────────────

// ── Cartoon: Sam fist-pumping at the win screen ────────────────────────────

function SamCheering() {
  return (
    <svg viewBox="0 0 120 110" width="100" height="92" aria-hidden>
      {/* speech bubble */}
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <path d="M58 6 H 110 Q 116 6 116 12 V 30 Q 116 36 110 36 H 80 L 70 46 L 74 36 H 58 Q 52 36 52 30 V 12 Q 52 6 58 6 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.6"/>
        <text x="84" y="26" textAnchor="middle" fontSize="13" fontWeight="700" fill="#92400e" fontFamily="ui-sans-serif,system-ui">YES.</text>
      </motion.g>
      {/* arm doing fist-pump (animated) */}
      <motion.g
        initial={{ rotate: 0 }}
        animate={{ rotate: [-8, -22, -10, -22, -10] }}
        transition={{ delay: 0.5, duration: 1.2, repeat: Infinity, repeatDelay: 0.4 }}
        style={{ transformOrigin: "44px 80px" }}
      >
        <rect x="40" y="56" width="9" height="26" rx="3" fill="#3b82f6"/>
        <circle cx="44" cy="50" r="7" fill="#fcd9b6" stroke="#1f2937" strokeWidth="1.2"/>
      </motion.g>
      {/* body */}
      <rect x="20" y="74" width="36" height="30" rx="6" fill="#3b82f6"/>
      {/* head */}
      <circle cx="38" cy="58" r="14" fill="#fcd9b6"/>
      {/* hair */}
      <path d="M26 50 Q 32 42 38 43 Q 44 42 50 50 L 50 54 L 26 54 Z" fill="#1f2937"/>
      {/* glasses */}
      <circle cx="33" cy="58" r="3.4" fill="white" stroke="#1f2937" strokeWidth="1.2"/>
      <circle cx="43" cy="58" r="3.4" fill="white" stroke="#1f2937" strokeWidth="1.2"/>
      <line x1="36.4" y1="58" x2="39.6" y2="58" stroke="#1f2937" strokeWidth="1"/>
      {/* eyes — closed/squinting from joy */}
      <path d="M30.5 58 Q 33 56 35.5 58" stroke="#1f2937" strokeWidth="1.4" fill="none"/>
      <path d="M40.5 58 Q 43 56 45.5 58" stroke="#1f2937" strokeWidth="1.4" fill="none"/>
      {/* big grin */}
      <path d="M32 64 Q 38 70 44 64" stroke="#1f2937" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      {/* headphones */}
      <path d="M26 49 Q 38 38 50 49" fill="none" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round"/>
      <ellipse cx="26" cy="55" rx="2.2" ry="3.2" fill="#1f2937"/>
      <ellipse cx="50" cy="55" rx="2.2" ry="3.2" fill="#1f2937"/>
      {/* sparkle accents */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 0.6, duration: 1.4, repeat: Infinity }}
      >
        <path d="M14 30 L 16 36 L 22 38 L 16 40 L 14 46 L 12 40 L 6 38 L 12 36 Z" fill="#f59e0b"/>
      </motion.g>
    </svg>
  );
}

function GrainBg() {
  // Inline SVG turbulence — adds tactile texture without a remote asset.
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="krit-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#krit-grain)" />
    </svg>
  );
}

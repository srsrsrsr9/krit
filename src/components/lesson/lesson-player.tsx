"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import type { ContentBlock } from "@/lib/content/blocks";
import { BlockRenderer } from "./block-renderer";
import { LessonMetaBar } from "./blocks/lesson-meta-bar";
import { TutorSidebar } from "@/components/tutor/tutor-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/use-swipe";
import { useGameSound, setGlobalMute } from "@/hooks/use-game-sound";

interface Section {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

// Block types that each deserve their own section in the player.
const SOLO_SECTION_TYPES = new Set([
  "fieldNotes",
  "bossBattle",
  "keyTakeaways",
  "branchScenario",
  "skillProof",
  "hotspotReveal",
  "timedChallenge",
  "revealCard",
]);

// Block types the player strips out before grouping (handled elsewhere).
const SKIP_TYPES = new Set(["lessonMeta"]);

function groupIntoSections(blocks: ContentBlock[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { id: "open", title: "Open", blocks: [] };

  function commit() {
    if (current.blocks.length > 0) sections.push(current);
  }

  for (const b of blocks) {
    if (SKIP_TYPES.has(b.type)) continue;

    if (b.type === "heading") {
      commit();
      current = { id: `h-${sections.length}`, title: b.text, blocks: [] };
      continue;
    }

    if (SOLO_SECTION_TYPES.has(b.type)) {
      commit();
      const title =
        b.type === "fieldNotes" ? "Field notes from production" :
        b.type === "bossBattle" ? ((b as Extract<ContentBlock, { type: "bossBattle" }>).title || "Boss battle") :
        b.type === "keyTakeaways" ? "Wrap up" :
        b.type === "branchScenario" ? ((b as Extract<ContentBlock, { type: "branchScenario" }>).title || "Branching scenario") :
        b.type === "skillProof" ? ((b as Extract<ContentBlock, { type: "skillProof" }>).skill || "Prove it") :
        b.type === "hotspotReveal" ? "Explore" :
        b.type === "timedChallenge" ? "Timed challenge" :
        b.type === "revealCard" ? "Reveal" :
        b.type;
      current = { id: `solo-${sections.length}`, title, blocks: [b] };
      continue;
    }

    current.blocks.push(b);
  }
  commit();

  if (sections[0]?.id === "open") sections[0].title = "Get oriented";
  return sections;
}

export interface LessonPlayerProps {
  blocks: ContentBlock[];
  lessonId: string;
  lessonTitle: string;
  lessonSummary: string;
  pathTitle: string;
  skillHints: string[];
  savedReflections?: Record<string, string>;
  footer?: React.ReactNode;
}

export function LessonPlayer({
  blocks,
  lessonId,
  lessonTitle,
  lessonSummary,
  pathTitle,
  skillHints,
  savedReflections,
  footer,
}: LessonPlayerProps) {
  const sections = useMemo(() => groupIntoSections(blocks), [blocks]);
  const meta = blocks.find((b) => b.type === "lessonMeta");
  const [idx, setIdx] = useState(0);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const total = sections.length;
  const safeIdx = Math.min(idx, total - 1);
  const section = sections[safeIdx]!;
  const nextSection = sections[safeIdx + 1];
  const playSound = useGameSound();

  // Sync global mute state whenever the toggle changes.
  useEffect(() => {
    setGlobalMute(soundMuted);
  }, [soundMuted]);

  // Reset stage scroll to top on section change.
  useEffect(() => {
    if (stageRef.current) stageRef.current.scrollTop = 0;
  }, [idx]);

  // Esc closes the tutor drawer.
  useEffect(() => {
    if (!tutorOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTutorOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tutorOpen]);

  function go(delta: number) {
    setIdx((i) => {
      const next = Math.max(0, Math.min(total - 1, i + delta));
      if (next !== i) playSound("transition");
      return next;
    });
  }

  // Swipe left → next, swipe right → prev.
  useSwipe(stageRef, {
    onSwipeLeft: () => go(1),
    onSwipeRight: () => go(-1),
  });

  return (
    <div className="relative flex flex-col md:min-h-0 min-h-[calc(100dvh-4rem)]">
      {/* Progress dots — anchored at the very top */}
      <div className="mb-3 flex items-center justify-center gap-1.5 pt-1">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Go to section ${i + 1}: ${s.title}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx
                ? "w-10 bg-primary"
                : i < idx
                  ? "w-3 bg-primary/40 hover:bg-primary/60"
                  : "w-3 bg-muted-foreground/20 hover:bg-muted-foreground/40",
            )}
          />
        ))}
      </div>

      {meta && meta.type === "lessonMeta" && (
        <div className="mb-4">
          <LessonMetaBar
            audioUrl={meta.audioUrl}
            audioDurationSec={meta.audioDurationSec}
            audioChapters={meta.audioChapters}
            notesPdfUrl={meta.notesPdfUrl}
            notesByline={meta.notesByline}
          />
        </div>
      )}

      {/* Section label + controls row */}
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {idx + 1} / {total}
        </span>
        <span className="font-medium">{section.title}</span>
        {/* Global sound mute toggle */}
        <button
          type="button"
          onClick={() => setSoundMuted((m) => !m)}
          aria-label={soundMuted ? "Unmute game sounds" : "Mute game sounds"}
          className="rounded-full p-1 hover:bg-muted transition-colors"
        >
          {soundMuted
            ? <VolumeX className="h-3.5 w-3.5" />
            : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Player stage + AI launcher */}
      <div className="relative grid flex-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div
          ref={stageRef}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 touch-pan-y"
        >
          <BlockRenderer
            key={section.id}
            blocks={section.blocks}
            lessonId={lessonId}
            savedReflections={savedReflections}
          />
        </div>

        {/* AI launcher — desktop pillar */}
        <button
          type="button"
          onClick={() => setTutorOpen(true)}
          className="group hidden lg:flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-5 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          aria-label="Open Atlas, your AI tutor"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md ring-4 ring-primary/15 transition-transform group-hover:scale-110">
            <Sparkles className="h-6 w-6" />
          </span>
          <span className="max-w-[80px] text-center leading-tight">Ask Atlas</span>
        </button>
      </div>

      {/* Prev / Next */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => go(-1)}
          disabled={idx === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        {nextSection ? (
          <Button type="button" onClick={() => go(1)} className="gap-1.5">
            <span className="hidden sm:inline">Next:</span> {nextSection.title}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-xs italic text-muted-foreground">
            End of lesson — complete below.
          </span>
        )}
      </div>

      {idx === total - 1 && footer && <div className="mt-6">{footer}</div>}

      {/* Mobile AI FAB */}
      <button
        type="button"
        onClick={() => setTutorOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-xl ring-4 ring-primary/20 lg:hidden"
        aria-label="Open Atlas, your AI tutor"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* AI tutor drawer */}
      {tutorOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setTutorOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Atlas AI tutor"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-background shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setTutorOpen(false)}
              aria-label="Close tutor"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground/20"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full overflow-hidden p-3">
              <TutorSidebar
                lessonId={lessonId}
                lessonTitle={lessonTitle}
                lessonSummary={lessonSummary}
                pathTitle={pathTitle}
                skillHints={skillHints}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import type { ContentBlock } from "@/lib/content/blocks";
import { BlockRenderer } from "./block-renderer";
import { LessonMetaBar } from "./blocks/lesson-meta-bar";
import { TutorSidebar } from "@/components/tutor/tutor-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

function groupIntoSections(blocks: ContentBlock[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { id: "open", title: "Open", blocks: [] };
  let openCount = 0;

  function commit() {
    if (current.blocks.length > 0) sections.push(current);
  }

  for (const b of blocks) {
    if (b.type === "lessonMeta") continue;

    if (b.type === "heading") {
      commit();
      current = { id: `h-${sections.length}`, title: b.text, blocks: [] };
      continue;
    }
    if (b.type === "fieldNotes") {
      commit();
      current = { id: `fn-${sections.length}`, title: "Field notes from production", blocks: [b] };
      continue;
    }
    if (b.type === "bossBattle") {
      commit();
      current = { id: `bb-${sections.length}`, title: b.title || "Boss battle", blocks: [b] };
      continue;
    }
    if (b.type === "keyTakeaways") {
      commit();
      current = { id: `kt-${sections.length}`, title: "Wrap up", blocks: [b] };
      continue;
    }

    if (current.blocks.length === 0 && current.id === "open") openCount++;
    current.blocks.push(b);
  }
  commit();

  // Adopt a friendlier title for the very first section if it stayed "Open".
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
  /** What renders below the last section — typically the next/prev nav card. */
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
  const stageRef = useRef<HTMLDivElement>(null);
  const total = sections.length;
  const safeIdx = Math.min(idx, total - 1);
  const section = sections[safeIdx]!;
  const nextSection = sections[safeIdx + 1];

  // When the active section changes, reset the stage scroll to the top so
  // long sections don't open mid-way through.
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
    setIdx((i) => Math.max(0, Math.min(total - 1, i + delta)));
  }

  return (
    <div className="relative">
      {meta && meta.type === "lessonMeta" && (
        <div className="mb-6">
          <LessonMetaBar
            audioUrl={meta.audioUrl}
            audioDurationSec={meta.audioDurationSec}
            audioChapters={meta.audioChapters}
            notesPdfUrl={meta.notesPdfUrl}
            notesByline={meta.notesByline}
          />
        </div>
      )}

      {/* Section progress dots */}
      <div className="mb-4 flex items-center justify-center gap-1.5">
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

      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Section {idx + 1} of {total}
        </span>
        <span className="font-medium">{section.title}</span>
      </div>

      {/* Player stage — center column. The AI launcher floats off to the right. */}
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div
          ref={stageRef}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <BlockRenderer
            key={section.id}
            blocks={section.blocks}
            lessonId={lessonId}
            savedReflections={savedReflections}
          />
        </div>

        {/* AI launcher — big icon on the right. Opens the sidebar drawer. */}
        <button
          type="button"
          onClick={() => setTutorOpen(true)}
          className="group hidden lg:flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-5 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          aria-label="Open Atlas, your AI tutor"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md ring-4 ring-primary/15 transition-transform group-hover:scale-110">
            <Sparkles className="h-6 w-6" />
          </span>
          <span className="leading-tight text-center max-w-[80px]">Ask Atlas</span>
        </button>
      </div>

      {/* Mobile launcher: floating action button */}
      <button
        type="button"
        onClick={() => setTutorOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-xl ring-4 ring-primary/20 lg:hidden"
        aria-label="Open Atlas, your AI tutor"
      >
        <Sparkles className="h-6 w-6" />
      </button>

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
          Previous
        </Button>
        {nextSection ? (
          <Button type="button" onClick={() => go(1)} className="gap-1.5">
            Next: {nextSection.title}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-xs italic text-muted-foreground">
            End of lesson — complete below.
          </span>
        )}
      </div>

      {idx === total - 1 && footer && <div className="mt-6">{footer}</div>}

      {/* AI tutor drawer — slides in from the right */}
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

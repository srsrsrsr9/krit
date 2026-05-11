"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { useGameSound } from "@/hooks/use-game-sound";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Lightbulb, Info, AlertTriangle, PartyPopper, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/lib/content/blocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { AnimatedTimelineBlock } from "./blocks/animated-timeline-block";
import { SortableStepsBlock } from "./blocks/sortable-steps-block";
import { JoinExplorerBlock } from "./blocks/join-explorer-block";
import { SvgFigureBlock } from "./blocks/svg-figure-block";
import { CulturalAsideBlock } from "./blocks/cultural-aside-block";
import { EmbedAnimationBlock } from "./blocks/embed-animation-block";
import { ChatScenarioBlock } from "./blocks/chat-scenario-block";
import { LessonMetaBar } from "./blocks/lesson-meta-bar";
import { BossBattleBlock } from "./blocks/boss-battle-block";
import { FieldNotesBlock } from "./blocks/field-notes-block";
import { HotspotRevealBlock } from "./blocks/hotspot-reveal-block";
import { RevealCardBlock } from "./blocks/reveal-card-block";
import { TimedChallengeBlock } from "./blocks/timed-challenge-block";
import { DragClassifyBlock } from "./blocks/drag-classify-block";
import { ComicStripBlock } from "./blocks/comic-strip-block";
import { PanelComicBlock } from "./blocks/panel-comic-block";
import { ScaleSliderBlock } from "./blocks/scale-slider-block";
import { CardSwipeBlock } from "./blocks/card-swipe-block";
import { HandsOnBlock } from "./blocks/hands-on-block";

// Heavy new blocks — lazy-loaded to keep initial bundle slim.
const BranchScenarioBlock = dynamic(
  () => import("./blocks/branch-scenario-block").then((m) => m.BranchScenarioBlock),
  { ssr: false, loading: () => <div className="h-48 w-full rounded-xl border border-border bg-card" /> },
);
const SkillProofBlock = dynamic(
  () => import("./blocks/skill-proof-block").then((m) => m.SkillProofBlock),
  { ssr: false, loading: () => <div className="h-32 w-full rounded-xl border border-border bg-card" /> },
);

// Lazy-load the heavy ones — Remotion + alasql shouldn't sit in the
// initial lesson page bundle.
const RemotionPlayerBlock = dynamic(
  () => import("./blocks/remotion-player-block").then((m) => m.RemotionPlayerBlock),
  { ssr: false, loading: () => <div className="aspect-video w-full rounded-lg border border-border bg-card" /> },
);
const SqlPlaygroundBlock = dynamic(
  () => import("./blocks/sql-playground-block").then((m) => m.SqlPlaygroundBlock),
  { ssr: false, loading: () => <div className="h-48 w-full rounded-lg border border-border bg-card" /> },
);

export function BlockRenderer({
  blocks,
  lessonId,
  savedReflections,
}: {
  blocks: ContentBlock[];
  lessonId?: string;
  savedReflections?: Record<string, string>;
}) {
  // Extract the (at most one) lessonMeta block; render its bar above the
  // rest. Renders nothing if the lesson didn't include one.
  const meta = blocks.find((b) => b.type === "lessonMeta");
  const rest = blocks.filter((b) => b.type !== "lessonMeta");
  return (
    <div className="prose-krit space-y-6">
      {meta && meta.type === "lessonMeta" && (
        <LessonMetaBar
          audioUrl={meta.audioUrl}
          audioDurationSec={meta.audioDurationSec}
          audioChapters={meta.audioChapters}
          notesPdfUrl={meta.notesPdfUrl}
          notesByline={meta.notesByline}
        />
      )}
      {rest.map((b, i) => (
        <BlockOne key={i} block={b} lessonId={lessonId} savedReflections={savedReflections ?? {}} />
      ))}
    </div>
  );
}

function BlockOne({
  block,
  lessonId,
  savedReflections,
}: {
  block: ContentBlock;
  lessonId?: string;
  savedReflections: Record<string, string>;
}) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3";
      return <Tag className="font-display tracking-tight">{block.text}</Tag>;
    }
    case "markdown":
      return <Markdown md={block.md} />;
    case "callout":
      return <Callout tone={block.tone} title={block.title} md={block.md} />;
    case "code":
      return (
        <figure className="not-prose">
          <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 text-sm">
            <code>{block.code}</code>
          </pre>
          {block.caption && <figcaption className="mt-2 text-xs text-muted-foreground">{block.caption}</figcaption>}
        </figure>
      );
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.src} alt={block.alt} className="rounded-lg border border-border" />;
    case "video":
      return <VideoEmbed block={block} />;
    case "quiz":
      return <InlineQuiz block={block} />;
    case "reflect":
      return <Reflect prompt={block.prompt} lessonId={lessonId} initial={savedReflections[block.prompt.slice(0, 200)] ?? ""} />;
    case "keyTakeaways":
      return <KeyTakeaways points={block.points} />;
    case "tryIt":
      return <TryIt block={block} />;
    case "remotion":
      return (
        <RemotionPlayerBlock
          composition={block.composition}
          durationFrames={block.durationFrames}
          fps={block.fps}
          width={block.width}
          height={block.height}
          caption={block.caption}
          inputProps={block.props}
        />
      );
    case "animatedTimeline":
      return <AnimatedTimelineBlock title={block.title} steps={block.steps} />;
    case "sortableSteps":
      return <SortableStepsBlock prompt={block.prompt} items={block.items} hint={block.hint} />;
    case "joinExplorer":
      return <JoinExplorerBlock prompt={block.prompt} left={block.left} right={block.right} />;
    case "sqlPlayground":
      return <SqlPlaygroundBlock prompt={block.prompt} tables={block.tables} starter={block.starter} expected={block.expected} hint={block.hint} />;
    case "svgFigure":
      return <SvgFigureBlock svg={block.svg} alt={block.alt} caption={block.caption} maxWidth={block.maxWidth} />;
    case "culturalAside":
      return <CulturalAsideBlock defaultLocale={block.defaultLocale} variants={block.variants} />;
    case "embedAnimation":
      return <EmbedAnimationBlock src={block.src} height={block.height} caption={block.caption} fallbackImage={block.fallbackImage} audioSrc={block.audioSrc} />;
    case "chatScenario":
      return <ChatScenarioBlock coach={block.coach} intro={block.intro} buckets={block.buckets} scenarios={block.scenarios} />;
    case "lessonMeta":
      // Already extracted at the top of BlockRenderer; render nothing inline.
      return null;
    case "bossBattle":
      return <BossBattleBlock title={block.title} setup={block.setup} coach={block.coach} stages={block.stages} outcomes={block.outcomes} />;
    case "fieldNotes":
      return <FieldNotesBlock title={block.title} source={block.source} date={block.date} story={block.story} takeaway={block.takeaway} />;
    case "hotspotReveal":
      return <HotspotRevealBlock src={block.src} alt={block.alt} width={block.width} height={block.height} hotspots={block.hotspots} caption={block.caption} />;
    case "timedChallenge":
      return <TimedChallengeBlock prompt={block.prompt} choices={block.choices} timeLimitSec={block.timeLimitSec} fastSec={block.fastSec} fullPoints={block.fullPoints} partialPoints={block.partialPoints} />;
    case "branchScenario":
      return <BranchScenarioBlock title={block.title} startNodeId={block.startNodeId} nodes={block.nodes} />;
    case "revealCard":
      return <RevealCardBlock front={block.front} back={block.back} hint={block.hint} />;
    case "skillProof":
      return <SkillProofBlock skill={block.skill} instruction={block.instruction} choices={block.choices} starter={block.starter} evalPattern={block.evalPattern} referenceAnswer={block.referenceAnswer} badgeLabel={block.badgeLabel} lang={block.lang} />;
    case "dragClassify":
      return <DragClassifyBlock prompt={block.prompt} bins={block.bins} items={block.items} />;
    case "comicStrip":
      return <ComicStripBlock title={block.title} frames={block.frames} />;
    case "panelComic":
      return <PanelComicBlock title={block.title} panels={block.panels} />;
    case "scaleSlider":
      return (
        <ScaleSliderBlock
          prompt={block.prompt}
          min={block.min}
          max={block.max}
          step={block.step}
          startValue={block.startValue}
          leftLabel={block.leftLabel}
          rightLabel={block.rightLabel}
          unit={block.unit}
          bands={block.bands}
        />
      );
    case "cardSwipe":
      return (
        <CardSwipeBlock
          prompt={block.prompt}
          leftLabel={block.leftLabel}
          rightLabel={block.rightLabel}
          cards={block.cards}
        />
      );
    case "handsOn":
      return (
        <HandsOnBlock
          title={block.title}
          setup={block.setup}
          steps={block.steps}
          verify={block.verify}
        />
      );
  }
}

function Markdown({ md }: { md: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>;
}

const toneClass = {
  info: "border-blue-500/30 bg-blue-500/5 text-foreground",
  tip: "border-accent/30 bg-accent/5 text-foreground",
  warn: "border-amber-500/30 bg-amber-500/5 text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/5 text-foreground",
} as const;
const toneIcon = { info: Info, tip: Lightbulb, warn: AlertTriangle, success: PartyPopper };

function Callout({ tone, title, md }: { tone: "info" | "tip" | "warn" | "success"; title?: string; md: string }) {
  const Icon = toneIcon[tone];
  return (
    <div className={cn("not-prose rounded-lg border p-4", toneClass[tone])}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" />
        {title ?? tone[0]!.toUpperCase() + tone.slice(1)}
      </div>
      <div className="prose-krit text-sm">
        <Markdown md={md} />
      </div>
    </div>
  );
}

function VideoEmbed({ block }: { block: Extract<ContentBlock, { type: "video" }> }) {
  const src =
    block.provider === "youtube"
      ? `https://www.youtube.com/embed/${extractYouTubeId(block.src)}`
      : block.provider === "vimeo"
      ? `https://player.vimeo.com/video/${extractVimeoId(block.src)}`
      : block.src;
  if (block.provider === "url") {
    return <video src={src} controls className="w-full rounded-lg border border-border" />;
  }
  return (
    <div className="not-prose aspect-video overflow-hidden rounded-lg border border-border bg-black">
      <iframe src={src} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
    </div>
  );
}
function extractYouTubeId(u: string): string {
  const m = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m?.[1] ?? u;
}
function extractVimeoId(u: string): string {
  const m = u.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? u;
}

function InlineQuiz({ block }: { block: Extract<ContentBlock, { type: "quiz" }> }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const playSound = useGameSound();

  const toggle = (id: string) => {
    if (submitted) return;
    if (block.multi) {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    } else {
      setSelected([id]);
    }
  };

  const correctIds = block.choices.filter((c) => c.correct).map((c) => c.id);
  const isCorrect =
    submitted &&
    correctIds.length === selected.length &&
    correctIds.every((id) => selected.includes(id));

  return (
    <div className="not-prose rounded-lg border border-border bg-card p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check your understanding</div>
      <div className="mb-3 text-sm font-medium">{block.prompt}</div>
      <div className="space-y-2">
        {block.choices.map((c) => {
          const isSelected = selected.includes(c.id);
          const reveal = submitted && (c.correct || isSelected);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40",
                reveal && c.correct && "border-emerald-500/60 bg-emerald-500/10",
                reveal && isSelected && !c.correct && "border-destructive/60 bg-destructive/10",
              )}
              type="button"
            >
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center">
                {reveal && c.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : reveal && isSelected && !c.correct ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <span className={cn("h-3 w-3 rounded-full border", isSelected ? "bg-primary border-primary" : "border-muted-foreground/40")} />
                )}
              </span>
              <span className="flex-1">{c.label}</span>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <Button
          className="mt-4"
          size="sm"
          disabled={selected.length === 0}
          onClick={() => {
            const isRight =
              correctIds.length === selected.length &&
              correctIds.every((id) => selected.includes(id));
            setSubmitted(true);
            playSound(isRight ? "correct" : "wrong");
          }}
          type="button"
        >
          Check answer
        </Button>
      ) : (
        <div className="mt-4 space-y-2">
          <div className={cn("text-sm font-medium", isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
            {isCorrect ? "Correct." : "Not quite — review the explanation."}
          </div>
          {block.choices
            .filter((c) => c.explain && (c.correct || selected.includes(c.id)))
            .map((c) => (
              <div key={c.id} className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">{c.label}:</strong> {c.explain}
              </div>
            ))}
          <Button variant="ghost" size="sm" onClick={() => { setSubmitted(false); setSelected([]); }} type="button">
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

function Reflect({ prompt, lessonId, initial }: { prompt: string; lessonId?: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(initial ? "saved" : "idle");
  const dirty = value !== initial && status !== "saving";

  async function save() {
    if (!lessonId) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, prompt, content: value }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="not-prose rounded-lg border border-dashed border-border bg-muted/30 p-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reflect</div>
      <div className="mb-3 text-sm">{prompt}</div>
      <Textarea value={value} onChange={(e) => { setValue(e.target.value); if (status === "saved") setStatus("idle"); }} placeholder="Write your thinking…" />
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={status === "saving" || (!dirty && status === "saved")} type="button">
          {status === "saving" ? "Saving…" : status === "saved" && !dirty ? "Saved" : "Save"}
        </Button>
        {status === "error" && <span className="text-xs text-destructive">Couldn't save — try again.</span>}
        {status === "saved" && !dirty && <span className="text-xs text-muted-foreground">Saved to your profile</span>}
      </div>
    </div>
  );
}

function KeyTakeaways({ points }: { points: string[] }) {
  function shareToWhatsApp() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const lines = points.map((p) => "• " + p).join("\n");
    const text = `The 30-Minute Trap — a Krit lesson:\n\n${lines}\n\nFull lesson: ${url}`;
    const encoded = encodeURIComponent(text);
    // Native share if available (iOS / Android share sheets), else WhatsApp deeplink.
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: "The 30-Minute Trap", text }).catch(() => {
        window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
      });
    } else {
      window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="not-prose rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
        <Lightbulb className="h-4 w-4" />
        Take these home
      </div>
      <ul className="space-y-2.5 text-sm">
        {points.map((p, i) => (
          <TakeawayLine key={i} text={p} index={i} />
        ))}
      </ul>

      <button
        type="button"
        onClick={shareToWhatsApp}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <WhatsAppIcon />
        Share to WhatsApp
      </button>
      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-amber-700/60">
        Send these takeaways to a teammate
      </p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1.1 2.8 1.2 3c.1.2 2.1 3.2 5.2 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4Zm-5.4 7.4c-1.7 0-3.4-.5-4.9-1.3l-3.5.9.9-3.4c-.9-1.5-1.4-3.3-1.4-5 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.7 9.8Zm0-21.4c-6.4 0-11.6 5.2-11.6 11.6 0 2 .5 4 1.5 5.7l-1.6 5.9 6-1.6c1.7.9 3.6 1.4 5.6 1.4 6.4 0 11.6-5.2 11.6-11.6S18.5.4 12.1.4Z" />
    </svg>
  );
}

function TakeawayLine({ text, index }: { text: string; index: number }) {
  // Each takeaway gets a tiny cartoon mark, varied by index for visual rhythm.
  const marks = ["🌱", "⚡", "🛡", "🔁"];
  const mark = marks[index % marks.length]!;
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + index * 0.18, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex items-start gap-3 rounded-lg bg-white/60 px-3 py-2.5"
    >
      <motion.span
        initial={{ rotate: -10, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.18 + index * 0.18, duration: 0.4, type: "spring" }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-base"
        aria-hidden
      >
        {mark}
      </motion.span>
      <span className="leading-snug">{text}</span>
    </motion.li>
  );
}

function TryIt({ block }: { block: Extract<ContentBlock, { type: "tryIt" }> }) {
  const [v, setV] = useState(block.starter ?? "");
  const [showExpected, setShowExpected] = useState(false);
  return (
    <div className="not-prose rounded-lg border border-accent/40 bg-accent/5 p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
        <PlayCircle className="h-4 w-4" /> Try it
      </div>
      <div className="mb-3 text-sm">{block.instruction}</div>
      <Textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="font-mono text-xs"
        spellCheck={false}
        rows={6}
        data-lang={block.lang ?? "sql"}
      />
      {block.expected && (
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={() => setShowExpected((s) => !s)} type="button">
            {showExpected ? "Hide" : "Show"} a reference solution
          </Button>
          {showExpected && (
            <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-card p-3 text-xs">
              <code>{block.expected}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

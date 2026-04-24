"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, XCircle, Lightbulb, Info, AlertTriangle, PartyPopper, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/lib/content/blocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-krit space-y-6">
      {blocks.map((b, i) => (
        <BlockOne key={i} block={b} />
      ))}
    </div>
  );
}

function BlockOne({ block }: { block: ContentBlock }) {
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
      return <Reflect prompt={block.prompt} />;
    case "keyTakeaways":
      return <KeyTakeaways points={block.points} />;
    case "tryIt":
      return <TryIt block={block} />;
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
          onClick={() => setSubmitted(true)}
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

function Reflect({ prompt }: { prompt: string }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div className="not-prose rounded-lg border border-dashed border-border bg-muted/30 p-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reflect</div>
      <div className="mb-3 text-sm">{prompt}</div>
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Write your thinking…" />
      <Button size="sm" className="mt-3" onClick={() => setSaved(true)} type="button">
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

function KeyTakeaways({ points }: { points: string[] }) {
  return (
    <div className="not-prose rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="h-4 w-4 text-primary" />
        Key takeaways
      </div>
      <ul className="space-y-2 text-sm">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
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

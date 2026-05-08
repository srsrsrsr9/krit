"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Hotspot {
  id: string;
  xPct: number;
  yPct: number;
  label: string;
  body: string;
}
export interface HotspotRevealBlockProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  hotspots: Hotspot[];
  caption?: string;
}

export function HotspotRevealBlock({ src, alt, hotspots, caption }: HotspotRevealBlockProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playSound = useGameSound();

  const active = hotspots.find((h) => h.id === activeId) ?? null;

  function toggle(id: string) {
    const next = activeId === id ? null : id;
    setActiveId(next);
    if (next) playSound("click");
  }

  // Close on outside click.
  useEffect(() => {
    if (!activeId) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveId(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [activeId]);

  return (
    <figure className="not-prose space-y-2">
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-auto w-full" draggable={false} />

        {hotspots.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => toggle(h.id)}
            aria-haspopup="dialog"
            aria-expanded={activeId === h.id}
            aria-label={h.label}
            className={cn(
              "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg transition-transform",
              activeId === h.id
                ? "scale-125 bg-primary ring-4 ring-primary/30"
                : "bg-primary/80 hover:scale-110",
            )}
            style={{ left: `${h.xPct}%`, top: `${h.yPct}%` }}
          >
            {hotspots.indexOf(h) + 1}
          </button>
        ))}

        {active && (
          <div
            role="dialog"
            aria-label={active.label}
            className="absolute bottom-3 left-3 right-3 rounded-xl border border-primary/30 bg-background/95 p-4 shadow-xl backdrop-blur-sm"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{active.label}</span>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Close"
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="prose-krit prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.body}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-xs italic text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

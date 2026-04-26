"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Play } from "lucide-react";
import { COMPOSITIONS } from "@/remotion";

/**
 * Renders a Remotion composition inline. The Player is dynamically
 * imported so the heavy Remotion runtime doesn't bloat the initial
 * lesson page bundle.
 */

const Player = dynamic(() => import("@remotion/player").then((m) => m.Player), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
      Loading animation…
    </div>
  ),
});

export interface RemotionPlayerBlockProps {
  composition: keyof typeof COMPOSITIONS;
  durationFrames: number;
  fps: number;
  width: number;
  height: number;
  caption?: string;
  inputProps: Record<string, unknown>;
}

export function RemotionPlayerBlock({
  composition,
  durationFrames,
  fps,
  width,
  height,
  caption,
  inputProps,
}: RemotionPlayerBlockProps) {
  const def = COMPOSITIONS[composition];
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoplayed, setAutoplayed] = useState(false);
  const playerRef = useRef<{ play: () => void; pause: () => void } | null>(null);

  // Auto-play once the player scrolls into view (better than autoPlay
  // which trips browser policies).
  useEffect(() => {
    if (autoplayed) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !autoplayed) {
            setAutoplayed(true);
            playerRef.current?.play();
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [autoplayed]);

  if (!def) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Unknown composition: {composition}
      </div>
    );
  }

  return (
    <figure ref={containerRef} className="not-prose">
      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <Player
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={playerRef as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          component={def.Component as any}
          durationInFrames={durationFrames}
          fps={fps}
          compositionWidth={width}
          compositionHeight={height}
          inputProps={inputProps}
          controls
          loop
          clickToPlay
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Play className="h-3 w-3" />
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

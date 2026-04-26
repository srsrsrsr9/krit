"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Play } from "lucide-react";
import { COMPOSITIONS } from "@/remotion";

/**
 * Renders a Remotion composition inline. The whole module is already
 * dynamic-imported (ssr:false) at the renderer level, so we import
 * Player directly here — no need for a second dynamic boundary.
 *
 * Aspect-ratio is enforced via CSS so the Player container never
 * collapses to 0 height, which is the default failure mode.
 */

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
  const playerRef = useRef<PlayerRef>(null);
  const [autoplayed, setAutoplayed] = useState(false);

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
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-black"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Player
          ref={playerRef}
          component={def.Component}
          durationInFrames={durationFrames}
          fps={fps}
          compositionWidth={width}
          compositionHeight={height}
          inputProps={inputProps}
          controls
          loop
          clickToPlay
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
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

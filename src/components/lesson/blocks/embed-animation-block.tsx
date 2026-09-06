"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmbedAnimationBlockProps {
  src: string;
  height?: number;
  caption?: string;
  fallbackImage?: string;
  /** Optional narration audio file (mp3) to play in sync with the animation. */
  audioSrc?: string;
}

export function EmbedAnimationBlock({ src, height = 420, caption, fallbackImage, audioSrc }: EmbedAnimationBlockProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [bust, setBust] = useState(0);
  const [errored, setErrored] = useState(false);

  // Anim-lab embeds (with a deep-link hash and no narration) auto-activate
  // in solo mode — no Play overlay needed. For audio-narrated embeds we still
  // need the user gesture to unlock the AudioContext.
  const isAnimLab = /\/anim-lab\//.test(src) && /#L/.test(src);
  const needsGesture = !!audioSrc && !isAnimLab;
  const [started, setStarted] = useState(!needsGesture);
  const [muted, setMuted] = useState(false);
  const [autoHeight, setAutoHeight] = useState<number | null>(null);

  useEffect(() => { setErrored(false); }, [src, bust]);

  // Reset audio + the start-overlay whenever the animation is replayed.
  useEffect(() => {
    setStarted(!needsGesture);
    setAutoHeight(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [bust, needsGesture]);

  // Listen for height postMessages from anim-lab solo mode so the iframe
  // resizes to fit its content instead of clipping or wasting space.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data;
      if (data?.type === "krit:anim-lab:height" && typeof data.h === "number") {
        // Clamp 380-900 to avoid runaway and respect the spec's stage range.
        const clamped = Math.max(380, Math.min(900, Math.round(data.h)));
        setAutoHeight(clamped);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const url = `${src}${src.includes("?") ? "&" : "?"}v=${bust}`;
  const renderedHeight = autoHeight ?? height;

  function handleStart() {
    setStarted(true);
    if (audioSrc && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.muted = muted;
      void audioRef.current.play().catch(() => undefined);
    }
    // Tell self-contained iframe animations (Web Audio inside) that the user
    // gesture happened — they can unlock their AudioContext + restart visuals.
    iframeRef.current?.contentWindow?.postMessage({ type: "krit:start" }, "*");
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  }

  return (
    <figure className="not-prose space-y-2">
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[height] duration-200"
        style={{ height: `${renderedHeight}px` }}
      >
        {errored ? (
          fallbackImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fallbackImage} alt={caption ?? "Animation poster"} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Animation unavailable. The HTML file may not have been uploaded yet.
            </div>
          )
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            sandbox="allow-scripts allow-same-origin allow-modals allow-popups-to-escape-sandbox"
            loading="lazy"
            className="h-full w-full"
            onError={() => setErrored(true)}
            title={caption ?? "Embedded animation"}
          />
        )}
        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="none"
            onEnded={() => undefined}
          />
        )}
        {!started && !errored && needsGesture && (
          <button
            type="button"
            onClick={handleStart}
            className="group absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-[2px] transition-colors hover:bg-foreground/20"
            aria-label={audioSrc ? "Play animation with narration" : "Play animation"}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/30 transition-transform group-hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
            </span>
            {audioSrc && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-3 py-1 text-[11px] font-medium text-background">
                Tap for narrated walkthrough
              </span>
            )}
          </button>
        )}
        <div className="absolute right-2 top-2 flex gap-1 opacity-70 transition-opacity hover:opacity-100">
          {audioSrc && started && (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={toggleMute}
              aria-label={muted ? "Unmute narration" : "Mute narration"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={() => setBust((b) => b + 1)}
            aria-label="Restart animation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {caption && (
        <figcaption className="text-center text-xs italic text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

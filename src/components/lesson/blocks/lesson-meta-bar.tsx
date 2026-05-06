"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, Download, Volume2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Chapter {
  startSec: number;
  label: string;
}
export interface LessonMetaBarProps {
  audioUrl?: string;
  audioDurationSec?: number;
  audioChapters?: Chapter[];
  notesPdfUrl?: string;
  notesByline?: string;
}

function fmt(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LessonMetaBar({
  audioUrl,
  audioDurationSec,
  audioChapters,
  notesPdfUrl,
  notesByline,
}: LessonMetaBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const [duration, setDuration] = useState(audioDurationSec ?? 0);
  const [audioMissing, setAudioMissing] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setNow(a.currentTime);
    const onDur = () => setDuration(a.duration || audioDurationSec || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onErr = () => setAudioMissing(true);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onErr);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onErr);
    };
  }, [audioDurationSec, audioUrl]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setAudioMissing(true));
    else a.pause();
  }
  function jumpTo(s: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = s;
    if (a.paused) a.play().catch(() => setAudioMissing(true));
  }

  if (!audioUrl && !notesPdfUrl) return null;

  const pct = duration > 0 ? (now / duration) * 100 : 0;

  return (
    <div className="not-prose mb-2 rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex flex-wrap items-center gap-3">
        {audioUrl && (
          <div className="flex flex-1 items-center gap-3 min-w-[260px]">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <Button
              type="button"
              size="icon"
              onClick={toggle}
              disabled={audioMissing}
              className="h-10 w-10 rounded-full shrink-0"
              aria-label={playing ? "Pause narration" : "Play narration"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Volume2 className="h-3.5 w-3.5" />
                <span className="font-medium">Listen to this lesson</span>
                {audioMissing && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                    audio not uploaded yet
                  </span>
                )}
                <span className="ml-auto font-mono">
                  {fmt(now)} / {fmt(duration)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {notesPdfUrl && (
          <Button asChild type="button" size="sm" variant="outline" className="gap-1.5">
            <a href={notesPdfUrl} download>
              <FileDown className="h-3.5 w-3.5" />
              Download notes
              {notesByline && <span className="text-xs text-muted-foreground hidden sm:inline">— {notesByline}</span>}
            </a>
          </Button>
        )}
      </div>
      {audioUrl && audioChapters && audioChapters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {audioChapters.map((ch, i) => {
            const active = now >= ch.startSec && (i === audioChapters.length - 1 || now < (audioChapters[i + 1]?.startSec ?? Infinity));
            return (
              <button
                key={i}
                type="button"
                onClick={() => jumpTo(ch.startSec)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
                title={`Jump to ${fmt(ch.startSec)}`}
              >
                <SkipForward className="h-3 w-3" />
                <span className="font-mono">{fmt(ch.startSec)}</span>
                <span>·</span>
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

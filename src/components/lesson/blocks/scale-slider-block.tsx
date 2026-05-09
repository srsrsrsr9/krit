"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, GaugeCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Band {
  lo: number;
  hi: number;
  title: string;
  body: string;
  tone: "bad" | "okay" | "good";
}
export interface ScaleSliderBlockProps {
  prompt: string;
  min?: number;
  max?: number;
  step?: number;
  startValue?: number;
  leftLabel: string;
  rightLabel: string;
  unit?: string;
  bands: Band[];
}

const TONE_BG: Record<Band["tone"], string> = {
  bad: "border-rose-400 bg-rose-50",
  okay: "border-amber-400 bg-amber-50",
  good: "border-emerald-400 bg-emerald-50",
};
const TONE_LABEL: Record<Band["tone"], string> = {
  bad: "Risky territory",
  okay: "Productive zone",
  good: "Well calibrated",
};
const TONE_KICKER: Record<Band["tone"], string> = {
  bad: "text-rose-700",
  okay: "text-amber-700",
  good: "text-emerald-700",
};

export function ScaleSliderBlock({
  prompt,
  min = 0,
  max = 100,
  step = 5,
  startValue = 50,
  leftLabel,
  rightLabel,
  unit,
  bands,
}: ScaleSliderBlockProps) {
  const [value, setValue] = useState(startValue);
  const [locked, setLocked] = useState(false);
  const playSound = useGameSound();

  const band = useMemo(
    () => bands.find((b) => value >= b.lo && value <= b.hi) ?? bands[bands.length - 1]!,
    [value, bands],
  );

  const pct = ((value - min) / (max - min)) * 100;

  function lockIn() {
    setLocked(true);
    playSound(band.tone === "good" ? "achievement" : band.tone === "bad" ? "wrong" : "click");
  }
  function reset() {
    setLocked(false);
    setValue(startValue);
  }

  return (
    <div className="not-prose">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">
          <GaugeCircle className="h-3.5 w-3.5" /> Scale · pick where you land
        </span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {locked ? "LOCKED" : "DRAG"}
        </span>
      </div>

      <p className="mb-5 text-base font-semibold leading-snug">{prompt}</p>

      {/* Big readout */}
      <div className="mb-3 flex items-baseline justify-center gap-1.5">
        <motion.span
          key={value}
          initial={{ scale: 1.15, color: "#f59e0b" }}
          animate={{ scale: 1, color: "#0f172a" }}
          transition={{ duration: 0.18 }}
          className="font-display text-5xl font-black leading-none tracking-tight"
        >
          {value}
        </motion.span>
        {unit && <span className="font-mono text-sm text-muted-foreground">{unit}</span>}
      </div>

      {/* Slider track */}
      <div className="relative pt-1">
        {/* Banded gradient under the slider */}
        <div
          className="absolute inset-x-0 top-2 h-2 overflow-hidden rounded-full"
          aria-hidden
        >
          <div className="h-full w-full bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-300" />
        </div>
        {/* Tick marker */}
        <div
          className="absolute top-0 h-6 w-[3px] rounded-full bg-slate-900 shadow-md"
          style={{ left: `calc(${pct}% - 1.5px)` }}
          aria-hidden
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={locked}
          onChange={(e) => setValue(Number(e.target.value))}
          className="relative z-10 w-full appearance-none bg-transparent accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
          aria-label={prompt}
        />

        {/* Anchor labels */}
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span>← {leftLabel}</span>
          <span>{rightLabel} →</span>
        </div>
      </div>

      {/* Action */}
      {!locked ? (
        <Button size="sm" onClick={lockIn} className="mt-5 w-full gap-1.5" type="button">
          <Sparkles className="h-3.5 w-3.5" /> Lock in {value}{unit ? ` ${unit}` : ""}
        </Button>
      ) : (
        <AnimatePresence>
          <motion.div
            key="band"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className={cn("mt-5 rounded-xl border-2 p-4 text-sm", TONE_BG[band.tone])}
          >
            <div className={cn("mb-1 text-[10px] font-bold uppercase tracking-[0.18em]", TONE_KICKER[band.tone])}>
              {TONE_LABEL[band.tone]} · {band.lo}–{band.hi}{unit ? ` ${unit}` : ""}
            </div>
            <div className="mb-1 font-display text-base font-bold leading-tight">{band.title}</div>
            <p className="text-sm leading-snug text-slate-700">{band.body}</p>
            <Button size="sm" variant="ghost" onClick={reset} className="mt-3 gap-1" type="button">
              <RotateCcw className="h-3.5 w-3.5" /> Try a different value
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

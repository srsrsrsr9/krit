"use client";

import { useMemo, useState } from "react";
import {
  DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface Bin {
  id: string;
  label: string;
  tone: "safe" | "danger" | "neutral";
  flavor?: string;
}
interface Item {
  id: string;
  label: string;
  correctBinId: string;
  comment?: string;
}
export interface DragClassifyBlockProps {
  prompt: string;
  bins: Bin[];
  items: Item[];
}

type Mood = "idle" | "happy" | "smug";

export function DragClassifyBlock({ prompt, bins, items }: DragClassifyBlockProps) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [moods, setMoods] = useState<Record<string, Mood>>({});
  const playSound = useGameSound();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const remaining = items.filter((i) => !placed[i.id]);
  const total = items.length;
  const correctCount = items.filter((i) => placed[i.id] === i.correctBinId).length;
  const done = remaining.length === 0;

  function setBinMood(binId: string, mood: Mood, ms = 1200) {
    setMoods((m) => ({ ...m, [binId]: mood }));
    setTimeout(() => setMoods((m) => ({ ...m, [binId]: "idle" })), ms);
  }

  function onDragEnd(e: DragEndEvent) {
    const itemId = String(e.active.id);
    const binId = e.over ? String(e.over.id) : null;
    if (!binId) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.correctBinId === binId) {
      setPlaced((p) => ({ ...p, [itemId]: binId }));
      setBinMood(binId, "happy");
      playSound("correct");
    } else {
      setBinMood(binId, "smug");
      setWrongShake(itemId);
      playSound("wrong");
      setTimeout(() => setWrongShake(null), 500);
    }
  }

  function reset() {
    setPlaced({});
    setMoods({});
  }

  return (
    <div className="not-prose">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Drag · sort · learn</span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {correctCount} / {total}
        </span>
      </div>
      <p className="mb-4 text-base font-semibold leading-snug">{prompt}</p>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {/* Bins on TOP — always visible while dragging */}
        <div className="sticky top-0 z-10 -mx-1 mb-3 grid grid-cols-2 gap-2 rounded-xl bg-amber-50/95 p-1.5 backdrop-blur supports-[backdrop-filter]:bg-amber-50/80">
          {bins.map((bin) => {
            const placedItems = items.filter((i) => placed[i.id] === bin.id);
            const mood = moods[bin.id] ?? "idle";
            return (
              <Bin key={bin.id} bin={bin} placedItems={placedItems} mood={mood} />
            );
          })}
        </div>

        {/* Item tray below */}
        <div className="flex min-h-[80px] flex-col gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2 dark:bg-slate-900/30">
          <AnimatePresence>
            {remaining.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                All sorted. Nice work.
              </motion.div>
            ) : (
              remaining.map((it) => (
                <DraggableItem key={it.id} item={it} shake={wrongShake === it.id} />
              ))
            )}
          </AnimatePresence>
        </div>
      </DndContext>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 rounded-xl border p-4 text-sm",
            correctCount === total
              ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
              : "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
          )}
        >
          <div className="font-semibold">
            {correctCount === total
              ? "Clean run. The pattern's now in your bones."
              : `${correctCount}/${total} on the first pass — replay to sharpen.`}
          </div>
          <Button size="sm" variant="ghost" onClick={reset} className="mt-2 gap-1" type="button">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ── Draggable item ──────────────────────────────────────────────────────────

function DraggableItem({ item, shake }: { item: Item; shake: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 as const }
    : undefined;

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      aria-label={item.label}
      style={style}
      animate={shake ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
      transition={shake ? { duration: 0.4 } : { duration: 0 }}
      className={cn(
        "block w-full cursor-grab touch-none select-none rounded-lg border-2 bg-white px-3 py-2 text-left text-[13px] font-medium leading-snug shadow-sm transition-colors",
        isDragging
          ? "scale-[1.03] border-amber-400 shadow-lg cursor-grabbing"
          : "border-slate-300 hover:border-amber-400",
      )}
      {...listeners}
      {...attributes}
    >
      {item.label}
    </motion.button>
  );
}

// ── Bin (drop target) with cartoon mascot ──────────────────────────────────

function Bin({ bin, placedItems, mood }: { bin: Bin; placedItems: Item[]; mood: Mood }) {
  const { isOver, setNodeRef } = useDroppable({ id: bin.id });

  const tonePalette = {
    danger: { ring: "border-rose-300", bg: "bg-rose-50", chip: "bg-rose-100 text-rose-800", over: "border-rose-500 bg-rose-100" },
    safe: { ring: "border-emerald-300", bg: "bg-emerald-50", chip: "bg-emerald-100 text-emerald-800", over: "border-emerald-500 bg-emerald-100" },
    neutral: { ring: "border-slate-300", bg: "bg-slate-50", chip: "bg-slate-100 text-slate-800", over: "border-slate-500 bg-slate-100" },
  } as const;
  const t = tonePalette[bin.tone];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[80px] flex-col rounded-lg border-2 border-dashed p-2 transition-colors",
        isOver ? t.over : `${t.ring} ${t.bg}`,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Mascot tone={bin.tone} mood={mood} />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-none">
            {bin.tone === "danger" ? "Trap" : bin.tone === "safe" ? "Reinvest" : "Bin"}
          </div>
          <div className="text-[12px] font-bold leading-tight truncate">{bin.label}</div>
        </div>
        {placedItems.length > 0 && (
          <span className={cn("flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold", t.chip)}>
            {placedItems.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Cartoon mascots — react to drops ────────────────────────────────────────

function Mascot({ tone, mood }: { tone: "safe" | "danger" | "neutral"; mood: Mood }) {
  if (tone === "danger") return <TrapMascot mood={mood} />;
  if (tone === "safe") return <SeedlingMascot mood={mood} />;
  return <NeutralMascot mood={mood} />;
}

function TrapMascot({ mood }: { mood: Mood }) {
  return (
    <motion.svg
      viewBox="0 0 48 40"
      width="40"
      height="34"
      animate={mood === "smug" ? { rotate: [0, -8, 8, -4, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
      aria-hidden
    >
      {/* mouth */}
      <ellipse cx="24" cy="32" rx="20" ry="6" fill="#1f2937" />
      <ellipse cx="24" cy="32" rx="14" ry={mood === "smug" ? 8 : 4} fill="#0b0d10">
        <animate attributeName="ry" values="4;8;4" dur="1.4s" repeatCount="indefinite" />
      </ellipse>
      {/* eyes */}
      <g>
        <circle cx="14" cy="14" r="6" fill="#fffaf0" stroke="#1f2937" strokeWidth="1" />
        <circle cx="34" cy="14" r="6" fill="#fffaf0" stroke="#1f2937" strokeWidth="1" />
        <circle cx={mood === "smug" ? 16 : 14} cy={mood === "smug" ? 12 : 14} r="2.4" fill="#1f2937" />
        <circle cx={mood === "smug" ? 36 : 34} cy={mood === "smug" ? 12 : 14} r="2.4" fill="#1f2937" />
      </g>
      {/* tiny tie */}
      <path d="M22 22 L26 22 L28 26 L24 36 L20 26 Z" fill="#8b5cf6" />
    </motion.svg>
  );
}

function SeedlingMascot({ mood }: { mood: Mood }) {
  const happy = mood === "happy";
  return (
    <motion.svg
      viewBox="0 0 48 40"
      width="40"
      height="34"
      animate={happy ? { y: [0, -4, 0] } : { y: 0 }}
      transition={{ duration: 0.5 }}
      aria-hidden
    >
      {/* pot */}
      <path d="M14 24 L34 24 L31 36 L17 36 Z" fill="#a16207" />
      <ellipse cx="24" cy="24" rx="10" ry="2" fill="#92400e" />
      {/* stem */}
      <line x1="24" y1="24" x2="24" y2="14" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      {/* leaves — perk up when happy */}
      <ellipse cx="18" cy="16" rx={happy ? 7 : 5} ry={happy ? 4 : 3} fill="#10b981" transform={`rotate(-30 18 16)`} />
      <ellipse cx="30" cy={happy ? 10 : 14} rx={happy ? 7 : 5} ry={happy ? 4 : 3} fill="#10b981" transform={`rotate(30 30 ${happy ? 10 : 14})`} />
      {/* tiny smile when happy */}
      {happy && <path d="M21 18 Q24 21 27 18" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
      {/* eyes */}
      <circle cx="22" cy="17" r="1" fill="#1f2937" />
      <circle cx="26" cy="17" r="1" fill="#1f2937" />
    </motion.svg>
  );
}

function NeutralMascot({ mood }: { mood: Mood }) {
  return (
    <motion.div
      animate={mood === "happy" ? { scale: [1, 1.2, 1] } : mood === "smug" ? { rotate: [0, -8, 8, 0] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-base"
      aria-hidden
    >
      {mood === "happy" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
       mood === "smug"  ? <XCircle className="h-5 w-5 text-rose-500" /> :
                          <Sparkles className="h-5 w-5 text-slate-500" />}
    </motion.div>
  );
}

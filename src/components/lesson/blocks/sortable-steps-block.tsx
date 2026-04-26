"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, GripVertical, RotateCcw, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SortableStepsBlockProps {
  prompt: string;
  items: { id: string; label: string; detail?: string }[];
  hint?: string;
}

export function SortableStepsBlock({ prompt, items, hint }: SortableStepsBlockProps) {
  const correctIds = useMemo(() => items.map((i) => i.id), [items]);
  // Shuffle on mount, deterministically per refresh.
  const [order, setOrder] = useState<string[]>(() => shuffle([...correctIds]));
  const [checked, setChecked] = useState<null | "right" | "wrong">(null);
  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((cur) => arrayMove(cur, cur.indexOf(String(active.id)), cur.indexOf(String(over.id))));
    setChecked(null);
  }

  function check() {
    const right = order.every((id, i) => id === correctIds[i]);
    setChecked(right ? "right" : "wrong");
  }
  function reset() {
    setOrder(shuffle([...correctIds]));
    setChecked(null);
  }

  return (
    <div className="not-prose rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Drag to reorder</span>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Shuffle
        </Button>
      </div>
      <p className="mb-4 text-sm font-medium">{prompt}</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {order.map((id, idx) => (
              <SortableRow
                key={id}
                id={id}
                index={idx + 1}
                label={byId[id]!.label}
                detail={byId[id]!.detail}
                state={
                  checked === "right" ? "right" :
                  checked === "wrong" && correctIds[idx] === id ? "right" :
                  checked === "wrong" ? "wrong" : "idle"
                }
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={check} size="sm" disabled={checked === "right"}>
          {checked === "right" ? "Nice — that's the right order" : "Check order"}
        </Button>
        <AnimatePresence>
          {checked === "wrong" && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-destructive"
            >
              <XCircle className="h-3.5 w-3.5" /> Not quite — keep going
            </motion.span>
          )}
          {checked === "right" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Correct
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {hint && checked === "wrong" && (
        <p className="mt-2 text-xs text-muted-foreground">Hint: {hint}</p>
      )}
    </div>
  );
}

function SortableRow({
  id,
  index,
  label,
  detail,
  state,
}: {
  id: string;
  index: number;
  label: string;
  detail?: string;
  state: "idle" | "right" | "wrong";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex select-none items-center gap-3 rounded-lg border bg-background p-3 shadow-sm transition-colors",
        state === "right" && "border-emerald-500/50 bg-emerald-500/5",
        state === "wrong" && "border-destructive/50 bg-destructive/5",
        state === "idle" && "border-border",
        isDragging && "shadow-lg ring-2 ring-primary/30",
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{index}</span>
      <button
        {...attributes}
        {...listeners}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Drag handle"
        type="button"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <div className="font-mono text-sm font-medium">{label}</div>
        {detail && <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>}
      </div>
    </li>
  );
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

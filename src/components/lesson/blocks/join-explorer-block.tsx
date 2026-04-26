"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Cell = string | number | null;
type Row = Record<string, Cell>;

export interface JoinExplorerBlockProps {
  prompt?: string;
  left: { name: string; rows: Row[]; keyColumn: string };
  right: { name: string; rows: Row[]; keyColumn: string };
}

const JOIN_TYPES = [
  { id: "INNER", label: "INNER", desc: "rows that match in both" },
  { id: "LEFT", label: "LEFT", desc: "every left row, NULL right where no match" },
  { id: "RIGHT", label: "RIGHT", desc: "every right row, NULL left where no match" },
  { id: "FULL", label: "FULL", desc: "every row from both, NULL where no match" },
] as const;

type JoinKind = (typeof JOIN_TYPES)[number]["id"];

export function JoinExplorerBlock({ prompt, left, right }: JoinExplorerBlockProps) {
  const [join, setJoin] = useState<JoinKind>("INNER");

  const result = useMemo(() => computeJoin(left, right, join), [left, right, join]);
  const leftCols = useMemo(() => columns(left.rows), [left.rows]);
  const rightCols = useMemo(() => columns(right.rows), [right.rows]);

  return (
    <div className="not-prose space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Join explorer
        </div>
        {prompt && <p className="mb-3 text-sm">{prompt}</p>}
        <div className="flex flex-wrap gap-1.5">
          {JOIN_TYPES.map((j) => (
            <button
              key={j.id}
              onClick={() => setJoin(j.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-mono transition-colors",
                join === j.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-accent/40",
              )}
              type="button"
            >
              {j.label} JOIN
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{JOIN_TYPES.find((j) => j.id === join)?.desc}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SmallTable
          title={left.name}
          accent="text-emerald-500"
          rows={left.rows}
          cols={leftCols}
          highlightKey={left.keyColumn}
          matchedKeys={new Set(result.matchedLeftKeys)}
          unmatchedTone={join === "LEFT" || join === "FULL" ? "kept-null" : "dropped"}
        />
        <SmallTable
          title={right.name}
          accent="text-indigo-400"
          rows={right.rows}
          cols={rightCols}
          highlightKey={right.keyColumn}
          matchedKeys={new Set(result.matchedRightKeys)}
          unmatchedTone={join === "RIGHT" || join === "FULL" ? "kept-null" : "dropped"}
        />
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-500">
          result · {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
        </div>
        <ResultTable rows={result.rows} cols={result.cols} />
      </div>
    </div>
  );
}

function SmallTable({
  title,
  accent,
  rows,
  cols,
  highlightKey,
  matchedKeys,
  unmatchedTone,
}: {
  title: string;
  accent: string;
  rows: Row[];
  cols: string[];
  highlightKey: string;
  matchedKeys: Set<Cell>;
  unmatchedTone: "kept-null" | "dropped";
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className={cn("border-b border-border bg-muted/40 px-3 py-1.5 font-mono text-xs", accent)}>{title}</div>
      <table className="w-full text-xs">
        <thead className="bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
          <tr>{cols.map((c) => <th key={c} className="px-3 py-1.5 text-left font-medium">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const matched = matchedKeys.has(r[highlightKey] ?? null);
            return (
              <motion.tr
                key={i}
                animate={{
                  opacity: matched ? 1 : unmatchedTone === "dropped" ? 0.3 : 0.85,
                  backgroundColor: matched ? "rgba(34, 211, 238, 0.08)" : "rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.25 }}
                className={cn(matched ? "" : unmatchedTone === "dropped" && "line-through")}
              >
                {cols.map((c) => (
                  <td key={c} className="border-t border-border px-3 py-1.5 font-mono">{fmt(r[c])}</td>
                ))}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ResultTable({ rows, cols }: { rows: Row[]; cols: string[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-cyan-500/40 bg-cyan-500/5">
      <table className="w-full text-xs">
        <thead className="bg-cyan-500/10 text-[10px] uppercase tracking-wide text-muted-foreground">
          <tr>{cols.map((c) => <th key={c} className="px-3 py-1.5 text-left font-medium">{c}</th>)}</tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.tr
                key={`${i}-${cols.map((c) => String(r[c])).join(",")}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, delay: i * 0.02 }}
              >
                {cols.map((c) => (
                  <td key={c} className="border-t border-cyan-500/20 px-3 py-1.5 font-mono">{fmt(r[c])}</td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function fmt(v: Cell | undefined) {
  if (v === null || v === undefined) return <span className="text-muted-foreground/60">NULL</span>;
  return String(v);
}

function columns(rows: Row[]): string[] {
  const set = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) set.add(k);
  return [...set];
}

function computeJoin(left: { rows: Row[]; keyColumn: string }, right: { rows: Row[]; keyColumn: string }, kind: JoinKind) {
  const leftCols = columns(left.rows);
  const rightCols = columns(right.rows);
  const cols = [...leftCols.map((c) => `l_${c}`), ...rightCols.map((c) => `r_${c}`)];
  const rows: Row[] = [];
  const matchedLeftKeys = new Set<Cell>();
  const matchedRightKeys = new Set<Cell>();

  for (const l of left.rows) {
    const lk = l[left.keyColumn] ?? null;
    const matchingRights = right.rows.filter((r) => (r[right.keyColumn] ?? null) === lk);
    if (matchingRights.length > 0) {
      matchedLeftKeys.add(lk);
      for (const r of matchingRights) {
        matchedRightKeys.add(r[right.keyColumn] ?? null);
        const row: Row = {};
        leftCols.forEach((c) => (row[`l_${c}`] = l[c] ?? null));
        rightCols.forEach((c) => (row[`r_${c}`] = r[c] ?? null));
        rows.push(row);
      }
    } else if (kind === "LEFT" || kind === "FULL") {
      const row: Row = {};
      leftCols.forEach((c) => (row[`l_${c}`] = l[c] ?? null));
      rightCols.forEach((c) => (row[`r_${c}`] = null));
      rows.push(row);
    }
  }

  if (kind === "RIGHT" || kind === "FULL") {
    for (const r of right.rows) {
      const rk = r[right.keyColumn] ?? null;
      if (matchedRightKeys.has(rk)) continue;
      const row: Row = {};
      leftCols.forEach((c) => (row[`l_${c}`] = null));
      rightCols.forEach((c) => (row[`r_${c}`] = r[c] ?? null));
      rows.push(row);
    }
  }

  return { rows, cols, matchedLeftKeys: [...matchedLeftKeys], matchedRightKeys: [...matchedRightKeys] };
}

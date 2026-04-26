"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Sparkles, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Cell = string | number | null;

export interface SqlPlaygroundBlockProps {
  prompt: string;
  tables: { name: string; columns: string[]; rows: Cell[][] }[];
  starter?: string;
  expected?: string;
  hint?: string;
}

interface AlaSql {
  (sql: string): unknown;
  (sql: string, params: unknown[]): unknown;
}

export function SqlPlaygroundBlock({ prompt, tables, starter, expected, hint }: SqlPlaygroundBlockProps) {
  const [sql, setSql] = useState(starter ?? "");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, Cell>[] | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const dbRef = useRef<AlaSql | null>(null);

  // Lazy-load alasql, then seed tables.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("alasql");
      if (cancelled) return;
      const alasql = (mod.default ?? mod) as AlaSql;
      // Drop & recreate so the block is idempotent across remounts.
      for (const t of tables) {
        try { alasql(`DROP TABLE IF EXISTS ${t.name}`); } catch { /* noop */ }
        const colsDef = t.columns.map((c) => `${c} STRING`).join(", ");
        alasql(`CREATE TABLE ${t.name} (${colsDef})`);
        if (t.rows.length > 0) {
          const objs = t.rows.map((r) => Object.fromEntries(t.columns.map((c, i) => [c, r[i] ?? null])));
          alasql(`INSERT INTO ${t.name} SELECT * FROM ?`, [objs]);
        }
      }
      dbRef.current = alasql;
    })();
    return () => { cancelled = true; };
  }, [tables]);

  function run() {
    setRunning(true);
    setError(null);
    setRows(null);
    setTimeout(() => {
      try {
        const db = dbRef.current;
        if (!db) {
          setError("SQL engine still loading…");
          return;
        }
        const result = db(sql);
        if (Array.isArray(result)) {
          setRows(result as Record<string, Cell>[]);
        } else {
          setRows([{ result: String(result) }]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setRunning(false);
      }
    }, 50);
  }

  function reset() {
    setSql(starter ?? "");
    setRows(null);
    setError(null);
  }

  return (
    <div className="not-prose space-y-4 rounded-xl border border-accent/40 bg-accent/5 p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
          <Sparkles className="h-3.5 w-3.5" /> SQL playground
        </span>
        <span className="text-xs text-muted-foreground">runs in your browser</span>
      </div>
      <p className="text-sm font-medium">{prompt}</p>

      <details className="group">
        <summary className="cursor-pointer text-xs font-mono text-muted-foreground hover:text-foreground">
          ▸ schema · {tables.map((t) => `${t.name}(${t.columns.length})`).join(", ")}
        </summary>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {tables.map((t) => (
            <div key={t.name} className="overflow-x-auto rounded-md border border-border bg-background">
              <div className="border-b border-border bg-muted/40 px-3 py-1 font-mono text-[11px] text-muted-foreground">{t.name}</div>
              <table className="w-full text-[11px]">
                <thead className="bg-muted/20 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>{t.columns.map((c) => <th key={c} className="px-2 py-1 text-left font-medium">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {t.rows.slice(0, 5).map((r, i) => (
                    <tr key={i}>{r.map((c, j) => <td key={j} className="border-t border-border px-2 py-1 font-mono">{c ?? <span className="text-muted-foreground/60">NULL</span>}</td>)}</tr>
                  ))}
                  {t.rows.length > 5 && <tr><td colSpan={t.columns.length} className="border-t border-border px-2 py-1 text-muted-foreground/60">…{t.rows.length - 5} more</td></tr>}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </details>

      <Textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        rows={5}
        spellCheck={false}
        className="font-mono text-sm"
        placeholder="SELECT * FROM customers;"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={running || !sql.trim()} className="gap-1">
          <Play className="h-3.5 w-3.5" /> {running ? "Running…" : "Run query"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset} className="gap-1">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
        {hint && (
          <Button size="sm" variant="ghost" onClick={() => setShowHint((h) => !h)} className="gap-1 text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" /> Hint
          </Button>
        )}
        {expected && (
          <Button size="sm" variant="ghost" onClick={() => setShowSolution((s) => !s)} className="gap-1 text-muted-foreground">
            {showSolution ? "Hide" : "Show"} solution
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showHint && hint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">{hint}</div>
          </motion.div>
        )}
        {showSolution && expected && (
          <motion.pre initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-x-auto rounded-md border border-border bg-card p-3 text-xs">
            <code>{expected}</code>
          </motion.pre>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-md border border-destructive/40 bg-destructive/5 p-3 font-mono text-xs text-destructive">
            {error}
          </motion.div>
        )}
        {rows && !error && (
          <motion.div key="rows" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <ResultTable rows={rows} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultTable({ rows }: { rows: Record<string, Cell>[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-3 font-mono text-xs text-muted-foreground">
        0 rows
      </div>
    );
  }
  const cols = Object.keys(rows[0]!);
  return (
    <div className="overflow-x-auto rounded-md border border-emerald-500/40 bg-emerald-500/5">
      <div className="border-b border-emerald-500/20 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        {rows.length} row{rows.length === 1 ? "" : "s"}
      </div>
      <table className="w-full text-xs">
        <thead className="bg-emerald-500/10 text-[10px] uppercase tracking-wide text-muted-foreground">
          <tr>{cols.map((c) => <th key={c} className={cn("px-3 py-1.5 text-left font-medium")}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.4) }}>
              {cols.map((c) => (
                <td key={c} className="border-t border-emerald-500/15 px-3 py-1.5 font-mono">
                  {r[c] === null || r[c] === undefined ? <span className="text-muted-foreground/60">NULL</span> : String(r[c])}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

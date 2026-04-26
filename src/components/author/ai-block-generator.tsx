"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Wand2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { ContentBlock } from "@/lib/content/blocks";

const SUGGESTIONS = [
  "Show the difference between INNER JOIN and LEFT JOIN",
  "Explain the SQL execution order vs. write order",
  "Test understanding of WHERE vs HAVING with a quiz",
  "Drag-to-order puzzle for the four steps of writing a query",
  "Hands-on: write a GROUP BY query against a customers table",
  "Mental model for what GROUP BY actually does",
];

export function AiBlockGenerator({
  lessonTitle,
  surroundingMarkdown,
  onInsert,
}: {
  lessonTitle?: string;
  surroundingMarkdown?: string;
  onInsert: (block: ContentBlock) => void;
}) {
  const [open, setOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ContentBlock | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function generate() {
    if (!concept.trim()) return;
    setBusy(true);
    setError(null);
    setPreview(null);
    setInfo(null);
    try {
      const res = await fetch("/api/ai/generate-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, lessonTitle, lessonOutline: surroundingMarkdown }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }
      setPreview(data.block);
      setInfo(`${data.block.type} · ${data.modelTookMs}ms · ${data.attempts} attempt${data.attempts === 1 ? "" : "s"}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  function accept() {
    if (preview) {
      onInsert(preview);
      reset();
    }
  }

  function reset() {
    setOpen(false);
    setConcept("");
    setPreview(null);
    setError(null);
    setInfo(null);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        type="button"
        className="gap-1.5 border-accent/40 bg-accent/5 text-accent hover:bg-accent/10"
      >
        <Sparkles className="h-3.5 w-3.5" /> Generate with AI
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Generate a content block</div>
                    <div className="text-xs text-muted-foreground">Atlas picks the best block type for your concept.</div>
                  </div>
                </div>
                <button onClick={reset} className="rounded p-1 text-muted-foreground hover:bg-accent/40" type="button">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">What should this block teach?</label>
                  <Textarea
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    rows={3}
                    placeholder="e.g. Show how INNER JOIN drops rows that don't match, and how LEFT JOIN keeps them."
                  />
                </div>

                {!concept && (
                  <div>
                    <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Examples</div>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setConcept(s)}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button onClick={generate} disabled={busy || !concept.trim()} className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> {busy ? "Thinking…" : preview ? "Regenerate" : "Generate"}
                  </Button>
                  {info && <span className="text-xs text-muted-foreground">{info}</span>}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div>{error}</div>
                    </motion.div>
                  )}
                  {preview && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview JSON</div>
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-mono text-accent">{preview.type}</span>
                      </div>
                      <pre className="max-h-72 overflow-auto rounded-md border border-border bg-card p-3 text-[11px]">
                        <code>{JSON.stringify(preview, null, 2)}</code>
                      </pre>
                      <div className="mt-3 flex items-center gap-2">
                        <Button onClick={accept} size="sm">Insert into lesson</Button>
                        <Button onClick={() => setPreview(null)} size="sm" variant="ghost">Discard</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

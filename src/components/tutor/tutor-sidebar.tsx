"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function TutorSidebar({
  lessonId,
  lessonTitle,
  lessonSummary,
  pathTitle,
  skillHints,
}: {
  lessonId: string;
  lessonTitle: string;
  lessonSummary: string;
  pathTitle: string;
  skillHints: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [diag, setDiag] = useState<{ ok: boolean; reason?: string; model?: string; status?: number; raw?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tutor/check")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.ok) setDiag({ ok: true, model: j.model });
        else {
          const upBody = j.upstream?.body;
          const reason =
            j.reason ??
            (typeof upBody === "object" && upBody !== null && "error" in upBody ? JSON.stringify((upBody as { error: unknown }).error) : null) ??
            (typeof upBody === "string" ? upBody : null) ??
            "Unknown — see /api/tutor/check for details.";
          setDiag({ ok: false, reason, model: j.model, status: j.upstream?.status, raw: JSON.stringify(j, null, 2) });
        }
      })
      .catch(() => { if (!cancelled) setDiag({ ok: false, reason: "Could not reach /api/tutor/check" }); });
    return () => { cancelled = true; };
  }, []);

  const suggestedPrompts = [
    "Explain this lesson like I've never coded",
    "Give me a harder example",
    "What's a common mistake here?",
  ];

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          lessonTitle,
          lessonSummary,
          pathTitle,
          skillHints,
          messages: nextHistory,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "Tutor is unavailable right now." };
          return copy;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: assistant };
          return copy;
        });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "Tutor connection interrupted." };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Atlas</div>
          <div className="text-xs text-muted-foreground">Your context-aware tutor</div>
        </div>
        <Sparkles className="h-4 w-4 text-accent" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {diag && !diag.ok && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> Tutor not configured
            </div>
            <p className="text-muted-foreground">
              {diag.status ? `Upstream returned ${diag.status}. ` : ""}{diag.reason}
            </p>
            {diag.model && <p className="mt-1 text-muted-foreground">Model: <code className="rounded bg-muted px-1">{diag.model}</code></p>}
            <details className="mt-2"><summary className="cursor-pointer text-muted-foreground">Raw diagnostic</summary><pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[10px] text-muted-foreground">{diag.raw}</pre></details>
          </div>
        )}
        {diag?.ok && messages.length === 0 && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Connected · {diag.model}
          </div>
        )}
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask about this lesson. I can see what you're reading and what skills you're building.
            </p>
            <div className="space-y-1.5">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  m.role === "user" ? "ml-6 bg-primary/5 text-foreground" : "mr-6 bg-muted/60",
                )}
              >
                {m.role === "assistant" ? (
                  <div className="prose-krit prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Atlas anything about this lesson…"
            rows={2}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={streaming}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

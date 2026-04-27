"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const T = {
  bg: "oklch(0.985 0.006 80)",
  ink: "oklch(0.14 0.015 264)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  rule: "oklch(0.88 0.008 264)",
  indigo: "oklch(0.52 0.22 264)",
  indigoLight: "oklch(0.94 0.04 264)",
  indigoMid: "oklch(0.88 0.07 264)",
};

interface Msg {
  id: number;
  role: "user" | "assistant";
  content: string;
  context?: string; // "this section" reference for the message
}

interface Diag {
  ok: boolean;
  reason?: string;
  model?: string;
  status?: number;
  raw?: string;
}

const SUGGESTED = [
  "Explain this lesson like I've never coded",
  "Give me a harder example",
  "What's a common mistake here?",
  "Walk me through a numeric example",
];

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
  const [mode, setMode] = useState<"section" | "lesson">("lesson");
  const [savedNotes, setSavedNotes] = useState<Msg[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [diag, setDiag] = useState<Diag | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Diagnose connection on mount.
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
            (typeof upBody === "object" && upBody !== null && "error" in upBody
              ? JSON.stringify((upBody as { error: unknown }).error)
              : null) ??
            (typeof upBody === "string" ? upBody : null) ??
            "Unknown — see /api/tutor/check.";
          setDiag({ ok: false, reason, model: j.model, status: j.upstream?.status, raw: JSON.stringify(j, null, 2) });
        }
      })
      .catch(() => {
        if (!cancelled) setDiag({ ok: false, reason: "Could not reach /api/tutor/check" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { id: Date.now(), role: "user", content: text };
    const next = [...messages, userMsg, { id: Date.now() + 1, role: "assistant" as const, content: "", context: mode === "section" ? lessonTitle : undefined }];
    setMessages(next);
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
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        setMessages((m) => updateLast(m, "Tutor is unavailable right now."));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        setMessages((m) => updateLast(m, buf));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((m) => updateLast(m, "Tutor connection interrupted."));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function saveNote(msg: Msg) {
    setSavedNotes((notes) => (notes.find((n) => n.id === msg.id) ? notes : [...notes, msg]));
  }

  return (
    <div
      className="krit-landing flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-xl border bg-white"
      style={{ borderColor: T.rule, fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <div
        className="flex flex-shrink-0 items-center gap-2.5 border-b px-4 py-3"
        style={{ borderColor: T.rule }}
      >
        <AtlasLogo size={28} />
        <div>
          <div className="text-[0.9375rem] font-semibold" style={{ color: T.ink }}>Atlas</div>
          <div className="text-[0.7rem]" style={{ color: T.ink3 }}>Your AI tutor</div>
        </div>
        <button
          onClick={() => setShowNotes((s) => !s)}
          type="button"
          className="ml-auto flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs"
          style={{ borderColor: T.rule, color: T.ink3, background: "white" }}
        >
          📝 {savedNotes.length > 0 ? `${savedNotes.length} notes` : "Notes"}
        </button>
      </div>

      {/* Mode toggle */}
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b px-3.5 py-2.5"
        style={{ borderColor: T.rule }}
      >
        <span className="mr-1 text-[0.7rem] font-medium" style={{ color: T.ink3 }}>Ask about:</span>
        {[
          { id: "section", label: "This lesson" },
          { id: "lesson", label: "Anything" },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMode(opt.id as "section" | "lesson")}
            className="rounded-full border px-3 py-1 text-xs transition-all duration-150"
            style={{
              borderColor: mode === opt.id ? T.indigo : T.rule,
              background: mode === opt.id ? T.indigoLight : "transparent",
              color: mode === opt.id ? T.indigo : T.ink3,
              fontWeight: mode === opt.id ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reading-context banner */}
      <div
        className="flex flex-shrink-0 items-center gap-2.5 border-b px-3.5 py-2.5"
        style={{ background: T.indigoLight, borderColor: T.indigoMid }}
      >
        <PulsingEye color={T.indigo} />
        <div className="min-w-0 flex-1">
          <div className="text-[0.7rem] font-semibold tracking-wide" style={{ color: T.indigo }}>
            {mode === "section" ? "Reading now" : "Lesson context"}
          </div>
          <div className="truncate text-xs" style={{ color: T.ink2 }}>
            &ldquo;{lessonTitle}&rdquo;
          </div>
        </div>
        <div className="h-1 w-9 overflow-hidden rounded" style={{ background: T.indigoMid }}>
          <div
            className="h-full w-[60%] rounded animate-[krit-readbar_3s_ease-in-out_infinite_alternate]"
            style={{ background: T.indigo }}
          />
        </div>
      </div>

      {/* Diagnostic banner */}
      {diag && !diag.ok && (
        <div className="border-b px-3.5 py-2.5 text-xs" style={{ background: "rgba(220,38,38,0.05)", borderColor: T.rule, color: "rgb(153,27,27)" }}>
          <div className="font-semibold">Tutor not configured</div>
          <p style={{ color: T.ink2 }}>
            {diag.status ? `Upstream returned ${diag.status}. ` : ""}{diag.reason}
          </p>
        </div>
      )}
      {diag?.ok && messages.length === 0 && (
        <div className="border-b px-3.5 py-2 text-[0.7rem]" style={{ borderColor: T.rule, color: "oklch(0.42 0.16 145)" }}>
          ✓ Connected · {diag.model}
        </div>
      )}

      {/* Notes drawer */}
      {showNotes && (
        <div className="flex-shrink-0 border-b px-4 py-3" style={{ background: T.bg, borderColor: T.rule }}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: T.ink3 }}>Saved notes</div>
          {savedNotes.length === 0 ? (
            <p className="text-[0.8125rem] italic" style={{ color: T.ink3 }}>No notes yet. Save useful answers below.</p>
          ) : (
            savedNotes.map((n, i) => (
              <div
                key={n.id}
                className="border-b py-2 text-[0.8125rem] leading-relaxed"
                style={{ color: T.ink2, borderColor: i < savedNotes.length - 1 ? T.rule : "transparent" }}
              >
                &ldquo;{n.content.slice(0, 140)}{n.content.length > 140 ? "…" : ""}&rdquo;
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-y-auto px-1 py-1">
        {messages.length === 0 && (
          <div className="px-3 py-3 text-sm font-light" style={{ color: T.ink3 }}>
            Ask about this lesson. I can see what you&apos;re reading and what skills you&apos;re building.
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} msg={m} streaming={streaming} onSave={saveNote} saved={Boolean(savedNotes.find((n) => n.id === m.id))} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div
          className="flex flex-shrink-0 gap-2 overflow-x-auto border-t px-3.5 py-2.5"
          style={{ borderColor: T.rule }}
        >
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors"
              style={{ background: T.bg, borderColor: T.rule, color: T.ink2 }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        className="flex flex-shrink-0 items-center gap-2 border-t px-3 py-3"
        style={{ borderColor: T.rule }}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "section" ? `Ask about "${lessonTitle}"…` : "Ask anything…"}
          className="flex-1 rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-2"
          style={{ borderColor: T.rule, background: T.bg, color: T.ink, fontFamily: "var(--font-sans)" }}
        />
        <button
          type="submit"
          disabled={streaming}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-white disabled:opacity-50"
          style={{ background: T.indigo }}
          aria-label="Send"
        >
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M9 3l5 5-5 5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>

      <style jsx>{`
        @keyframes krit-readbar { from { transform: translateX(-30%); } to { transform: translateX(50%); } }
        @keyframes krit-eye-pulse { 0%, 100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.15); opacity: 1; } }
      `}</style>
    </div>
  );
}

function updateLast(m: Msg[], text: string): Msg[] {
  if (m.length === 0) return m;
  const copy = [...m];
  copy[copy.length - 1] = { ...copy[copy.length - 1]!, content: text };
  return copy;
}

function Message({
  msg,
  streaming,
  onSave,
  saved,
}: {
  msg: Msg;
  streaming: boolean;
  onSave: (m: Msg) => void;
  saved: boolean;
}) {
  const isAtlas = msg.role === "assistant";
  const isStreamingHere = streaming && msg.content === "";
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5">
      {isAtlas ? (
        <AtlasLogo size={22} />
      ) : (
        <div className="order-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: T.indigo }}>
          You
        </div>
      )}
      <div className={`min-w-0 flex-1 ${isAtlas ? "" : "order-1"}`}>
        {msg.context && (
          <div className="mb-1 text-[0.7rem] italic" style={{ color: T.ink3 }}>
            re: &ldquo;{msg.context}&rdquo;
          </div>
        )}
        {isStreamingHere ? (
          <ThinkingDots />
        ) : isAtlas ? (
          <div
            className="prose prose-sm max-w-none text-[0.8875rem] font-light leading-[1.65]"
            style={{ color: T.ink }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <div
            className="rounded-lg px-3 py-2 text-[0.8875rem]"
            style={{ background: T.indigoLight, color: T.ink2 }}
          >
            {msg.content}
          </div>
        )}
        {isAtlas && msg.content && !isStreamingHere && (
          <button
            type="button"
            onClick={() => onSave(msg)}
            className="mt-2 flex items-center gap-1 text-[0.7rem] transition-colors"
            style={{ background: "none", border: "none", color: saved ? T.indigo : T.ink3, padding: 0, cursor: "pointer" }}
          >
            {saved ? "✓ Saved to notes" : "↓ Save to notes"}
          </button>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: T.indigo,
            animation: `krit-thinking-dot 1s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.4,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes krit-thinking-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

function AtlasLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={11} fill={T.indigo} />
      <circle cx={12} cy={10} r={4} fill="none" stroke="white" strokeWidth={1.4} />
      <circle cx={12} cy={10} r={1.5} fill="white" />
      <path d="M7 18c0-3 2-5 5-5s5 2 5 5" fill="none" stroke="white" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

function PulsingEye({ color }: { color: string }) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 16 16"
      fill="none"
      style={{ flexShrink: 0, animation: "krit-eye-pulse 2s ease-in-out infinite" }}
      aria-hidden
    >
      <circle cx={8} cy={8} r={7} stroke={color} strokeWidth={1.5} />
      <circle cx={8} cy={8} r={3} fill={color} />
      <circle cx={9.5} cy={6.5} r={1} fill="white" />
    </svg>
  );
}

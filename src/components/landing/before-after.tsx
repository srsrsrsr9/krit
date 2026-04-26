"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-driven "before vs after" comparison: a generic LMS course list
 * stacks up tediously on the left while Krit's skill graph blooms into
 * structured competence on the right. Sticky comparison + 300vh travel.
 */

const T = {
  ink: "oklch(0.14 0.015 264)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  rule: "oklch(0.88 0.008 264)",
  indigo: "oklch(0.52 0.22 264)",
  violet: "oklch(0.52 0.22 292)",
  red: "oklch(0.56 0.18 22)",
  green: "oklch(0.54 0.16 145)",
};

const LMS_COURSES = [
  { title: "Introduction to Data Science", progress: 100, status: "done" },
  { title: "Python Fundamentals", progress: 100, status: "done" },
  { title: "SQL for Beginners", progress: 47, status: "stalled" },
  { title: "Machine Learning Basics", progress: 12, status: "stalled" },
  { title: "Statistics 101", progress: 3, status: "new" },
  { title: "Deep Learning Foundations", progress: 0, status: "new" },
  { title: "Data Visualisation", progress: 0, status: "new" },
  { title: "Natural Language Processing", progress: 0, status: "new" },
  { title: "Feature Engineering", progress: 0, status: "new" },
  { title: "Model Deployment", progress: 0, status: "new" },
  { title: "MLOps Fundamentals", progress: 0, status: "new" },
  { title: "Advanced SQL Patterns", progress: 0, status: "new" },
] as const;

const KRIT_NODES = [
  { id: "sql", x: 0.18, y: 0.45, label: "SQL", mastered: true, ev: 9 },
  { id: "py", x: 0.4, y: 0.22, label: "Python", mastered: true, ev: 14 },
  { id: "stats", x: 0.4, y: 0.68, label: "Statistics", mastered: true, ev: 11 },
  { id: "ml", x: 0.62, y: 0.45, label: "ML Basics", mastered: true, ev: 8 },
  { id: "reg", x: 0.82, y: 0.68, label: "Regression", mastered: false, ev: 3 },
  { id: "nlp", x: 0.82, y: 0.22, label: "NLP", mastered: false, ev: 1 },
];
const KRIT_EDGES: [string, string][] = [
  ["sql", "py"], ["sql", "stats"], ["py", "ml"], ["stats", "ml"], ["ml", "nlp"], ["ml", "reg"],
];

function useScrollProgress<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);
  return progress;
}

function LMSPanel({ progress }: { progress: number }) {
  const visibleCount = Math.floor(2 + progress * 10);
  const courses = LMS_COURSES.slice(0, Math.min(visibleCount, LMS_COURSES.length));
  const completed = 2;

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        className="flex items-center gap-6 rounded-lg border bg-white px-4 py-3.5 transition-opacity duration-300"
        style={{ borderColor: T.rule, opacity: progress > 0.1 ? 1 : 0 }}
      >
        <div>
          <div className="text-2xl font-semibold leading-none" style={{ color: T.ink }}>{courses.length}</div>
          <div className="text-xs" style={{ color: T.ink3 }}>courses started</div>
        </div>
        <div className="h-8 w-px" style={{ background: T.rule }} />
        <div>
          <div className="text-2xl font-semibold leading-none" style={{ color: T.red }}>{completed}</div>
          <div className="text-xs" style={{ color: T.ink3 }}>completed</div>
        </div>
        <div className="ml-auto self-center text-[0.8125rem]" style={{ color: T.ink3 }}>
          {Math.round((completed / Math.max(1, courses.length)) * 100)}% completion
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        {courses.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-md border bg-white px-3 py-2"
            style={{ borderColor: T.rule }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
              style={{
                background:
                  c.status === "done" ? T.green : c.status === "stalled" ? "oklch(0.90 0.08 76)" : T.rule,
                color: "white",
              }}
            >
              {c.status === "done" ? "✓" : c.status === "stalled" ? "…" : "○"}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-sm font-medium"
                style={{ color: c.status === "new" ? T.ink3 : T.ink }}
              >
                {c.title}
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-sm" style={{ background: T.rule }}>
                <div
                  className="h-full rounded-sm transition-[width] duration-700"
                  style={{
                    width: `${c.progress}%`,
                    background:
                      c.status === "done" ? T.green : c.status === "stalled" ? "oklch(0.72 0.18 76)" : T.indigo,
                  }}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs" style={{ color: T.ink3 }}>{c.progress}%</span>
          </div>
        ))}
        {progress > 0.6 && courses.length < LMS_COURSES.length && (
          <div className="py-2 text-center text-[0.8125rem] italic" style={{ color: T.ink3 }}>
            +{LMS_COURSES.length - courses.length} more courses…
          </div>
        )}
      </div>
    </div>
  );
}

function KritPanel({ progress }: { progress: number }) {
  const showCred = progress > 0.7;
  const showEv = progress > 0.3;

  function lc(n: typeof KRIT_NODES[number]): string {
    return n.mastered ? T.indigo : n.ev > 0 ? "oklch(0.72 0.12 264)" : T.rule;
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        className="flex items-center gap-6 rounded-lg border bg-white px-4 py-3.5 transition-opacity duration-300"
        style={{ borderColor: T.rule, opacity: progress > 0.1 ? 1 : 0 }}
      >
        <div>
          <div className="text-2xl font-semibold leading-none" style={{ color: T.indigo }}>12</div>
          <div className="text-xs" style={{ color: T.ink3 }}>skills mapped</div>
        </div>
        <div className="h-8 w-px" style={{ background: T.rule }} />
        <div>
          <div className="text-2xl font-semibold leading-none" style={{ color: T.green }}>4</div>
          <div className="text-xs" style={{ color: T.ink3 }}>mastered</div>
        </div>
        <div className="ml-auto self-center text-[0.8125rem]" style={{ color: T.ink3 }}>
          1 credential earned
        </div>
      </div>
      <div
        className="relative flex-1 overflow-hidden rounded-xl border bg-white p-4"
        style={{ borderColor: T.rule }}
      >
        <svg viewBox="0 0 400 280" width="100%" height="100%" style={{ overflow: "visible" }}>
          {KRIT_EDGES.map(([a, b], i) => {
            const na = KRIT_NODES.find((n) => n.id === a)!;
            const nb = KRIT_NODES.find((n) => n.id === b)!;
            const vis = progress > 0.2 + i * 0.04;
            return (
              <line
                key={i}
                x1={na.x * 400} y1={na.y * 280}
                x2={nb.x * 400} y2={nb.y * 280}
                stroke={na.mastered && nb.mastered ? T.indigo : T.rule}
                strokeWidth={na.mastered && nb.mastered ? 2 : 1.5}
                opacity={vis ? 0.6 : 0}
                style={{ transition: `opacity 0.6s ${i * 0.08}s` }}
              />
            );
          })}
          {KRIT_NODES.map((n, i) => {
            const vis = progress > 0.15 + i * 0.06;
            const cx = n.x * 400;
            const cy = n.y * 280;
            const evDots = showEv ? Math.min(n.ev, 6) : 0;
            return (
              <g
                key={n.id}
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: `scale(${vis ? 1 : 0})`,
                  opacity: vis ? 1 : 0,
                  transition: `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s, opacity 0.4s ${i * 0.1}s`,
                  filter:
                    n.mastered && progress > 0.5
                      ? `drop-shadow(0 0 6px oklch(0.52 0.22 264 / 0.5))`
                      : "none",
                }}
              >
                <circle cx={cx} cy={cy} r={26} fill={lc(n)} opacity={n.mastered ? 1 : 0.5 + (n.ev / 10) * 0.4} />
                <text
                  x={cx} y={cy + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fontWeight={600}
                  fill={n.mastered ? "white" : n.ev > 0 ? T.ink : "oklch(0.6 0.01 264)"}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {n.label}
                </text>
                {Array.from({ length: evDots }, (_, k) => {
                  const angle = (k / Math.min(n.ev, 6)) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <circle
                      key={k}
                      cx={cx + Math.cos(angle) * 36}
                      cy={cy + Math.sin(angle) * 36}
                      r={3.5}
                      fill={T.violet}
                      opacity={0.75}
                      style={{ transition: `opacity 0.4s ${0.3 + k * 0.05}s` }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
        {showCred && (
          <div
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold text-white"
            style={{ background: T.indigo }}
          >
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
              <circle cx={7} cy={7} r={6.5} fill="none" stroke="white" strokeWidth={1} />
              <polyline points="3,7 5.5,10 11,4.5" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
            ML Foundations · Verified
          </div>
        )}
      </div>
    </div>
  );
}

export function BeforeAfterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollP = useScrollProgress(sectionRef);
  const p = Math.max(0, Math.min(1, (scrollP - 0.1) / 0.65));

  return (
    <div>
      <div className="flex h-[40vh] items-center justify-center px-4 text-center sm:px-8">
        <div>
          <h2
            className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-tight"
            style={{ color: T.ink, fontWeight: 400 }}
          >
            The problem with courses
            <br />
            is that they never end.
          </h2>
          <p className="mt-4 text-[1.0625rem] font-light" style={{ color: T.ink2 }}>
            Scroll to see the difference.
          </p>
        </div>
      </div>

      <div ref={sectionRef} className="relative" style={{ minHeight: "300vh" }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-4 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 grid gap-12 md:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: T.red }}>
                  The LMS way
                </div>
                <h3 className="font-serif text-[1.375rem] leading-tight" style={{ color: T.ink, fontWeight: 400 }}>
                  Course after course,<br />forever.
                </h3>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: T.indigo }}>
                  The Krit way
                </div>
                <h3 className="font-serif text-[1.375rem] leading-tight" style={{ color: T.ink, fontWeight: 400 }}>
                  Precise skills,<br />real proof.
                </h3>
              </div>
            </div>

            <div className="grid gap-12 md:grid-cols-2" style={{ height: "60vh", minHeight: 360, maxHeight: 580 }}>
              <div
                className="relative overflow-hidden rounded-xl border p-5"
                style={{ background: "oklch(0.97 0.004 264)", borderColor: T.rule }}
              >
                <div
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    background: "linear-gradient(to bottom, transparent 60%, oklch(0.97 0.004 264) 100%)",
                  }}
                />
                <LMSPanel progress={p} />
              </div>
              <div
                className="overflow-hidden rounded-xl border bg-white p-5"
                style={{
                  borderColor: "oklch(0.88 0.07 264)",
                  boxShadow: `0 0 0 1px oklch(0.88 0.07 264 / 0.3), 0 8px 32px oklch(0.52 0.22 264 / 0.06)`,
                }}
              >
                <KritPanel progress={p} />
              </div>
            </div>

            <div
              className="mt-6 text-center transition-opacity duration-500"
              style={{ opacity: p > 0.5 ? 1 : 0 }}
            >
              <p className="text-[0.9375rem] font-light" style={{ color: T.ink2 }}>
                Same learner. Same time investment. Completely different outcome.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "20vh" }} />
    </div>
  );
}

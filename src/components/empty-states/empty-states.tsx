"use client";

import Link from "next/link";

const T = {
  ink: "oklch(0.14 0.015 264)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  rule: "oklch(0.88 0.008 264)",
  indigo: "oklch(0.52 0.22 264)",
  indigoLight: "oklch(0.94 0.04 264)",
  violet: "oklch(0.52 0.22 290)",
};

function MiniGraph({ animated = true }: { animated?: boolean }) {
  const nodes = [
    { x: 60, y: 100, r: 20, level: 3, label: "SQL" },
    { x: 140, y: 55, r: 18, level: 2, label: "Python" },
    { x: 140, y: 145, r: 18, level: 0, label: "Stats" },
    { x: 220, y: 100, r: 22, level: 0, label: "ML" },
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3]];
  const lc = (l: number) =>
    l === 3 ? T.indigo : l === 2 ? "oklch(0.72 0.15 264)" : l === 1 ? "oklch(0.82 0.09 264)" : T.rule;
  return (
    <svg viewBox="0 0 280 200" width="100%" style={{ maxWidth: 280 }} aria-hidden>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a]!.x} y1={nodes[a]!.y}
          x2={nodes[b]!.x} y2={nodes[b]!.y}
          stroke={T.rule} strokeWidth={1.5}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x} cy={n.y} r={n.r}
            fill={lc(n.level)}
            style={{
              animation: animated && n.level === 0 ? `krit-node-pulse 2.5s ease-in-out ${i * 0.5}s infinite` : "none",
              transformOrigin: `${n.x}px ${n.y}px`,
            }}
          />
          <text
            x={n.x} y={n.y + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={500}
            fill={n.level >= 2 ? "white" : T.ink2}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {n.label}
          </text>
          {n.level > 0 &&
            Array.from({ length: n.level * 2 + 1 }, (_, k) => {
              const a = (k / (n.level * 2 + 1)) * Math.PI * 2 - Math.PI / 2;
              return (
                <circle
                  key={k}
                  cx={n.x + Math.cos(a) * (n.r + 10)}
                  cy={n.y + Math.sin(a) * (n.r + 10)}
                  r={2.5}
                  fill={T.violet}
                  opacity={0.7}
                />
              );
            })}
        </g>
      ))}
      <style>{`
        @keyframes krit-node-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </svg>
  );
}

export function HomeEmptyState({ learnerName }: { learnerName: string }) {
  return (
    <div className="krit-landing space-y-8" style={{ fontFamily: "var(--font-sans)" }}>
      <div>
        <p className="text-[0.8125rem]" style={{ color: T.ink3 }}>
          Good day, {learnerName.split(" ")[0]}
        </p>
        <h1
          className="mt-1 font-serif text-[1.75rem] leading-tight"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          Where would you like to start?
        </h1>
      </div>

      <div
        className="rounded-2xl border bg-white p-12 text-center"
        style={{ borderColor: T.rule }}
      >
        <div className="mx-auto mb-7 flex justify-center">
          <MiniGraph />
        </div>
        <h2
          className="mb-3 font-serif text-[1.375rem]"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          Your skill graph is empty — for now.
        </h2>
        <p
          className="mx-auto mb-8 max-w-md text-[0.9375rem] font-light leading-[1.7]"
          style={{ color: T.ink2 }}
        >
          Pick a skill goal and Krit will map exactly what you know, what you&apos;re missing, and the fastest path forward.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/catalog"
            className="rounded-md px-7 py-3 text-[0.9375rem] font-medium text-white no-underline"
            style={{ background: T.indigo }}
          >
            Explore skill paths
          </Link>
          <Link
            href="/profile"
            className="rounded-md border px-7 py-3 text-[0.9375rem] font-medium no-underline"
            style={{ color: T.indigo, borderColor: "oklch(0.88 0.07 264)" }}
          >
            Set your first goal
          </Link>
        </div>
      </div>

      <div>
        <p
          className="mb-4 text-[0.8125rem] font-medium uppercase tracking-[0.08em]"
          style={{ color: T.ink3 }}
        >
          Popular paths this week
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "SQL Foundations", slug: "sql-foundations", skills: 6, time: "~6 hours", hot: true },
            { name: "Python Foundations", slug: "python-foundations", skills: 6, time: "~7 hours", hot: false },
            { name: "Data Analysis", slug: "catalog", skills: 10, time: "~6 weeks", hot: false },
          ].map((p) => (
            <Link
              key={p.name}
              href={p.slug === "catalog" ? "/catalog" : `/learn/${p.slug}`}
              className="block rounded-xl border bg-white p-5 no-underline transition-shadow hover:shadow-[0_4px_16px_oklch(0.52_0.22_264_/_0.08)]"
              style={{ borderColor: T.rule }}
            >
              {p.hot && (
                <span
                  className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: T.indigo }}
                >
                  Trending
                </span>
              )}
              <p className="mb-1 text-[0.9375rem] font-medium" style={{ color: T.ink }}>
                {p.name}
              </p>
              <p className="text-[0.8125rem]" style={{ color: T.ink3 }}>
                {p.skills} skills · {p.time}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkillsEmptyState() {
  return (
    <div className="krit-landing flex flex-col gap-8 lg:flex-row" style={{ fontFamily: "var(--font-sans)" }}>
      <div
        className="flex-1 rounded-2xl border bg-white p-12 text-center"
        style={{ borderColor: T.rule }}
      >
        <svg viewBox="0 0 200 120" width={200} height={120} className="mx-auto mb-7" aria-hidden>
          {([[40, 60], [100, 30], [100, 90], [160, 60]] as [number, number][]).map(([x, y], i) => (
            <g key={i}>
              <circle
                cx={x} cy={y} r={20}
                fill={T.rule} opacity={0.5}
                style={{
                  animation: `krit-node-pulse 2s ${i * 0.5}s ease-in-out infinite`,
                  transformOrigin: `${x}px ${y}px`,
                }}
              />
              <circle cx={x} cy={y} r={20} fill="none" stroke={T.rule} strokeWidth={1} strokeDasharray="3,3" />
            </g>
          ))}
          {([[0, 1], [0, 2], [1, 3], [2, 3]] as [number, number][]).map(([a, b], i) => {
            const pts: [number, number][] = [[40, 60], [100, 30], [100, 90], [160, 60]];
            return (
              <line
                key={i}
                x1={pts[a]![0]} y1={pts[a]![1]}
                x2={pts[b]![0]} y2={pts[b]![1]}
                stroke={T.rule} strokeWidth={1} strokeDasharray="4,3"
              />
            );
          })}
        </svg>
        <h2
          className="mb-3 font-serif text-[1.25rem]"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          No evidence yet.
        </h2>
        <p
          className="mx-auto mb-8 max-w-sm text-[0.9375rem] font-light leading-[1.7]"
          style={{ color: T.ink2 }}
        >
          Evidence accumulates as you read lessons, complete exercises, and submit work. Start a lesson to collect your first evidence item.
        </p>
        <Link
          href="/catalog"
          className="rounded-md px-7 py-3 text-[0.9375rem] font-medium text-white no-underline"
          style={{ background: T.indigo }}
        >
          Start your first lesson
        </Link>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-72">
        <p
          className="text-[0.75rem] font-medium uppercase tracking-[0.08em]"
          style={{ color: T.ink3 }}
        >
          How evidence works
        </p>
        {[
          { step: "01", title: "Read a lesson", body: "Your reading behaviour is logged — time on page, highlights, re-reads." },
          { step: "02", title: "Complete exercises", body: "Each correct answer adds a weighted evidence item to the skill." },
          { step: "03", title: "Reach the threshold", body: "Hit the mastery threshold to unlock your credential." },
        ].map((s) => (
          <div
            key={s.step}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: T.rule }}
          >
            <p
              className="mb-1 font-serif text-[1.25rem] leading-none"
              style={{ color: T.indigo, opacity: 0.3 }}
            >
              {s.step}
            </p>
            <p className="mb-1 text-sm font-medium" style={{ color: T.ink }}>{s.title}</p>
            <p className="text-[0.8125rem] font-light leading-[1.6]" style={{ color: T.ink3 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CredentialsEmptyState({ recommendedPath }: { recommendedPath?: { slug: string; title: string } }) {
  const path = recommendedPath ?? { slug: "sql-foundations", title: "SQL Foundations" };
  return (
    <div className="krit-landing grid gap-6 lg:grid-cols-[1fr_340px]" style={{ fontFamily: "var(--font-sans)" }}>
      <div
        className="rounded-2xl border bg-white p-12 text-center"
        style={{ borderColor: T.rule }}
      >
        <div
          className="mx-auto mb-8 w-56 rounded-xl border-2 border-dashed p-6 opacity-70"
          style={{ background: T.indigoLight, borderColor: "oklch(0.82 0.1 264)" }}
        >
          <div
            className="mb-4 flex h-9 items-center justify-center rounded-md"
            style={{ background: T.indigo }}
          >
            <span className="text-xs font-medium tracking-wider text-white">CERTIFICATE</span>
          </div>
          <div className="mb-2 h-2 rounded" style={{ background: T.rule }} />
          <div className="mx-auto mb-4 h-2 w-3/5 rounded" style={{ background: T.rule }} />
          <div className="mx-auto h-10 w-10 rounded-full" style={{ background: T.rule }} />
        </div>
        <h2
          className="mb-3 font-serif text-[1.25rem]"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          Your first credential is closer than you think.
        </h2>
        <p
          className="mx-auto mb-8 max-w-sm text-[0.9375rem] font-light leading-[1.7]"
          style={{ color: T.ink2 }}
        >
          Credentials are earned, not given. Complete the recommended path to earn your first.
        </p>
        <Link
          href={`/learn/${path.slug}`}
          className="rounded-md px-7 py-3 text-[0.9375rem] font-medium text-white no-underline"
          style={{ background: T.indigo }}
        >
          Begin {path.title}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: T.rule }}>
        <div className="border-b px-5 py-4" style={{ borderColor: T.rule }}>
          <p
            className="mb-1 text-[0.75rem] font-medium uppercase tracking-[0.08em]"
            style={{ color: T.ink3 }}
          >
            Fastest path to your first credential
          </p>
          <h3
            className="font-serif text-[1.1rem]"
            style={{ color: T.ink, fontWeight: 400 }}
          >
            {path.title}
          </h3>
        </div>
        <div className="p-5">
          {[
            "Read 6 short lessons",
            "Pass a 20-question assessment",
            "Submit a real capstone project",
          ].map((step, i) => (
            <div key={i} className="mb-3 flex items-start gap-3">
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: T.indigo }}
              >
                {i + 1}
              </span>
              <p className="text-[0.875rem] font-light" style={{ color: T.ink2 }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const T = {
  bg: "oklch(0.985 0.006 80)",
  ink: "oklch(0.14 0.015 264)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  rule: "oklch(0.88 0.008 264)",
  indigo: "oklch(0.52 0.22 264)",
  violet: "oklch(0.52 0.22 292)",
  indigoLight: "oklch(0.94 0.04 264)",
  indigoMid: "oklch(0.88 0.07 264)",
};

interface Goal {
  id: string;
  label: string;
  skills: string[];
  pathSlug: string;
}

const GOALS: Goal[] = [
  { id: "pm", label: "Become a data-aware PM", skills: ["SQL", "Analytics", "Experimentation", "Product Metrics"], pathSlug: "sql-foundations" },
  { id: "ml", label: "Pick up Python for data work", skills: ["Python", "Statistics", "Pandas", "Pythonic Idioms"], pathSlug: "python-foundations" },
  { id: "job", label: "Get my first job in tech", skills: ["Python", "SQL", "Git", "Portfolio"], pathSlug: "python-foundations" },
  { id: "sql", label: "Brush up on SQL", skills: ["SQL Basics", "Joins", "Aggregation", "Optimisation"], pathSlug: "sql-foundations" },
  { id: "other", label: "Other (describe later)", skills: [], pathSlug: "sql-foundations" },
];

interface SkillQ { skill: string; id: string }
const SKILL_QUESTIONS: Record<string, SkillQ[]> = {
  ml: [
    { skill: "Python basics", id: "py" },
    { skill: "Basic statistics", id: "stats" },
    { skill: "Working with CSV/Pandas data", id: "data" },
    { skill: "Probability theory", id: "prob" },
  ],
  pm: [
    { skill: "Writing SQL queries", id: "sql" },
    { skill: "A/B testing basics", id: "ab" },
    { skill: "Excel / Sheets at work", id: "xl" },
    { skill: "Funnel analysis", id: "fn" },
  ],
  job: [
    { skill: "Python basics", id: "py" },
    { skill: "SQL basics", id: "sql" },
    { skill: "Git / GitHub", id: "git" },
    { skill: "Building a portfolio site", id: "web" },
  ],
  sql: [
    { skill: "Basic SELECT queries", id: "sel" },
    { skill: "Joins (INNER/LEFT)", id: "join" },
    { skill: "Aggregations (GROUP BY)", id: "agg" },
  ],
  other: [],
};

interface NodeXY { x: number; y: number; l: string }
const NODES_BY_GOAL: Record<string, NodeXY[]> = {
  ml: [
    { x: 0.5, y: 0.15, l: "Python" },
    { x: 0.2, y: 0.45, l: "Stats" },
    { x: 0.8, y: 0.45, l: "Pandas" },
    { x: 0.5, y: 0.78, l: "Idioms" },
  ],
  pm: [
    { x: 0.5, y: 0.15, l: "SQL" },
    { x: 0.2, y: 0.5, l: "Analytics" },
    { x: 0.8, y: 0.5, l: "A/B Test" },
    { x: 0.5, y: 0.82, l: "Metrics" },
  ],
  job: [
    { x: 0.5, y: 0.15, l: "Python" },
    { x: 0.25, y: 0.5, l: "SQL" },
    { x: 0.75, y: 0.5, l: "Git" },
    { x: 0.5, y: 0.82, l: "Portfolio" },
  ],
  sql: [
    { x: 0.5, y: 0.2, l: "SELECT" },
    { x: 0.25, y: 0.55, l: "Joins" },
    { x: 0.75, y: 0.55, l: "Aggr" },
    { x: 0.5, y: 0.85, l: "Window" },
  ],
  other: [{ x: 0.5, y: 0.5, l: "?" }],
};

const TIME_OPTIONS = [
  { mins: 15, label: "15 min/day", weeks: 16 },
  { mins: 30, label: "30 min/day", weeks: 9 },
  { mins: 60, label: "1 hr/day", weeks: 5 },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [timeIdx, setTimeIdx] = useState(1);

  return (
    <div className="krit-landing flex h-screen flex-col" style={{ background: T.bg, fontFamily: "var(--font-sans)" }}>
      <div
        className="flex flex-shrink-0 items-center justify-between border-b px-4 py-5 sm:px-8"
        style={{ borderColor: T.rule }}
      >
        <Link href="/" className="font-serif text-xl font-semibold no-underline" style={{ color: T.ink }}>
          Krit
        </Link>
        <div className="text-[0.8125rem]" style={{ color: T.ink3 }}>Step {step + 1} of 4</div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-10 sm:px-8">
        <StepBar step={step} />
        <div className="flex-1 overflow-y-auto pb-4">
          {step === 0 && (
            <GoalPicker
              onSelect={(g) => {
                setGoal(g);
                setStep(1);
              }}
            />
          )}
          {step === 1 && goal && (
            <SkillSnapshot
              goal={goal}
              answers={answers}
              setAnswers={setAnswers}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && goal && (
            <TimeCommitment
              timeIdx={timeIdx}
              setTimeIdx={setTimeIdx}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && goal && (
            <FirstLesson
              goal={goal}
              minutes={TIME_OPTIONS[timeIdx]!.mins}
              onStart={() => router.push(`/learn/${goal.pathSlug}`)}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes krit-slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes krit-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes krit-node-bloom {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StepBar({ step }: { step: number }) {
  const steps = ["Goal", "Snapshot", "Schedule", "Start"];
  return (
    <div className="mb-8 flex items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
              style={{
                background: i <= step ? T.indigo : "rgba(0,0,0,0.08)",
                color: i <= step ? "white" : T.ink3,
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide"
              style={{ color: i === step ? T.indigo : T.ink3 }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="-mb-5 mx-2 h-[2px] flex-1 transition-colors"
              style={{ background: i < step ? T.indigo : T.rule }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function GoalPicker({ onSelect }: { onSelect: (g: Goal) => void }) {
  return (
    <div style={{ animation: "krit-slide-in-right 0.45s ease forwards" }}>
      <h1
        className="mb-3 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-tight"
        style={{ color: T.ink, fontWeight: 400 }}
      >
        What are you here to do?
      </h1>
      <p className="mb-10 text-[1rem] font-light" style={{ color: T.ink2 }}>
        Pick the goal that&rsquo;s closest. You can change it later.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GOALS.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g)}
            className="flex flex-col gap-4 rounded-xl border bg-white p-5 text-left transition-all hover:border-[oklch(0.52_0.22_264)] hover:bg-[oklch(0.94_0.04_264)]"
            style={{
              borderColor: T.rule,
              animation: `krit-fade-up 0.4s ease ${i * 0.06}s both`,
            }}
          >
            <div
              className="flex h-20 items-center justify-center rounded-lg"
              style={{ background: T.indigoLight }}
            >
              <svg viewBox="0 0 80 60" width={80} height={60} aria-hidden>
                {g.skills.slice(0, 4).map((s, k) => {
                  const cx = [40, 20, 60, 40][k]!;
                  const cy = [12, 40, 40, 55][k]!;
                  return (
                    <g key={k}>
                      <circle cx={cx} cy={cy} r={12} fill={T.indigo} opacity={0.2 + k * 0.15} />
                      <text
                        x={cx} y={cy + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={6} fill={T.indigo}
                        style={{ fontFamily: "var(--font-sans)" }}
                        fontWeight={600}
                      >
                        {s.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
                {g.skills.length > 1 &&
                  ([
                    [20, 40, 40, 12],
                    [40, 12, 60, 40],
                    [20, 40, 40, 55],
                    [40, 55, 60, 40],
                  ] as [number, number, number, number][])
                    .slice(0, g.skills.length - 1)
                    .map(([x1, y1, x2, y2], k) => (
                      <line
                        key={k}
                        x1={x1} y1={y1}
                        x2={x2} y2={y2}
                        stroke={T.indigo} strokeWidth={1} opacity={0.4}
                      />
                    ))}
              </svg>
            </div>
            <div>
              <div className="mb-1 text-[0.9375rem] font-semibold" style={{ color: T.ink }}>{g.label}</div>
              <div className="text-[0.8125rem]" style={{ color: T.ink3 }}>
                {g.skills.length ? `${g.skills.length} core skills` : "You define it"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SkillSnapshot({
  goal,
  answers,
  setAnswers,
  onBack,
  onNext,
}: {
  goal: Goal;
  answers: Record<string, boolean>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const questions = SKILL_QUESTIONS[goal.id] ?? [];
  const nodes = NODES_BY_GOAL[goal.id] ?? [];
  const known = Object.values(answers).filter(Boolean).length;

  return (
    <div
      className="grid items-start gap-12 lg:grid-cols-2"
      style={{ animation: "krit-slide-in-right 0.45s ease forwards" }}
    >
      <div>
        <h1
          className="mb-3 font-serif text-[clamp(1.5rem,2.5vw,2rem)] leading-tight"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          What do you already know?
        </h1>
        <p className="mb-8 text-[0.9375rem] font-light" style={{ color: T.ink2 }}>
          Quick yes/no — this seeds your skill graph with your real starting point.
        </p>
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => {
            const yes = answers[q.id] === true;
            const no = answers[q.id] === false;
            return (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3.5 transition-colors"
                style={{
                  borderColor: yes ? T.indigo : T.rule,
                  animation: `krit-fade-up 0.4s ease ${i * 0.07}s both`,
                }}
              >
                <span
                  className="text-[0.9375rem]"
                  style={{ color: T.ink, fontWeight: yes ? 500 : 400 }}
                >
                  {q.skill}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: true }))}
                    className="rounded-md border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-all"
                    style={{
                      borderColor: yes ? T.indigo : T.rule,
                      background: yes ? T.indigo : "transparent",
                      color: yes ? "white" : T.ink3,
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: false }))}
                    className="rounded-md border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-all"
                    style={{
                      borderColor: no ? T.ink : T.rule,
                      background: no ? T.ink : "transparent",
                      color: no ? "white" : T.ink3,
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
          {questions.length === 0 && (
            <p className="text-sm" style={{ color: T.ink3 }}>
              We&rsquo;ll start fresh — your goal will shape the graph.
            </p>
          )}
        </div>
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md px-4 py-2.5 text-[0.875rem]"
            style={{ background: "transparent", color: T.ink3 }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-md px-7 py-3 text-[0.9375rem] font-medium text-white"
            style={{ background: T.indigo }}
          >
            {Object.keys(answers).length === 0 ? "Skip →" : "Continue →"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: T.rule }}>
        <p
          className="mb-4 text-xs font-medium uppercase tracking-[0.08em]"
          style={{ color: T.ink3 }}
        >
          Your starting graph · {goal.label}
        </p>
        <svg viewBox="0 0 200 180" width="100%" height={220}>
          {nodes.map((n, i) =>
            nodes.slice(i + 1).map((m, j) => {
              const dx = Math.abs(n.x - m.x);
              const dy = Math.abs(n.y - m.y);
              if (dx < 0.4 && dy < 0.4)
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={n.x * 200} y1={n.y * 180}
                    x2={m.x * 200} y2={m.y * 180}
                    stroke={T.rule} strokeWidth={1.5}
                  />
                );
              return null;
            }),
          )}
          {nodes.map((n, i) => {
            const ans = questions[i] ? answers[questions[i].id] : undefined;
            const col = ans === true ? T.indigo : ans === false ? "oklch(0.72 0.06 264)" : T.rule;
            return (
              <g
                key={i}
                style={{
                  animation: `krit-node-bloom 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`,
                  transformOrigin: `${n.x * 200}px ${n.y * 180}px`,
                }}
              >
                <circle cx={n.x * 200} cy={n.y * 180} r={18} fill={col} opacity={ans === true ? 1 : 0.5} />
                <text
                  x={n.x * 200} y={n.y * 180 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={7.5} fontWeight={600}
                  fill={ans === true ? "white" : "oklch(0.5 0.01 264)"}
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {n.l}
                </text>
                {ans === true &&
                  Array.from({ length: 3 }, (_, k) => {
                    const a = (k / 3) * Math.PI * 2;
                    return (
                      <circle
                        key={k}
                        cx={n.x * 200 + Math.cos(a) * 26}
                        cy={n.y * 180 + Math.sin(a) * 26}
                        r={3}
                        fill={T.violet}
                        opacity={0.8}
                      />
                    );
                  })}
              </g>
            );
          })}
        </svg>
        {known > 0 && (
          <p className="mt-2 text-center text-[0.8125rem]" style={{ color: T.ink3 }}>
            {known} skill{known > 1 ? "s" : ""} seeded from your knowledge
          </p>
        )}
      </div>
    </div>
  );
}

function TimeCommitment({
  timeIdx,
  setTimeIdx,
  onBack,
  onNext,
}: {
  timeIdx: number;
  setTimeIdx: (n: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const opt = TIME_OPTIONS[timeIdx]!;
  return (
    <div
      className="max-w-2xl"
      style={{ animation: "krit-slide-in-right 0.45s ease forwards" }}
    >
      <h1
        className="mb-3 font-serif text-[clamp(1.5rem,2.5vw,2rem)]"
        style={{ color: T.ink, fontWeight: 400 }}
      >
        How much time can you give it?
      </h1>
      <p className="mb-10 text-[0.9375rem] font-light" style={{ color: T.ink2 }}>
        Be honest — a realistic schedule beats an ambitious one you&rsquo;ll abandon.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {TIME_OPTIONS.map((o, i) => (
          <button
            key={o.mins}
            type="button"
            onClick={() => setTimeIdx(i)}
            className="rounded-xl border-2 p-6 text-center transition-all"
            style={{
              borderColor: timeIdx === i ? T.indigo : T.rule,
              background: timeIdx === i ? T.indigoLight : "white",
            }}
          >
            <div
              className="mb-1 font-serif text-[1.75rem]"
              style={{ color: timeIdx === i ? T.indigo : T.ink }}
            >
              {o.mins}
              <span className="ml-0.5 text-base">m</span>
            </div>
            <div className="text-[0.8125rem]" style={{ color: timeIdx === i ? T.indigo : T.ink3 }}>
              {o.label}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-8 rounded-xl border bg-white p-6" style={{ borderColor: T.rule }}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[0.9375rem]" style={{ color: T.ink2 }}>
            At {opt.label}, your credential is {opt.weeks} weeks away
          </p>
          <span className="text-sm font-semibold" style={{ color: T.indigo }}>{opt.weeks}w</span>
        </div>
        <div
          className="relative h-3 overflow-hidden rounded-full"
          style={{ background: T.rule }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${(1 - opt.weeks / 20) * 100}%`,
              background: `linear-gradient(90deg, ${T.indigo}, ${T.violet})`,
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs" style={{ color: T.ink3 }}>
          <span>Today</span>
          <span>Credential ✓</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md px-4 py-2.5 text-[0.875rem]"
          style={{ background: "transparent", color: T.ink3 }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md px-7 py-3 text-[0.9375rem] font-medium text-white"
          style={{ background: T.indigo }}
        >
          Set my schedule →
        </button>
      </div>
    </div>
  );
}

function FirstLesson({
  goal,
  minutes,
  onStart,
  onBack,
}: {
  goal: Goal;
  minutes: number;
  onStart: () => void;
  onBack: () => void;
}) {
  const lessons: Record<string, { title: string; duration: string; skills: string[] }> = {
    ml: { title: "Python types and the mutable trap", duration: "12 min", skills: ["Python", "Types"] },
    pm: { title: "What is SQL, and why it still matters", duration: "8 min", skills: ["SQL", "Data"] },
    job: { title: "What is Python, and why it's everywhere", duration: "8 min", skills: ["Python"] },
    sql: { title: "What is SQL, and why it still matters", duration: "8 min", skills: ["SQL"] },
    other: { title: "What is SQL, and why it still matters", duration: "8 min", skills: ["Orientation"] },
  };
  const lesson = lessons[goal.id]!;

  return (
    <div className="max-w-xl" style={{ animation: "krit-slide-in-right 0.45s ease forwards" }}>
      <div className="mb-1 text-[0.8125rem] font-medium" style={{ color: T.indigo }}>You&rsquo;re all set.</div>
      <h1
        className="mb-3 font-serif text-[clamp(1.5rem,2.5vw,2.25rem)] leading-tight"
        style={{ color: T.ink, fontWeight: 400 }}
      >
        Your first lesson is ready.
      </h1>
      <p className="mb-10 text-[0.9375rem] font-light" style={{ color: T.ink2 }}>
        One lesson. {lesson.duration}. {minutes} minutes/day from here.
      </p>

      <div
        className="mb-6 rounded-2xl border-2 bg-white p-7 shadow-[0_0_0_4px_oklch(0.52_0.22_264_/_0.08)]"
        style={{ borderColor: T.indigo }}
      >
        <div className="mb-4 flex items-center gap-2.5">
          {lesson.skills.map((s) => (
            <span
              key={s}
              className="rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.06em]"
              style={{ background: T.indigoLight, color: T.indigo, borderColor: T.indigoMid }}
            >
              {s}
            </span>
          ))}
          <span className="ml-auto text-xs" style={{ color: T.ink3 }}>{lesson.duration}</span>
        </div>
        <h2
          className="mb-4 font-serif text-[1.25rem] leading-snug"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          {lesson.title}
        </h2>
        <div className="flex gap-4 text-[0.8125rem]" style={{ color: T.ink3 }}>
          <span>📖 Reading + exercises</span>
          <span>+3 evidence items</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md px-4 py-2.5 text-[0.875rem]"
          style={{ background: "transparent", color: T.ink3 }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onStart}
          className="flex-1 rounded-md px-6 py-3.5 text-base font-medium text-white"
          style={{ background: T.indigo }}
        >
          Start lesson →
        </button>
      </div>
      <p className="mt-3 text-center text-[0.8125rem]" style={{ color: T.ink3 }}>
        You can <Link href="/catalog" className="underline" style={{ color: T.indigo }}>explore the catalog</Link> first if you&rsquo;d like.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const T = {
  indigo: "oklch(0.52 0.22 264)",
  indigoLight: "oklch(0.66 0.22 264)",
  violet: "oklch(0.52 0.22 292)",
  rule: "rgba(255,255,255,0.1)",
  gold: "oklch(0.80 0.12 76)",
};

export interface CelebrationProps {
  title: string;
  learner: string;
  issueDate: string;
  code: string;
  skills: { label: string; count: number }[];
  credentialUrl: string;
  onDismiss?: () => void;
}

function playClick() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // best-effort only
  }
}

export function CelebrationOverlay({ title, learner, issueDate, code, skills, credentialUrl, onDismiss }: CelebrationProps) {
  const [phase, setPhase] = useState(0);
  const [muted, setMuted] = useState(false);
  const [orbR, setOrbR] = useState(220);

  useEffect(() => {
    const setR = () => setOrbR(Math.min(window.innerWidth * 0.24, 220));
    setR();
    window.addEventListener("resize", setR);
    return () => window.removeEventListener("resize", setR);
  }, []);

  // Phase 1 (overlay) → 2 (orbs) → 3 (card) → 4 (seal) → 5 (actions)
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  useEffect(() => {
    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 700);
    const t2 = setTimeout(() => {
      setPhase(3);
      if (!mutedRef.current) playClick();
    }, 1700);
    const t3 = setTimeout(() => setPhase(4), 2600);
    const t4 = setTimeout(() => setPhase(5), 3300);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-[background] duration-700"
      style={{
        background: phase >= 1 ? "oklch(0.10 0.018 264)" : "transparent",
        fontFamily: "var(--font-sans)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Credential earned"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.52 0.22 264 / 0.12) 0%, transparent 70%)" }}
      />

      <div
        className="absolute inset-x-0 top-8 text-center transition-opacity duration-500"
        style={{ opacity: phase >= 1 ? 1 : 0 }}
      >
        <span className="font-serif text-lg" style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
          You earned it.
        </span>
      </div>

      <div
        className="relative transition-[margin] duration-500"
        style={{
          width: orbR * 2,
          height: orbR * 2,
          marginBottom: phase >= 3 ? "-4rem" : 0,
        }}
      >
        {skills.map((s, i) => {
          const angle = (i / skills.length) * Math.PI * 2;
          const cx = Math.cos(angle) * orbR;
          const cy = Math.sin(angle) * orbR;
          return (
            <div
              key={s.label}
              className="absolute left-1/2 top-1/2 transition-opacity duration-500"
              style={{
                transform: `translate(${cx}px, ${cy}px) translate(-50%, -50%)`,
                opacity: phase >= 2 ? 1 : 0,
                transitionDelay: `${i * 0.08}s`,
              }}
            >
              <div
                className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.rule}` }}
              >
                <div className="text-[11px] font-semibold leading-none" style={{ color: "rgba(255,255,255,0.6)" }}>{s.count}</div>
                <div
                  className="mt-0.5 max-w-[40px] text-center text-[8px] leading-tight"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
        <div
          className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background] duration-700"
          style={{
            background: phase >= 3 ? "radial-gradient(circle, oklch(0.52 0.22 264 / 0.4), transparent)" : "transparent",
          }}
        />
      </div>

      <div
        className="relative z-10 transition-[margin] duration-500"
        style={{ marginTop: phase >= 3 ? "-1rem" : "2rem" }}
      >
        <CredentialCard
          phase={phase}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          title={title}
          learner={learner}
          issueDate={issueDate}
          code={code}
        />
      </div>

      <div
        className="mt-8 flex flex-wrap justify-center gap-3 px-4 transition-all duration-500"
        style={{
          opacity: phase >= 5 ? 1 : 0,
          transform: phase >= 5 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(credentialUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-6 py-3 text-[0.9375rem] font-medium text-white no-underline"
          style={{ background: T.indigo }}
        >
          <LinkedinIcon /> Share to LinkedIn
        </a>
        <Link
          href={credentialUrl}
          className="flex items-center rounded-lg px-6 py-3 text-[0.9375rem] font-medium no-underline"
          style={{
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          View credential →
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-4 py-3 text-sm"
          style={{ color: "rgba(255,255,255,0.42)", background: "transparent", border: "none" }}
        >
          Continue learning
        </button>
      </div>

      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes ring-pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function CredentialCard({
  phase,
  muted,
  onToggleMute,
  title,
  learner,
  issueDate,
  code,
}: {
  phase: number;
  muted: boolean;
  onToggleMute: () => void;
  title: string;
  learner: string;
  issueDate: string;
  code: string;
}) {
  return (
    <div
      className="relative w-[360px] max-w-[92vw] overflow-hidden rounded-2xl transition-all duration-700"
      style={{
        background: "linear-gradient(135deg, oklch(0.22 0.04 264), oklch(0.18 0.02 264))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px oklch(0.52 0.22 264 / 0.15)",
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(28px)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[2] rounded-2xl"
        style={{
          background:
            "linear-gradient(105deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 70%)",
          backgroundSize: "200% 100%",
          animation: phase >= 3 ? "shimmer-sweep 3s ease-in-out 0.5s infinite" : "none",
        }}
      />
      <div className="border-b px-7 py-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: T.indigoLight }}
          >
            Krit · Verified Credential
          </span>
          <button
            onClick={onToggleMute}
            type="button"
            className="flex items-center gap-1 text-xs"
            style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none" }}
            aria-label={muted ? "Sound off" : "Sound on"}
          >
            {muted ? "🔇" : "🔔"} {muted ? "Sound off" : "Sound on"}
          </button>
        </div>
        <h2 className="font-serif text-[1.625rem] leading-tight tracking-tight text-white" style={{ fontWeight: 400 }}>
          {title}
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Earned by {learner}
        </p>
      </div>
      <div className="flex items-center gap-5 px-7 py-7">
        <svg width={64} height={64} viewBox="0 0 72 72" aria-hidden>
          <circle cx={36} cy={36} r={34} fill={T.indigo} />
          <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const r1 = 27, r2 = 31;
            return (
              <line
                key={i}
                x1={36 + Math.cos(a) * r1} y1={36 + Math.sin(a) * r1}
                x2={36 + Math.cos(a) * r2} y2={36 + Math.sin(a) * r2}
                stroke="white" strokeWidth={i % 6 === 0 ? 1.5 : 0.75} opacity={0.6}
              />
            );
          })}
          <polyline
            points="21,36 30,47 51,25"
            fill="none" stroke="white"
            strokeWidth={3.5}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={80}
            style={{
              strokeDashoffset: phase >= 4 ? 0 : 80,
              transition: "stroke-dashoffset 0.6s ease 0.2s",
            }}
          />
        </svg>
        <div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{issueDate}</p>
          <p
            className="mt-1 inline-block rounded px-2 py-0.5 font-mono text-xs tracking-wider"
            style={{ color: T.indigoLight, background: "rgba(255,255,255,0.05)" }}
          >
            {code}
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkedinIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

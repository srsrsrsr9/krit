"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const T = {
  ink: "oklch(0.14 0.015 264)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  indigo: "oklch(0.52 0.22 264)",
  rule: "oklch(0.88 0.008 264)",
};

interface SkillEvidence {
  name: string;
  level: number;          // 0..3
  evidence: number;       // count
  description?: string;
}

export interface CredentialView {
  title: string;
  learner: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  code: string;
  skills: SkillEvidence[];
}

const LEVEL_LABEL = ["–", "Familiar", "Proficient", "Mastered"] as const;
function levelColor(l: number): string {
  if (l <= 0) return T.rule;
  if (l === 1) return "oklch(0.75 0.14 264)";
  if (l === 2) return "oklch(0.62 0.19 264)";
  return T.indigo;
}

export function CredentialPublicView({ credential }: { credential: CredentialView }) {
  const [copied, setCopied] = useState(false);
  const [showOG, setShowOG] = useState(false);

  function copyLink() {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => undefined,
    );
  }

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareText = `${credential.learner} earned the ${credential.title} credential on Krit.`;

  return (
    <div className="krit-landing min-h-screen">
      <header className="border-b bg-white" style={{ borderColor: T.rule }}>
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="font-serif text-lg font-semibold no-underline" style={{ color: T.ink }}>
            Krit
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.8125rem] sm:inline" style={{ color: T.ink3 }}>Issued credential</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide"
              style={{ background: T.ink, color: "white" }}
            >
              <CheckCircle size={10} />
              Verified
            </span>
          </div>
        </div>
      </header>

      <section className="px-4 py-16 sm:px-8 sm:py-20" style={{ background: T.ink }}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="krit-fade-up">
            <Seal size={80} />
          </div>
          <p
            className="krit-fade-up mt-8 text-xs font-medium uppercase tracking-[0.12em]"
            style={{ color: T.indigo, animationDelay: "0.1s" }}
          >
            Krit · Verified Credential
          </p>
          <h1
            className="krit-fade-up mt-5 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[1.15] tracking-tight"
            style={{ color: "white", fontWeight: 400, animationDelay: "0.18s" }}
          >
            {credential.title}
          </h1>
          <div className="krit-fade-up mt-7" style={{ animationDelay: "0.28s" }}>
            <p className="text-sm" style={{ color: "oklch(0.68 0.008 264)" }}>Earned by</p>
            <p
              className="mt-1 font-serif text-[clamp(1.5rem,3.5vw,2.25rem)]"
              style={{ color: "white", fontWeight: 400 }}
            >
              {credential.learner}
            </p>
          </div>
          <div className="krit-fade-up mt-10 flex flex-wrap items-start justify-center gap-12" style={{ animationDelay: "0.36s" }}>
            <Stat label="Issued" value={credential.issueDate} />
            {credential.expiryDate && <Stat label="Expires" value={credential.expiryDate} />}
            <Stat label="Skills verified" value={String(credential.skills.length)} />
          </div>
          <div
            className="krit-fade-up mt-10 inline-flex flex-col items-center gap-2"
            style={{ animationDelay: "0.44s" }}
          >
            <p className="text-xs uppercase tracking-[0.06em]" style={{ color: "oklch(0.45 0.01 264)" }}>
              Verification code
            </p>
            <span
              className="rounded-md border px-4 py-2 font-mono text-[0.8125rem] tracking-[0.12em]"
              style={{
                background: "oklch(0.20 0.015 264)",
                borderColor: "oklch(0.28 0.02 264)",
                color: "oklch(0.82 0.1 264)",
              }}
            >
              {credential.code}
            </span>
            <p className="text-xs" style={{ color: "oklch(0.42 0.01 264)" }}>
              Verify at krit.so/verify
            </p>
          </div>
        </div>
      </section>

      <div className="border-b bg-white px-4 py-4 sm:px-8" style={{ borderColor: T.rule }}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
          <span className="mr-1 text-[0.8125rem]" style={{ color: T.ink3 }}>Share</span>
          <ShareBtn href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}>
            <LinkedinIcon /> LinkedIn
          </ShareBtn>
          <ShareBtn href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}>
            <XIcon /> Post on X
          </ShareBtn>
          <button className="krit-share-btn" onClick={copyLink} type="button">
            {copied ? "✓ Copied" : "⌘ Copy link"}
          </button>
          <button
            className="krit-share-btn ml-auto"
            style={{ fontSize: "0.75rem", color: T.ink3 }}
            onClick={() => setShowOG((s) => !s)}
            type="button"
          >
            {showOG ? "Hide" : "Show"} OG preview
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="mb-10">
          <h2 className="font-serif text-2xl" style={{ color: T.ink, fontWeight: 400 }}>Skill evidence</h2>
          <p className="mt-2 text-[0.9375rem] font-light" style={{ color: T.ink3 }}>
            Each skill was assessed through reading comprehension logs, exercises, and applied work. Evidence is cryptographically linked to this credential.
          </p>
        </div>
        <div>
          {credential.skills.map((s, i) => (
            <SkillRow key={s.name} skill={s} index={i} />
          ))}
        </div>

        <div
          className="mt-12 flex items-center gap-5 rounded-xl border bg-white p-7"
          style={{ borderColor: T.rule }}
        >
          <Seal size={48} />
          <div className="flex-1">
            <p className="font-medium" style={{ color: T.ink }}>Issued by {credential.issuer}</p>
            <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: T.ink3 }}>
              Krit credentials are backed by verifiable evidence records. This credential was not handed out — it was earned through demonstrated mastery.
            </p>
          </div>
          <Link
            href="/"
            className="hidden whitespace-nowrap text-[0.8125rem] font-medium no-underline sm:inline-block"
            style={{ color: T.indigo }}
          >
            krit.so →
          </Link>
        </div>

        <p className="mt-6 text-center text-[0.8125rem]" style={{ color: T.ink3 }}>
          Verify this credential independently at{" "}
          <span className="font-medium" style={{ color: T.indigo }}>krit.so/credentials/{credential.code}</span>
        </p>
      </section>

      {showOG && <OGPreview credential={credential} onClose={() => setShowOG(false)} />}

      <style jsx>{`
        :global(.krit-fade-up) { animation: kritFadeUp 0.55s ease forwards; opacity: 0; }
        :global(.krit-share-btn) {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1.1rem; border-radius: 6px;
          font-family: var(--font-sans); font-size: 0.875rem; font-weight: 500;
          cursor: pointer; border: 1.5px solid ${T.rule}; background: white; color: ${T.ink2};
          transition: all 0.18s; line-height: 1;
        }
        :global(.krit-share-btn:hover) {
          border-color: ${T.indigo}; color: ${T.indigo}; background: oklch(0.94 0.04 264);
        }
        @keyframes kritFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.06em]" style={{ color: "oklch(0.45 0.01 264)" }}>{label}</p>
      <p className="mt-1 text-base font-medium" style={{ color: "oklch(0.78 0.01 264)" }}>{value}</p>
    </div>
  );
}

function ShareBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="krit-share-btn" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function SkillRow({ skill, index }: { skill: SkillEvidence; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) setVisible(true); },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const maxLevel = 3;
  const pct = (skill.level / maxLevel) * 100;
  const c = levelColor(skill.level);

  return (
    <div
      ref={ref}
      className="krit-fade-up border-b py-5"
      style={{ borderColor: T.rule, animationDelay: `${index * 0.06}s` }}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[0.9375rem] font-medium" style={{ color: T.ink }}>{skill.name}</span>
          {skill.description && (
            <span className="ml-3 text-[0.8125rem]" style={{ color: T.ink3 }}>{skill.description}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[0.8125rem]" style={{ color: T.ink3 }}>{skill.evidence} evidence items</span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{ color: c, background: `${c}1a`, borderColor: `${c}40` }}
          >
            {LEVEL_LABEL[Math.min(skill.level, 3)]}
          </span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: T.rule }}>
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: visible ? `${pct}%` : "0%", background: c }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {Array.from({ length: skill.evidence }, (_, k) => (
          <span
            key={k}
            className="block h-1.5 w-1.5 rounded-full transition-transform duration-200"
            style={{
              background: c,
              opacity: 0.55 + (k / Math.max(1, skill.evidence)) * 0.45,
              transform: visible ? "scale(1)" : "scale(0)",
              transitionDelay: `${0.4 + k * 0.03}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Seal({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-label="Verification seal">
      <circle cx={40} cy={40} r={38} fill={T.indigo} />
      <circle cx={40} cy={40} r={34} fill="none" stroke="white" strokeWidth={1} opacity={0.3} />
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const r1 = 30, r2 = 34;
        return (
          <line
            key={i}
            x1={40 + Math.cos(angle) * r1} y1={40 + Math.sin(angle) * r1}
            x2={40 + Math.cos(angle) * r2} y2={40 + Math.sin(angle) * r2}
            stroke="white"
            strokeWidth={i % 6 === 0 ? 1.5 : 0.75}
            opacity={0.6}
          />
        );
      })}
      <polyline
        points="24,40 34,52 56,28"
        fill="none" stroke="white" strokeWidth={3.5}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircle({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden>
      <circle cx={5} cy={5} r={4.5} fill="none" stroke="white" strokeWidth={0.8} />
      <polyline points="2.5,5 4,7 7.5,3" fill="none" stroke="white" strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function OGPreview({ credential, onClose }: { credential: CredentialView; onClose: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[300px] overflow-hidden rounded-xl border bg-white shadow-2xl"
      style={{ borderColor: T.rule }}
    >
      <div className="flex items-center justify-between border-b px-3.5 py-2.5" style={{ borderColor: T.rule }}>
        <span className="text-xs font-medium" style={{ color: T.ink3 }}>OG preview · 1200×630</span>
        <button onClick={onClose} className="text-base leading-none" style={{ color: T.ink3 }} type="button">×</button>
      </div>
      <div className="flex flex-col justify-center gap-2 p-6" style={{ background: T.ink, aspectRatio: "1200/630" }}>
        <div className="text-[0.55rem] font-medium uppercase tracking-[0.1em]" style={{ color: T.indigo }}>
          Krit · Verified Credential
        </div>
        <div className="font-serif text-lg leading-tight text-white">{credential.title}</div>
        <div className="text-[0.6rem]" style={{ color: "oklch(0.68 0.008 264)" }}>
          Earned by {credential.learner} · {credential.issueDate}
        </div>
        <div className="mt-1 flex gap-1.5">
          {credential.skills.slice(0, 6).map((s, i) => (
            <div key={i} className="h-1 w-5 rounded-sm" style={{ background: levelColor(s.level) }} />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[0.5rem] text-white"
            style={{ background: T.indigo }}
          >
            ✓
          </span>
          <span className="text-[0.55rem]" style={{ color: T.indigo }}>
            Cryptographically verified · {credential.code}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  SkillGraph,
  IllustrationGraph,
  IllustrationTutor,
  IllustrationCredential,
  StepDiagram,
} from "@/components/brand/illustrations";

const T = {
  indigo: "oklch(0.52 0.22 264)",
  violet: "oklch(0.52 0.22 290)",
  ink: "oklch(0.14 0.015 264)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  rule: "oklch(0.88 0.008 264)",
  indigoLight: "oklch(0.94 0.04 264)",
  indigoMid: "oklch(0.88 0.07 264)",
};

/**
 * Reusable scroll-reveal hook — adds .is-visible to .krit-reveal children
 * once they intersect 12% of the viewport.
 */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-visible");
      },
      { threshold: 0.12 },
    );
    el.querySelectorAll(".krit-reveal").forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);
  return ref;
}

// Common pill — used for section labels.
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.06em]"
      style={{ borderColor: T.indigoMid, color: T.indigo, background: T.indigoLight }}
    >
      {children}
    </span>
  );
}

function ButtonPrimary({ children, href = "#", className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-7 py-3 text-[0.9375rem] font-medium tracking-wide text-white transition-[background,transform] duration-150 hover:-translate-y-px ${className}`}
      style={{ background: T.indigo, fontFamily: "var(--font-sans)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.violet)}
      onMouseLeave={(e) => (e.currentTarget.style.background = T.indigo)}
    >
      {children}
    </Link>
  );
}

function ButtonGhost({ children, href = "#", className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-7 py-3 text-[0.9375rem] font-medium tracking-wide transition-all duration-150 ${className}`}
      style={{ color: T.indigo, border: `1.5px solid ${T.indigoMid}`, fontFamily: "var(--font-sans)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = T.indigo;
        e.currentTarget.style.background = T.indigoLight;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.indigoMid;
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────────────

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md transition-colors"
      style={{
        background: "oklch(0.985 0.006 80 / 0.92)",
        borderBottom: `1px solid ${scrolled ? T.rule : "transparent"}`,
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-8">
        <Link href="/" className="flex flex-1 items-baseline gap-1.5 no-underline">
          <span className="font-serif text-[1.35rem] font-semibold" style={{ color: T.ink }}>Krit</span>
          <span className="mb-0.5 text-[0.65rem] font-medium uppercase tracking-[0.1em]" style={{ color: T.ink3 }}>beta</span>
        </Link>
        <div className="hidden items-center gap-8 sm:flex">
          {[
            { label: "Product", href: "#features" },
            { label: "For Teams", href: "#pricing" },
            { label: "Pricing", href: "#pricing" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm transition-colors duration-150"
              style={{ color: T.ink2, fontFamily: "var(--font-sans)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.ink)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.ink2)}
            >
              {l.label}
            </Link>
          ))}
          <ButtonPrimary href="/sign-in" className="!px-5 !py-2 !text-sm">Get early access</ButtonPrimary>
        </div>
        <div className="sm:hidden">
          <ButtonPrimary href="/sign-in" className="!px-4 !py-2 !text-xs">Sign in</ButtonPrimary>
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────

export function LandingHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-40">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <Chip>Skill-first learning</Chip>
          <h1
            className="mt-6 font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.15] tracking-[-0.01em]"
            style={{ color: T.ink, fontWeight: 400 }}
          >
            Learn skills.
            <br />
            Not courses.
            <br />
            <em style={{ color: T.indigo }}>Show your work.</em>
          </h1>
          <p
            className="mt-6 max-w-md text-lg font-light leading-[1.7]"
            style={{ color: T.ink2 }}
          >
            Krit maps every concept into a skill graph — with AI that watches what you read and verifiable credentials that prove what you know.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonPrimary href="/sign-in">Start learning free</ButtonPrimary>
            <ButtonGhost href="#pricing">For L&amp;D teams →</ButtonGhost>
          </div>
          <p className="mt-5 text-[0.8125rem]" style={{ color: T.ink3 }}>
            No credit card. Free access to 200+ skills.
          </p>
        </div>
        <div
          className="rounded-2xl border bg-white p-8 shadow-[0_4px_24px_oklch(0.52_0.22_264_/_0.05)]"
          style={{ borderColor: T.rule }}
        >
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.08em]"
            style={{ color: T.ink3, fontFamily: "var(--font-sans)" }}
          >
            Your skill graph · Data Science path
          </p>
          <SkillGraph animated />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    chip: "Skill graph",
    title: "The atomic unit is the skill, not the course.",
    body: "Every piece of knowledge in Krit is a discrete skill with prerequisites, mastery levels, and evidence requirements. You see exactly what you know, what unlocks next, and the shortest path to your goal.",
    Illustration: IllustrationGraph,
  },
  {
    chip: "AI tutor",
    title: "An AI that sees exactly what you read.",
    body: "As you read lessons, Atlas observes your reading behaviour — time on page, re-reads, what you flag — and surfaces the right question at the right moment. It doesn't quiz you; it notices gaps and fills them.",
    Illustration: IllustrationTutor,
  },
  {
    chip: "Credentials",
    title: "Verifiable proof that travels with you.",
    body: "Every credential links back to the evidence: real work samples, quiz results, project reviews. Share a URL on LinkedIn or your résumé. Employers can verify in one click, forever.",
    Illustration: IllustrationCredential,
  },
];

export function LandingFeatures() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      id="features"
      ref={ref}
      className="border-y bg-white px-4 py-24 sm:px-8 sm:py-28"
      style={{ borderColor: T.rule }}
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: T.ink3 }}>How Krit works</p>
        <h2
          className="krit-reveal mt-3 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-snug"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          Three ideas that change how learning sticks.
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.chip}
              className="krit-reveal rounded-xl border bg-white p-10 transition-shadow duration-200 hover:shadow-[0_8px_32px_oklch(0.52_0.22_264_/_0.08)]"
              style={{ borderColor: T.rule, transitionDelay: `${i * 0.1}s` }}
            >
              <div className="mb-7 rounded-lg p-5" style={{ background: T.indigoLight }}>
                <f.Illustration />
              </div>
              <Chip>{f.chip}</Chip>
              <h3
                className="mt-4 font-serif text-[1.25rem] leading-snug"
                style={{ color: T.ink, fontWeight: 400 }}
              >
                {f.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] font-light leading-[1.75]" style={{ color: T.ink2 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// How It Works
// ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { num: "01", title: "Pick a skill goal", body: "Choose a role or skill cluster. Krit maps the prerequisite graph and shows you where you stand today." },
  { num: "02", title: "Learn with your AI tutor", body: "Read curated lessons. Atlas tracks your comprehension in real time and surfaces exercises exactly when you need them." },
  { num: "03", title: "Earn a verifiable credential", body: "Once evidence thresholds are met, Krit issues a cryptographically signed credential you can share anywhere." },
];

export function LandingHowItWorks() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="px-4 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: T.ink3 }}>The process</p>
        <h2
          className="krit-reveal mt-3 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-snug"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          Three steps. No fluff.
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.num} className="krit-reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="mb-6 flex items-start gap-5">
                <div className="font-serif text-5xl leading-none" style={{ color: T.indigo, opacity: 0.25 }}>{s.num}</div>
                <StepDiagram step={(i + 1) as 1 | 2 | 3} />
              </div>
              <h3 className="mb-2 text-base font-semibold" style={{ color: T.ink }}>{s.title}</h3>
              <p className="text-[0.9375rem] font-light leading-[1.75]" style={{ color: T.ink2 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Social proof
// ─────────────────────────────────────────────────────────────────────

export function LandingSocialProof() {
  return (
    <section className="border-y bg-white px-4 py-16 sm:px-8 sm:py-20" style={{ borderColor: T.rule }}>
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-[0.8125rem]" style={{ color: T.ink3 }}>
          Trusted by L&amp;D teams at forward-thinking organisations
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-10">
          {[140, 90, 120, 80, 110, 95].map((w, i) => (
            <div key={i} className="krit-logo-ph" style={{ width: w }} />
          ))}
        </div>
        <p
          className="mx-auto mt-10 max-w-[520px] font-serif italic leading-[1.7]"
          style={{ color: T.ink2, fontSize: "1.125rem" }}
        >
          &ldquo;Krit gave us a single source of truth for skill readiness across 400 engineers — something no LMS had ever done.&rdquo;
        </p>
        <p className="mt-3 text-[0.8125rem]" style={{ color: T.ink3 }}>— Head of Engineering L&amp;D, Fortune 500 fintech</p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────────────

export function LandingPricing() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="pricing" ref={ref} className="px-4 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: T.ink3 }}>Pricing</p>
        <h2
          className="krit-reveal mt-3 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-snug"
          style={{ color: T.ink, fontWeight: 400 }}
        >
          Start free. Prove mastery when you&rsquo;re ready.
        </h2>
        <div className="mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <div
            className="krit-reveal rounded-xl border bg-white p-10"
            style={{ borderColor: T.rule }}
          >
            <Chip>For learners</Chip>
            <div className="mt-5 font-serif text-3xl" style={{ color: T.ink, fontWeight: 400 }}>Free</div>
            <p className="text-sm" style={{ color: T.ink3 }}>+ paid certifications</p>
            <div className="mt-6 space-y-3 border-t pt-5" style={{ borderColor: T.rule }}>
              {["Full skill graph access", "AI tutor on every lesson", "Personal evidence log", "Verifiable credential: from $29"].map((f) => (
                <div key={f} className="flex items-start gap-3 text-sm" style={{ color: T.ink2 }}>
                  <span style={{ color: T.indigo, marginTop: 1 }}>→</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <ButtonGhost href="/sign-in" className="mt-7 w-full">Start free</ButtonGhost>
          </div>
          <div
            className="krit-reveal rounded-xl border bg-white p-10"
            style={{
              borderColor: T.indigo,
              boxShadow: "0 0 0 3px oklch(0.52 0.22 264 / 0.10)",
              transitionDelay: "0.1s",
            }}
          >
            <Chip>For L&amp;D teams</Chip>
            <div className="mt-5 font-serif text-3xl" style={{ color: T.ink, fontWeight: 400 }}>Custom</div>
            <p className="text-sm" style={{ color: T.ink3 }}>per seat · per year</p>
            <div className="mt-6 space-y-3 border-t pt-5" style={{ borderColor: T.rule }}>
              {[
                "Everything in free",
                "Team skill gap dashboards",
                "Custom skill paths + content",
                "SSO + HRIS integration",
                "Dedicated success manager",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3 text-sm" style={{ color: T.ink2 }}>
                  <span style={{ color: T.indigo, marginTop: 1 }}>→</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <ButtonPrimary href="/sign-in" className="mt-7 w-full">Book a demo</ButtonPrimary>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────

const FOOTER_COLS = [
  { heading: "Product", links: ["Skill graph", "AI tutor", "Credentials", "For teams"] },
  { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { heading: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export function LandingFooter() {
  return (
    <footer className="px-4 pb-10 pt-16 sm:px-8" style={{ background: T.ink, color: "white" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="font-serif text-[1.35rem] font-semibold">Krit</div>
            <p className="mt-3 max-w-[260px] text-sm font-light leading-[1.7]" style={{ color: "oklch(0.68 0.008 264)" }}>
              Skill-first learning for the people who want to be sure they know what they say they know.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "oklch(0.55 0.01 264)" }}>{col.heading}</p>
              {col.links.map((l) => (
                <div key={l} className="mb-2">
                  <Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: "oklch(0.68 0.008 264)" }}>
                    {l}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t pt-6" style={{ borderColor: "oklch(0.22 0.01 264)" }}>
          <p className="text-[0.8125rem]" style={{ color: "oklch(0.45 0.01 264)" }}>
            © {new Date().getFullYear()} Krit Learning, Inc. The Sanskrit word <em>krit</em> means doer.
          </p>
          <p className="text-[0.8125rem]" style={{ color: "oklch(0.45 0.01 264)" }}>Made with care.</p>
        </div>
      </div>
    </footer>
  );
}

# DECISIONS.md — Architecture & Tool Decision Log

This file is append-only. Never edit or delete existing entries.
When a decision is superseded, add a new entry that references the old one.

Claude must append a new entry here after any session that:
- Chooses a library or tool over alternatives
- Establishes a new pattern or convention
- Abandons an approach that was tried and failed
- Makes a structural or architectural change

---

## Entry Format

```
## [YYYY-MM-DD] — Short title

**Context:** What problem were we solving?
**Decision:** What did we choose?
**Alternatives considered:** What else was evaluated and why rejected?
**Consequences:** What does this make easier or harder going forward?
**Supersedes:** [link to earlier entry if applicable]
```

---

## Log

## [YYYY-MM-DD] — Initial project setup

**Context:** Starting the project from scratch. Needed to pick the core stack.
**Decision:** Next.js 15 App Router, TypeScript strict, Tailwind v4, shadcn/ui.
**Alternatives considered:** Remix (less ecosystem maturity for our use case), Vite SPA (need SSR).
**Consequences:** App Router patterns throughout. No Pages Router patterns allowed.

---

<!-- Append new entries below this line -->

## [2026-04-24] — Skill-first data model (not course-first)

**Context:** The predecessor product was built course-first, with content as the atomic unit and skills absent from the model entirely. This made cross-path analytics, role readiness, credential provenance, and AI tutor context all awkward or impossible.
**Decision:** Rebuild the data model with `Skill` as the primitive. `Path`/`Lesson`/`Assessment`/`Project` are delivery; `Evidence` ties activities to skills; `SkillState` is a deterministic view over the ledger.
**Alternatives considered:**
- Course-first with skills as tags → keeps the old limitations, ceiling is low.
- Competency frameworks as configurable JSON → too permissive, no single source of truth.
**Consequences:** Every meaningful analytic ("team readiness", "who is ready for the Senior PM role") is a query over skill state. Credentials carry a snapshot of the evidence rows that earned them. Adaptive paths and skill-decay re-verification both become straightforward.

## [2026-04-24] — Event-sourced LRS as the ledger of truth

**Context:** Progress, streaks, credentials, analytics, and compliance roll-ups all need the same underlying facts: *who did what when*. Storing each as its own mutable counter would guarantee drift.
**Decision:** All learner activity is recorded as immutable `LrsEvent` rows (xAPI-shaped: actor-verb-object-context). `LessonProgress`, `SkillState`, and credential evidence are derived views that can be rebuilt at any time.
**Alternatives considered:** Direct mutation of progress tables → simpler day one, impossible to audit.
**Consequences:** Append-only means we can re-derive any metric historically. Heavy writes — but a single-writer event table with appropriate indexes is a well-trodden pattern.

## [2026-04-24] — Typed JSON content blocks, not HTML

**Context:** Needed a content format that survives AI authoring, multi-surface delivery (web/mobile/Slack), and AI tutor retrieval.
**Decision:** Lessons store a Zod-validated array of typed `ContentBlock` objects (`markdown`, `callout`, `code`, `quiz`, `tryIt`, `reflect`, `keyTakeaways`, `heading`, `image`, `video`). The renderer is a single component.
**Alternatives considered:**
- Raw HTML stored in DB → opaque, hard to author with AI, XSS footgun.
- MDX files on disk → good for docs, bad for per-workspace authoring.
**Consequences:** Authoring tools (AI-assisted or visual) produce valid JSON directly. Migrations are data-shape migrations, not HTML parsers.

## [2026-04-24] — iron-session cookie auth for the initial build [PROVISIONAL]

**Context:** STACK.md default is Clerk. For a first buildable, demo-able product, Clerk requires account setup and keys that block local experience.
**Decision:** Use `iron-session` with a signed cookie, plus a dev-only one-click sign-in page that enumerates seeded users. Auth is fully abstracted behind `lib/auth.ts` so the swap is mechanical.
**Alternatives considered:** Ship with Clerk from day one → adds friction for the first experience.
**Consequences:** Must swap to Clerk / SAML before first paying customer. Tracked in STACK.md as `[PROVISIONAL]`.

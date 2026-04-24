# CLAUDE.md — Production Kernel (V6)

Read this file at the start of every session. Load `docs/` on demand, not upfront.
New project? Run `/init` (or read `SETUP.md`), then delete `SETUP.md`.

---

## When to use this tier

Use the Production kernel when **at least one** of:
- Real users depend on uptime
- The codebase will outlive a single sprint
- More than one developer touches it
- Revenue or regulatory surface exists

Below that threshold, prefer `CLAUDE.mvp.md` (six sections, one file) or `CLAUDE.prototype.md` (no backend). Importing 19 module docs into a hobby repo is over-engineering and Claude will treat everything more cautiously than the project warrants.

---

## Stack

Stack nouns live in `STACK.md`. Read it when a decision depends on stack specifics. The kernel does not duplicate them.

If `STACK.md` is empty or still shows `[fill in]` placeholders → run `/init` before writing any code.

---

## Key Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run test         # full test suite
npm run lint         # ESLint + Prettier check
npm run typecheck    # tsc --noEmit
```

---

## ⚡ Quick Reference

Highest-frequency rules. Apply every session without loading the full doc.

| Area | Rule |
|---|---|
| **Styling** | `cn()` always · no inline styles · mobile-first · no arbitrary values unless justified |
| **TypeScript** | No `any` without comment · narrow `unknown`, never `as` |
| **Errors** | Return `Result<T,E>` from data layer (see `lib/result.ts`) · never expose stack traces to client |
| **DB** | Shared `db` instance · `select:` specific fields · transactions for multi-table writes · money as integer cents |
| **Git** | Stage only · never commit/push · developer's identity always (hook enforces) |
| **Secrets** | Never in source · no `NEXT_PUBLIC_` on sensitive vars (hook scans staging) |
| **Plans** | 3+ files, or touches auth/payments/schema → `/plan` first |
| **State** | Server → TanStack Query · Client → Zustand · Shareable → URL |
| **Quality** | No `any` · guard clauses · functions < 40 lines · no TODO without issue # |
| **Monitoring** | `captureError()` in catch · structured logger · never log PII |
| **Bugs** | `/bugfix` for anything non-trivial · one hypothesis · one change · 3 attempts = stop |
| **AI** | Validate outputs · budget tokens · log prompts+responses · graceful fallback |

---

## Slash Commands (use these instead of describing protocols)

| Command | What it does | When to use |
|---|---|---|
| `/init` | Runs SETUP questionnaire, fills STACK.md and CLAUDE.md | First session on a new project |
| `/plan` | Writes `docs/PLAN.md` in canonical format and waits for approval | Before any 3+ file change or risky area |
| `/spec` | Writes `docs/specs/[feature].md` and scaffolds a prototype | New user-facing flow where UX isn't obvious |
| `/bugfix` | Drives the BUGFIX protocol step by step | Any bug that isn't a one-line obvious fix |
| `/ship` | Runs pre-deploy checklist (typecheck, lint, test, build, staging verify) | Before a production deploy |
| `/reset` | Session reset — re-reads kernel, runs git status + typecheck, 5-bullet summary | Long session, degraded context, or stuck |
| `/break-glass` | Suspends PLAN gate + staging-first for emergency fix | Production down or active security incident |
| `/graduate` | Upgrade a tier (prototype → mvp → production) with checklist | When the project clears the next threshold |

Prefer slash commands over prose. Each one loads exactly the docs it needs.

---

## Load Before Acting

**Single-domain tasks:**

| Task | Read |
|---|---|
| Styling / UI components | `docs/STYLE.md` |
| State management question | `docs/STATE.md` |
| Error handling / logging | `docs/ERRORS.md` |
| Database / queries / migrations | `docs/DATABASE.md` |
| Tests | `docs/TESTING.md` |
| Auth, secrets, user input | `docs/SECURITY.md` |
| Images, bundle, rendering perf | `docs/PERFORMANCE.md` |
| Deploy config or commands | `docs/DEPLOY.md` |
| Env vars | `docs/ENV.md` |
| Git / commits | `docs/GIT.md` |
| Dependencies / package choice | `docs/PACKAGES.md` |
| Code review / naming / components | `docs/QUALITY.md` |
| Observability / alerting / incidents | `docs/MONITORING.md` |
| Tech debt / deprecation / refactoring | `docs/MAINTENANCE.md` |
| Bug fix (non-trivial) | `docs/BUGFIX.md` (or `/bugfix`) |
| Mobile work | `docs/MOBILE.md` |
| AI features / LLM calls / prompts | `docs/AI.md` |
| New feature with unclear UX | `docs/SPEC.md` (or `/spec`) |
| Feature with 3+ files or risk | `docs/PLAN.md` (or `/plan`) |
| Pattern worth reusing | Append to `docs/PATTERNS.md` |
| Tool / library choice made | Append to `docs/DECISIONS.md` |

**Multi-domain tasks — load the set:**

| Task shape | Load |
|---|---|
| New auth-protected page with form | `STYLE.md` + `SECURITY.md` + `ERRORS.md` + `QUALITY.md` |
| New server action that mutates data | `DATABASE.md` + `ERRORS.md` + `SECURITY.md` + `TESTING.md` |
| Payment / checkout change | `SECURITY.md` + `ERRORS.md` + `TESTING.md` + `DATABASE.md` + `DECISIONS.md` |
| New API route (external-facing) | `SECURITY.md` + `ERRORS.md` + `PERFORMANCE.md` + `MONITORING.md` |
| Feature that calls an LLM | `AI.md` + `ERRORS.md` + `SECURITY.md` + `MONITORING.md` |
| Dashboard / list view | `STYLE.md` + `STATE.md` + `PERFORMANCE.md` |

If the task doesn't match a pattern: load the single-domain doc closest to the core concern, and name the others you considered.

---

## Hard Rules

**MUST** — never violate · **SHOULD** — default, override with reason · **MAY** — preference (usually enforced by tooling)

### MUST
- No inline styles. Tailwind only.
- No `any` without a justification comment.
- No secrets in source code. Always `process.env`.
- No autonomous commits or pushes. Developer commits. (Hook blocks this.)
- No direct pushes to `main`. PR only.
- No production deploy without staging passing 24h.
- No new env var without `docs/ENV.md` entry.
- No feature complete without tests.
- No risky change without approved `docs/PLAN.md`.
- No `migrate dev` against prod. Use `migrate deploy`.

### SHOULD
- Return `Result<T,E>` from data-layer functions (import from `lib/result.ts`).
- Use `cuid()` for database IDs.
- Paginate queries that could return unbounded rows.
- Use `dynamic()` for components not needed on initial load.
- Use `next/image` and `next/font`. Not raw `<img>` / Google Fonts link.

### MAY (enforced by tooling — do not debate in code review)
- Tailwind class order — `prettier-plugin-tailwindcss` enforces.
- Import sort — Prettier enforces.
- Conventional Commits — Husky + commitlint enforce.

---

## Rule Conflict Resolution

When two rules conflict, apply the higher priority and document in `docs/DECISIONS.md`:

```
1. Security
2. Data integrity
3. Deployment safety
4. Runtime correctness
5. Code quality
6. Performance
7. Style preferences
```

**Known conflicts:**
- "Never throw" (ERRORS.md) vs framework boundary (Next.js server actions, route handlers) →
  Return `Result<T,E>` in your own code; convert to throw only at the framework edge. Comment the boundary.
- Plan gate vs urgent security fix → `/break-glass`, proceed, document within 24h.
- `select:` specific fields vs "just need everything" → always `select`, even if you list every column.

---

## Failure Tiers

**Tier 1 — Catastrophic** (stop everything)
Secret in source · prod deploy broken · destructive migration on live DB · prod data touched from dev

**Tier 2 — Expensive** (flag and fix before moving on)
Large refactor without plan · env var without ENV.md entry · silent API contract change · tests deleted to pass CI

**Tier 3 — Annoying** (fix this session)
Style inconsistency · missing `select:` · `console.log` committed · inconsistent naming

---

## 🔄 Session Reset

Long session, degraded context, or same fix failed 3 times → `/reset`.

Manually: STOP → re-read this file → re-read the relevant module doc → `git status` + `npm run typecheck` → write 5 bullets (goal / changes made / what's broken / last attempt / next step) → share before continuing.

Same bug failed 3 times: revert everything → follow `docs/BUGFIX.md` handoff.

---

## 🚨 Break Glass

Production down or critical security fix only. Use `/break-glass`.

Suspended: PLAN.md gate, staging-first deploy.
Never suspended: no secrets in source, no autonomous commits, no identity changes.
Document in DECISIONS.md within 24h. Review in next retrospective.

---

## Session Handoff

Resuming a project:
1. Read this kernel.
2. Read `STACK.md` if any stack decision is relevant.
3. Check `docs/PLAN.md` — if status is IN PROGRESS, that's where you are.
4. Read the last 3 entries in `docs/DECISIONS.md`.
5. Scan `docs/PATTERNS.md` for any new pattern since your last session.

---

## Current Focus

Initial production build of Krit — skill-first LMS. Scaffold, skill-graph data model, learner + workspace surfaces, AI tutor, and a fully seeded "SQL Foundations" course are in place. Next up: real database provisioning, GitHub repo init, and staging deploy. See `README.md` for run instructions.

## Known Issues

- **Dependencies not installed yet** — run `npm install` before the first `npm run dev`. Version matrix was written against Next 15.1, React 19, Tailwind v4 beta, Prisma 6.
- **Auth uses iron-session cookie [PROVISIONAL]** — fine for staged demos; swap to Clerk/SSO before production launch (documented in `STACK.md`).
- **AI tutor falls back to canned reply when `ANTHROPIC_API_KEY` is unset** — by design.
- **Admin authoring UI is read-only** — the data model supports authoring; UI is next iteration.
- **Prisma seed deletes all data** before running — expected behaviour (`npm run db:seed`).
- `.env` secret: set a strong `SESSION_SECRET` (`openssl rand -hex 32`) before any deployment.

# Krit

A skill-first learning platform. The atomic unit is the **skill**. Paths, lessons, and assessments are delivery; evidence against skills is the product.

Built for:
- **Corporate L&D teams** — role architecture, compliance deadlines, manager dashboards, skill gap analysis.
- **Retail learners** — portable skill profiles, verifiable credentials, AI tutor, shareable public profiles.

> The original project-template README is preserved as `README.kernel.md`.

## What's in this repo

| | |
|---|---|
| `src/app` | Next.js 15 App Router — learner surface, workspace admin, public credential page, API routes |
| `src/components` | UI primitives (shadcn-style), lesson block renderer, MCQ runner, AI tutor sidebar, project submission |
| `lib/` | DB, auth (iron-session), LRS event ledger, progress & skill-state computation, AI tutor (Anthropic), credential issuance |
| `prisma/` | Skill-first schema + full seed of the SQL Foundations course |
| `docs/` | Kernel companion docs (STYLE, DATABASE, SECURITY, etc.) |
| `CLAUDE.md` | Production kernel (V6) — read first when resuming |
| `STACK.md` | Single source of truth for tool choices |

## Quick start

Requires Node 20+, npm, and a Postgres database.

```bash
# 1. Install deps
npm install

# 2. Copy env template and fill DATABASE_URL + SESSION_SECRET
cp .env.example .env
# Generate a session secret:  openssl rand -hex 32

# 3. Push schema + seed the SQL Foundations course
npm run db:generate
npm run db:push
npm run db:seed

# 4. Run the app
npm run dev
# → http://localhost:3000
```

Sign in with any of the seeded users:
- `learner@krit.dev` — Nadia Patel (learner)
- `admin@krit.dev` — Omar Khan (workspace admin)
- `manager@krit.dev` — Priya Subramanian (people manager)

## What's seeded

One complete, production-quality course — **SQL Foundations** — designed to exercise every feature end-to-end:

- **Skill graph**: `sql-basics` → `sql-filtering` → `sql-joins` / `sql-aggregation` → `sql-problem-solving`, with a supporting `data-literacy` skill.
- **Path**: 8 items — 6 full lessons, a 20-question assessment, a capstone project.
- **Lessons**: real educational content, ~8–15 min each, rendered from typed content blocks (markdown, callouts, code, quizzes, reflect, try-it, key-takeaways).
- **Assessment**: 20 calibrated MCQs (single & multi) spanning five skills with per-choice explanations.
- **Capstone project**: five real business questions against a schema, reviewed against a 3-criterion rubric.
- **Credential**: auto-issued on path completion; public verification page with evidence snapshot.
- **Role profile**: *Data-Aware Product Manager* with required-skill mappings — pre-assigned to the learner.
- **Assignment**: compliance-style assignment on the learner with a due date, driven by the admin.

## Key flows to experience

1. Sign in as **Nadia** → land on home with assignment + stats → open *SQL Foundations*.
2. Progress through each lesson — each one records lesson-complete evidence, bumping your skill states.
3. Open the assessment, submit, see the results page with per-question review + skill badges.
4. Submit the capstone project (markdown free-form).
5. When the path completes, a credential auto-issues with a public verification URL.
6. Sign in as **Omar** → open `/workspace` → see the analytics, skill graph, and team roster.
7. The AI tutor sidebar lives on every lesson. Without `ANTHROPIC_API_KEY` it falls back to a human-written nudge; with a key it streams context-aware answers.

## Architecture highlights

- **Event-sourced LRS** (`lib/lrs.ts`) — every learner interaction is an append-only event. Progress, credentials, and analytics are derived views over the ledger. This is what keeps the system composable as features grow.
- **Typed content blocks** (`lib/content/blocks.ts`) — lessons are JSON, not HTML, validated by Zod. Enables AI authoring, multi-surface delivery, and AI tutor retrieval.
- **Skill state recomputation** (`lib/progress.ts`) — every evidence row triggers a deterministic recompute of `SkillState`, so level and confidence are always in sync with the ledger.
- **Credential issuance snapshots evidence** (`lib/credential.ts`) — a credential carries, forever, the exact evidence that earned it.
- **Result<T,E> at the data layer, throw at the edge** — per kernel guidance in `CLAUDE.md`.
- **AI tutor uses prompt caching** (`lib/ai.ts`) — system prompt is cache-pinned so follow-up turns are cheap and fast.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run test         # vitest (unit)
npm run db:push      # apply schema (no migration file)
npm run db:migrate   # create + apply migration (dev)
npm run db:deploy    # apply pending migrations (prod)
npm run db:seed      # seed SQL Foundations course
npm run db:reset     # drop + migrate + seed
npm run db:studio    # Prisma Studio
```

## What's next (explicit non-goals for this build)

These are designed-for but not yet implemented — the data model and architecture already accommodate them:

- Author tooling UI (the data model + block renderer are in place; visual authoring is next)
- Stripe billing + per-creator payouts
- Clerk / SSO / SAML swap for the auth layer
- Adaptive testing (IRT) and item calibration
- Cohort-based courses with live sessions
- Slack / Teams surface for "learning in the flow of work"
- HRIS integrations (SCIM provisioning)
- Mobile (React Native or PWA)

## License

Proprietary. All rights reserved.

# STACK.md — Single Source of Truth for Stack Nouns

---

## Core

| Field | Value | Notes |
|---|---|---|
| `project_name` | `krit` | Env var prefix `KRIT_*` |
| `description` | Skill-first LMS for corporate L&D and retail learners | |
| `tier` | `production` | |
| `status` | `active` | |

## Frontend

| Field | Value |
|---|---|
| `framework` | Next.js 15 App Router |
| `language` | TypeScript (strict, `noUncheckedIndexedAccess`) |
| `styling` | Tailwind v4 + shadcn-style primitives |
| `state_server` | TanStack Query |
| `state_client` | Zustand |
| `forms` | react-hook-form + Zod |

## Backend

| Field | Value |
|---|---|
| `database` | PostgreSQL via Prisma |
| `auth` | iron-session cookie auth (pluggable; swap to Clerk post-MVP) [PROVISIONAL] |
| `payments` | Stripe [PROVISIONAL — not wired yet] |
| `file_storage` | Supabase Storage [PROVISIONAL — not wired yet] |
| `email` | Resend [PROVISIONAL — not wired yet] |
| `rate_limit` | Upstash Redis [PROVISIONAL — not wired yet] |
| `background_jobs` | Inngest [PROVISIONAL — not wired yet] |

## Observability

| Field | Value |
|---|---|
| `error_tracking` | Sentry [PROVISIONAL — `captureError()` shim in place] |
| `logging` | Pino (structured JSON) |
| `analytics` | PostHog [PROVISIONAL] |
| `uptime` | BetterStack [PROVISIONAL] |

## Deployment

| Field | Value |
|---|---|
| `prod_host` | Vercel |
| `staging_host` | Vercel preview |
| `ci` | GitHub Actions |

## Testing

| Field | Value |
|---|---|
| `unit` | Vitest |
| `component` | React Testing Library |
| `e2e` | Playwright [PROVISIONAL — smoke spec seeded] |

## AI

| Field | Value |
|---|---|
| `llm_provider` | OpenRouter (routes to Anthropic, OpenAI, Google, Meta, etc.) |
| `llm_model` | `anthropic/claude-sonnet-4.5` (default; change via `OPENROUTER_MODEL`) |
| `sdk` | `openai` (OpenAI-protocol, pointed at `https://openrouter.ai/api/v1`) |

## Mobile

Deferred. Web is mobile-first responsive; native app comes later.

---

## Locked decisions

- Money as integer cents.
- IDs are `cuid()` (via `cuid` package) unless otherwise specified.
- Server state → TanStack Query · Client state → Zustand · Shareable → URL.
- Secrets never prefixed with `NEXT_PUBLIC_`.
- Migrations run via `migrate deploy` in prod.
- **The atomic unit of learning is the Skill.** Paths/Lessons/Assessments are delivery; evidence against Skills is the product.
- **All learner activity is recorded as LRS events** (xAPI-inspired). Progress/credentials are derived views over the event ledger.
- **Lesson content is block JSON**, never raw HTML in the DB.

---

## Provisional entries

Items above marked `[PROVISIONAL]` are acceptable for the initial build but must be resolved before first paying customer. Tracked in `docs/DECISIONS.md`.

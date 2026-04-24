# CLAUDE.md — MVP (V6)

**Tier: MVP** — ship real functionality to real users. Follow core rules.
Explicitly deferred items are marked `[POST-MVP]` — do not apply them now, do not remind me they're missing.

---

## When to use this tier

Use MVP when:
- Real users will interact with it, but
- Pre-revenue or still finding product-market fit, and
- The team is small (often 1 person), and
- You're not yet making uptime commitments

If any of these reverse → `/graduate production`.
If none of these hold yet and you're still in "does this idea work at all?" → `CLAUDE.prototype.md` is correct.

---

## Project

**Name:** [Project name]
**Description:** [One sentence]
**Status:** Active development

---

## Stack

Stack nouns live in `STACK.md`. Read it when a decision depends on stack specifics.

---

## Key Commands

```bash
npm run dev          # local dev
npm run build        # production build
npm run lint         # ESLint check
npm run typecheck    # tsc --noEmit
npm run test         # tests (scoped — see Testing section)
```

---

## Slash Commands Available

`/plan` · `/bugfix` · `/ship` · `/reset` · `/break-glass` · `/spec` · `/graduate`

See `.claude/commands/` for what each does. Prefer them over describing protocols.

---

## Quick Reference

| Area | Rule |
|---|---|
| **Styling** | `cn()` always · no inline styles · mobile-first |
| **TypeScript** | No `any` without comment · narrow types, never cast |
| **Errors** | Never expose stack traces to client · log with context |
| **DB** | Shared `db` instance · `select:` specific fields · transactions for multi-table writes · money as integer cents |
| **Git** | Stage only · never commit/push · developer's identity (hook blocks this) |
| **Secrets** | Never in source · no `NEXT_PUBLIC_` on sensitive vars |
| **State** | Server → TanStack Query · Client → Zustand · Shareable → URL |

---

## Load Before Acting

MVP uses a lighter doc set than Production. Not every V6 module is required.

| Task | Read |
|---|---|
| Styling / UI | `docs/STYLE.md` |
| Database / queries | `docs/DATABASE.md` |
| Auth, secrets, user input | `docs/SECURITY.md` |
| Error handling | `docs/ERRORS.md` |
| State management | `docs/STATE.md` |
| Git / commits | `docs/GIT.md` |
| Env vars | `docs/ENV.md` |
| Deploy | `docs/DEPLOY.md` |
| Bug fix | `docs/BUGFIX.md` or `/bugfix` |
| New feature, unclear UX | `docs/SPEC.md` or `/spec` |
| Tool/library choice | Append `docs/DECISIONS.md` |

Files you do **not** maintain at MVP: `PERFORMANCE.md`, `MONITORING.md` (beyond basic Sentry), `MAINTENANCE.md`, `PACKAGES.md` (monthly cycle), `QUALITY.md` (full version). These turn on at `/graduate production`.

---

## Hard Rules

### MUST — never violate
- No inline styles. Tailwind only.
- No `any` without a justification comment.
- No secrets in source code. Always `process.env`.
- No autonomous commits or pushes. Developer commits. (Hook enforces.)
- No direct pushes to `main`. PR only.
- No production deploy without staging passing.
- No new env var without `docs/ENV.md` entry.
- No auth route without session check.
- No database schema change without migration.
- No `migrate dev` against prod.

### SHOULD — default, override with a reason
- Return `Result<T,E>` from server functions that can fail (import from `lib/result.ts`).
- Use `cuid()` for database IDs.
- Paginate queries that could return unbounded rows.
- Validate all API input with Zod.

### MUST NOT — explicitly deferred [POST-MVP]
Do not apply. Do not flag their absence.

- [POST-MVP] Comprehensive test suite
- [POST-MVP] Performance optimisation (LCP, bundle size, lazy loading)
- [POST-MVP] Rate limiting on API routes
- [POST-MVP] Secrets scanning in CI (basic pre-commit hook is still on)
- [POST-MVP] OWASP full audit
- [POST-MVP] Monitoring beyond basic Sentry
- [POST-MVP] Accessibility audit (WCAG compliance)
- [POST-MVP] PLAN.md approval gate for UI-only changes
- [POST-MVP] Monthly package update cycle
- [POST-MVP] Changelog maintenance
- [POST-MVP] Tech debt tracking beyond inline TODOs

---

## When a Plan Is Required

Use `/plan`. Required for:
- Database schema changes or migrations
- Auth flow changes
- Payment integration changes
- API contract changes that affect other code

No plan needed:
- UI changes
- New pages or components
- Bug fixes
- Adding queries to existing schema

---

## Testing — MVP Scope

Write tests only for:
- Auth logic (login, session, permissions)
- Payment flows (if integrated)
- Data mutations hard to manually verify

Skip tests for:
- UI components
- Read-only queries
- Anything fast to verify in the browser

When in doubt: manually test, ship, write tests post-MVP.

---

## Error Handling — MVP Scope

**Required:**
- Users never see raw stack traces or database errors
- API routes return consistent `{ error: string }` on failure
- Failed mutations show a toast or inline error message

**Not required yet:**
- `Result<T,E>` everywhere (use it where natural; skip where it adds friction)
- Structured logging with full context on every path
- Error boundaries on every page section

---

## Security — MVP Scope

**Required now:**
- Session check on every API route that returns user data
- Ownership verification (user accesses only their own records)
- Zod validation on all API inputs
- No secrets in source code (hook scans staged files)
- Password / token fields never returned in API responses

**Not required yet:**
- Rate limiting
- CSP headers
- Security scanning in CI
- OWASP full audit

---

## Failure Tiers

**Stop everything:** Secret in source · prod deploy broken · destructive migration on live DB
**Fix before moving on:** Missing session check on protected route · env var not in ENV.md · schema change without migration
**Fix this session:** Missing `select:` · `console.log` committed · inconsistent naming

---

## 🔄 Session Reset

`/reset` — same fix failed 3 times or context feels degraded.

Manual: re-read this file → `git status` + `npm run typecheck` → write goal / changes made / what's broken / next step → share before continuing.

---

## 🚨 Break Glass

`/break-glass` — production down or critical security fix.
Suspended: plan approval gate · staging-first requirement
Never suspended: no secrets in source · no autonomous commits
Document in `DECISIONS.md` within 24h.

---

## Graduating to Production

Run `/graduate production` when:
- [ ] Users are paying, or depend on uptime
- [ ] More than one developer is contributing
- [ ] A regulated surface exists (PII beyond email, payments at scale, health data)
- [ ] You have an incident that basic Sentry wouldn't have caught in time

`/graduate production`:
1. Replaces this file with the full `CLAUDE.md` V6 kernel
2. Scaffolds the [POST-MVP] docs: `TESTING.md` (full), `PERFORMANCE.md`, `MONITORING.md`, `MAINTENANCE.md`, `QUALITY.md`, full `SECURITY.md`
3. Writes a graduation checklist into `docs/PLAN.md` with ordered hardening tasks (Sentry first — you need visibility before hardening)

---

## Current Focus

[Update at end of each session.]

## Known Issues

[Active bugs, constraints, watch-outs.]

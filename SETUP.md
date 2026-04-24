# SETUP.md — New Project Onboarding

**Used once, at project start. Delete after.**

Triggered by `/init`. Claude asks each question in turn, records answers in `STACK.md` and `CLAUDE.md`, initialises `docs/ENV.md` and `docs/DECISIONS.md`, then deletes this file.

---

## Stack Questionnaire

Ask one at a time. Show default. Wait for answer.

```
1. Project name, and one sentence on what it does?

2. Which tier are you starting at?
   → [1] Prototype / Static (no auth, no real data) — use CLAUDE.prototype.md
      [2] MVP (real users, pre-revenue) — use CLAUDE.mvp.md
      [3] Production (paying users, team, uptime) — use CLAUDE.md (default for this SETUP)

3. Frontend framework?
   → [1] Next.js 15 App Router (default)
      [2] Next.js 15 Pages Router
      [3] Vite + React SPA
      [4] Expo (mobile) — loads MOBILE.md
      [5] Other — describe

4. Database?
   → [1] PostgreSQL via Prisma (default)
      [2] Supabase (Postgres + Auth + Storage)
      [3] PlanetScale (MySQL via Prisma)
      [4] SQLite via Drizzle
      [5] No database

5. Auth?
   → [1] Clerk (default — fastest)
      [2] NextAuth / Auth.js
      [3] Supabase Auth
      [4] Custom / None

6. Payments?
   → [1] Stripe (default)
      [2] None

7. AI features?
   → [1] Yes — loads docs/AI.md for AI work
      [2] No

8. Deployment targets?
   → [1] Vercel prod + Railway staging (default)
      [2] Vercel prod + Render staging
      [3] Fly.io only
      [4] Other — describe

9. Component library?
   → [1] shadcn/ui + Tailwind (default)
      [2] Tailwind only
      [3] None

10. State management?
    → [1] Zustand + TanStack Query (default)
       [2] TanStack Query only
       [3] Context API only

11. Testing?
    → [1] Vitest + RTL + Playwright (default)
       [2] Vitest + RTL only
       [3] Skip (prototype — revisit before production)

12. TypeScript?
    → [1] Strict mode (default)
       [2] Base (prototype — must tighten before production)

13. Mobile (if Expo in Q3)?
    → Platform targets (iOS / Android / both)?
    → Minimum OS versions?
    → EAS account set up?
```

---

## After Collecting Answers

Execute in order:

1. **Write `STACK.md`** — fill every field. Mark anything the developer was unsure about `[PROVISIONAL]`.

2. **Fill `CLAUDE.md`** — Project Overview section. Tech Stack section references `STACK.md`, so nothing duplicated there.

3. **Initialise `docs/ENV.md`** — create the deployment URL table with the platforms from Q8.

4. **Append to `docs/DECISIONS.md`** — the initial stack decision, with the alternatives considered.

5. **Install tooling** (if the developer wants automation now):
   ```bash
   npm i -D prettier prettier-plugin-tailwindcss husky @commitlint/cli @commitlint/config-conventional
   npx husky init
   echo 'npm run typecheck && npm run lint' > .husky/pre-commit
   echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
   ```
   The `prettier-plugin-tailwindcss` config enforces class order. `commitlint` enforces Conventional Commits. Together these delete several CLAUDE.md rules in favour of tooling.

6. **Conditional scaffolds:**
   - Expo selected → confirm `docs/MOBILE.md` loads for mobile tasks.
   - AI selected → confirm `docs/AI.md` loads for AI tasks. Set `STACK.llm_model` to a current Claude model.
   - Prototype tier → replace `CLAUDE.md` with `CLAUDE.prototype.md`; delete unused module docs.
   - MVP tier → replace `CLAUDE.md` with `CLAUDE.mvp.md`; keep only the MVP-scope docs.

7. **Delete this file:**
   ```bash
   rm SETUP.md
   ```

---

## Provisional Stack Note

If the developer answers "not sure yet" to any question, record the provisional choice in `STACK.md` with `[PROVISIONAL]`. Revisit before the first staging deploy. Do not carry provisional choices into production.

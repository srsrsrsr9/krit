# Handover — Krit, Next Session Start

> Last updated 2026-05-14 at the close of the V2 spec session.
> Read this first when picking up the project.
> Supersedes the prior handover from 2026-05-11 (archived at end of this doc).

---

## Goal

A platform with **100 courses** that are a pleasure to consume and leave a lasting learning impact.

---

## Read order

1. **`docs/PLATFORM_SPEC.md`** — what the platform must do (7 pillars: R/S/E/V/A/T/O, cross-iframe protocol, component inventory, quality bars, dependency-chain build order).
2. **`docs/COURSE_CREATION_SPEC.md` (V2)** — what authors must write (5 pillars: P/E/M/U/A, canonical lesson template, cast/palette/register, quality floor with auto/review/code tags).
3. **`docs/ANIM_LAB_SPEC.md`** — what the per-course interactive widgets look like (12 rules).
4. **`docs/ANIM_LAB_REVIEW_PASS2.md`** — synthesis of agent-reviews that produced the rules.

The two top specs cross-reference each other. Both reference the anim-lab spec.

---

## What this session produced

- **`docs/PLATFORM_SPEC.md`** — V1, drafted from the 4 expert reviews of `docs/COURSE_CREATION_SPEC.md` V1
- **`docs/COURSE_CREATION_SPEC.md`** — upgraded V1 → V2 against 4 expert reviews; added P8-P10, M9-M13, E8-E12, U9-U14, A8; new §3.1 (protagonist brief), §3.5 (palette + register + retrievalGate), §4.5 (cross-iframe protocol); tightened §5 quality floor with `[auto]` / `[review]` / `[code]` tags
- **`lib/content/blocks.ts`** — 35 block types now (added `RetrievalGateBlock`)
- **`prisma/seed/import-course.ts`** — schema accepts `cast`, `palette`, `register` at root + `affectArc` per lesson (all optional, backwards-compat); refactored `importCourseFile()` as a reusable export
- **15 standard courses** — anim-lab artifacts threaded through every course (~298 embeds) with structured V2-quality captions (`Try (~60s) · Title — setup`), all imported into Postgres, all PUBLISHED at `/learn/<slug>` (auth-gated)
- **2 showcase courses (ai-for-developers, leaders-ai-os)** — imported, PUBLISHED
- **`public/anim-lab/_shell.js`** — solo mode with aria-modal + aria-hidden + ResizeObserver-driven height postMessage + showModal fallback
- **`src/components/lesson/blocks/embed-animation-block.tsx`** — sandbox includes `allow-modals`, skips Play overlay for anim-lab embeds, listens for `krit:anim-lab:height` and resizes 380-900px
- **`scripts/integrate-anim-lab.mjs`** — V2 placement logic (monotonic scaffold, never after keyTakeaways/reflect, real titles in captions, `?solo=1` URLs)
- **`scripts/audit-anim-lab-positions.mjs`** — 75/75 lessons pass
- **Bulk import scripts** — `db:import-all`, `db:import-showcase`, `db:seed-all`, `db:reset-all`, `course:validate`
- **3 pass-3 expert reviews** of the V1 spec; 4 expert reviews of the integrated courses (synthesis in `docs/ANIM_LAB_REVIEW_PASS2.md`)

---

## Content inventory

### Standard courses (15) — `courses/*.json`

All have: V1 imported, DB live, anim-lab integrated with V2 captions + monotonic placement.

| Slug | Title |
|---|---|
| ai-for-accounting | AI for Accounting |
| ai-for-leaders | AI for Leaders |
| ai-for-teachers | AI for Teachers |
| ai-fundamentals | AI Fundamentals |
| claude-pro | Claude Pro: Cowork, Code, Design |
| data-science-and-analysis | Data Science and Analysis |
| digital-marketing-with-ai | Digital Marketing Powered by AI |
| leadership-in-age-of-ai | Leadership in the Age of AI |
| money-fundamentals | Money Fundamentals |
| product-management | Product Management Fundamentals |
| python-foundations | Python Foundations |
| sql-foundations | SQL Foundations |
| testing-with-playwright | Testing with Playwright |
| the-science-of-well-being | The Science of Well-Being |
| ui-ux-design | UI/UX Design Foundations |

**Pass-3 nominations:**
- Elevate exemplars: `digital-marketing-with-ai` (Learning), `the-science-of-well-being` (Marketing), `leadership-in-age-of-ai` (Psychology + UX)
- Overhaul targets: `the-science-of-well-being` (Learning — over-dense), `ai-for-leaders` (Marketing — rotating cast + abstract opener), `python-foundations` (Psychology — 3 embeds in a row), `testing-with-playwright` (UX — clipping)

### Showcase courses (3) — `courses/showcase/*.json`

| Slug | Title | Notes |
|---|---|---|
| ai-for-developers | AI for Developers | The quality bar. 6 lessons, 5-member cast. Embeddings deep-dive in lesson 1. |
| leaders-ai-os | The Leader's AI Operating System | 5 lessons. Anim-lab gallery is the pass-2 showcase. |
| the-30-minute-trap | (standalone lesson, not a course) | Auto-skipped from bulk import. Has `blocks` at root, no `slug`/`lessons`. |

### Anim-lab galleries (17) — `public/anim-lab/<slug>.html`

| Tier | Galleries |
|---|---|
| **Showcase** (pass-2 reviewed) | leaders-ai-os, ai-for-developers |
| **Spec V1** (built post-spec) | ai-for-accounting, ai-for-leaders, ai-for-teachers, ai-fundamentals, data-science-and-analysis, digital-marketing-with-ai, leadership-in-age-of-ai, product-management, testing-with-playwright, the-science-of-well-being |
| **Draft** (pre-spec, retrofit pending) | python-foundations, sql-foundations, claude-pro, money-fundamentals, ui-ux-design |

Two draft galleries (`claude-pro`, `money-fundamentals`) are missing one artifact each (19/20). The integration script handles this gracefully.

### Standalone prototypes — `public/prototype/`

| File | Purpose |
|---|---|
| `embeddings/index.html` | The standalone embeddings deep-dive (the quality bar) |
| `embeddings.html` | Earlier iteration |
| `bicycle.html` | Mechanics deep-dive (falsification-first) |
| `compound-interest.html` | Finance deep-dive (counterfactual simulation) |
| `positioning.html` | Marketing deep-dive (case-comparison) |
| `krit-deep-dives.html` | Combined gallery of all 4 |

---

## Code inventory

### Block schema
- `lib/content/blocks.ts` — 35 block types (Zod discriminated union). `RetrievalGateBlock` added this session.
- `lib/content/course.ts` — showcase-course Zod schema.

### Importers
| Script | What |
|---|---|
| `prisma/seed/import-course.ts` | Standard-course importer; exports `importCourseFile()`; V2 schema accepts cast/palette/register/affectArc |
| `prisma/seed/import-all-courses.ts` | Bulk import for `courses/*.json` (idempotent) |
| `prisma/seed/showcase-course-import.ts` | Showcase importer with integrity checks + `--yes` non-interactive flag |
| `prisma/seed/import-all-showcase.ts` | Bulk showcase import; auto-skips non-Course files |
| `prisma/seed/validate-all-courses.ts` | Schema-only validation, no DB |
| `prisma/seed/list-courses.ts` | Diagnostic listing + auto-promote DRAFT → PUBLISHED |
| `prisma/seed/skill-catalog.ts` | Curated skill catalog with tolerant lookup |
| `prisma/seed.ts` | Base seed (workspaces, demo users, SQL + Python content) |

### Scripts
| Script | Status |
|---|---|
| `scripts/integrate-anim-lab.mjs` | exists — V2 placement logic |
| `scripts/audit-anim-lab-positions.mjs` | exists — 75/75 lessons clean |
| `scripts/audit-heading-order.mjs` | **not built — needs to be built** |
| `scripts/audit-contrast.mjs` | **not built** |
| `scripts/audit-iframe-titles.mjs` | **not built** |
| `scripts/audit-passive-blocks.mjs` | **not built** |
| `scripts/audit-block-types.mjs` | **not built** |
| `scripts/audit-cast-consistency.mjs` | **not built** |
| `scripts/audit-voice-tics.mjs` | **not built** |
| `scripts/audit-transfer-tags.mjs` | **not built** |
| `scripts/audit-time-budget.mjs` | **not built** |
| `scripts/assemble-course.mjs` | exists |
| `scripts/splice-bonus.mjs` | exists |
| `scripts/splice-trap-animations.mjs` | exists |
| `scripts/generate-notes.ts` | exists |
| `scripts/render-tts-all.sh` / `render-tts-local.sh` | exists (deferred) |

### Renderers
`src/components/lesson/blocks/*` — one per block type. `embed-animation-block.tsx` updated this session for V2 protocol.

**Not built (called out by platform spec):**
- `src/components/lesson/blocks/retrieval-gate-block.tsx` — for the new `retrievalGate` block type
- `src/components/lesson/MicroMomentTicker.tsx` — for E6 + U13
- `src/components/lesson/AffectArcBand.tsx` — for E11 + PE2
- `src/components/lesson/ActivitiesSkipLink.tsx` — for R7 + U14
- Host-side receivers in `embed-animation-block.tsx` for `krit:anim-lab:ready`, `krit:anim-lab:opens`, `krit:anim-lab:commit`

### npm scripts

```bash
npm run dev                # Next dev server
npm run typecheck          # tsc --noEmit
npm run db:seed            # base seed only
npm run db:seed-all        # base seed + all standard + all showcase courses
npm run db:import-all      # bulk-import all 15 standard courses
npm run db:import-showcase # bulk-import showcase courses
npm run db:reset-all       # destructive reset + full seed-all
npm run course:validate    # Zod schema check on all courses
```

---

## Database

**Provider:** Postgres on Neon (Singapore). `.env` has `DATABASE_URL` + `DIRECT_URL`. **Neon free tier suspends DB after inactivity** — wake with `npx prisma db push --skip-generate`.

**Schema:** `prisma/schema.prisma`. Tables include identity (`User`/`Workspace`/`Membership`), skill graph (`Skill`/`SkillPrerequisite`/`SkillState`/`Evidence`), course structure (`Path`/`PathItem`/`Lesson`/`LessonSkill`/`LessonProgress`), assessment (`Assessment`/`Question`/`Attempt`/`Answer`), project (`ProjectBrief`/`Submission`), credentials (`Credential`/`IssuedCredential`), AI tutor (`TutorConversation`/`TutorMessage`), LRS (`LrsEvent`), compliance (`Assignment`/`RoleProfile`).

**Migrations pending for V2:**
- `LessonCommitment` table (per platform spec S2)
- `Lesson.affectArc` column (per platform spec PE2)
- `Question.transferTag` column (per platform spec PT5)
- `Path.contentVersion` column (per platform spec PO5)

---

## Open threads (priority order)

### Tier 1 — schema + protocol foundation

1. `LessonCommitment` Prisma model + migration (powers retrievalGate + Atlas memory)
2. Migrations for `Lesson.affectArc`, `Question.transferTag`, `Path.contentVersion`
3. Cross-frame postMessage receivers in `EmbedAnimationBlock` for `krit:anim-lab:ready`, `krit:anim-lab:opens`, `krit:anim-lab:commit` (only `height` is wired today)

### Tier 2 — host renderers + audit pipeline

4. `RetrievalGateBlock` React renderer with commit persistence
5. `MicroMomentTicker` component + integration into `LessonLayout`
6. `AffectArcBand` component
7. `ActivitiesSkipLink` + activity TOC from JSON
8. The 9 new audit scripts named in `docs/PLATFORM_SPEC.md` §3
9. `npm run a11y:audit` (axe-core + Playwright) in CI

### Tier 3 — Atlas + assessment

10. Atlas system-prompt prepends course `register` + recent `LessonCommitment` (PT2, PT3)
11. Atlas guardrails (cite-or-decline, PT4)
12. Atlas budget enforcement (PT5)
13. `transferTag` surfaced in score breakdown

### Tier 4 — voice + identity propagation

14. Course-card palette + M9 belief-sentence surfacing
15. Per-course palette propagated into lesson chrome
16. Cast avatars + role-line single-source-of-truth render path
17. Protagonist brief as course home hero

### Tier 5 — engagement polish

18. SFX palette implementation (per `docs/sfx.md`)
19. Optional ambient music beds (per `docs/music.md`)
20. Idle-state recovery (PE6)
21. High-contrast palette family (PA7)
22. Simpler-language toggle scaffolding (PA8)

### Tier 6 — authoring tooling

23. `src/app/admin/authoring/` route group (live preview + audit panel + AI-assisted caption rewrite)
24. Peer-review pipeline (4-agent dispatch as a workflow)

### Tier 7 — content scale to 100 courses

25. Cast unification across the 15 standard courses (single biggest content gap per Pass-3 marketing review)
26. Per-course `palette` + `register` + protagonist brief authoring
27. `retrievalGate` block at lesson 2-5 block 2 in every course
28. `affectArc` declared per lesson
29. Lesson templates restructured to V2's 21-block worked-worked-faded-faded-solo arc
30. Voice-tic sweep: kill "Two tribes" / repeated "Scene yeh hai" / second-person-command ledes / category-level enemies
31. Assessment transfer-tag pass: every question gets `transferTag`; ≥30% novel-context per course; ≥2 far-transfer
32. Bring 3 courses to V2 showcase tier as exemplars (`digital-marketing-with-ai`, `the-science-of-well-being`, `ai-for-developers`)
33. Migrate remaining 14 courses to V2 schema
34. Author 80 more V2-tier courses to reach 100

**Each tier unblocks the next.** Tier 7 cannot start until Tiers 1-5 are at the platform-spec §5 quality bars.

---

## Known issues

| Issue | Source | Impact |
|---|---|---|
| Neon DB suspends after inactivity | Free tier | Wake with `npx prisma db push --skip-generate` before first DB command |
| ~1.2 MB duplicated JS per lesson (one full `_shell.js` per iframe) | UX Pass-3 review | Defeats lazy loading; deferred — needs code-split |
| 5 anim-lab galleries are pre-spec drafts (python, sql, claude-pro, money, ui-ux) | Built before `ANIM_LAB_SPEC.md` | Retrofit per pass-2 review |
| `claude-pro` and `money-fundamentals` galleries missing 1 artifact each (19/20) | Pre-spec drafts | Integration handles gracefully |
| No `LessonCommitment` table yet | New in V2 | `retrievalGate` can't persist answers until Tier 1 #1 lands |
| Atlas indexing isn't course-aware in production | Existing | Tutor answers without course-scoped retrieval; PT1 unblocks |

---

## Quick-start for the next session

```bash
cd /Users/srinivasvedantam/Documents/Me/elemes/v2/project-docs-v6

# 1. Wake the DB (Neon free tier sleeps after inactivity)
npx prisma db push --skip-generate

# 2. See current state
npx tsx prisma/seed/list-courses.ts

# 3. Run existing audits to confirm baseline
npm run course:validate
node scripts/audit-anim-lab-positions.mjs

# 4. Start dev server when you need to see the rendered surface
npm run dev   # → http://localhost:3000
```

**Most leveraged next move:** Tier 1 + Tier 2 in parallel — `LessonCommitment` migration + the 9 audit scripts + the host-side renderers (MicroMomentTicker, RetrievalGateBlock, AffectArcBand). Each is small. Together they unblock authoring 100 courses to V2 quality with mechanical CI enforcement.

---

## Decisions log

(Reconstructed from this session and the prior one. Should be moved to `docs/DECISIONS.md`.)

| Decision | Rationale |
|---|---|
| Anim-lab artifacts live in their own gallery, separate from course JSON | Reusable across courses, testable in isolation |
| Solo mode (`?solo=1`) for iframe embedding | Hide gallery chrome inside lesson context |
| `Lab.makeSortable` (▲▼ buttons) replaces native HTML5 drag for order-rank | Touch-safe, keyboard-accessible, no library |
| `findCatalogSkill` made tolerant of display names | Existing showcase JSONs use display names; tolerance > rewrite |
| `import-course.ts` refactored to export `importCourseFile()` | Enables bulk import + composable test scripts |
| Standalone `the-30-minute-trap.json` auto-skipped from showcase bulk | It's a lesson, not a course |
| postMessage protocol owned jointly by course spec and platform spec | Cross-cutting; if it drifts the integration breaks |
| All anim-lab + course audit logic is mechanical (scripts, not editorial) | Mechanical fixes propagate to 17 galleries / 15 courses for free |
| Krit's value is the structured journey through great existing content, with practice mechanics at every transition (not generating content from scratch) | From the May 11 prior-session strategic framing — still valid |
| No streaks, no badges-for-logins, no loss-aversion gamification | Violates lasting-learning-impact goal (platform spec PE7) |
| Background music off by default; workspace opt-in | Sound is enhancement, not the experience (platform spec PE4) |

---

## Prior context (preserved from 2026-05-11 handover)

The previous handover captured the strategic moment when the user observed *"people can't really learn from something like this"* about pure Story Mode, which led to the embeddings prototype and the entire learning-prototype-deep-dive thread. That framing is still valid:

> **Krit's value isn't generating content. It's the structured journey *through* great existing content, with practice mechanics built in at every transition.**

The user's working agreement (from May 11):

- **First question on any feature:** *"what's the smallest version we can validate, and who's the first learner?"*
- **When asked for polish, ask if the core is proven.** Polish before validation is a tax.
- **When asked to extend the schema, ask if existing primitives are exhausted.** Schema bloat is invisible until a new author has to choose between 35+ block types and freezes.
- **Name the bet** before executing. If the user wants me to build something I think is the wrong move, do it — but say *"I think this is polish over substance"* first.

The user also explicitly asked, late in this session, to **stop estimating calendar time** for work — order by dependency chains instead. The platform spec §6 follows this.

---

## Change log

| Date | Change | Source |
|---|---|---|
| 2026-05-11 | Original handover at end of "learning prototype" pivot session | Prior session |
| 2026-05-14 | Full rewrite at close of V2 spec session — inventory of all assets, threads ordered by dependency chains, prior strategic framing preserved | This session |

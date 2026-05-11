# Handover — Krit project-docs-v6

_Written 2026-05-11 at the end of the "learning prototype" pivot session. **Read this first when picking up the project.**_

## You are here

- **Branches:**
  - `main` — full Story Mode codebase, two courses, authoring CLI, Field Guide PDF
  - `learning-prototype` — adds `public/prototype/embeddings.html` (the depth prototype). Off-main on purpose.
- **Latest on `main`:** `c86132a` — feat(course): AI for Developers + new handsOn block
- **Latest on `learning-prototype`:** `1a0dc33` — prototype: embeddings deep-dive with all 3 learning layers
- **Dev server:** port **3001** (not 3000 — mednext occupies 3000)
- **Tailwind cold-start race:** already fixed via `outputFileTracingRoot` in `next.config.mjs` + a safety-net `touch src/app/globals.css` in the dev script. If CSS ever goes missing again, the fix is to `touch src/app/globals.css`.

## What the session did (brief)

1. Built the full **Story Mode** showcase: mobile-first swipe player, comics, animations, drag-classify, scale-slider, card-swipe, hands-on blocks. 17 block types. On `main`.
2. Built two end-to-end courses (`leaders-ai-os`, `ai-for-developers`) with full authoring CLI: `course:new` → LLM prompt → `course:import` (strict, idempotent, with skill catalog auto-creation). Plus Field Guide PDF + per-lesson notes + soft-delete commands.
3. **Pivot moment:** the user observed that swipe-through Story Mode is engagement-format, not learning-format. Their words: *"people can't really learn from something like this."* This is the most important framing in the project.
4. Created `learning-prototype` branch. Built a single static HTML file (`public/prototype/embeddings.html`) demonstrating three "learning layers" on the topic of embeddings: forced production (predict-then-reveal × 4, hands-on with forced observation), scaffolded practice (worked → faded → solo), and persistence (localStorage state, calibration table, retention scheduling).
5. Brainstormed depth additions. User proposed 5 ideas (external reads, YouTube clips, GitHub snippets, code walkthroughs, Manim diagrams). I pushed back on Manim and the "inspire" framing of GitHub; proposed grouping 1–3 + the YouTube-able part of 5 into a single `ExternalDive` primitive; argued code walkthrough is the highest-leverage missing primitive.

## The strategic position the user is converging on

> **Krit's value isn't generating content. It's the structured journey *through* great existing content, with practice mechanics built in at every transition.**

Concretely: Story Mode is the engagement + retention wrapper around content that lives elsewhere (Lilian Weng, Karpathy, Jay Alammar, Distill, fast.ai, sentence-transformers docs). The depth layer (the prototype) shows what reading-with-practice looks like. **The deep content itself comes from curation, not authoring.**

If you find yourself proposing to author more lessons or courses from scratch — pause and reread that.

## The immediate open question — **wait for the user's answer**

Before any more code on the prototype: the user is deciding between two `codeWalkthrough` styles:

- **Karpathy style** — full file visible, scroll- or tap-driven highlight moves through the code, annotations alongside. Closer to reading real code in context.
- **Distill style** — code chunks revealed progressively, prose between them. Closer to a guided narrative.

Different UX, different learning outcomes. **Do not start building until they answer.** This decision gates the rest of the depth additions.

## Priority order for future depth builds (agreed at end of session)

1. **`codeWalkthrough`** — highest leverage, missing primitive, technical content needs it most. ~1–1.5 days.
2. **`ExternalDive`** primitive — one block, four kinds (article / video / repo / paper / talk). The `returnQuestion` field is the load-bearing part (turns "click a link" into "actually engage"). ~half a day.
3. **Hover/tap definitions for jargon** — 30 min. Wrapped `<dfn>` with one-line popups. Prevents reading attrition.
4. **Interactive SVG figures** — one per concept (e.g. drag two vectors, watch the cosine score change). ~1–2 days each, scales linearly.
5. **Skip Manim** until something specific genuinely demands it; use curated 3Blue1Brown videos via `ExternalDive` instead.

Additional ideas I floated that the user hasn't reacted to yet:
- **Authentic conversation excerpts** (HN / Twitter / Slack debates). Low cost, real practitioner voices.
- **Steel-manning the disagreement** — for each strong claim, the strongest counter-argument. Content discipline, no code.

## How the user wants me to work going forward (explicit ask)

Late in the session, the user said: *"Start pushing me back on ideas in future."* My commitments:

- **First question on any feature:** *"what's the smallest version we can validate, and who's the first learner?"*
- **When asked for polish, ask if the core is proven.** Polish before validation is a tax.
- **When asked to extend the schema, ask if existing primitives are exhausted.** Schema bloat is invisible until a new author has to choose between 17+ block types and freezes.
- **Name the bet** before executing. If the user wants me to build something I think is the wrong move, do it — but say *"I think this is polish over substance"* first.
- Their words: *"You'll still get the work done. You'll also get a second opinion, unsolicited, before the work starts."*

## Things to NOT do

- **Don't merge `learning-prototype` into `main`** until the user explicitly says so. The branch is a staging ground.
- **Don't add new block types to the production schema** without explicit ask + validation. We already have 17.
- **Don't generate more course content.** The existing two courses are validation output, not product. They don't have target learners.
- **Don't build new custom animations.** The four existing HTMLs are diminishing returns.
- **Don't propose new features unprompted.** Push back, ask what's being validated, then build.
- **Don't author content from scratch** for topics where great content already exists. Curate + frame instead.
- **Don't edit `courses/showcase/the-30-minute-trap.json`** — it's the standalone-lesson route. Course-level lessons live in `leaders-ai-os.json`.

## What's actually load-bearing (ranked by real value, not effort)

1. **`public/prototype/embeddings.html`** (`learning-prototype` branch) — defines what learning looks like in this codebase. Most important file right now.
2. **Block schema + Story Mode UX** (`main`) — strong as a *wrapper* around real content; weak as primary learning surface.
3. **Authoring CLI + strict importer + skill catalog** (`main`) — `prisma/seed/showcase-course-{new,import,archive}.ts`, `skill-catalog.ts`. Durable infrastructure.
4. **Field Guide PDF + lesson notes** (`main`) — `src/components/lesson/course-field-guide.tsx`, `/showcase/course/[slug]/notes` routes.
5. The two courses — well-crafted but no target learner; treat as proofs-of-format.
6. The custom animations + panel comics — beautiful, lower value than the hours spent.

## File map

```
public/prototype/embeddings.html         ← THE PROTOTYPE (learning-prototype branch only)

courses/showcase/leaders-ai-os.json      ← 5-lesson leadership course
courses/showcase/ai-for-developers.json  ← 6-lesson dev course
courses/showcase/the-30-minute-trap.json ← standalone lesson (don't edit)

lib/content/blocks.ts                    ← block-type Zod schema (17 types)
lib/content/course.ts                    ← Course Zod schema
lib/showcase-course-loader.ts            ← file → Zod → object

src/components/lesson/blocks/            ← one component per block type
src/components/lesson/lesson-story-player.tsx
src/components/lesson/course-field-guide.tsx ← print-friendly long-form

src/app/showcase/                        ← /showcase/[slug] (standalone lesson)
src/app/showcase/course/                 ← /showcase/course/[slug]/...
public/prototype/                        ← static HTML prototypes (no React)

prisma/seed/showcase-course-new.ts       ← interactive scaffolder
prisma/seed/showcase-course-import.ts    ← strict importer (Prisma)
prisma/seed/showcase-course-archive.ts   ← soft-delete
prisma/seed/skill-catalog.ts             ← curated skill slugs (30)

docs/COURSE_AUTHORING_GUIDE.md           ← colleague-facing how-to
docs/HANDOVER.md                         ← this file
```

## Practical notes

- **Single-workspace assumption.** The importer expects exactly one workspace in the DB.
- **The leadership cast** (Sam, Rina, Kavya, CFO, Atlas) is repurposed across both courses. Character art is generic enough that it works.
- **Panel comic scenes** are leadership-themed (`boardroom-rina`, `cfo-math`, `ic-desk`, `handshake`, `ending`). New scenes (`code-review`, `production-incident`, `interview-room`) are a deferred change; the user knows this.
- **`embedAnimation` HTML files** live under `public/courses/showcase/anim/`. The importer hard-fails if any referenced file doesn't exist.
- **Audio in animations** uses Web Audio synthesis (no mp3 files). Unlocked via `krit:start` postMessage from the parent overlay tap.

## What to do when you start

1. Read this file.
2. `git status` and `git log --oneline -10`. Confirm what branch you're on.
3. **If on `main`** — ask the user before switching to `learning-prototype`. They might want to discuss something on `main`.
4. **If on `learning-prototype`** — the prototype is at `public/prototype/embeddings.html`. View at `localhost:3001/prototype/embeddings.html`.
5. **Check whether the user has answered the Karpathy-vs-Distill question.** If yes, build code walkthrough. If no, **ask and wait** — don't preempt.
6. **Push back on at least one thing per session.** Name bets before executing.

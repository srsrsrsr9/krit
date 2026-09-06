# Course Creation Spec — V2

> The contract every new Krit course must satisfy.
> Distils ~7 sessions of agent feedback on the embeddings prototype, the 17-course catalogue, the anim-lab integration, and the V1 spec review into one document.
> V2 incorporates the four Pass-3 expert reviews of V1 (see §9 change log).

---

## 0 · Audience and purpose

This spec is the **author's contract** for any new full-length course in Krit
(`courses/<slug>.json` — Path + Lessons + Assessment + Project + Credential)
and for any rebuild of an existing course toward showcase quality.

It defines:
- the 5 quality pillars (P / E / M / U / A)
- the canonical lesson template
- the cast pattern
- anim-lab integration rules
- the §X quality floor a course must clear before import
- the build order

It does **not** define:
- subject matter (varies per course)
- audio polish (deferred per `docs/music.md` + `docs/sfx.md`)
- the AI tutor's behavior (separate spec)

The reference quality bar: **`courses/showcase/ai-for-developers.json`**, in
particular its "How we got here" lesson. Anything written against this spec
should be readable next to that lesson without obviously dropping a tier.

---

## 1 · The 5 pillars

### P — Pedagogy

| Rule | What |
|---|---|
| **P1** | Anims advance the concept. If "Watch" doesn't visibly move state, it's a `panel` not an `anim`. |
| **P2** | Predict-then-reveal. The learner commits *before* the answer shows. Live-update sandboxes are scaffold-1 only. **At least ONE predict-reveal per lesson MUST be generative** — open response, sortableSteps, dragClassify with ≥4 buckets, or scaleSlider with reasoning field. Two-option MCQ-shaped predicts do not satisfy P2 on their own. |
| **P3** | Every drag-bucket / order-sort ends in a scoring reveal with named hits/misses + the misconception behind each miss. |
| **P4** | ≤1 MCQ-shaped block per lesson. `bossBattle` counts. So does an MCQ-shaped `i01` predict-reveal. Don't stack two. |
| **P5** | Within a lesson, scaffold rises monotonically: 1 → 1 → 2-3 → 4. Never regress. |
| **P6** | Worked → worked → faded → solo (Renkl/Atkinson variation effect). Block 7 is the first worked example; block 9 is a SECOND worked at a different surface; block 10 starts the fading. Cutting the second worked is forbidden — cut `chatScenario` or `culturalAside` instead. |
| **P7** | Interleave retrieval *across* lessons. Lesson 3 should briefly reach back to Lesson 1's commitment so the learner re-encounters it. |
| **P8** | Element-interactivity budget (Sweller). Per lesson, at MOST ONE novel conceptual primitive carries new intrinsic load; all other blocks rehearse it, recontextualise it, or extend it by one variable. The `revealCard` at block 3 names that primitive. A second primitive splits to a new lesson. |
| **P9** | Spaced retrieval gate (Karpicke). Block 2 of lessons 2-5 MUST be a `retrievalGate` block — a 30-second cued recall of the prior lesson's `i02` commitment, BEFORE the cold open. Requires a learner answer (not a markdown recap). |
| **P10** | Transfer-tagged assessment. ≥30% of assessment questions present a context (industry, dataset, scenario) NOT used in any lesson. Every question carries `transferTag: "recall" \| "near" \| "far"`. ≥2 far-transfer questions per course. |

### E — Engagement

| Rule | What |
|---|---|
| **E1** | First visible state change in ≤800ms after artifact mount. Pre-render the opening frame as static SVG if JS boot is slow. |
| **E2** | Every input has a ≤200ms feedback echo (value chip, sound, colour shift). |
| **E3** | Commit-before-reveal on every interactive scored as right/wrong. Live verdicts without a lock button violate this. |
| **E4** | Final artifact state visibly differs from entry state. `fill="freeze"` on terminal SMIL frames. No infinite-loop anims. |
| **E5** | ≥6 distinct mechanics per 20-artifact gallery. ≥4 distinct mechanics within any single lesson. |
| **E6** | Variable-ratio reward survives the iframe boundary. Solo mode emits `postMessage({type: "krit:anim-lab:opens", id, sessionOpens})` on every artifact open. **The host page MUST mount a `MicroMomentTicker` component that listens for this message and paints an `aria-live="polite"` "N of 20 explored" chip outside every iframe.** Without the host receiver, E6 is theatre. |
| **E7** | Curiosity gap on entry. Each `embedAnimation` is preceded by exactly 1 line of host markdown that names the prediction the artifact will gate. Example: *"Before scrolling — guess which step in the funnel leaks most. The artifact will check you."* |
| **E8** | Time-budget honesty. Each interactive block declares `estSeconds` (anims default 30, inters default 60); lesson total sits in 35-45 min. `lessonMeta.estimatedMinutes` MUST match the sum within ±10%. |
| **E9** | Attention-recovery hook before any prose ≥250 words. `fieldNotes`, `markdown` >250 words, and `culturalAside` that follow block 12 MUST be preceded by a 1-line callout naming the question the prose answers ("Here's where the model breaks — read for the bug, not the lesson."). |
| **E10** | No two consecutive passive blocks. `markdown`, `comicStrip`, `fieldNotes`, `culturalAside`, `image`, `video` cannot stack adjacent. Insert a `revealCard`, `quiz`, `tryIt`, or `embedAnimation` between any two. Lint-enforced. |
| **E11** | Affect arc declared per lesson. `lessonMeta.affectArc: "tense→relief" \| "curious→satisfied" \| "frustrated→competent" \| "skeptical→convinced"`. Cold open and reflect must bookend the named arc. |
| **E12** | Per-course palette propagates across iframe seam. Each course declares `palette: { accent, accentSoft, accentStrong, paper }` at JSON root. The integration script appends these as URL params (`?solo=1&p=<accent>&ps=<accentStrong>...`); `_shell.js` reads them on boot and overrides the gallery's CSS variables. No more affect-snap at the embed border. |

### M — Marketing voice

| Rule | What |
|---|---|
| **M1** | Lede names a specific enemy AND stakes a belief. The path subtitle must contain (a) a named practice, tool, or habit the course is against, and (b) the contrarian rule the course is for. Generic enemies ("hype," "theory," "jargon," "the old way") are placeholders, not deliverables. **Test:** a competitor course must be able to read your subtitle and say "we disagree." |
| **M2** | Card titles are frames, not labels. "Where the money leaks" beats "Funnel analysis". |
| **M3** | Payload footers and lesson subtitles carry a number, a named tradeoff, or a counter-intuitive rule. Never recap. |
| **M4** | Cast is recurring, not rotating. 5 named members per course; each member's role-line is identical across all lessons. |
| **M5** | Cold open is a scene, not a textbook. "Tuesday 11:40 AM. PM Slacks: 'Search returns nothing for kid-friendly restaurant.'" beats "Today we'll learn search." |
| **M6** | No template tics: "Twenty drop-ins for X" / "Two tribes of marketers" / "Scene yeh hai" used more than once per course is a tic and triggers a rewrite. |
| **M7** | Captions earn the embed. "`Try (~60s) · X — <one-line setup>`" minimum. Plain `Try: X` is the placeholder, not the deliverable. |
| **M8** | `culturalAside` blocks rotate their opener. ≤1 per opener phrase per course. |
| **M9** | Stated belief. The path `summary` MUST include one sentence starting with "We believe…" or "The bet here is…" — a load-bearing claim a competing course would refuse to print. Without it, M1's "enemy" reads as a generic category, not a positioning. |
| **M10** | Concrete-noun budget. Every 100 words of body copy contains ≥2 concrete proper nouns (a product, a tool, a city, a job title, a ₹/$ figure, a year). Abstract-noun stretches >40 words trigger rewrite. |
| **M11** | One villain, named. The path-level enemy from M1 must be a specific *practice or product*, not a category. "Postgres `LIKE` with a 3,400-entry synonym dictionary" is a villain. "Keyword search" is a category. |
| **M12** | Course-distinct register declared at JSON root. `"register": "<one line>"` (e.g., "dry, numerate, mildly impatient — Bangalore senior eng on Slack at 11pm"). Every block's draft is checked against the register. |
| **M13** | No second-person commands in the lede. Path subtitles + L1 cold opens must NOT begin with "You will learn / You'll build / Learn to…". Open with a scene, a number, or a stated belief. Second-person imperative is the universal tell of a marketplace listing. |

### U — UX & accessibility

| Rule | What |
|---|---|
| **U1** | Touch-safe drag. `Lab.makeDraggable` (bucket) or `Lab.makeSortable` (order). Never raw `draggable="true"`. |
| **U2** | WCAG 2.2 AA contrast. `--accent` for shapes/bars only; `--accent-strong` mandatory for SVG text ≤14px. **Automated:** `node scripts/audit-contrast.mjs` (see §5). |
| **U3** | Reduced motion. Every SMIL-using mount calls `Lab.gateSMIL(stage)` and provides a static fallback frame. |
| **U4** | Dialog focus management. `aria-modal="true"`, focus moves to `#focusTitle` on open, restores to opener on close, traps Tab inside. |
| **U5** | Solo mode (iframe embeds) hides topbar/grid AND sets `aria-hidden="true"` on them so screen readers don't traverse the now-invisible cards. |
| **U6** | iframe sandbox: `allow-scripts allow-same-origin allow-modals allow-popups-to-escape-sandbox`. Without `allow-modals` the dialog silently breaks. |
| **U7** | Iframe height is dynamic via `postMessage` (`krit:anim-lab:height`), clamped 380-900px. No fixed `height=640px`. |
| **U8** | Caption ≠ title. The iframe `title` attribute is terse for SR landmarks; the visible `<figcaption>` is rich with setup. |
| **U9** | Heading order. Each lesson renders a single `<main>`, `<h1>` (lesson title), and `<h2>` per block-cluster. `<h3>` must not precede an `<h2>`. Cold-open callout, comicStrip captions, culturalAside MUST NOT introduce new heading levels. Audit: `scripts/audit-heading-order.mjs`. |
| **U10** | 44×44 CSS px minimum touch target for ALL interactive controls outside anim-lab (`dragClassify`, `sortableSteps`, `scaleSlider`, `branchScenario`, `bossBattle` options). Keyboard equivalents match `Lab.makeSortable`'s Up/Down + ArrowUp/ArrowDown pattern. |
| **U11** | Captions, transcripts, no autoplay. Every `embedAnimation` with `audioSrc` requires a `transcript` field (plaintext, ≥80% of audio words). Narration MUST NOT autoplay — the Play overlay is the gesture-to-play contract. Reduced-motion users get the transcript shown by default. |
| **U12** | Unique iframe titles. The iframe `title` is `"<lesson title> — <artifact title>"`, never the caption verbatim and never repeated within a lesson. Generated by the integration script. |
| **U13** | The variable-ratio reward ticker (from E6) is an `aria-live="polite"` region in the host DOM. The saffron pulse in `_shell.js` is decorative only; the cumulative count MUST arrive in the host page as a labeled live region so SR users hear "8 of 20 explored" when crossed. |
| **U14** | Artifact-ready handshake. The iframe shell announces readiness via `postMessage({type: "krit:anim-lab:ready", artifactTitle, hasInteraction: boolean})`. The host mirrors this into a visible "Activity: <title> — press Enter to focus" affordance OUTSIDE the iframe so SR users encountering the embed via skip-link can find the interaction. |

### A — Architecture

| Rule | What |
|---|---|
| **A1** | A course is one JSON: `path + skills + skillPrerequisites + lessons[5-6] + assessment + project + credential`. Plus `cast`, `palette`, `register` at root (see §3, §3.5). |
| **A2** | Lessons are 8-18 blocks each. 12-18 is the default; 8-11 acceptable when intrinsic load is high (e.g., recursion, Bayes, embeddings). Above 22 needs an editorial cut, not a "comprehensive!" sticker. |
| **A3** | Lesson skill-hints reference the curated catalog (`prisma/seed/skill-catalog.ts`) by slug. Display names accepted as fallback. |
| **A4** | Block diversity per lesson: ≥6 distinct block types. A lesson with 12 markdown + 1 quiz is not a Krit lesson. |
| **A5** | Anim-lab embeds use `?solo=1&p=<accent>&ps=<accentStrong>` + `#L<n>-<id>` URL fragment (palette propagation per E12). Captions follow M7. Slot order is monotonic per P5. |
| **A6** | Assessment: 12-20 questions, ≥3 MCQ_MULTI, ≥1 per lesson, `skillSlug` AND `transferTag` set on every question. ≥30% novel-context (per P10). |
| **A7** | Project: rubric has ≥3 criteria × ≥3 levels. Prompt is ≥150 words with named context and audience. |
| **A8** | Course root carries `lessonMeta.estimatedMinutes` per lesson AND `lessonMeta.affectArc` (per E11). The lessonMeta block at the top of each lesson surfaces both to the learner. |

---

## 2 · The canonical lesson template

A showcase lesson is a 5-act arc. Block-by-block:

```
1.  lessonMeta              — title, est minutes (E8), affectArc (E11), skill hints
2.  retrievalGate           — lessons 2-5 ONLY (P9). 30s cued recall of prior lesson's i02 commitment. Lesson 1 starts at block 3.
3.  callout (tone="warn")   — cold open: a scene, a time, a name (M5)
4.  revealCard              — the single concept primitive (P8), predict-flip (P2)
5.  comicStrip              — 3-5 frames, cast members carry POV (M4)
6.  markdown                — the load-bearing claim, ~100 words
7.  embedAnimation a01      — scaffold-1 watch, ~30s (M7 caption, P5 slot 1, E7 setup line precedes)
8.  handsOn                 — WORKED example #1, full solution shown (P6)
9.  embedAnimation a02      — scaffold-1 watch at different surface (variation effect, P5 slot 2)
10. handsOn | chatScenario  — WORKED example #2, different surface from block 8 (P6 variation)
11. embedAnimation i01      — scaffold-2-3 predict-reveal (P5 slot 3, E3 lock). MUST be generative (P2) if no other generative interactive exists.
12. dragClassify | scaleSlider | sortableSteps — concept-level retrieval
13. tryIt | handsOn         — faded → solo application sketch
14. embedAnimation i02      — scaffold-4 solo commitment (P5 slot 4, lands BEFORE keyTakeaways). PEAK COGNITIVE LOAD.
15. callout (1 line)        — E9 attention-recovery hook: "Here's where the model breaks — read for the bug, not the lesson."
16. fieldNotes              — one anonymised real-world story, 250-400 words
17. bossBattle | branchScenario — replaces fieldNotes only when MCQ is the right shape AND no other MCQ block in lesson (P4)
18. quiz | tryIt            — E10 active-block separator before keyTakeaways (no two passive blocks adjacent)
19. culturalAside           — locale-flexed humour, max 1 per lesson, opener rotates per M8
20. keyTakeaways            — 4-7 points, each a complete sentence
21. reflect                 — 1 prompt that references the learner's i02 commitment AND the lesson's affectArc resolution
```

**Notes:**
- Drop blocks 10 / 12 / 17 / 18 / 19 as the lesson allows. Keep 1 / 3 / 4 / 6 / 14 / 20 / 21 as the spine, plus block 2 (`retrievalGate`) for lessons 2-5. Total 8-18 blocks.
- **Block 9 (worked #2) is NOT optional** — cutting it violates P6. Cut `chatScenario` or `culturalAside` first.
- The anim-lab quartet (a01, a02, i01, i02) is fixed in *order*, flexible in *adjacent neighbours*. The integration script enforces P5 placement automatically.
- `handsOn` is the spine of every showcase lesson — appears 2-3 times, not zero.
- The E9 attention-recovery hook (block 15) is mandatory whenever any prose ≥250 words sits after block 12.
- The `affectArc` named in lessonMeta (E11) bookends the cold open (block 3) and the reflect (block 21).

---

## 3 · The cast spec (M4)

A course has **exactly 5 named cast members** at the JSON root:

```json
"cast": [
  { "id": "anaya", "name": "Anaya", "role": "Protagonist — VP Marketing, 18 months into the job" },
  { "id": "vinod", "name": "Vinod", "role": "CFO chip — wants ROAS in 30 days, not a strategy doc" },
  { "id": "ria",   "name": "Ria",   "role": "Domain expert — ex-agency growth lead, allergic to dashboards" },
  { "id": "deepa", "name": "Deepa", "role": "Skeptic — head of brand, asks the hardest question last" },
  { "id": "atlas", "name": "Atlas", "role": "Your AI tutor" }
]
```

Pattern:
- **One protagonist** the learner identifies with (same role/seniority as the audience)
- **One budget/skeptic voice** (the CFO chip / the board member / the auditor)
- **One domain expert** with strong POV (the practitioner)
- **One contrarian** who asks the hardest question
- **Atlas** the AI tutor — same in every course

Cast members appear in `comicStrip`, `panelComic`, `chatScenario`, and `bossBattle` blocks. Each member's role-line MUST be identical across all uses; varying it makes them feel like different characters (a documented anti-pattern).

### 3.1 · Protagonist 100-word brief

Every course author writes a 100-word protagonist brief at the top of the course folder (`courses/<slug>.brief.md`) BEFORE writing lesson 1. It declares the protagonist's tics, habits, and what they say no to. Example (Anaya, from a hypothetical Marketing-VP course):

> **Anaya, VP Marketing.** Eighteen months in. Inherited a deck of 47 dashboards from her predecessor and a CFO who measures everything in weeks-to-payback. She is not bitter, but she is *done* with frameworks. When she opens a Monday review and a slide says "brand equity flywheel," she taps her pen twice and asks what the number was last quarter. She likes Ria because Ria has shipped. She tolerates Deepa because Deepa is usually right two weeks later. She and Vinod have a deal: if she can name the kill criterion on Monday, he stops asking on Wednesday.

Test: an author writing lesson 2 should be able to ask *"would she tap her pen here?"* and know the answer.

---

## 3.5 · Palette + register + retrievalGate

These three root-level fields are required on every course (added in V2).

### Palette (E12, U2)

```json
"palette": {
  "accent":       "#b32d2d",
  "accentSoft":   "#f5d2d2",
  "accentStrong": "#7a1818",
  "paper":        "#fffaf0"
}
```

The `integrate-anim-lab.mjs` script appends these as URL params on every embed (`?solo=1&p=%23b32d2d&ps=%237a1818`). `_shell.js` reads them on boot in solo mode and overrides the gallery's CSS variables. Contrast pairs MUST pass WCAG 2.2 AA against `paper` (4.5:1 for body, 3:1 for ≥24px bold).

### Register (M12)

```json
"register": "dry, numerate, mildly impatient — Bangalore senior eng on Slack at 11pm"
```

One line. Every block's draft is checked against it. If a paragraph could appear in any other course in the catalogue verbatim, it has failed the register.

### retrievalGate block (P9)

A new block type added to `lib/content/blocks.ts`:

```json
{
  "type": "retrievalGate",
  "prompt": "Last lesson you locked an answer to 'which step in your funnel leaks most?'. Before the new lesson — name a different metric that would have caught the same leak.",
  "expectsAnswer": true,
  "linkedLessonSlug": "funnel-math",
  "linkedCommitmentLabel": "funnel leak prediction"
}
```

Block 2 of lessons 2-5. Requires a learner answer (not a markdown recap). Renders before the cold open.

---

## 4 · Anim-lab integration rules

Every standard course has a matching anim-lab gallery at `public/anim-lab/<slug>.html` with up to 20 artifacts (4 per lesson × 5 lessons).

**Integration:** run `node scripts/integrate-anim-lab.mjs <slug.json>`. The script:
- Strips prior anim-lab embeds (idempotent)
- Parses gallery artifacts (id, type, title, what)
- Inserts 4 embeds per lesson in monotonic order (a01 → a02 → i01 → i02)
- Caps the insertion window at the earlier of `keyTakeaways` or `reflect`
- Generates captions as `"<Verb> (<runtime>) · <title> — <what>"`

**Embed URL shape:** `/anim-lab/<slug>.html?solo=1#L<n>-<id>`

**Block shape:**
```json
{
  "type": "embedAnimation",
  "src": "/anim-lab/the-science-of-well-being.html?solo=1#L1-i02",
  "height": 640,
  "caption": "Try (~60s) · Spot your own miswanting — pick which 'want' is likely to backfire."
}
```

Renderer (`src/components/lesson/blocks/embed-animation-block.tsx`):
- iframe sandbox includes `allow-modals` (U6)
- Skips Play overlay when `src` matches `/anim-lab/` + `#L` + no `audioSrc`
- Listens for `krit:anim-lab:height` postMessage; resizes iframe (U7)

Shell (`public/anim-lab/_shell.js`):
- Solo mode hides chrome AND sets `aria-hidden` (U5)
- `aria-modal="true"`, `role="dialog"` on focus (U4)
- Emits height postMessage on open + every ResizeObserver tick
- Reads `?p=` and `?ps=` URL params and overrides CSS variables (E12 palette propagation)
- showModal fallback to `setAttribute("open","")` if sandbox blocks modals

### 4.5 · Cross-iframe postMessage protocol

The shell emits these messages; the host page MUST listen for all of them.

| Type | When | Payload | Host action |
|---|---|---|---|
| `krit:anim-lab:ready` | Iframe boot complete | `{ artifactTitle, hasInteraction, type }` | Render "Activity: \<title\> — press Enter" affordance (U14) |
| `krit:anim-lab:height` | On open + ResizeObserver tick | `{ h, id }` | Resize iframe element, clamp 380-900 (U7) |
| `krit:anim-lab:opens` | After every artifact open in this session | `{ id, sessionOpens, courseSlug }` | MicroMomentTicker increments + paints aria-live region (E6, U13) |
| `krit:anim-lab:commit` | When learner locks a predict-reveal answer | `{ id, answer, correct, scaffold }` | (Future) feed analytics + show "8 commitments this lesson" |

The host page renders one `<MicroMomentTicker />` per lesson; the iframe never paints to the host directly. All cross-frame state goes through this protocol.

---

## 5 · The quality floor

A course passes the floor when ALL of these are true. **Items marked `[auto]` are CI-enforced; items marked `[review]` need human eyes.**

**Schema:**
- [ ] `[auto]` `npm run course:validate` — Zod + cross-ref clean
- [ ] `[auto]` `node scripts/audit-anim-lab-positions.mjs` — 0 anim-lab embeds after keyTakeaways/reflect
- [ ] `[auto]` `node scripts/audit-heading-order.mjs <slug>` — heading-level deltas ≤ +1 (U9)
- [ ] `[auto]` `node scripts/audit-contrast.mjs <slug>` — every `--accent-strong`/`--paper` pair passes WCAG AA (U2)
- [ ] `[auto]` `node scripts/audit-iframe-titles.mjs <slug>` — iframe titles unique within each lesson, ≤80 chars (U12)
- [ ] `[auto]` `node scripts/audit-passive-blocks.mjs <slug>` — no two consecutive passive blocks (E10)
- [ ] `[auto]` `node scripts/audit-block-types.mjs <slug>` — ≥6 distinct block types per lesson (A4)

**Per lesson:**
- [ ] `[auto]` 8-18 blocks (A2); above 22 blocks-an-editorial-cut warning
- [ ] `[auto]` ≤1 MCQ-shaped block (P4: bossBattle OR MCQ predict-reveal, never both)
- [ ] `[auto]` Anim-lab embeds in a01 → a02 → i01 → i02 order, ALL before keyTakeaways/reflect (P5, A5)
- [ ] `[auto]` `retrievalGate` present at block 2 of lessons 2-5 (P9)
- [ ] `[auto]` `lessonMeta.affectArc` declared (E11)
- [ ] `[auto]` `lessonMeta.estimatedMinutes` within ±10% of sum of `estSeconds` on interactive blocks (E8)
- [ ] `[auto]` `handsOn` appears ≥2 times in lesson (P6 worked-worked-faded-solo)
- [ ] `[review]` Cold open is a scene (M5)
- [ ] `[review]` Lesson subtitle has a number, tradeoff, or counter-intuitive rule (M3)
- [ ] `[review]` ≥1 generative predict-reveal (P2; not just binary MCQ)
- [ ] `[review]` Single novel conceptual primitive per lesson (P8)

**Per course:**
- [ ] `[auto]` `cast` array has exactly 5 members with identical role-lines across all references (M4)
- [ ] `[auto]` `palette`, `register` declared at root (E12, M12)
- [ ] `[auto]` Path subtitle ≤120 chars, contains no second-person commands (M13)
- [ ] `[auto]` Path summary contains "We believe" or "The bet here is" (M9)
- [ ] `[auto]` Anim-lab gallery passes `docs/ANIM_LAB_SPEC.md` (E1-E5, U1-U2, P1-P5)
- [ ] `[auto]` Assessment: 12-20 questions, ≥3 MCQ_MULTI, ≥1/lesson, all `skillSlug`+`transferTag` set, ≥30% novel-context, ≥2 far-transfer (P10, A6)
- [ ] `[auto]` Project: rubric ≥3×3, prompt ≥150 words (A7)
- [ ] `[review]` Lede names a specific (not category-level) enemy AND stakes a belief (M1, M11)
- [ ] `[review]` No "Twenty drop-ins" / "Two tribes" / repeated culturalAside opener (M6, M8)
- [ ] `[review]` Concrete-noun density ≥2 per 100 body words (M10) — sampled, not exhaustive
- [ ] `[review]` Protagonist brief (`courses/<slug>.brief.md`) ≥100 words, consistent with cast (§3.1)

**Renderer / host page (cross-cutting):**
- [ ] `[code]` Lesson page mounts `<MicroMomentTicker />` listening for `krit:anim-lab:opens` postMessage (E6, U13)
- [ ] `[code]` Lesson page renders the "Activity: <title> — press Enter to focus" affordance on `krit:anim-lab:ready` (U14)
- [ ] `[code]` `embedAnimation` renderer enforces 44×44 touch targets, transcript field present when audioSrc set (U10, U11)

**End-to-end:**
- [ ] `npm run db:import-course courses/<slug>.json` — clean
- [ ] Renders at `/learn/<slug>` (auth-gated; verify on a staging account)
- [ ] 4 expert subagents review pass — see §6 build order step 11

A course missing any floor item is **not ready for import**; fix the gap.

---

## 6 · Build order for a new course

1. **Scope, day 1.** Audience (1 sentence), enemy (1 sentence), 5 lessons (1 line each, each naming a load-bearing concept), 5 cast members (1 line each).
2. **Path-level voice, day 1.** Subtitle (M1), summary (M3 payload), audience line — write these THREE FIRST. The rest of the course reads better when the lede is already sharp.
3. **Lesson 1 cold open, day 2.** Write the scene. Test it on yourself: is it specific enough that a reader has to keep reading? Iterate.
4. **Lesson 1 spine, day 2-3.** Write 7-block spine: callout → revealCard → comicStrip → markdown → handsOn → tryIt → reflect. No anim-lab yet.
5. **Lesson 1 quality pass, day 3.** Run the per-lesson quality floor against it. If it fails any item, fix before moving to lesson 2.
6. **Repeat 3-5 for lessons 2-5.**
7. **Anim-lab gallery, day 6-7.** Build the 20 artifacts per `docs/ANIM_LAB_SPEC.md`. Use existing exemplars as clones: `leaders-ai-os#L1-i02`, `digital-marketing-with-ai#L1-i01`, `leadership-in-age-of-ai#L4-i01`.
8. **Integration, day 7.** `node scripts/integrate-anim-lab.mjs <slug.json>`. Audit positions.
9. **Assessment + project + credential, day 8.** Each question maps to a `skillSlug`. Rubric is genuinely 3×3.
10. **Floor check, day 8-9.** Run the full §5 checklist. Fix gaps. Validate. Import.
11. **Peer review, day 9-10.** Dispatch the 4 expert subagents. Apply findings.
12. **Ship, day 10.**

Realistic cadence: **8-10 working days per showcase-tier course**. A draft-tier course (anim-lab not yet wired or assessment is provisional) is 4-5 days.

---

## 7 · Anti-patterns log

Documented in `docs/ANIM_LAB_REVIEW_PASS2.md` and the three Pass-3 reviews. Quick list:

- **Curtain-call embeds:** anim-lab embeds after `keyTakeaways`/`reflect`. Fix: never.
- **Slot 2 regression:** [a01, i01, a02, i02] — easy-watch *after* hard-try. Fix: a01 → a02 → i01 → i02.
- **Tag captions:** `"Try: X"` with no setup. Fix: §M7 format.
- **Rotating cast:** named experts that appear once. Fix: §M4 5-member ensemble.
- **Template lede tic:** "Twenty drop-ins" / "Two tribes". Fix: one named scene per opener, no formula.
- **Identical Hindi culturalAside opener:** "Scene yeh hai…" 5+ times in one course. Fix: rotate openers.
- **Double-MCQ collision:** bossBattle + MCQ-shaped i01 in same lesson. Fix: §P4 — pick one.
- **Subtitles without payload:** "AI cell or AI factory? Pick the wrong one and the program dies in queue." Fix: add a number.
- **Block-density overload:** 30+ blocks per lesson. Fix: §A2 12-18.
- **Embed double-gate:** Play overlay over an already-auto-opening anim-lab modal. Fix: render-side skip when `?solo=1#L` + no audio.
- **Fixed iframe height clipping:** 640px on a 720-tall artifact. Fix: postMessage auto-resize.
- **`draggable="true"` on touch devices:** breaks iOS. Fix: `Lab.makeDraggable` / `Lab.makeSortable`.
- **Two consecutive passive blocks:** fieldNotes + culturalAside back-to-back drops attention to zero. Fix: E10 — insert a `quiz` / `tryIt` / `revealCard` between.
- **Single worked example before fading:** lesson 1 had handsOn at block 7, then immediately faded — Renkl variation effect needs TWO worked at different surfaces. Fix: P6 — block 9 is `handsOn #2`, never optional.
- **Category-level enemy in lede:** "AI hype" / "the old way" / "frameworks". Reads as everyone-and-no-one. Fix: M11 — specific tool, specific practice.
- **Affect-snap at iframe seam:** lesson chrome is grey, iframe is rose. Russell circumplex resets per embed. Fix: E12 palette propagation via `?p=` URL params.
- **Variable-ratio reward stuck in iframe:** each embed has its own `state.opens` counter. Skinner reward effectively dead. Fix: E6 + U13 — host MicroMomentTicker listens for `krit:anim-lab:opens`.
- **Block 2 of lesson 2-5 = a markdown recap:** no retrieval, no test. Karpicke spacing wasted. Fix: P9 — mandatory `retrievalGate` with learner answer.
- **Second-person command lede:** "You will learn to…". Reads as marketplace listing. Fix: M13.
- **No transfer questions in assessment:** every Q uses lesson contexts. Learner can't apply elsewhere. Fix: P10 — ≥30% novel context, `transferTag` per Q.

---

## 8 · References

- **`docs/PLATFORM_SPEC.md` — platform-side contract. This spec defines what authors write; the platform spec defines what the platform renders. They share §4.5 (postMessage protocol) verbatim. If they ever drift, the course spec defines the WHAT, the platform spec defines the HOW.**
- `docs/ANIM_LAB_SPEC.md` — anim-lab artifact contract (12 rules)
- `docs/ANIM_LAB_REVIEW_PASS2.md` — synthesis of pass-2 expert reviews on the galleries
- `lib/content/blocks.ts` — 34 block types with Zod schemas
- `lib/content/course.ts` — showcase course schema
- `prisma/seed/import-course.ts` — standard-course importer (idempotent)
- `prisma/seed/showcase-course-import.ts` — showcase-course importer (integrity-checked)
- `prisma/seed/skill-catalog.ts` — curated skill catalog
- `scripts/integrate-anim-lab.mjs` — anim-lab → course integration
- `scripts/audit-anim-lab-positions.mjs` — placement audit
- `courses/showcase/ai-for-developers.json` — the quality bar reference
- `courses/showcase/leaders-ai-os.json` — secondary reference for leadership audiences

---

## 9 · Change log

| Date | Change | Source |
|---|---|---|
| 2026-05-14 | V1 spec drafted from pass-3 review synthesis | This session |
| 2026-05-14 | **V2** — incorporated 4 expert reviews of V1: added P8 (cognitive-load budget), P9 (spaced retrieval gate), P10 (transfer-tagged assessment); amended P2 (generative predict-reveal), P6 (worked-worked-faded-solo). Added M9-M13 (stated belief, concrete-noun budget, named villain, course-distinct register, no second-person command lede); amended M1. Added E8-E12 (estSeconds, attention-recovery, no two consecutive passive blocks, affectArc, palette propagation); amended E6 (host MicroMomentTicker required). Added U9-U14 (heading order, 44×44 touch target, audio transcripts, unique iframe titles, aria-live ticker, krit:anim-lab:ready handshake). Added A8 (lessonMeta meta surfaces). Rewrote §2 lesson template with retrievalGate at block 2, second worked example at block 9, E9 attention-recovery hook at block 15. Added §3.1 (protagonist brief), §3.5 (palette + register + retrievalGate root fields), §4.5 (cross-iframe postMessage protocol). Tightened §5 quality floor with `[auto]` / `[review]` / `[code]` tags and 7 new audit scripts. Added 8 new anti-patterns to §7. | This session — Pass-3 expert reviews of V1 |

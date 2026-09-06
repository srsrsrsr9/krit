# Krit Platform Spec — V1

> The contract the Krit platform must satisfy to deliver the course experience that `docs/COURSE_CREATION_SPEC.md` promises.
>
> Goal: 100 courses that are a pleasure to consume and leave a lasting learning impact. The platform is the substrate that makes the course content's pedagogy, voice, engagement, and accessibility *actually land*. Course content names what to teach; this spec names how the platform must render, sequence, sound, react, persist, and prove it.

---

## 0 · Why this exists

The four expert reviewers — learning, marketing, psychology, UX — wrote acid critiques of the V1 course spec (`docs/COURSE_CREATION_SPEC.md`, V2). Most of their findings cannot be solved by content authors alone. They require the platform to:

- Render block types the schema names (`retrievalGate`, `affectArc`, palette propagation)
- Listen for cross-iframe messages and paint host-side affordances (variable-ratio ticker, readiness handshake, focus return)
- Enforce a11y at the lesson-shell level (heading order, landmarks, 44×44 targets, aria-live ticker)
- Carry the learner's commitments forward across lessons (the prior i02 answer must be queryable at the next lesson's retrievalGate)
- Run automated audits as CI gates, not author courtesy
- Sound, animate, and respond at a level that earns the "pleasure to consume" claim

This spec is what the platform delivers in service of those expectations.

---

## 1 · The 7 platform pillars

### R — Rendering

| Rule | What |
|---|---|
| **R1** | Every `ContentBlock` discriminated-union variant has a one-to-one React renderer at `src/components/lesson/blocks/<type>-block.tsx`. New block types are not real until the renderer ships. |
| **R2** | Lesson page is one `<main>`, one `<h1>` (lesson title), `<h2>` per block-cluster. Block renderers MUST NOT emit `<h1>`. Heading order is enforced by `scripts/audit-heading-order.mjs` AND a runtime assertion in dev. |
| **R3** | `retrievalGate` renderer gates the lesson DOM until the learner submits a non-empty answer. Answers persist to `LessonCommitment` (new table); next lesson's gate reads from it. |
| **R4** | `MicroMomentTicker` (new component) lives in the lesson layout. Mounts once per lesson; subscribes to `krit:anim-lab:opens` postMessage; paints an `aria-live="polite"` chip "8 of 20 explored — last: <artifactTitle>". |
| **R5** | `embedAnimation` renderer is sandbox-correct (`allow-modals`), listens for `krit:anim-lab:height` for auto-resize, listens for `krit:anim-lab:ready` and renders the "Activity: <title> — press Enter to focus" affordance OUTSIDE the iframe (per U14). |
| **R6** | All custom interactive renderers (`dragClassify`, `sortableSteps`, `scaleSlider`, `branchScenario`, `bossBattle`) follow the same touch + keyboard contract: 44×44 hit targets, ArrowUp/ArrowDown reorder, Enter to commit, Esc to cancel. |
| **R7** | The lesson page exposes a skip-link to "Activities" — a TOC of all `embedAnimation` + interactive blocks — populated from JSON, navigable by keyboard. |
| **R8** | Markdown renderer strips `<h1>`/`<h2>` from content (markdown headings inside a block use `<h3>+`). Sanitisation is mandatory for any user-influenced HTML; XSS is a P1 incident. |

### S — Sequencing & persistence

| Rule | What |
|---|---|
| **S1** | Every interactive commit emits a `LrsEvent` (Learning Record Store): `{ learnerId, lessonId, blockId, type: "commit", payload: { answer, correct, scaffold, timestamp } }`. Used by the AI tutor + analytics. |
| **S2** | `LessonCommitment` table joins (learner, lesson, blockId) → (answer, correct, scaffold). Read by next lesson's `retrievalGate`. |
| **S3** | Lesson progress is block-level, not lesson-level. The renderer marks each block "seen" / "engaged" / "committed". A 12-block lesson opened to block 8 resumes at block 8, not block 1. |
| **S4** | Time-on-block is recorded for E8 telemetry. If a lesson's measured time deviates >40% from `lessonMeta.estimatedMinutes`, the platform flags it for author review (not the learner — invisible signal). |
| **S5** | `Attempt` rows accumulate per assessment with `passThreshold`, `timeLimitSec`, `attemptsAllowed` honoured. Result feeds the Skill Graph evidence (S6). |
| **S6** | **Skill Graph evidence**: a lesson's `i02` commit at scaffold 4 + a pass on the same lesson's assessment skillSlug = an `Evidence` row at `WORKING` level. Three pieces of WORKING evidence on a skill = automatic promotion to `PROFICIENT` (configurable per workspace). |
| **S7** | `LessonCommitment` answers persist for the course duration AND beyond — they can be re-surfaced in the AI tutor's retrieval context. "Remember last week you said you'd cut the Wednesday status meeting? How did that go?" |

### E — Engagement layer

| Rule | What |
|---|---|
| **PE1** | The variable-ratio reward (E6 in course spec) is a platform feature, not a content one. The host-mounted `MicroMomentTicker` increments per `krit:anim-lab:opens` message; at the spec's variable-ratio cadence (3-7 opens), the host paints a saffron pulse + aria-live announce. |
| **PE2** | Affect arc UI: `lessonMeta.affectArc` is surfaced as a thin progress band at the top of the lesson page that fills as the learner advances. The band's colour shifts along the named arc (e.g., `tense→relief` goes from `--accent-strong` to `--accent-soft`). |
| **PE3** | Sound design (per `docs/sfx.md`): platform-wide SFX palette tied to specific events — commit (`SFX.confirm`), reveal-correct (`SFX.success`), reveal-wrong (gentle, never punitive), scaffolded-prediction-lock (`SFX.pop`). Sound toggle persists per learner, not per lesson. |
| **PE4** | Optional ambient bed (per `docs/music.md`): one of 4 generative beds (calm / focused / playful / urgent) auto-selected by the lesson's affectArc + register. Loops at low volume, ducks during narration. Off by default; opt-in per workspace. |
| **PE5** | Reduced-motion (`prefers-reduced-motion`) propagates everywhere. CSS transitions, SMIL animations (via `Lab.gateSMIL`), parallax effects, the affect-arc band — all respect the user setting. |
| **PE6** | Idle-state recovery: if the learner pauses >2 minutes mid-lesson, the platform offers a re-engagement nudge ("Pick back up at block 9: 'You were predicting CAC'.") — never auto-pause, never gamification. |
| **PE7** | Streaks are NOT a feature. Daily-login pressure violates the lasting-learning-impact goal. Track engagement; surface it; do not weaponise it. |

### V — Voice & identity

| Rule | What |
|---|---|
| **PV1** | Per-course `palette` propagates from course JSON → lesson page chrome → embed iframe URL params → anim-lab solo mode (per E12 in course spec). A learner enters a "rose course" and every surface is rose-tinged. |
| **PV2** | Per-course `register` is shown to the AI tutor (Atlas) as a system-prompt prefix so its replies match the course voice. A learner in `the-science-of-well-being` hears Atlas in a different register from `testing-with-playwright`. |
| **PV3** | The protagonist brief (`courses/<slug>.brief.md`, per §3.1 of course spec) is rendered as the course's home page hero — not as a tooltip, but as the **promise the course is making to *this* learner**. |
| **PV4** | Cast members render as identifiable avatars + role-line tags wherever they appear (comicStrip, panelComic, chatScenario, bossBattle). Role-line is read from a single source of truth (root `cast` array); per-block overrides are forbidden. |
| **PV5** | The path-level lede (subtitle + summary) renders prominently on the course home, the catalogue card, and the lesson page header. M9's "We believe…" sentence is visually emphasised — bolded, leading-em-dash, not buried. |

### A — Accessibility

| Rule | What |
|---|---|
| **PA1** | WCAG 2.2 AA is the floor, not the ceiling. Every interactive renderer passes axe-core + manual SR walkthrough. CI gate: `npm run a11y:audit` (uses axe + Playwright). |
| **PA2** | Focus management contract: every page has one initial focus target (h1 by default), focus restoration on dialog close, focus trap inside modal interactives. Documented in `docs/A11Y_PATTERNS.md`. |
| **PA3** | All interactives have keyboard equivalents matching the spec U10 + R6 contract. No mouse-only paths. |
| **PA4** | Live regions: the `MicroMomentTicker`, the affect-arc band's milestone announcements, the AI tutor's response-arrival ping — all `aria-live`. |
| **PA5** | Audio: narration has transcript (per U11), background music has a master "audio off" toggle, all sound effects can be globally muted. |
| **PA6** | Reduced-motion respected everywhere (PE5). |
| **PA7** | High-contrast mode (system preference) overrides the per-course palette and uses a verified high-contrast palette tied to the course's hue family. |
| **PA8** | Cognitive accessibility: text complexity for body copy targets Flesch-Kincaid grade 9. Block renderers expose a "simpler language" toggle that surfaces an alternate `mdSimple` field where authored. |

### T — AI tutor (Atlas)

| Rule | What |
|---|---|
| **PT1** | Atlas is course-aware: retrieval index per course (lesson markdowns + author notes + the learner's own `LessonCommitment` history). |
| **PT2** | Atlas is voice-aware: course `register` is the system prompt's first line. Atlas-in-well-being ≠ Atlas-in-Playwright. |
| **PT3** | Atlas is commitment-aware: when the learner asks a question, Atlas can reference their prior i02 lock ("Last lesson you locked CAC at ₹3,200. Want to revisit that here?"). |
| **PT4** | Atlas guardrails: no factual claims beyond the course content + cited public sources. Hallucination on a learning platform is a P0 incident. Every answer either cites a course block or admits unknown. |
| **PT5** | Atlas usage budget per learner per day (default 50 messages); soft-warns at 40, hard-stops at 50. Beyond budget, route to a `reflect` prompt or course content. |
| **PT6** | Atlas is opt-in. Some learners want silence. Hide the tutor surface entirely when toggled off; do not nudge. |

### O — Ops & integrity

| Rule | What |
|---|---|
| **PO1** | Cost discipline: per-tenant rate limits + spend alerts + circuit breaker on all LLM calls (Atlas, AI feedback grader, AI categorisation). Implements `docs/AI.md` patterns. |
| **PO2** | Observability: structured logging on every block render, every interactive commit, every Atlas call. Logs never contain PII or full answer text (only hash + scaffold). |
| **PO3** | Migrations: every schema change has up + down migrations. Destructive migrations require explicit `/break-glass` + DECISIONS.md entry. |
| **PO4** | Staging-first deploys: every prod release sits on staging ≥24h. Verified by `npm run ship` checklist. |
| **PO5** | Content versioning: each course JSON has a `contentVersion` field; on update, the platform shows learners on prior versions a "this course has been updated" banner without breaking their progress. |
| **PO6** | Backups: nightly snapshot of `LessonCommitment`, `Attempt`, `Evidence`, `Submission`. Restorable in <1h. |
| **PO7** | Tenancy: all queries are workspace-scoped at the data layer, not at the route layer. Adding a workspace cannot accidentally expose another's data. |

---

## 2 · The cross-iframe postMessage protocol (canonical)

This protocol is the contract between the anim-lab gallery shell and the host lesson page. It is jointly owned by `docs/COURSE_CREATION_SPEC.md` §4.5 and this document.

| Type | Direction | Payload | Action |
|---|---|---|---|
| `krit:anim-lab:ready` | iframe → host | `{ artifactTitle, hasInteraction, type, lessonNum, artifactId }` | Host renders "Activity: <title> — press Enter to focus" SR-only affordance + analytics ping |
| `krit:anim-lab:height` | iframe → host | `{ h, id }` | Host resizes iframe wrapper, clamps 380-900 |
| `krit:anim-lab:opens` | iframe → host | `{ id, sessionOpens, courseSlug }` | Host `MicroMomentTicker` increments; if cadence matches, paints saffron pulse + announces "8 of 20 explored" via aria-live |
| `krit:anim-lab:commit` | iframe → host | `{ id, answer, correct, scaffold, timeMs }` | Host writes `LessonCommitment` row + emits `LrsEvent` |
| `krit:start` | host → iframe | `{}` | Iframe unlocks AudioContext + starts narration (legacy; for audio-narrated embeds) |
| `krit:palette` | host → iframe | `{ accent, accentSoft, accentStrong, paper }` | Iframe overrides CSS variables (fallback to URL params if message not received) |
| `krit:reset` | host → iframe | `{}` | Iframe re-mounts the current artifact at scaffold 1 (used when learner re-attempts) |
| `krit:focus` | host → iframe | `{}` | Iframe transfers focus into the dialog (used when learner hits the skip-link affordance) |

All messages MUST pass through `event.source === iframeRef.current.contentWindow` origin check. The host ignores messages from unknown windows.

---

## 3 · Component inventory (what must exist)

These are the concrete React components / routes / API endpoints the platform must ship to satisfy the course spec. Many already exist; many are net new.

### Lesson-rendering chain

| Component | Status | Purpose |
|---|---|---|
| `src/components/lesson/BlockRenderer.tsx` | exists | Discriminated-union router over `ContentBlock` |
| `src/components/lesson/blocks/<type>-block.tsx` | partial | One per block type. RetrievalGate renderer is NEW. |
| `src/components/lesson/MicroMomentTicker.tsx` | **new** | aria-live region listening for `krit:anim-lab:opens` |
| `src/components/lesson/AffectArcBand.tsx` | **new** | Top-of-lesson progress band coloured by affectArc |
| `src/components/lesson/ActivitiesSkipLink.tsx` | **new** | Skip-link + activity TOC from JSON |
| `src/components/lesson/LessonLayout.tsx` | exists | Owns the cross-cutting infra: skip-link, ticker, affect band, lesson commit-store provider |

### Atlas (AI tutor)

| Component | Status | Purpose |
|---|---|---|
| `src/components/tutor/TutorPanel.tsx` | exists | Right-side dock |
| `src/server/tutor/retrieve.ts` | exists | Vector search over course content |
| `src/server/tutor/system-prompt.ts` | **modify** | Prepend course `register` + recent `LessonCommitment` |
| `src/server/tutor/guardrails.ts` | **new** | Cite-or-decline enforcement |
| `src/server/tutor/budget.ts` | **new** | Per-learner-per-day rate limit |

### Assessment + project + credential

| Component | Status | Purpose |
|---|---|---|
| `src/app/(learner)/assess/[slug]/page.tsx` | exists | Assessment runner |
| `src/server/assessment/score.ts` | exists | Pass/fail + skill evidence |
| `src/components/assessment/TransferTag.tsx` | **new** | Render transferTag chip on each question for analytics |
| `src/app/(learner)/projects/[projectSlug]/page.tsx` | exists | Project submission |
| `src/server/credential/issue.ts` | exists | Mint IssuedCredential on completion |

### Authoring + audit

| Script / Component | Status | Purpose |
|---|---|---|
| `scripts/integrate-anim-lab.mjs` | exists | Threads anim-lab embeds through course lessons |
| `scripts/audit-anim-lab-positions.mjs` | exists | No embeds after keyTakeaways/reflect |
| `scripts/audit-heading-order.mjs` | **new** | U9 enforcement |
| `scripts/audit-contrast.mjs` | **new** | U2 WCAG AA check on palette pairs |
| `scripts/audit-iframe-titles.mjs` | **new** | U12 unique titles per lesson |
| `scripts/audit-passive-blocks.mjs` | **new** | E10 no two passive blocks adjacent |
| `scripts/audit-block-types.mjs` | **new** | A4 ≥6 distinct block types per lesson |
| `scripts/audit-cast-consistency.mjs` | **new** | M4 role-lines byte-identical |
| `scripts/audit-voice-tics.mjs` | **new** | M6 / M8 detect repeated lede + culturalAside openers |
| `scripts/audit-transfer-tags.mjs` | **new** | P10 ≥30% novel-context + ≥2 far-transfer |
| `scripts/audit-time-budget.mjs` | **new** | E8 lessonMeta estimatedMinutes within ±10% of estSeconds sum |
| `src/app/admin/authoring/` (route group) | **new** | Authoring UI (rich block editor + live preview + audit panel + AI assist for caption rewrites, etc.) |

### Data

| Model | Status | Purpose |
|---|---|---|
| `User`, `Workspace`, `Membership` | exists | Identity + tenancy |
| `Skill`, `SkillPrerequisite`, `SkillState` | exists | Skill graph |
| `Path`, `PathItem`, `Lesson`, `LessonSkill` | exists | Course structure |
| `Assessment`, `Question`, `Attempt`, `Answer` | exists | Assessments |
| `Submission`, `ProjectBrief` | exists | Capstone projects |
| `IssuedCredential`, `Credential` | exists | Certifications |
| `LrsEvent` | exists | Learning record store |
| `TutorConversation`, `TutorMessage` | exists | AI tutor sessions |
| `LessonCommitment` | **new** | learner × lesson × blockId → answer (powers retrievalGate + Atlas memory) |
| `LessonProgress` | exists | Per-lesson state; extend with block-level position (S3) |
| `Assignment` | exists | Compliance / cohort assignments |

### Catalogue + discovery

| Component | Status | Purpose |
|---|---|---|
| `src/app/(learner)/catalog/page.tsx` | exists | Catalogue grid |
| `src/app/(learner)/catalog/[slug]/page.tsx` | exists | Course home with hero + protagonist brief |
| `src/components/catalog/CourseCard.tsx` | **modify** | Pull from course `palette` + `register` excerpt; show M9 belief sentence |
| `src/server/recommendation/next-course.ts` | **new** | Given the learner's skill state + recent commits, suggest the next course |

---

## 4 · Sync with `docs/COURSE_CREATION_SPEC.md`

The two specs share these contracts; either is authoritative on its half but both must agree on these:

| Contract | Course spec section | Platform spec section |
|---|---|---|
| Block type list | Block schema (`lib/content/blocks.ts`) | R1 (renderers) |
| Cross-iframe postMessage protocol | §4.5 | §2 |
| Per-course `palette` field | §3.5 | PV1 + PA7 (palette propagation + high-contrast variant) |
| Per-course `cast` field | §3 | PV4 (avatars + role-lines) |
| Per-course `register` field | §3.5 | PV2 (Atlas system prompt) |
| `retrievalGate` block | §3.5 + P9 | R3 (renderer + gating) |
| `affectArc` per lesson | E11 + A8 | PE2 (UI band) |
| `MicroMomentTicker` | E6 (names the requirement) | R4 + PE1 (component) |
| Audit scripts | §5 quality floor | §3 component inventory (the new scripts) |
| WCAG 2.2 AA contrast pairs | U2 | PA1 + PA7 |
| Touch targets 44×44 | U10 | R6 |

If they ever drift, **the course spec defines the WHAT, the platform spec defines the HOW**, and they cross-reference each other. The change log in each spec names the date of sync.

---

## 5 · Quality bars

A platform release is shippable when ALL true:

**Functional:**
- [ ] All 35 `ContentBlock` types have a renderer (R1)
- [ ] All 8 cross-frame messages from §2 have handlers on the host (R4, R5)
- [ ] `LessonCommitment` table created + migrations applied + populated by `krit:anim-lab:commit` (S2)
- [ ] `MicroMomentTicker` mounts on every lesson page with ≥1 `embedAnimation` (R4)
- [ ] AffectArcBand renders for every lesson with `lessonMeta.affectArc` set (PE2)

**Audit pipeline (CI):**
- [ ] All 9 new audit scripts ship + run in CI (§3)
- [ ] `npm run a11y:audit` (axe-core + Playwright) on every lesson page in every course; 0 critical violations (PA1)
- [ ] `npm run course:validate` on every course in `courses/*.json` (existing)
- [ ] `npm run typecheck` + `npm run lint` clean

**Performance:**
- [ ] Lesson page TTI ≤2.5s on mid-tier 4G mobile (matches `docs/PERFORMANCE.md`)
- [ ] Embedded iframe `loading="lazy"` working; first iframe boots after lesson interactive (Largest Contentful Paint not blocked by iframe)
- [ ] Shared anim-lab shell JS code-split + cached across iframes (defer to follow-up; flagged anti-pattern in Pass-3 review)

**A11y:**
- [ ] axe-core: zero critical issues
- [ ] Manual screen-reader walkthrough (VoiceOver Mac + TalkBack Android) on the showcase course's lesson 1
- [ ] Keyboard-only walkthrough completes 1 full lesson + 1 assessment
- [ ] Reduced-motion: 1 full lesson with `prefers-reduced-motion: reduce` looks correct (no broken 0-width SMIL state)

**Content:**
- [ ] ≥3 courses ship at showcase tier (full V2 spec compliance)
- [ ] ≥15 courses ship at draft tier (anim-lab integrated; voice + cast partially migrated)
- [ ] Atlas indexed over all shipped courses; cite-or-decline guardrail verified on a 50-prompt eval set

---

## 6 · Build order

This spec does not estimate calendar time. It orders the work by *prerequisite chains*.

**Tier 1 — schema + protocol foundation (everything else depends on this):**

1. `LessonCommitment` Prisma model + migration (S2)
2. Block schema additions: `retrievalGate` + `transferTag` on questions (already started — `lib/content/blocks.ts`)
3. Importer schema additions: `cast`, `palette`, `register` on course root, `affectArc` on lesson (already started — `prisma/seed/import-course.ts`)
4. Cross-frame postMessage protocol implementation: emitter side complete in `_shell.js`; receivers needed in `EmbedAnimationBlock`, `MicroMomentTicker`, `LessonLayout`
5. Migrations applied to dev + staging DB

**Tier 2 — host renderers + audits (the platform features the course spec depends on):**

6. `RetrievalGateBlock` renderer + commit persistence (R3)
7. `MicroMomentTicker` component + integration into `LessonLayout` (R4, PE1)
8. `AffectArcBand` component (PE2)
9. `ActivitiesSkipLink` + activity TOC (R7)
10. The 9 new audit scripts (§3)
11. axe-core a11y CI integration (PA1)

**Tier 3 — Atlas + assessment + analytics:**

12. Atlas system-prompt update for `register` + `LessonCommitment` retrieval (PT2, PT3)
13. Atlas guardrails (PT4)
14. Atlas budget enforcement (PT5)
15. `transferTag` on assessment questions surfaced in score breakdown
16. `LrsEvent` extended with block-level commit telemetry (S1, S4)

**Tier 4 — voice + identity propagation:**

17. Course-card palette + M9 belief-sentence surfacing (PV5)
18. Per-course palette propagated into lesson chrome (PV1)
19. Cast avatars + role-line single-source-of-truth render path (PV4)
20. Protagonist brief as course home hero (PV3)

**Tier 5 — engagement polish:**

21. SFX palette implementation (PE3)
22. Optional ambient music beds (PE4)
23. Idle-state recovery nudge (PE6)
24. High-contrast palette family (PA7)
25. Simpler-language toggle scaffolding (PA8)

**Tier 6 — authoring tooling:**

26. Authoring UI route group (`src/app/admin/authoring`)
27. Live-preview iframe of in-progress lesson
28. AI-assisted caption rewrite (uses the voice spec)
29. Peer-review pipeline integration

**Tier 7 — scale + content:**

30. Course-content authoring sprint: bring 3 courses to V2 showcase tier (start with `the-science-of-well-being`, `digital-marketing-with-ai`, `ai-for-developers`)
31. Migrate remaining 14 courses to V2 schema (cast + palette + register, retrievalGates, audit-clean)
32. Author 80 more courses to V2 spec to reach the 100-course goal

**Each tier unblocks the next.** Tier 7 cannot start until Tiers 1-5 are at the quality bars in §5.

---

## 7 · Anti-patterns the platform must refuse

- **Streaks, badges-for-logins, loss aversion gamification.** Violates "lasting learning impact." Engagement we measure, never weaponise.
- **Auto-playing media on lesson load.** Violates WCAG 1.4.2 + user-respect. Every audio/video gesture-gated.
- **Per-tenant analytics leaking across workspaces.** P0 incident.
- **"AI feedback" without cite-or-decline.** Atlas may not invent rubric scores or learning outcomes.
- **Hardcoding course palette in components.** The palette is data, propagated end-to-end via R1 + PV1 + the `?p=` URL param contract.
- **Authors editing rendered HTML.** All content goes through JSON → Zod → renderer. Never let a hand-edited HTML escape the schema.
- **Background music on by default.** Workspace-level opt-in only. Sound is an enhancement, not the experience.
- **Pop-up upgrade prompts mid-lesson.** Monetisation happens at the catalogue + onboarding, never in the learning flow.

---

## 8 · References

- `docs/COURSE_CREATION_SPEC.md` — course-side contract (V2 in sync)
- `docs/ANIM_LAB_SPEC.md` — anim-lab artifact contract
- `docs/ANIM_LAB_REVIEW_PASS2.md` — synthesis of pass-2 expert reviews
- `lib/content/blocks.ts` — 35 block types (Zod)
- `prisma/schema.prisma` — DB schema
- `prisma/seed/import-course.ts` — course importer with V2 schema additions
- `public/anim-lab/_shell.js` — anim-lab shell with solo mode + postMessage emitter
- `src/components/lesson/blocks/embed-animation-block.tsx` — host iframe receiver
- `scripts/integrate-anim-lab.mjs` — anim-lab → course integration
- `scripts/audit-anim-lab-positions.mjs` — embed placement audit

---

## 9 · Change log

| Date | Change | Source |
|---|---|---|
| 2026-05-14 | V1 platform spec drafted in sync with course spec V2 | This session |

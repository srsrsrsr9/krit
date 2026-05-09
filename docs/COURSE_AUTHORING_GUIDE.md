# Course Authoring Guide — Krit Story Mode

End-to-end guide for authoring a new Story Mode course. Hand it to anyone who wants to build a course; no prior context required.

---

## TL;DR

```bash
# 1. Scaffold a new course (interactive — picks slug, locale, skills, cast)
npm run course:new

# 2. Paste the generated prompt into Claude (Sonnet 4.6+) / Gemini 2.5 Pro / GPT-5
# 3. Save the LLM's JSON output as: courses/showcase/<slug>.json
# 4. Validate + import (strict — fails on anything that could break)
npm run course:import courses/showcase/<slug>.json

# Soft-delete / restore (no hard deletes ever)
npm run course:archive <slug>
npm run course:restore <slug>
```

---

## What the scaffolder picks for you

You don't need to remember conventions — the CLI handles them.

| Decision | Who picks |
|---|---|
| **Slug** | Auto-derived from the title (`"AI Strategy for CFOs"` → `ai-strategy-for-cfos`) |
| **Locale suffix** | Auto-appended for non-English (`-hi`, `-ta`, `-mr`, etc.) |
| **Cast** | Pick `leadership` / `fresh` / `mixed` — names auto-localised for Hindi/Marathi |
| **Skill hints** | Pick from a curated list shown in the CLI |
| **Workspace** | Single-workspace setup; the importer just uses the one that's there |

You answer 7 short questions. The scaffolder writes:

- `courses/showcase/<slug>.draft.json` — pre-filled metadata stub
- `prompts/<slug>.md` — the LLM prompt, fully self-contained, paste-ready

---

## The flow in detail

### 1 · Scaffold

```
$ npm run course:new

┄ Krit · new Story Mode course ┄

Course title: AI Strategy for CFOs
One-line subtitle (the hook): The five questions every CFO ducks until Q4
Audience (one line): CFOs and senior finance leaders
Number of lessons (5): 
Estimated total minutes (50): 
What is this course about? Two or three sentences. Be specific:
> Translating AI investment into board-defendable ROI. Each lesson covers
  one specific decision the CFO has to make: capex vs opex, vendor
  lock-in, headcount conversion, audit posture, the AI line on the P&L.

Locale options:
  1. English    (en)
  2. Hindi      (hi)
  3. Tamil      (ta)
  4. Telugu     (te)
  5. Marathi    (mr)
  6. Kannada    (kn)
  7. Bengali    (bn)
Pick a locale (number) (1): 1

Cast (leadership · fresh · mixed) [leadership]: 

Available skills (pick 2–5 by comma-separated number):
  ── Leadership ──
   1. Leadership fundamentals  [leadership-fundamentals]
   2. Decision-making under ambiguity  [decision-making]
   ...
  ── Finance ──
  27. AI ROI framing  [ai-roi]
  28. CapEx vs OpEx framing  [capex-vs-opex]
  ── Strategy ──
  29. Vendor and platform strategy  [vendor-strategy]

Pick numbers (e.g. 2,7,12,18): 27,28,29,24,11

✓ Slug:    ai-strategy-for-cfos
✓ Draft:   courses/showcase/ai-strategy-for-cfos.draft.json
✓ Prompt:  prompts/ai-strategy-for-cfos.md

Next steps:
  1. Open prompts/ai-strategy-for-cfos.md and copy the ENTIRE contents.
  2. Paste into Claude (Sonnet 4.6+) / Gemini 2.5 Pro / GPT-5.
  3. Save the LLM's JSON output as: courses/showcase/ai-strategy-for-cfos.json
  4. npm run course:import courses/showcase/ai-strategy-for-cfos.json
```

### 2 · Generate with an LLM

The generated prompt at `prompts/<slug>.md` is **self-contained**. Paste the entire file into:

- **Claude (Sonnet 4.6 or higher)** — recommended; best at long-form structured JSON
- **Gemini 2.5 Pro** — also good, especially for India-anchored tone
- **GPT-5** — works fine

The model returns a single JSON object. **Save it verbatim** as `courses/showcase/<slug>.json`. If it truncated mid-output (rare on Claude/Gemini, occasional on GPT), ask the model to "continue from where you left off" and concatenate.

### 3 · Import (strict — fails fast on anything that could break)

```
$ npm run course:import courses/showcase/ai-strategy-for-cfos.json

┄ Course preview ┄

  Title:         AI Strategy for CFOs
  Slug:          ai-strategy-for-cfos
  Workspace:     Krit Demo
  Audience:      CFOs and senior finance leaders
  Estimated:     50 min total
  Lessons:
    01. The CapEx Trap                 (10 cards · 10 min)
    02. Vendor Lock-In or Lift-Off     (11 cards · 10 min)
    03. Headcount, Translated          (10 cards · 10 min)
    04. The Audit Posture              (12 cards · 10 min)
    05. The Line On The P&L            (11 cards · 10 min)

  ✓ 3 catalog skill(s) auto-created in this workspace.

Proceed with import? (y/N): y

✓ Imported "AI Strategy for CFOs"
  Path: ai-strategy-for-cfos  (5 lessons linked in order)
  Live in production at:  /learn/ai-strategy-for-cfos
  Story Mode preview at:  /showcase/course/ai-strategy-for-cfos
```

**Idempotent.** Running the same import twice updates the course in place. Learner progress (started/completed lessons, reflections, evidence) is preserved.

---

## What "strict import" actually checks

Before any DB write, the importer runs these checks. **Any error here aborts the import** and lists every problem with what's expected.

### Schema validation (Zod)
Every block, every field, every enum literal. Failed → message tells you the exact path (e.g. `lessons[2].blocks[5].choices`).

### Referential integrity
- `dragClassify`: every `item.correctBinId` exists in `bins[].id`
- `branchScenario`: `startNodeId` exists in `nodes[].id`; every `nextNodeId` exists; every choice has either `nextNodeId` OR `outcome`
- `chatScenario`: every `scenario.correctBucketId` exists in `buckets[].id`
- `quiz` / `timedChallenge` / `bossBattle.stages[]`: at least one option marked `correct: true`
- `skillProof`: must have either `choices` (with one correct) or `evalPattern` — both empty = no way to evaluate
- `scaleSlider`: every band's `[lo, hi]` fits inside `[min, max]`; `startValue` within range
- Lesson slugs unique within the course; lesson has at least one block

### Animation files
Every `embedAnimation` block's `src` must exist as an actual HTML file under `public/`. Missing files → import blocked, with the exact paths listed.

### Skill catalog
Every `skillHints` slug must:
- Already exist as a `Skill` row in the DB, OR
- Be in the curated catalog at `prisma/seed/skill-catalog.ts` (auto-created on import)

Anything else → error with the message: *"Add it to prisma/seed/skill-catalog.ts (and re-import) OR use a slug from the catalog."*

### Style warnings (non-blocking)
- Lesson missing `reflect` or `keyTakeaways` card → warned
- Lesson card count outside 8–12 → warned
- `keyTakeaways` outside 3–5 points → warned
- `cardSwipe` deck where every card has the same `correctSide` → warned

Warnings show but don't block. Errors block.

---

## Soft-delete / restore (no hard deletes ever)

```bash
npm run course:archive <slug>   # Path.status = ARCHIVED
npm run course:restore <slug>   # Path.status = DRAFT (back to editable)
```

Both commands are reversible. Lessons, learner progress, reflections, evidence — all stay intact. Archiving just marks the path so it can be hidden from the catalog without losing data.

The importer will also automatically set `status: DRAFT` if you re-import a previously-archived course (i.e. re-importing un-archives).

---

## Animations are a separate flow

Animations are self-contained HTML files at `public/courses/<courseSlug>/anim/<file>.html`. The course JSON references them via `embedAnimation` blocks.

**The LLM should NOT produce `embedAnimation` cards** — the prompt explicitly says so. After the course imports cleanly, you decide which lessons benefit from a visual, generate the HTML separately (using `docs/ANIMATION_STYLE.md` + a focused per-animation prompt), drop the HTML at the right path, add the `embedAnimation` block to the JSON, and re-import.

The import is strict about animation files — if you reference a file that doesn't exist, the import fails before any DB write happens.

---

## Block type reference

The LLM prompt includes every block schema; this section is for human authors editing JSON by hand or reviewing LLM output.

### Static — render text and visuals
| Type | Use when |
|---|---|
| `callout` | Hook a card with a concrete moment ("Tuesday 4:12 PM…"). Tones: `info`, `tip`, `warn`, `success`. |
| `markdown` | Plain prose. Markdown supported. Keep ≤ 350 chars. |
| `heading` | Section break. Levels 1–3. |
| `code` | Code snippet with language tag. |

### Reveal & narrative
| Type | Use when |
|---|---|
| `revealCard` | Tap-to-flip. Front = provocative claim, back = nuanced truth. |
| `comicStrip` | Multi-character avatar dialogue. Use for quick character beats. |
| `panelComic` | Phantom-style scene panels with narration, speech bubbles, SFX. Use for longitudinal narrative ("twelve months later…"). |

### Test understanding
| Type | Use when |
|---|---|
| `quiz` | Single- or multi-select MCQ. Default for comprehension checks. |
| `timedChallenge` | Same as quiz + countdown. Adds tension. |
| `skillProof` | "Prove it" framing — multi-choice or free-text. Ends a lesson with a confident move. |

### Manipulate & explore
| Type | Use when |
|---|---|
| `dragClassify` | Sort items into named bins. Cartoon mascots react. |
| `scaleSlider` | Continuous-value answer. Banded feedback after lock-in. |
| `cardSwipe` | Tinder-style decision deck. 3–8 cards, swipe each. |
| `branchScenario` | Twine-style branching choices with consequences. |
| `chatScenario` | Multi-turn coaching with chip answers. |
| `bossBattle` | 2–5 stage capstone challenge with letter grade. |

### World-grounding & wrap
| Type | Use when |
|---|---|
| `fieldNotes` | Real-world (or "real-world-shaped") case study. |
| `reflect` | Open prompt + textarea. Use once per lesson. |
| `keyTakeaways` | 3–5 bullets. Always last card. |

### Animation (manual workflow)
| Type | Use when |
|---|---|
| `embedAnimation` | Reference an HTML file you generated separately. **The LLM should not produce these.** |

---

## Things to consider before authoring at scale

**Workspace.** Single-workspace assumption. The importer always uses the one workspace it finds in the DB. Multi-tenant support is a future extension.

**Slug conflicts.** Slugs are auto-derived from titles. If you author two courses with the same title, the second one's slug collides with the first and the importer overwrites the first one's content (idempotent update). Watch the preview step. If you've shipped the first course already, change the second course's title or run a manual rename.

**Skill linkage.** Only catalog skills (or pre-existing DB skills) are accepted. To add a new skill, append it to `prisma/seed/skill-catalog.ts` and re-import the course. The importer creates the `Skill` row in DB automatically — you don't run a separate seed.

**Cast continuity.** Use the same cast across all lessons in a course. The scaffolder gives you 3 default casts (`leadership` / `fresh` / `mixed`) — pick once and stick with it. Adding new characters mid-course breaks the world.

**LLM drift.** When generating, the model occasionally drifts in tone (corporate jargon creeps in) or pads ("As an AI language model…"). The prompt explicitly forbids both, but if you see it, ask the LLM to "rewrite in the worked-example tone — terse, concrete, character-driven."

**Truncation on long courses.** If you ask for >5 lessons in one shot, the LLM may truncate. Two strategies:
- Break into batches: ask for 3 lessons, save, then ask for the next 3 in a new prompt that references the saved JSON.
- Use Claude Sonnet 4.6+ with extended output. Handles 7-lesson courses comfortably in one shot.

**Locale (auto-handled).** When you pick `hi` / `ta` / etc., the scaffolder appends the locale suffix to the slug AND tells the LLM in the prompt to write the content in that script. Cast names auto-localise where appropriate (Hindi/Marathi: Sam → Samar, Rina → Reena). You don't need to remember the suffix convention — the CLI handles it.

**Versioning.** The Course schema has no `schemaVersion` field today. When we add custom block types in the future, we'll bump the version and the importer will refuse outdated JSON cleanly.

---

## "Good lesson" rubric

When reviewing an LLM-generated course, check:

- [ ] Each lesson opens with a **specific moment** (date, time, character, ₹ figure) — not a definition
- [ ] At least one **revealCard** or **comicStrip** per lesson — moves the story
- [ ] At least one **hard interactive** per lesson (quiz / timedChallenge / branchScenario / bossBattle / cardSwipe / dragClassify / skillProof)
- [ ] Every lesson ends with **reflect + keyTakeaways**
- [ ] **3–5 takeaways** per lesson, each ≤ 160 chars, action-oriented
- [ ] **Cast consistency** — same characters in same roles across all lessons
- [ ] No `embedAnimation` blocks (those are added manually after import)
- [ ] No corporate jargon, no "As we discussed earlier", no AI tells
- [ ] Speech bubbles ≤ 100 chars, callout titles ≤ 140 chars
- [ ] Each lesson 8–12 cards, balanced across types

The importer will warn on most of these automatically. If three or more fail, regenerate that lesson with a sharper prompt.

---

## Troubleshooting

**"Course JSON failed Zod validation"** — Zod found a structural problem. The error tells you the path. Common causes:
- LLM forgot a required field (most often: `tone` on dragClassify bins)
- Type literal misspelled (e.g. `"chatScenarios"` vs `"chatScenario"`)
- Wrong nesting (an `options` array nested inside a `bossBattle` stage)

Send the error back to the LLM and ask it to fix that specific lesson.

**"skillHint X is not in the curated catalog AND not in the DB"** — the LLM invented a skill slug not on the list. Either:
- Tell the LLM to use only slugs from the list you gave it (in section 4 of the prompt), and regenerate
- OR add the new skill to `prisma/seed/skill-catalog.ts` if it's a legitimate gap

**"file not found at /courses/.../anim/X.html"** — `embedAnimation` references an HTML you haven't generated yet. Either generate it or remove the block from the JSON before importing.

**"node X choice Y → nextNodeId Z doesn't exist"** — branching scenario integrity error. Tell the LLM "the nextNodeId in node X choice Y doesn't match any node in your nodes[] list. Either point to an existing node id or replace nextNodeId with an outcome string."

**"No workspace found"** — your local Prisma DB isn't seeded. Run your seed script first.

**LLM produces broken JSON because of unescaped quotes inside speech bubbles** — happens occasionally with Gemini. Easiest fix: tell the model "your output is not valid JSON; escape all quotation marks inside string values" and re-run.

# Course Authoring Guide — Krit Story Mode

This is the end-to-end guide for authoring a new Story Mode course. Hand it to anyone who wants to build a course; no prior context required.

---

## TL;DR

```bash
# 1. Scaffold a new course (interactive)
npm run course:new

# 2. Paste the generated prompt into Claude / Gemini / GPT.
# 3. Save the LLM's JSON output as: courses/showcase/<slug>.json
# 4. Import it into the LMS:
npm run course:import courses/showcase/<slug>.json
```

You'll end up with:
- A new Path + Lessons in the production database (rendered at `/learn/<slug>`)
- The same course playable as a swipe-through Story Mode at `/showcase/course/<slug>`

---

## The flow in detail

### 1 · Scaffold

```
$ npm run course:new

┄ Krit · new Story Mode course ┄

Course title: AI Strategy for CFOs
URL slug (ai-strategy-for-cfos): 
One-line subtitle (the hook): The five questions every CFO ducks until Q4
Audience (Mid-career leaders): CFOs and senior finance leaders
Number of lessons (5): 
Estimated total minutes (50): 
What is this course about? Two or three sentences. Be specific:
> Translating AI investment into board-defendable ROI. Each lesson covers one
  specific decision the CFO has to make: capex vs opex, vendor lock-in, headcount
  conversion, audit posture, and the AI line on next year's P&L.
Cast (leadership · fresh · mixed) [leadership]: 

✓ Wrote draft stub: courses/showcase/ai-strategy-for-cfos.draft.json
✓ Wrote LLM prompt: prompts/ai-strategy-for-cfos.md

Next steps:
  1. Open prompts/ai-strategy-for-cfos.md and copy the ENTIRE contents.
  2. Paste into Claude (sonnet 4.6 or higher) / Gemini 2.5 Pro / GPT-5.
  3. The LLM will return valid JSON matching the Course schema.
  4. Save its output as: courses/showcase/ai-strategy-for-cfos.json
  5. Validate + import into the LMS:
        npm run course:import courses/showcase/ai-strategy-for-cfos.json
```

**What's pre-filled for you:**
- A URL-safe slug derived from the title
- Cast (5 default characters with continuity across lessons)
- Lesson count, estimated minutes
- The full schema reference for every block type
- A worked-example lesson the LLM can pattern-match against
- A style guide that captures what makes Krit lessons feel different

### 2 · Generate with an LLM

The generated prompt at `prompts/<slug>.md` is **self-contained**. Paste the entire file into:
- **Claude** (Sonnet 4.6 or higher) — recommended, best at long-form structured JSON
- **Gemini 2.5 Pro** — also good, especially for Indian / Asian audience tone
- **GPT-5** — works fine

The model will return a single JSON object. **Save it verbatim** as `courses/showcase/<slug>.json`. Don't manually format it — the importer validates on next step.

If the LLM truncated mid-output (rare on Claude/Gemini, more common on GPT), ask it to "continue from where you left off" and concatenate. Or split lessons and run twice.

### 3 · Import

```
$ npm run course:import courses/showcase/ai-strategy-for-cfos.json

┄ Course preview ┄

  Title:            AI Strategy for CFOs
  Slug:             ai-strategy-for-cfos
  Workspace:        Krit Demo (krit-demo)
  Audience:         CFOs and senior finance leaders
  Estimated:        50 min total
  Lessons:
    01. The CapEx Trap                 (10 cards · 10 min)
    02. Vendor Lock-In or Lift-Off     (11 cards · 10 min)
    03. Headcount, Translated          (10 cards · 10 min)
    04. The Audit Posture              (12 cards · 10 min)
    05. The Line On The P&L            (11 cards · 10 min)

  ⚠ skillHints with no matching Skill row in DB:
     • finance-leadership
     • board-readiness
     These won't be linked. Add them via your skill-seed script if needed.

Proceed with import? (y/N): y

✓ Imported "AI Strategy for CFOs"
  Path: ai-strategy-for-cfos  (5 lessons linked in order)
  Live in production at:  /learn/ai-strategy-for-cfos
  Story Mode preview at:  /showcase/course/ai-strategy-for-cfos
```

The importer is **idempotent** — running it again on the same JSON updates the existing course in place. Learner progress (started/completed lessons) is preserved.

---

## Block type reference

The LLM prompt includes every block schema; this section is for human authors editing JSON by hand.

### Static — render text and visuals

| Type | Use when |
|---|---|
| `callout` | Hook a card with a concrete moment ("Tuesday 4:12 PM…"). Tones: `info`, `tip`, `warn`, `success`. |
| `markdown` | Plain prose. Markdown supported. Keep under ~350 chars. |
| `heading` | Section break. Levels 1–3. |
| `code` | Code snippet with language tag. |

### Reveal & narrative

| Type | Use when |
|---|---|
| `revealCard` | Tap-to-flip. Front = provocative claim, back = nuanced truth. |
| `comicStrip` | Multi-character avatar dialogue. Use for quick character beats. |
| `panelComic` | Phantom-style panel comic with scenes, narration, speech bubbles, SFX. Use for longitudinal narrative ("twelve months later…"). |

### Test understanding

| Type | Use when |
|---|---|
| `quiz` | Single- or multi-select MCQ. Default for comprehension checks. |
| `timedChallenge` | Same as quiz + countdown timer. Adds tension. |
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
| `embedAnimation` | Reference an HTML file you generated separately. **The LLM should not produce these** — see below. |

---

## Animations are a separate flow

Animations are self-contained HTML files at `public/courses/<courseSlug>/anim/<file>.html`. The course JSON references them via `embedAnimation` blocks.

To add an animation to a course:
1. Identify the lesson + concept that benefits from a visual (usually the moment a principle clicks)
2. Use `docs/ANIMATION_STYLE.md` + a focused per-animation prompt to generate the HTML
3. Drop the HTML at the right path
4. Add an `embedAnimation` card to the course JSON: `{ "type": "embedAnimation", "src": "/courses/<slug>/anim/<file>.html", "height": 360, "caption": "…" }`
5. Re-run `npm run course:import`

The importer reports any `embedAnimation` paths that don't exist on disk so you don't ship broken iframes.

---

## Things to consider before authoring at scale

**Workspace / multi-tenancy.** The importer attaches the course to the first workspace it finds (or `--workspace <slug>`). If you're authoring for a specific tenant, always pass the flag.

**Slug conflicts.** Course and lesson slugs must be unique within a workspace. If a slug already exists, the importer updates in place (idempotent). If a different course had the same lesson slug previously, that lesson's blocks get overwritten. Check the preview output carefully.

**Skill linkage.** `skillHints` are free-text strings in the JSON; the importer matches them against existing `Skill.slug` rows. Unmatched hints are listed in the preview but don't fail the import. To make hints stick, either pre-seed the skills (via your skills script) or use exact existing slugs.

**Cast continuity.** Use the same `cast` array across all lessons in a course. Defining new characters mid-course breaks the world-feel. The leadership cast (Sam, Rina, Kavya, CFO, Atlas) is the default — change it only with intent.

**LLM drift.** When generating with Claude/Gemini, the model occasionally drifts in tone (corporate jargon creeps in) or pads ("As an AI language model…"). The prompt explicitly forbids both, but if you see it, ask the LLM to "rewrite in the worked-example tone — terse, concrete, character-driven."

**Truncation on long courses.** If you ask for >5 lessons in one shot, the LLM may truncate. Two strategies:
- Break into batches: ask for 3 lessons, save, then ask for the next 3 in a new prompt that references the saved JSON.
- Use Claude with extended output (200k context, 32k output tokens). Sonnet 4.6+ handles 7-lesson courses comfortably in one shot.

**Versioning.** The Course schema has no `schemaVersion` field today. When we add one, old courses still load (Zod is permissive on missing optionals). When you add custom block types, bump the version and update the importer.

**Locale.** The schema is single-locale today. If you need Hindi or regional variants, copy the course JSON, change the slug to `<slug>-hi`, run the LLM with a translated style guide, and import as a separate course. Locale-aware block schemas are a future extension.

**Rolling back.** No automatic rollback yet. To remove a course: delete the `Path` row by slug, delete its `Lesson` rows by slug. (We can add `npm run course:remove` later if needed.)

---

## What "good" looks like — rubric

When reviewing an LLM-generated course, check for:

- [ ] Each lesson opens with a **specific moment** (date, time, character, dollar figure) — not a definition
- [ ] At least one **revealCard** or **comicStrip** per lesson — moves the story
- [ ] At least one **hard interactive** per lesson (quiz / timedChallenge / branchScenario / bossBattle / cardSwipe / dragClassify)
- [ ] Every lesson ends with **reflect + keyTakeaways**
- [ ] **3–5 takeaways** per lesson, each ≤ 160 chars, action-oriented
- [ ] **Cast consistency** — same characters in same roles across all lessons
- [ ] No `embedAnimation` blocks (those are added manually)
- [ ] No corporate jargon, no "As we discussed earlier", no AI tells
- [ ] Speech bubbles ≤ 100 chars, callout titles ≤ 140 chars
- [ ] Each lesson has 8–12 cards, balanced across types

If three or more of these fail, regenerate that lesson with a sharper prompt.

---

## Troubleshooting

**"Course JSON failed validation"** — Zod found a structural problem. The error message tells you the path (e.g. `lessons[2].blocks[5].choices`). Common causes:
- LLM forgot a required field (most common: `tone` on dragClassify bins)
- Type literal misspelled (e.g. `"chatScenarios"` vs `"chatScenario"`)
- Wrong nesting (an `options` array nested inside a `bossBattle` stage)

Usually fixable by sending the validation error back to the LLM and asking it to fix that specific lesson.

**"No workspace found"** — your local Prisma DB isn't seeded. Run your seed script first, or pass `--workspace <slug>` if the workspace exists under a non-default name.

**Animations missing on import** — the preview lists them. Drop the HTML files at the listed paths and re-run the import (idempotent).

**LLM produces a broken JSON because of unescaped quotes inside speech bubbles** — happens occasionally with Gemini. Easiest fix: tell the model "your output is not valid JSON; escape all quotation marks inside string values" and re-run.

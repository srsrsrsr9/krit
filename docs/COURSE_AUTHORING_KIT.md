# Krit Course Authoring Kit

Use this kit to produce production-ready Krit courses with any frontier LLM (GPT, Gemini, Claude). It encodes the voice, structure, and quality bar that makes a Krit course different from a stock LMS course.

The output is meant to be **directly seedable** through `prisma/seed/<course-name>-{skills,lessons,questions}.ts` (mirroring the existing `python-*` files), so the structures here line up 1:1 with the production Zod schemas.

---

## 1 · The 10-second philosophy

A Krit course is **a skill someone can demonstrate**, delivered through a sequence of small, opinionated lessons. We are not making a textbook. We are not making a TED talk. We are training a learner to be **slightly dangerous in a real situation by Friday**.

Three rules that flow from this:

1. **Mental model before facts.** Every lesson opens by giving the learner the right *picture* — a metaphor, a mental layout, a "think of it as…". Facts pinned to a model survive; facts on their own evaporate.
2. **Name the moves.** Patterns that have names get reused. Patterns without names get forgotten. We invent names like *"the mutable default trap"*, *"the fan-out trap"*, *"the four-step translation"*. Names are the unit of memory.
3. **Translation, not transcription.** The hardest part of any skill is going from a real-world question ("how many of our top customers churned last quarter?") to a formal answer (the SQL query, the spreadsheet model, the management decision). **Every Krit lesson includes at least one explicit translation moment.** This is the X-factor.

---

## 2 · Voice & style

| Rule | Do | Don't |
|---|---|---|
| Person | Second-person, direct ("you"). | Avoid "we" except when describing the platform or the field. |
| Tone | Opinionated, slightly nerdy, calm, never patronising. | Avoid breathless ("amazing!"), corporate ("synergy"), or salesy. |
| Sentence length | Mix. Short sentences land hard. Longer ones can carry a clause that earns its keep. | Avoid every sentence being the same medium length — it sedates. |
| Comma over em-dash | Prefer commas and semicolons. | Avoid em-dashes; they're ChatGPT's signature. |
| Concrete first | Examples first, abstractions second. | Avoid 200-word setups before showing what you mean. |
| Number specificity | Use real numbers in examples ("a 50M-row table", "after 10 layers, 0.25¹⁰ ≈ 0.0000001"). | Avoid placeholder numbers like "X" or "many". |
| Disagreement OK | If the field has a debated practice, take a side and say why. | Avoid "it depends" without saying what it depends on. |

**One stylistic move that defines Krit: the framed warning.** Almost every lesson has a callout titled something like *"The classic trap"* or *"Where this catches everyone"*. It's the most-loved part of the course. Use it.

---

## 3 · Course structure

Every course is one **Path** with this anatomy. Lengths are guidelines; let the topic decide.

```
Path
├── 5–7 Lessons (8–15 min each)
├── 1 Assessment (15–20 MCQs, mix single + multi)
├── 1 Capstone Project (rubric-scored)
└── 1 Credential (auto-issued on completion)
```

| Element | Purpose |
|---|---|
| Path | The story arc. Has a one-line subtitle and a 2-3 sentence summary that ends with the *capability* the learner walks away with. |
| Skills | 5–7 skills with prerequisites. Skills are the atomic unit; lessons attach to skills. |
| Lessons | Each teaches **one model + 2–4 named moves**. Never more. |
| Assessment | Tests retention + judgment. Single-answer for facts, multi-answer for nuance. |
| Capstone | A real, applied task with a 3-criterion rubric. Reviewer-graded. |
| Credential | Auto-issued. The point. |

### Lesson anatomy (this is the structural backbone)

A great Krit lesson follows this seven-step rhythm:

```
1. Hook              — one paragraph: why this matters today, the misconception we'll overturn
2. Mental model      — a callout(tip) titled "Mental model" giving the picture
3. The first move    — heading + concrete example + code/example
4. The second move   — heading + concrete example + code/example
5. The trap          — callout(warn) titled "The classic trap" or similar
6. Try it            — tryIt or sqlPlayground or sortableSteps — the learner *does*
7. Recap + reflect   — keyTakeaways (3–5 bullets) + reflect prompt
```

Each lesson should also seed a quiz (inline `quiz` block) somewhere mid-lesson to cement the move just learned. Don't quiz at the end — that's what the assessment is for.

---

## 4 · Block catalogue (this is the platform contract)

These are the only block types the renderer understands. Output JSON conforming exactly to these schemas.

| Type | Schema (pseudo-JSON) | When to use |
|---|---|---|
| `heading` | `{type, level: 1\|2\|3, text}` | Section breaks. Use level 2 for in-lesson sections. |
| `markdown` | `{type, md: string}` | Prose. Default. Markdown supported including `**bold**`, lists, tables. |
| `callout` | `{type, tone: "info"\|"tip"\|"warn"\|"success", title?, md}` | Mental models (`tip`), traps (`warn`), context (`info`), wins (`success`). |
| `code` | `{type, lang: string, code, caption?}` | Code or formula examples. `lang` matches the domain (`sql`, `python`, `text`, `excel`). |
| `image` | `{type, src: url, alt, caption?}` | Diagrams or photos. Always include alt. |
| `video` | `{type, provider: "youtube"\|"vimeo"\|"url", src, caption?}` | Video clips. |
| `quiz` | `{type, prompt, multi: bool, choices: [{id, label, correct, explain?}]}` | Inline understanding-check. 2–4 choices, *always* include `explain` for at least the correct + the most tempting wrong. |
| `tryIt` | `{type, instruction, lang?, starter?, expected?}` | Hands-on prompt. Always include `expected` reference solution. |
| `reflect` | `{type, prompt}` | One open-ended question, end of lesson only. |
| `keyTakeaways` | `{type, points: string[]}` | 3–5 bullets, end of lesson. Each bullet should be **a sentence the learner can quote three weeks later**. |
| `animatedTimeline` | `{type, title?, steps: [{label, body, code?}]}` | A 3–6 step process. Best for translation moments. |
| `sortableSteps` | `{type, prompt, items: [{id, label, detail?}], hint?}` | Drag-to-order puzzle. Items in array MUST be in correct order — UI shuffles them. |
| `joinExplorer` | `{type, prompt?, left, right}` | SQL JOIN-only — don't use outside SQL courses. |
| `sqlPlayground` | `{type, prompt, tables, starter?, expected?, hint?}` | SQL-only. Real in-browser execution. |
| `remotion` | `{type, composition: <id>, durationFrames, fps, width, height, caption?, props}` | Use only with existing compositions: `sqlExecutionOrder`, `joinFlow`, `groupByCollapse`. Don't invent new ones. |

**Output rule:** the `Lesson.blocks` field is an array of these objects. Strict JSON, double-quoted property names.

---

## 5 · Quizzes — the format that actually trains judgment

A Krit quiz is not a recall test. It's a **judgment trainer**. The wrong choices are wrong for *interesting* reasons that the learner needs to internalise.

For each MCQ, design the choices like this:

- **One correct** — direct.
- **One "almost right"** — the answer that sounds correct because it's a partial truth or the previous-version best practice. Explain why it's wrong with a sentence the learner will remember.
- **One "you didn't read carefully"** — tests whether the learner is paying attention.
- **One nonsense** — present only if you have a specific misconception worth dispelling. Otherwise three choices is fine.

Always include `explain` on the correct answer and on every wrong-but-tempting answer.

For multi-answer questions, use 4 choices, with **2 correct** that capture different facets of the same idea. Multi-answer questions are great for "select all defensible options" — perfect for management, ethics, or design judgment.

---

## 6 · Capstone projects — the X-factor for every course

Every Krit course ends with a capstone that mirrors a real task the learner would face on day one of using this skill. Not a toy. Not a multiple-choice test scaled up. A real task.

Capstone design rules:

1. **Frame it as a stakeholder ask.** Open with "Your manager / a friend / your client says…" and a slightly under-specified question. Part of the skill is asking the right clarifying question.
2. **3-criterion rubric, weighted.** Krit's rubrics are always 3 criteria, each with 3–4 levels of mastery scored as integer points. Examples below.
3. **Fail mode > grade.** The rubric explains *why* a missing piece is missing, not just "incorrect". This trains the reviewer's brain too.

Rubric template (re-use across domains):

```json
{
  "rubric": [
    { "criterion": "Correctness",      "levels": [
      { "label": "Fully solves the brief on the example data and the edge cases.", "points": 4 },
      { "label": "Solves the brief; one edge case slips.",                          "points": 3 },
      { "label": "Solves the happy path only.",                                     "points": 2 },
      { "label": "Wrong shape or wrong numbers.",                                   "points": 0 }
    ]},
    { "criterion": "Craft",            "levels": [
      { "label": "Idiomatic, named, clearly composed; a teammate could maintain it.", "points": 3 },
      { "label": "Works but reads awkwardly in places.",                              "points": 2 },
      { "label": "Reads like a different field's idioms forced through.",             "points": 0 }
    ]},
    { "criterion": "Edge handling",    "levels": [
      { "label": "Handles missing input, malformed input, and stated edge cases gracefully.", "points": 3 },
      { "label": "Handles obvious cases.",                                                    "points": 2 },
      { "label": "Crashes or silently does the wrong thing.",                                 "points": 0 }
    ]}
  ]
}
```

Adapt **Craft** and **Edge handling** to the domain — for a management course they might become **Empathy** and **Concrete next step**; for a cooking course **Technique** and **Adaptability**; for a finance course **Defensibility** and **Sensitivity to assumptions**.

---

## 7 · The X-factor patterns (use 2+ in every course)

These are the moves that make a Krit course feel earned, not assembled. Every course should hit at least two of these explicitly.

| Pattern | What it is | Example |
|---|---|---|
| **The named trap** | Pick the misconception that catches every beginner in this domain. Give it a name. Build a callout(warn) around it in lesson 2 or 3. | *"The mutable default trap"* (Python). *"The fan-out trap"* (SQL). |
| **The translation moment** | Mid-course, take an English question and walk the learner through translating it into the formal answer step by step. Use `animatedTimeline`. | *"Which top-10 cities had revenue growth last month?"* → grain → tables → filters → aggregate. |
| **The "what you write vs what runs"** | Show how the formal language's order differs from your written order. Even non-tech: *"What you say in a 1:1 vs what your report hears."* | SQL execution order. Cooking mise-en-place vs serving order. |
| **The judgment quiz** | One quiz where every wrong answer is defensible. The point is not to get it right; it's to know *why* you got it wrong. | A management quiz where every choice is something a real manager has done. |
| **The fan-out / cascade** | A single decision multiplied through a system. Explicit in tech (joins). Hidden in lifestyle (one missed habit cascading), management (one bad hire), commerce (one mispriced SKU). | Show the cascade visually. |
| **The "before vs after"** | Give the learner the same problem at the start of the course and the end, and let them feel the difference. | A messy CSV at lesson 1 they can barely parse → at the capstone they automate it. |

---

## 8 · Domain-agility notes

The kit works for any domain because the **block primitives** are domain-neutral. Here's how the seven domains beyond pure tech translate:

| Domain | Likely block mix | Domain-specific X-factor |
|---|---|---|
| **Tech / data** | code, sqlPlayground/tryIt, animatedTimeline, sortableSteps, quiz | The named trap. Translation moment. |
| **Lifestyle (cooking, fitness, sleep)** | image, video, animatedTimeline (process steps), sortableSteps (sequence), reflect | "The cascade" — a small daily move compounding over months. Use sortableSteps for *ingredient → process → plate* puzzle. |
| **Management / leadership** | quiz (judgment-style), sortableSteps (conversation steps), reflect, callout(warn) for traps | The "what you say vs what your report hears". Multi-answer quizzes where multiple options are defensible. |
| **Commerce / business** | code (Excel formulas), tryIt with toy P&L, animatedTimeline (funnel), quiz | The "fan-out" of one mispriced SKU through inventory + cash flow. Capstone: "your SaaS startup hits day 90 — diagnose the problem from these 5 numbers." |
| **Creative (writing, design)** | reflect, image (before/after), tryIt (rewrite this paragraph), quiz on style judgments | The "rewrite a real bad piece" capstone. Judgment quizzes with no single correct answer. |
| **Health / medical** | callout(warn) heavy, image, animatedTimeline (process), sortableSteps (procedure) | The compliance dimension — getting one thing wrong has real cost. Capstone: classify 5 real-world cases. |
| **Finance / personal finance** | code (formula or pseudo-Python), animatedTimeline (compounding), tryIt with sample portfolio, quiz | "The compounding cascade" — small percentage changes over decades. Capstone: critique a real piece of financial advice. |
| **Compliance / regulatory** | callout(warn) heavy, sortableSteps (escalation procedure), quiz on edge cases, reflect | Use `kind: COMPLIANCE` on the path. Skills get `decayDays` — re-verification needed. |

The constant across all domains: **named patterns, traps, translation moments, real capstones with rubrics**.

---

## 9 · Quality checklist

Before shipping any generated course, run this checklist on the output:

- [ ] Every lesson has a **mental model** in the first third.
- [ ] Every lesson has at least one **named pattern or trap**.
- [ ] Every lesson has at least one **interactive block** (quiz, tryIt, sortableSteps, sqlPlayground, joinExplorer, animatedTimeline).
- [ ] At least one lesson contains an **explicit translation moment** (English → formal answer).
- [ ] All quiz wrong-but-tempting choices have an `explain` field.
- [ ] All `tryIt` blocks have an `expected` reference solution.
- [ ] `keyTakeaways` are sentences a learner could quote three weeks later, not "we covered…" summaries.
- [ ] The capstone is **a stakeholder ask**, not a multiple-choice test scaled up.
- [ ] The rubric has **3 criteria**, each with 3–4 levels of mastery.
- [ ] Skill prerequisite chain is acyclic and intuitive.
- [ ] Voice: second-person, opinionated, no breathless adjectives, no em-dashes.
- [ ] Numbers in examples are specific (`50M rows`, `0.25^10 ≈ 0.0000001`), not placeholders.

---

## 10 · The drop-in prompt template

Paste this into GPT-4 / Claude Sonnet / Gemini 2.5 Pro. Replace the `<<TOPIC>>` block with the course you want.

```
You are a Krit course author. Krit is a skill-first LMS where every
course produces a verifiable credential. Read the Course Authoring Kit
(below) carefully — it defines the voice, structure, block schemas, and
X-factor patterns you must follow. Then produce the course described in
the TOPIC block.

#####  COURSE AUTHORING KIT  #####
[paste the contents of docs/COURSE_AUTHORING_KIT.md here]
#####  END KIT  #####

#####  TOPIC  #####
<<topic>>: [e.g. "How to read a P&L for non-finance founders"]
<<audience>>: [e.g. "First-time SaaS founders, no accounting background"]
<<outcome>>: [the capability the learner walks away with — one sentence]
<<duration>>: [e.g. "5 lessons of 10–12 min each"]
<<domain>>: [tech | lifestyle | management | commerce | creative | health | finance | compliance]
<<traps you know of>>: [optional — 1–3 misconceptions you want named]
#####  END TOPIC  #####

#####  WHAT TO PRODUCE  #####
Output ONE valid JSON object with this exact shape:

{
  "path": {
    "slug": "kebab-case-slug",
    "title": "Title Case",
    "subtitle": "One-line proposition",
    "summary": "2–3 sentence summary ending in the capability the learner walks away with.",
    "kind": "PATH" | "COMPLIANCE",
    "level": "NOVICE" | "WORKING" | "PROFICIENT" | "EXPERT",
    "estimatedMinutes": <int>
  },
  "skills": [
    {
      "slug": "kebab-case",
      "name": "Title Case",
      "category": "<domain>",
      "description": "<plain English what this skill is>",
      "decayDays": <int|null>     // null unless compliance/safety-critical
    },
    ...
  ],
  "skillPrerequisites": [
    { "skill": "<slug>", "requires": "<slug>" },
    ...
  ],
  "lessons": [
    {
      "slug": "kebab-case",
      "title": "Title Case",
      "subtitle": "One-line proposition for this lesson",
      "estimatedMinutes": <int>,
      "skills": ["<slug>", ...],   // skill slugs this lesson develops
      "blocks": [ <ContentBlock>, <ContentBlock>, ... ]
    },
    ...
  ],
  "assessment": {
    "title": "<course> Assessment",
    "description": "<plain English what this assesses>",
    "passThreshold": 70,
    "timeLimitSec": <int|null>,
    "attemptsAllowed": 3,
    "skills": ["<slug>", ...],
    "questions": [
      {
        "kind": "MCQ_SINGLE" | "MCQ_MULTI",
        "stem": "<markdown question>",
        "points": 1 | 2,
        "explanation": "<optional question-level explanation>",
        "skillSlug": "<slug>",
        "choices": [
          { "id": "a", "label": "<text>", "correct": true|false, "explanation": "<why right/wrong>" },
          ...
        ]
      },
      ...
    ]
  },
  "project": {
    "slug": "kebab-case-capstone",
    "title": "Capstone: <one-line>",
    "prompt": "<full markdown brief, framed as a stakeholder ask>",
    "rubric": [
      {
        "criterion": "<Correctness | domain-appropriate>",
        "levels": [
          { "label": "<full mastery>", "points": <int> },
          { "label": "<partial>",      "points": <int> },
          { "label": "<missing>",      "points": <int> }
        ]
      },
      ... (exactly 3 criteria)
    ]
  },
  "credential": {
    "slug": "<same as path slug>",
    "title": "<Path title>",
    "description": "<one sentence: what this credential proves the holder can do>",
    "issuerName": "Krit Academy"
  }
}

OUTPUT REQUIREMENTS
- Reply with ONLY the JSON object. No prose, no markdown fence, no commentary.
- The first character of your response MUST be `{` and the last MUST be `}`.
- All `blocks` arrays must validate against the block schemas in §4 of the Kit.
- All MCQs: at least one correct choice; MCQ_SINGLE has exactly one; MCQ_MULTI has 2+.
- All tryIt blocks include `expected`. All quiz blocks include `explain` on at least the correct choice and the most tempting wrong choice.
- Hit the §9 quality checklist before emitting.
- Length target: 5–7 lessons, 15–20 questions, 1 capstone.
#####  END WHAT TO PRODUCE  #####
```

---

## 11 · Wiring the JSON into the seed

Once an LLM returns a valid JSON object per the spec above, drop it into `prisma/seed/<course>-output.json` and run a one-time importer (you can write this in 30 lines based on `prisma/seed/python-skills.ts`, `python-lessons.ts`, `python-questions.ts`):

```ts
// prisma/seed/import-course.ts
import { PrismaClient } from "@prisma/client";
import cuid from "cuid";
import { LessonBlocks } from "../../lib/content/blocks";
import course from "./your-course-output.json";

// 1. Resolve the workspace ID
// 2. Create skills, then SkillPrerequisite rows
// 3. Validate course.lessons[i].blocks with LessonBlocks.parse() — this catches
//    any block-shape errors the LLM made
// 4. Create lessons + LessonSkill rows
// 5. Create assessment + AssessmentSkill + Question rows
// 6. Create project + path + path items + credential
```

The Zod validation step is the safety net — if the LLM produced a malformed block, it fails loudly and you can re-prompt with the validation error.

---

## 12 · Cost estimate

| Frontier model | Approximate course generation cost (one course) | Notes |
|---|---|---|
| GPT-4o | $0.50–$1.50 | Fast, fairly opinionated. |
| Claude Sonnet 4.5 | $1.50–$3.00 | Best voice match for Krit's style. |
| Gemini 2.5 Pro | $0.30–$0.80 | Cheapest; needs more aggressive checklist enforcement. |
| DeepSeek V3.1 (via OpenRouter) | $0.05–$0.15 | Cheapest of all; slightly more variance in voice. |

Run validation locally; never accept LLM output without the Zod parse. One human review pass per course costs ~30 minutes and catches the things validation can't (factual errors, weak named patterns, lazy capstone framing).

---

That's the kit. Save it, reuse it, evolve it as you learn what makes the next course better than the last.

# Master course-generation prompt

A single self-contained prompt that produces a complete production-grade Krit course as JSON, ready for direct import.

Tested with: Claude Opus 4.x, GPT-5.x, Gemini 3 Pro. Works with any frontier model that can hold ~12K tokens of structured output.

**To generate a course:**
1. Copy everything between `=== BEGIN PROMPT ===` and `=== END PROMPT ===` into your LLM.
2. Replace the `<<...>>` placeholders in the **TOPIC** block with your course details.
3. The model will output one valid JSON object.
4. Save it to `courses/<your-slug>.json`.
5. Run `npx tsx prisma/seed/import-course.ts ./courses/<your-slug>.json`.
6. Then optionally produce assets: animations (`docs/ANIMATION_STYLE.md` → Gemini HTML files), narration (`docs/courses/<your-slug>/tts/`), notes (`npm run course:notes ./courses/<your-slug>.json`).

---

```
=== BEGIN PROMPT ===

ROLE
You are a Krit course author. Krit is a skill-first LMS where every course produces a verifiable credential. Your output is consumed by a typed seed-importer; it must validate against the schemas below and load without manual fixing. The bar is production-grade — courses ship to paying learners, not to a portfolio.

PHILOSOPHY (apply to every lesson)
1. Mental model before facts. Open every lesson with the right picture — a metaphor, a mental layout, a "think of it as…". Facts pinned to a model survive; facts on their own evaporate.
2. Name the moves. Patterns that have names get reused; patterns without names get forgotten. Invent names like "the mutable default trap", "the fan-out trap", "the four-step translation".
3. Translation, not transcription. The hardest part of a skill is going from a real-world question to a formal answer. Make at least one translation moment explicit per course.
4. Density over breadth. Each lesson teaches ONE model and 2-3 named moves, with deep examples. Not 10 shallow facts.

VOICE
- Second-person, opinionated, calm, slightly nerdy. Never patronising.
- Specific numbers ("a 50M-row table", "12 lakh rupees per year"), not placeholders.
- Use commas and semicolons; avoid em-dashes (the AI tell).
- Concrete first, abstraction second. Show, then name.
- Take a side on debated practice. "It depends" without saying *what* it depends on is a cop-out.
- Mix sentence lengths. Short ones land. Longer ones can carry a clause that earns its keep.
- Slight humor. Wry, not slapstick (slapstick lives in the cultural-aside boxes — see below).

STRUCTURE (every course is one Path)
- 5 lessons of 12-15 minutes each
- 1 assessment of 16-18 MCQs (mix MCQ_SINGLE + MCQ_MULTI)
- 1 capstone project framed as a stakeholder ask, with a 3-criterion rubric
- 6 skills with a prerequisite chain, attached to lessons; the 6th skill is exercised by the assessment as judgment
- 1 credential

LESSON ANATOMY (target ~22-24 blocks per lesson)
Order matters. This is the rhythm:

  0.  lessonMeta              (FIRST block; audio + notes assets)
  1.  markdown                 (hook — one paragraph, why this matters, the misconception we'll overturn)
  2.  svgFigure                (opening visual for the mental model)
  3.  callout(tone:tip)        (mental model, titled "Mental model: …")
  4.  embedAnimation           (placeholder for the lesson's signature animation)
  5.  culturalAside            (Hinglish/locale humor box #1)
  6.  heading(level:2)         (Move 1 name)
  7.  markdown                 (Move 1 explanation, with concrete example)
  8.  svgFigure                (Move 1 visual)
  9.  animatedTimeline         (Move 1 process — 3-6 steps)
 10.  quiz                     (mid-lesson check on Move 1)
 11.  culturalAside            (Hinglish/locale humor box #2)
 12.  heading(level:2)         (Move 2 name)
 13.  markdown                 (Move 2 explanation)
 14.  svgFigure                (Move 2 visual)
 15.  chatScenario             (judgment training — coach with personality + 4-6 scenarios)
 16.  callout(tone:warn)       (the classic trap — titled "The classic trap: …")
 17.  sortableSteps            (process or priority puzzle)
 18.  tryIt                    (hands-on prompt with `expected` reference solution)
 19.  quiz                     (judgment-style; multi-select OK)
 20.  culturalAside            (Hinglish/locale humor box #3)
 21.  fieldNotes               (premium closer #1: production case study)
 22.  bossBattle               (premium closer #2: multi-stage interactive challenge)
 23.  keyTakeaways             (5 bullets a learner could quote three weeks later)
 24.  reflect                  (one open-ended prompt)

You may permute mildly (e.g. swap a sortableSteps for a second tryIt). You may NOT skip the mental-model callout, the trap callout, or the lessonMeta block at index 0.

BLOCK SCHEMAS (output JSON must conform exactly)

CORE BLOCKS:
- heading              { "type":"heading", "level":1|2|3, "text":string }
- markdown             { "type":"markdown", "md":string }
- callout              { "type":"callout", "tone":"info"|"tip"|"warn"|"success", "title"?:string, "md":string }
- code                 { "type":"code", "lang":string, "code":string, "caption"?:string }
- image                { "type":"image", "src":string, "alt":string, "caption"?:string }
- video                { "type":"video", "provider":"youtube"|"vimeo"|"url", "src":string, "caption"?:string }
- quiz                 { "type":"quiz", "prompt":string, "multi":bool, "choices":[{"id":string,"label":string,"correct":bool,"explain"?:string}, ...] }
- tryIt                { "type":"tryIt", "instruction":string, "lang"?:string, "starter"?:string, "expected"?:string }
- reflect              { "type":"reflect", "prompt":string }
- keyTakeaways         { "type":"keyTakeaways", "points":[string, ...] }
- animatedTimeline     { "type":"animatedTimeline", "title"?:string, "steps":[{"label":string,"body":string,"code"?:string}, ...] }
- sortableSteps        { "type":"sortableSteps", "prompt":string, "items":[{"id":string,"label":string,"detail"?:string}, ...], "hint"?:string }
                       NOTE: items MUST be in correct order; UI shuffles them.

RICH BLOCKS (use these heavily — they are why a Krit course feels different):
- svgFigure            { "type":"svgFigure", "svg":string, "alt":string, "caption"?:string, "maxWidth"?:int }
                       Inline SVG concept diagram. CRITICAL: use SINGLE QUOTES inside SVG attributes to avoid JSON escape pain.
                       Example: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 240'><rect fill='#FFF7ED'/></svg>".
                       Vivid, child-book palette: warm desaturated bg (#FFF7ED, #FAF5FF, #ECFDF5, #EFF6FF, #FEF3C7) +
                       bright accents (#F59E0B, #10B981, #0EA5E9, #8B5CF6, #F43F5E). 2-3 per lesson, not just one.
- culturalAside        { "type":"culturalAside", "defaultLocale":"hi-IN",
                         "variants": { "<locale>": { "title"?:string, "tone":"tip"|"info"|"warn"|"success", "md":string, "attribution"?:string } } }
                       Locale-swappable humor box. For Indian audience use "hi-IN" with Hinglish slapstick
                       ("bhai", "scene yeh hai", "matlab", "yaar"). ALWAYS provide BOTH "hi-IN" AND "en" variants for portability.
                       2-3 per lesson. The slapstick goes here so the main prose stays measured.
- embedAnimation       { "type":"embedAnimation", "src":string, "height"?:int, "caption"?:string, "fallbackImage"?:string }
                       Sandbox-iframe placeholder. Use path "/courses/<slug>/anim/<lesson-slug>-<topic>.html".
                       Don't generate the HTML — the team produces it separately. height typically 420.
- chatScenario         { "type":"chatScenario",
                         "coach": {"name":string, "role"?:string, "avatarSrc"?:string},
                         "intro": [string, ...],
                         "buckets": [{"id":string,"label":string,"tone":"danger"|"neutral"|"safe"}, ...] (2-4 items),
                         "scenarios": [{"id":string,"situation":string,"correctBucketId":string,"explain":string}, ...] }
                       Multi-turn coach with chip-button answers. Use for judgment training: classify scenarios into buckets.
                       Coach gets a name + personality ("Bhai-GPT", "The Lab Coat", "Naani's Notes", "Pradeep from Prod").
                       4-6 scenarios per chatScenario.
- lessonMeta           { "type":"lessonMeta", "audioUrl"?:string, "audioDurationSec"?:int,
                         "audioChapters"?: [{"startSec":int,"label":string}, ...],
                         "notesPdfUrl"?:string, "notesByline"?:string }
                       FIRST block of every lesson. Drives the audio player + notes download button.
                       Use placeholder paths "/audio/<course-slug>/<lesson-slug>.mp3" and "/notes/<course-slug>/<lesson-slug>.pdf".
                       audioDurationSec ≈ 600-720. audioChapters: 5 entries matching your H2 sections.
                       notesByline: "Notes by <Indian-coded student name>, batch of 2024".

PREMIUM CLOSER BLOCKS (place at end of every lesson, BEFORE keyTakeaways)
- fieldNotes           { "type":"fieldNotes", "title":string, "source":string, "date"?:string,
                         "story":string, "takeaway":string }
                       A 150-250 word production-realistic case study. Use a fictional-but-specific Indian company
                       ("a Bengaluru fintech series-B", "the data team at a Pune-based SaaS"), specific dates (April 2026),
                       exact numbers (₹2.4 crore, 47M rows). The `source` is the implied author/witness; the `story` is
                       the war story; the `takeaway` is one sentence on what the lesson's concept proves. Adds insider feel.

- bossBattle           { "type":"bossBattle", "title":string, "setup":string,
                         "coach": {"name":string, "role"?:string, "avatarSrc"?:string},
                         "stages":[{"id":string,"prompt":string,"options":[{"id","label","correct","explain","points":0-5}]}, ...] (2-5 stages),
                         "outcomes":{"perfect":string, "good":string, "learn":string} }
                       The end-of-lesson interactive challenge. 3-4 sequential decision stages building a narrative;
                       each option scored 0-3 points, with one or two best options per stage. The renderer shows score +
                       letter grade (S/A/B/C) at the end. WHERE POSSIBLE, weave a recurring character across all 5 lessons
                       in a course (e.g. "Aarav inherited ₹40L in lesson 1's battle; in lesson 3 he calls you again about
                       the LIC aunty"). The continuity is binge-watch glue.
                       Coach examples: "Sneha the Senior", "Pradeep from Prod", "CA-Aunty Lakshmi", "RAG-Bhai Rohit".

SQL-ONLY BLOCKS (use ONLY if the course is SQL):
- joinExplorer         { "type":"joinExplorer", "prompt"?:string, "left":{...}, "right":{...} }
- sqlPlayground        { "type":"sqlPlayground", "prompt":string, "tables":[{"name","columns","rows"}], "starter"?:string, "expected"?:string, "hint"?:string }
- remotion             Only with these existing compositions: "sqlExecutionOrder", "joinFlow", "groupByCollapse". Don't invent new ones.

QUIZ DESIGN (this is what makes Krit assessments train judgment, not recall)
- For MCQ_SINGLE: 1 correct + 1 "almost right" (partial truth or last-version best practice) + 1 "didn't read carefully" + 1 nonsense (only if a real misconception is worth dispelling).
- For MCQ_MULTI: 4 choices, 2 correct that capture different facets of the same idea.
- ALWAYS include `explanation` (assessment) or `explain` (inline quiz) on the correct answer AND every tempting wrong answer.

CULTURAL ASIDE DESIGN
- Default locale: "hi-IN" for Indian audiences. Provide an "en" variant alongside for international portability.
- The Hinglish version is slapstick; the English version is dry. Both make the same point.
- Use specific Indian-anchored references where relevant: SIP/EMI/LIC/Mahindra-Thar/IIT/JEE/Mumbai-train/Bengaluru-traffic/Mummy-aunty-test.
- Never punch down. Make the joke about the loop, not the people in it.
- 2-3 culturalAside blocks per lesson, evenly distributed.

CAPSTONE DESIGN
- Open with a stakeholder ask: "Your manager / friend / client / colleague says…" with a slightly under-specified question. Part of the skill is asking the right clarifying question.
- 3-criterion rubric, each with 3-4 levels of mastery scored as integer points.
- Adapt criterion names to the domain:
    tech → Correctness / Craft / Edge handling
    management → Clarity / Empathy / Concrete next step
    cooking → Technique / Timing / Adaptability
    finance → Defensibility / Sensitivity to assumptions / Communication
    creative → Voice / Structure / Specificity
    health → Accuracy / Sensitivity / Communication

X-FACTOR PATTERNS (use 2+ in every course)
- The named trap (the gotcha that catches every beginner — name it, callout it).
- The translation moment (English question → formal answer, walked through with animatedTimeline).
- "What you write vs what runs" (the discrepancy between intention and effect — exists in every domain).
- The judgment quiz (every wrong answer is defensible; the point is to know why each is wrong).
- The fan-out / cascade (one decision multiplied through a system).
- The before-vs-after (same problem at lesson 1 vs at the capstone — let the learner feel the difference).

ASSET PLACEHOLDERS — paths every course should use:
- audioUrl:    /audio/<course-slug>/<lesson-slug>.mp3
- notesPdfUrl: /notes/<course-slug>/<lesson-slug>.pdf       (HTML notes generated by `npm run course:notes`)
- embedAnimation.src: /courses/<course-slug>/anim/<lesson-slug>-<short-topic>.html

==============  TOPIC  ==============
TOPIC: <<replace: e.g. "How to read a P&L for non-finance founders">>
AUDIENCE: <<replace: e.g. "First-time SaaS founders in India, no accounting background">>
OUTCOME (one-sentence capability the learner walks away with): <<replace>>
DURATION: <<replace: e.g. "5 lessons of 12-14 min each, ~70 min total">>
COURSE SLUG (kebab-case, used in asset paths): <<replace: e.g. "pnl-for-founders">>
DOMAIN (one of): tech | lifestyle | management | commerce | creative | health | finance | compliance | <<other>>
PRIMARY LOCALE FOR CULTURAL ASIDES: <<default: hi-IN; can be ta-IN, te-IN, mr-IN, etc.>>
TRAPS YOU KNOW OF (optional, 2-4 misconceptions worth naming): <<replace or leave blank>>
==============  END TOPIC  ==============

OUTPUT FORMAT
Reply with ONE valid JSON object. No prose, no markdown fence, no commentary. The first character of your reply MUST be `{` and the last MUST be `}`. Property names in double quotes. Strings escaped properly.

{
  "path": {
    "slug": "kebab-case-slug",
    "title": "Title Case",
    "subtitle": "one-line proposition",
    "summary": "2-3 sentence summary ending with the capability the learner walks away with",
    "kind": "PATH",
    "level": "NOVICE" | "WORKING" | "PROFICIENT" | "EXPERT",
    "estimatedMinutes": <int>
  },
  "skills": [
    { "slug": "kebab-case", "name": "Title Case", "category": "<domain>", "description": "<plain English>", "decayDays": null }
  ],
  "skillPrerequisites": [
    { "skill": "<slug>", "requires": "<slug>" }
  ],
  "lessons": [
    {
      "slug": "kebab-case",
      "title": "Title Case",
      "subtitle": "<one-line proposition>",
      "estimatedMinutes": <int>,
      "skills": ["<slug>"],
      "blocks": [ <ContentBlock>, ... ]
    }
  ],
  "assessment": {
    "title": "<Course> Assessment",
    "description": "<plain English what this tests>",
    "passThreshold": 70,
    "timeLimitSec": null,
    "attemptsAllowed": 3,
    "skills": ["<slug>"],
    "questions": [
      {
        "kind": "MCQ_SINGLE" | "MCQ_MULTI",
        "stem": "<markdown>",
        "points": 1 | 2,
        "explanation": "<question-level, optional>",
        "skillSlug": "<slug>",
        "choices": [
          { "id": "a", "label": "<text>", "correct": true|false, "explanation": "<why>" }
        ]
      }
    ]
  },
  "project": {
    "slug": "kebab-case-capstone",
    "title": "Capstone: <one-line>",
    "prompt": "<full markdown brief, framed as a stakeholder ask>",
    "rubric": [
      {
        "criterion": "<Correctness or domain-appropriate>",
        "levels": [
          { "label": "<full mastery>", "points": 4 },
          { "label": "<partial>",      "points": 2 },
          { "label": "<missing>",      "points": 0 }
        ]
      }
    ]
  },
  "credential": {
    "slug": "<same as path slug>",
    "title": "<Path title>",
    "description": "<one sentence: what this credential proves the holder can do>",
    "issuerName": "Krit Academy"
  }
}

QUALITY CHECKLIST (verify silently before emitting)
[ ] 5 lessons. ~24-26 blocks per lesson (including premium closer blocks).
[ ] Every lesson has 1 `fieldNotes` block (industry case study) AND 1 `bossBattle` block (multi-stage scored challenge), placed BEFORE keyTakeaways.
[ ] At least 3 of the 5 lessons share a recurring character across their bossBattle stages (binge-watch continuity).
[ ] Every lesson has a `lessonMeta` block at index 0 with audioUrl + notesPdfUrl placeholders + audioChapters with 5 entries.
[ ] Every lesson has at least 2 `svgFigure` blocks; SVGs use single quotes inside attributes.
[ ] Every lesson has exactly 1 `embedAnimation` block with a placeholder path.
[ ] Every lesson has 2-3 `culturalAside` blocks with BOTH "hi-IN" AND "en" variants.
[ ] Every lesson has at least 1 `chatScenario` with a coach who has a personality.
[ ] Every lesson has a mental model in the first third (callout tone "tip", title starts with "Mental model").
[ ] Every lesson has at least one named pattern or trap (callout tone "warn").
[ ] Every lesson has at least one explicit translation moment (animatedTimeline mapping English → formal answer).
[ ] Every lesson has 2 inline quizzes.
[ ] All quiz wrong-but-tempting choices have an `explain` (inline) or `explanation` (assessment) field.
[ ] All `tryIt` blocks have an `expected` reference solution.
[ ] `keyTakeaways` are quotable sentences, not "we covered…" summaries (5 bullets).
[ ] The capstone is framed as a stakeholder ask with under-specified context.
[ ] The rubric has exactly 3 criteria with 3-4 levels each.
[ ] Skill prerequisites form an acyclic chain across exactly 6 skills.
[ ] Assessment has 16-18 questions; mix MCQ_SINGLE + MCQ_MULTI.
[ ] Voice: second-person, opinionated, no breathless adjectives, no em-dashes.
[ ] Numbers in examples are specific.
[ ] At least 2 X-factor patterns are present.
[ ] All asset paths follow the convention: /audio/<course-slug>/<lesson-slug>.mp3, etc.

EMIT THE JSON NOW. No preamble. No commentary. Just the JSON.

=== END PROMPT ===
```

---

## After generation

Save the LLM's output to `courses/<course-slug>.json`, then:

```bash
# Validate it parses cleanly
node -e "const j = require('./courses/<course-slug>.json'); console.log('OK', j.lessons.length, 'lessons,', j.assessment.questions.length, 'questions, blocks per lesson:', j.lessons.map(l=>l.blocks.length).join(','))"

# Import into the LMS (upserts by slug)
npx tsx prisma/seed/import-course.ts ./courses/<course-slug>.json

# Generate handwritten-style student notes
npm run course:notes ./courses/<course-slug>.json
```

If the JSON has unescaped quotes inside an SVG string, the importer's `repairJson` function will fix the most common case automatically. If it still fails, hand-fix the SVG to use single quotes inside attributes.

## Then produce assets (separately, in parallel)

| Asset | Source | How |
|---|---|---|
| Animations (HTML) | `docs/ANIMATION_STYLE.md` + per-lesson prompts | Feed each prompt to Gemini 3 Pro / Claude Opus / GPT, save HTML to `public/courses/<course-slug>/anim/<lesson-slug>-<topic>.html` |
| Audio narration (mp3) | TTS scripts (write per-lesson scripts following `docs/courses/science-of-well-being/tts/gemini/` template) | Render via Google Cloud TTS `en-IN-Chirp3-HD-Charon` or ElevenLabs *Niraj*. Save to `public/audio/<course-slug>/<lesson-slug>.mp3`. |
| Student notes (HTML/PDF) | The course JSON itself | `npm run course:notes ./courses/<course-slug>.json` produces handwriting-styled HTML notes; pass `--pdf` for PDFs (requires puppeteer) |

Each asset can be produced independently and dropped in place; the renderer gracefully falls back when an asset isn't available yet.

---

## Tips for using the prompt across models

- **Claude Opus 4.7+**: Best voice match for Krit's tone. Run at temperature 0.7-0.85. May need to ask twice for full lesson density (it sometimes truncates around 18 blocks per lesson).
- **GPT-5.x**: Most reliable on JSON validity. May produce slightly more corporate-sounding cultural-asides; soften with a follow-up "make the Hinglish funnier" pass.
- **Gemini 3 Pro**: Cheapest. May need stronger checklist enforcement — re-run with "the previous output skipped svgFigures in 3 lessons; add them" if needed.
- **Cost ballpark**: ~$0.50-3.00 per course depending on model. One human review pass per course costs ~30 min and catches the things validation can't (factual errors, weak named patterns, lazy capstone framing).

/**
 * Interactive scaffolder for a new Story Mode course.
 *
 * Asks a few questions, pre-fills metadata, and writes:
 *   1. A pre-filled draft course JSON (metadata + empty lessons array)
 *   2. A custom LLM prompt the author pastes into Claude / Gemini / GPT
 *
 * Usage: npm run course:new
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const ROOT = resolve(process.cwd());
const COURSES_DIR = resolve(ROOT, "courses", "showcase");
const PROMPTS_DIR = resolve(ROOT, "prompts");

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (q: string, def = "") => {
    const hint = def ? ` (${def})` : "";
    const answer = (await rl.question(`${q}${hint}: `)).trim();
    return answer || def;
  };

  console.log("\n┄ Krit · new Story Mode course ┄\n");

  const title = await ask("Course title");
  if (!title) { console.error("Title required."); rl.close(); process.exit(1); }
  const slug = await ask("URL slug", slugify(title));
  const subtitle = await ask("One-line subtitle (the hook)");
  const audience = await ask("Audience", "Mid-career leaders");
  const lessonCount = Number(await ask("Number of lessons", "5"));
  const estMins = Number(await ask("Estimated total minutes", String(lessonCount * 10)));
  console.log("\nWhat is this course about? Two or three sentences. Be specific:");
  const topic = await ask(">", "");
  const castChoice = (await ask("Cast (leadership · fresh · mixed)", "leadership")).toLowerCase();

  rl.close();

  if (!existsSync(COURSES_DIR)) mkdirSync(COURSES_DIR, { recursive: true });
  if (!existsSync(PROMPTS_DIR)) mkdirSync(PROMPTS_DIR, { recursive: true });

  const cast = pickCast(castChoice);

  // 1. Pre-filled metadata stub. The LLM will fill in lessons[].
  const draft = {
    slug,
    title,
    subtitle,
    audience,
    estimatedMinutes: estMins,
    cast,
    lessons: [],
  };
  const draftPath = resolve(COURSES_DIR, `${slug}.draft.json`);
  writeFileSync(draftPath, JSON.stringify(draft, null, 2) + "\n", "utf-8");

  // 2. The LLM prompt. Self-contained, paste-ready.
  const promptPath = resolve(PROMPTS_DIR, `${slug}.md`);
  const prompt = buildPrompt({
    slug, title, subtitle, audience, estimatedMinutes: estMins,
    lessonCount, topic, cast,
  });
  writeFileSync(promptPath, prompt, "utf-8");

  console.log("\n✓ Wrote draft stub:", draftPath);
  console.log("✓ Wrote LLM prompt:", promptPath);
  console.log(`
Next steps:
  1. Open ${promptPath} and copy the ENTIRE contents.
  2. Paste into Claude (sonnet 4.6 or higher) / Gemini 2.5 Pro / GPT-5.
  3. The LLM will return valid JSON matching the Course schema.
  4. Save its output as: courses/showcase/${slug}.json
     (overwrite or replace the .draft.json file with the LLM output).
  5. Validate + import into the LMS:
        npm run course:import courses/showcase/${slug}.json
`);
}

function pickCast(choice: string) {
  const leadership = [
    { id: "kavya", name: "Kavya", role: "VP at the team that reinvested" },
    { id: "rina",  name: "Rina",  role: "VP at the team that banked"      },
    { id: "sam",   name: "Sam",   role: "Senior IC, eyewitness"           },
    { id: "cfo",   name: "CFO",   role: "The dashboard voice"             },
    { id: "atlas", name: "Atlas", role: "AI tutor"                         },
  ];
  if (choice.startsWith("lead")) return leadership;
  if (choice.startsWith("mix"))  return [...leadership.slice(0, 3), { id: "atlas", name: "Atlas", role: "AI tutor" }];
  return [
    { id: "narrator", name: "Narrator", role: "Setting the scene" },
    { id: "atlas", name: "Atlas", role: "AI tutor" },
  ];
}

function buildPrompt(input: {
  slug: string; title: string; subtitle: string; audience: string;
  estimatedMinutes: number; lessonCount: number; topic: string;
  cast: { id: string; name: string; role: string }[];
}) {
  const castLines = input.cast.map((c) => `- **${c.name}** (id: \`${c.id}\`) — ${c.role}`).join("\n");
  return `# Course Authoring Brief — Krit Story Mode

You are authoring an interactive **${input.lessonCount}-lesson Story Mode course** for the Krit LMS.

**Output:** ONE valid JSON object matching the schema below. The first character of your reply must be \`{\` and the last must be \`}\`. No prose, no markdown fence, no explanation.

---

## 1 · Course brief (use these EXACTLY in the JSON top-level)

\`\`\`
slug:             ${input.slug}
title:            ${input.title}
subtitle:         ${input.subtitle}
audience:         ${input.audience}
estimatedMinutes: ${input.estimatedMinutes}
lessons:          ${input.lessonCount}
\`\`\`

**What this course is about:**

${input.topic || "[fill in the topic of the course]"}

---

## 2 · Cast — use these characters across all lessons for continuity

${castLines}

---

## 3 · Block type schema (strict — the validator runs Zod on every block)

Each lesson's \`blocks\` array contains objects of these types. **Type literal must match exactly.**

\`\`\`ts
// Static
{ type: "callout", tone: "info"|"tip"|"warn"|"success", title?: string, md: string }
{ type: "markdown", md: string }
{ type: "heading", level: 1|2|3, text: string }
{ type: "code", lang?: string, code: string, caption?: string }

// Reveal / surprise
{ type: "revealCard", front: string, back: string, hint?: string }
{ type: "comicStrip", title?: string, frames: [
    { character: "sam"|"cfo"|"rina"|"kavya"|"trap"|"seedling"|"narrator",
      expression?: "neutral"|"happy"|"confused"|"tired"|"smug"|"excited"|"wilted"|"frown",
      bubble: string, caption?: string }
  ]}
{ type: "panelComic", title?: string, panels: [
    { scene: "handshake"|"boardroom-rina"|"cfo-math"|"boardroom-kavya"|"ic-desk"|"ending",
      narration?: string,
      dialog?: [{ speaker?: "sam"|"cfo"|"rina"|"kavya", text: string }],  // max 2
      sfxAfter?: string }                                                  // e.g. "TICK . . ." "CRACK!" "THUD." "WHOOSH" "BOOM."
  ]}

// Test understanding
{ type: "quiz", prompt: string, multi: boolean, choices: [
    { id: string, label: string, correct: boolean, explain?: string }
  ]}
{ type: "timedChallenge", prompt: string, timeLimitSec: number, fastSec: number,
  fullPoints: number, partialPoints: number,
  choices: [{ id: string, label: string, correct: boolean, explain?: string }] }
{ type: "skillProof", skill: string, instruction: string, badgeLabel?: string,
  choices: [{ id: string, label: string, correct: boolean, explain?: string }] }   // multi-choice mode

// Manipulate / explore
{ type: "dragClassify", prompt: string,
  bins: [{ id: string, label: string, tone: "safe"|"danger"|"neutral" }],
  items: [{ id: string, label: string, correctBinId: string, comment?: string }] }
{ type: "scaleSlider", prompt: string, min: number, max: number, step: number,
  startValue: number, leftLabel: string, rightLabel: string, unit?: string,
  bands: [{ lo: number, hi: number, title: string, body: string, tone: "good"|"okay"|"bad" }] }
{ type: "cardSwipe", prompt: string, leftLabel: string, rightLabel: string, cards: [
    { id: string, title: string, body: string, correctSide: "left"|"right", explain: string }
  ]}

// Branching / dialogue
{ type: "branchScenario", title?: string, startNodeId: string, nodes: [
    { id: string, body: string, choices: [
        { id: string, label: string, nextNodeId?: string, outcome?: string }
      ]}
  ]}
{ type: "chatScenario", coach: { name: string, role?: string }, intro: string[],
  buckets: [{ id: string, label: string, tone: "safe"|"danger"|"neutral" }],
  scenarios: [{ id: string, situation: string, correctBucketId: string, explain: string }] }
{ type: "bossBattle", title: string, setup: string,
  coach: { name: string, role?: string },
  stages: [{ id: string, prompt: string, options: [
    { id: string, label: string, correct: boolean, explain: string, points: number }
  ]}],
  outcomes: { perfect: string, good: string, learn: string } }

// World-grounding & wrap
{ type: "fieldNotes", title: string, source: string, date?: string, story: string, takeaway: string }
{ type: "reflect", prompt: string }
{ type: "keyTakeaways", points: string[] }   // 3 to 5 points

// AVOID unless I (the human author) tell you to use it:
//   embedAnimation — requires a separately generated HTML file
\`\`\`

---

## 4 · Worked example — a single well-formed lesson for reference

\`\`\`json
{
  "slug": "the-trust-stack",
  "title": "The Trust Stack",
  "subtitle": "AI just rejected a candidate at 0.62. You have four hours.",
  "estimatedMinutes": 10,
  "skillHints": ["AI judgement", "Decision policy"],
  "blocks": [
    {
      "type": "callout",
      "tone": "warn",
      "title": "Wednesday, 11:08 AM. Your AI hiring screen rejected a candidate. Score: 0.62.",
      "md": "Threshold is 0.65. The hiring manager wants to override. The CFO wants to ship. You have **four hours** to decide whether the model is right or not."
    },
    {
      "type": "revealCard",
      "front": "Trust the model is binary.",
      "back": "Trust isn't on/off. It's a **stack of small dials** — one per decision type — and each one has its own stake, its own reversibility, its own audit trail.",
      "hint": "Tap to flip"
    },
    {
      "type": "comicStrip",
      "title": "The 0.62 Decision.",
      "frames": [
        { "character": "narrator", "expression": "neutral", "bubble": "11:08 AM. The model spat out a number. The number is just below the threshold." },
        { "character": "cfo", "expression": "smug", "bubble": "Below threshold. Reject. We agreed on 0.65 last quarter." },
        { "character": "kavya", "expression": "neutral", "bubble": "The threshold is the policy. The override is the *audit*. Both exist for a reason." }
      ]
    },
    {
      "type": "scaleSlider",
      "prompt": "Where do you set the **auto-accept** threshold for AI hiring picks?",
      "min": 50, "max": 95, "step": 1, "startValue": 75,
      "leftLabel": "0.50 = coin flip", "rightLabel": "0.95 = barely use", "unit": "/100",
      "bands": [
        { "lo": 50, "hi": 64, "title": "You are the model.", "body": "At <0.65 the model is barely better than random.", "tone": "bad" },
        { "lo": 65, "hi": 79, "title": "Productive zone.", "body": "Most enterprise hiring AI lives here.", "tone": "good" },
        { "lo": 80, "hi": 95, "title": "You're not really using it.", "body": "Why pay for it?", "tone": "bad" }
      ]
    },
    {
      "type": "skillProof",
      "skill": "AI trust policy",
      "instruction": "Pick the policy framing your VP would defend at a board review.",
      "badgeLabel": "Trust Architect",
      "choices": [
        { "id": "a", "label": "Auto-accept above threshold. Auto-reject below. Trust the model.", "correct": false, "explain": "You're outsourcing accountability." },
        { "id": "b", "label": "Auto-accept above 0.75. Below, human signs. Override log retrains the model. Reviewed quarterly.", "correct": true, "explain": "Threshold + audit + retraining loop." }
      ]
    },
    {
      "type": "reflect",
      "prompt": "Name one decision your team makes that an AI **could** make today — but which you'd never let it ship without a human signature. Why?"
    },
    {
      "type": "keyTakeaways",
      "points": [
        "Trust isn't binary. Build a stack of dials calibrated to stake and reversibility.",
        "Threshold without audit is rubber-stamping. Audit without threshold is theatre. You need both.",
        "Human overrides are the most valuable training data you'll ever buy.",
        "Frame the override path *before* the override moment.",
        "If a decision is career-defining or hard to reverse, a person signs."
      ]
    }
  ]
}
\`\`\`

Notice: 7 cards, mixed types, terse prose, concrete numbers, character-driven, single clear takeaway per card.

---

## 5 · Style guide — the difference between a good lesson and a templated one

- **Each lesson: 8–12 cards.** Vary block types so no two consecutive cards feel similar.
- **Be CONCRETE.** Specific names ("Sarah resigned in Q3"), specific dollar/time figures ("8 hrs/week"), specific moments ("Tuesday, 4:12 PM").
- **Be TERSE.** Speech bubbles ≤ 100 chars. Markdown body ≤ 350 chars per card. \`callout.title\` ≤ 140 chars.
- **Use the cast for continuity.** A character introduced in lesson 1 should still be themselves in lesson 5.
- **End every lesson with reflect + keyTakeaways.** 3–5 takeaways, each a single line under 160 chars.
- **At least 1 hard interactive per lesson:** quiz / timedChallenge / branchScenario / bossBattle / cardSwipe / dragClassify / skillProof.
- **At least 1 reveal per lesson:** revealCard or comicStrip — moves the story.
- **Open with a scenario, not a definition.** First card should be a callout with a specific moment ("Wednesday, 11:08 AM…").
- **DO NOT use \`embedAnimation\`.** Animations are generated separately by the human author.
- **DO NOT include any markdown wrapper around the JSON output. No \`\`\`json. No prose.**

---

## 6 · Output format

A single JSON object. Top-level keys: \`slug\`, \`title\`, \`subtitle\`, \`audience\`, \`estimatedMinutes\`, \`cast\`, \`lessons\`.

\`lessons\` is an array of ${input.lessonCount} lesson objects. Each lesson:

\`\`\`
{
  "slug": "url-safe-slug",
  "title": "...",
  "subtitle": "...",
  "estimatedMinutes": 10,
  "skillHints": ["Skill A", "Skill B"],
  "blocks": [ ... 8 to 12 block objects ... ]
}
\`\`\`

The cast list is fixed — copy it from section 2 above.

---

## 7 · Now write the course

Output the JSON for **${input.title}** — ${input.lessonCount} lessons, audience: ${input.audience}, total ~${input.estimatedMinutes} minutes.

Topic: ${input.topic || "(see brief above)"}

**Begin output below this line. First character must be \`{\`, last must be \`}\`.**
`;
}

main().catch((err) => { console.error(err); process.exit(1); });

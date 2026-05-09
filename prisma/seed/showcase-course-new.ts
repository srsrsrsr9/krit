/**
 * Interactive scaffolder for a new Story Mode course.
 *
 * Asks a few questions, picks the slug + locale suffix automatically, lets
 * the author choose skills from a curated catalog, and writes:
 *   1. A pre-filled draft course JSON (metadata + empty lessons array)
 *   2. A custom LLM prompt the author pastes into Claude / Gemini / GPT
 *
 * Usage: npm run course:new
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { getActiveSkills, type SkillCatalogEntry } from "./skill-catalog";

const ROOT = resolve(process.cwd());
const COURSES_DIR = resolve(ROOT, "courses", "showcase");
const PROMPTS_DIR = resolve(ROOT, "prompts");

const LOCALES = [
  { code: "en", label: "English",  script: "Latin" },
  { code: "hi", label: "Hindi",    script: "Devanagari" },
  { code: "ta", label: "Tamil",    script: "Tamil" },
  { code: "te", label: "Telugu",   script: "Telugu" },
  { code: "mr", label: "Marathi",  script: "Devanagari" },
  { code: "kn", label: "Kannada",  script: "Kannada" },
  { code: "bn", label: "Bengali",  script: "Bengali" },
];

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

  // ── Title + auto-slug ────────────────────────────────────────
  const title = await ask("Course title");
  if (!title) { console.error("Title required."); rl.close(); process.exit(1); }
  const baseSlug = slugify(title);

  const subtitle = await ask("One-line subtitle (the hook)");
  const audience = await ask("Audience (one line)", "Mid-career leaders");
  const lessonCount = Number(await ask("Number of lessons", "5")) || 5;
  const estMins = Number(await ask("Estimated total minutes", String(lessonCount * 10))) || lessonCount * 10;
  console.log("\nWhat is this course about? Two or three sentences. Be specific:");
  const topic = await ask(">", "");

  // ── Locale (auto-suffix) ─────────────────────────────────────
  console.log("\nLocale options:");
  LOCALES.forEach((l, i) => console.log(`  ${i + 1}. ${l.label.padEnd(10)} (${l.code})`));
  const locIdxRaw = await ask("Pick a locale (number)", "1");
  const locIdx = Math.max(0, Math.min(LOCALES.length - 1, Number(locIdxRaw) - 1));
  const locale = LOCALES[locIdx]!;
  const slug = locale.code === "en" ? baseSlug : `${baseSlug}-${locale.code}`;

  // ── Cast ─────────────────────────────────────────────────────
  const castChoice = (await ask("Cast (leadership · fresh · mixed)", "leadership")).toLowerCase();
  const cast = pickCast(castChoice, locale.code);

  // ── Skill picker ─────────────────────────────────────────────
  const catalog = getActiveSkills();
  console.log("\nAvailable skills (pick 2–5 by comma-separated number):");
  const byCategory = catalog.reduce<Record<string, SkillCatalogEntry[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s); return acc;
  }, {});
  let n = 1;
  const numbered: SkillCatalogEntry[] = [];
  for (const [cat, list] of Object.entries(byCategory)) {
    console.log(`  ── ${cat} ──`);
    for (const s of list) {
      console.log(`  ${String(n).padStart(2)}. ${s.name}  [${s.slug}]`);
      numbered.push(s); n++;
    }
  }
  const skillsRaw = await ask("Pick numbers (e.g. 2,7,12,18)", "");
  const skillsPicked = skillsRaw.split(",")
    .map((s) => Number(s.trim()) - 1)
    .filter((i) => Number.isInteger(i) && i >= 0 && i < numbered.length)
    .map((i) => numbered[i]!);
  if (skillsPicked.length === 0) {
    console.error("\n✗ At least one skill required. Aborting.");
    rl.close(); process.exit(1);
  }

  rl.close();

  // ── Write outputs ────────────────────────────────────────────
  if (!existsSync(COURSES_DIR)) mkdirSync(COURSES_DIR, { recursive: true });
  if (!existsSync(PROMPTS_DIR)) mkdirSync(PROMPTS_DIR, { recursive: true });

  const draft = {
    slug, title, subtitle, audience,
    estimatedMinutes: estMins,
    cast,
    lessons: [],
  };
  const draftPath = resolve(COURSES_DIR, `${slug}.draft.json`);
  writeFileSync(draftPath, JSON.stringify(draft, null, 2) + "\n", "utf-8");

  const promptPath = resolve(PROMPTS_DIR, `${slug}.md`);
  const prompt = buildPrompt({
    slug, title, subtitle, audience, estimatedMinutes: estMins,
    lessonCount, topic, cast, locale, skills: skillsPicked,
  });
  writeFileSync(promptPath, prompt, "utf-8");

  console.log(`
✓ Slug:    ${slug}${locale.code === "en" ? "" : `  (locale suffix: -${locale.code})`}
✓ Draft:   ${draftPath}
✓ Prompt:  ${promptPath}

Next steps:
  1. Open ${promptPath} and copy the ENTIRE contents.
  2. Paste into Claude (Sonnet 4.6+) / Gemini 2.5 Pro / GPT-5.
  3. Save the LLM's JSON output as: courses/showcase/${slug}.json
  4. npm run course:import courses/showcase/${slug}.json
`);
}

function pickCast(choice: string, locale: string) {
  // Cast names get light localisation per script. The LLM also handles tone.
  const isHindi = locale === "hi" || locale === "mr";
  const lead = [
    { id: "kavya", name: "Kavya",  role: "VP at the team that reinvested" },
    { id: "rina",  name: isHindi ? "Reena" : "Rina",  role: "VP at the team that banked" },
    { id: "sam",   name: isHindi ? "Samar" : "Sam",   role: "Senior IC, eyewitness" },
    { id: "cfo",   name: "CFO",   role: "The dashboard voice" },
    { id: "atlas", name: "Atlas", role: "AI tutor" },
  ];
  if (choice.startsWith("lead")) return lead;
  if (choice.startsWith("mix"))  return [...lead.slice(0, 3), { id: "atlas", name: "Atlas", role: "AI tutor" }];
  return [
    { id: "narrator", name: "Narrator", role: "Setting the scene" },
    { id: "atlas",    name: "Atlas",    role: "AI tutor" },
  ];
}

function buildPrompt(input: {
  slug: string; title: string; subtitle: string; audience: string;
  estimatedMinutes: number; lessonCount: number; topic: string;
  cast: { id: string; name: string; role: string }[];
  locale: { code: string; label: string; script: string };
  skills: SkillCatalogEntry[];
}) {
  const castLines = input.cast.map((c) => `- **${c.name}** (id: \`${c.id}\`) — ${c.role}`).join("\n");
  const skillLines = input.skills.map((s) => `- \`${s.slug}\` — ${s.name} (${s.category})`).join("\n");
  const localeBlock = input.locale.code === "en"
    ? "Write in English (US/UK mix is fine). Names per the cast list. Currency: USD or INR with ₹ — pick once and stay consistent."
    : `Write the **content** (callout titles, markdown, speech bubbles, captions, narration, etc.) in **${input.locale.label}** (${input.locale.script} script). Brand-y English terms (Slack, OKR, AI, PR, JD, ROI, FTE) stay in English — that's how leaders actually speak in ${input.locale.label}-speaking workplaces. Names per the cast list. Currency: ₹ (INR).`;

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

## 2 · Locale & tone

${localeBlock}

---

## 3 · Cast — use these characters across all lessons for continuity

${castLines}

---

## 4 · Skill hints — every lesson MUST pull from THIS list (slugs only)

\`\`\`
${skillLines}
\`\`\`

In each lesson's \`skillHints\` array, use the slug exactly as shown. Pick 2 per lesson that best fit the lesson's content. Do NOT invent new skills — the importer rejects unknown slugs.

---

## 5 · Block type schema (strict — Zod validates every field)

Each lesson's \`blocks\` array contains objects of these types. **Type literal must match exactly.**

\`\`\`ts
// Static
{ type: "callout", tone: "info"|"tip"|"warn"|"success", title?: string, md: string }
{ type: "markdown", md: string }
{ type: "heading", level: 1|2|3, text: string }
{ type: "code", lang?: string, code: string, caption?: string }

// Reveal & narrative
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
      sfxAfter?: string }   // e.g. "TICK . . ." "CRACK!" "THUD." "WHOOSH" "BOOM."
  ]}

// Test understanding (must have at least one correct: true)
{ type: "quiz", prompt: string, multi: boolean, choices: [
    { id: string, label: string, correct: boolean, explain?: string }
  ]}
{ type: "timedChallenge", prompt: string, timeLimitSec: number, fastSec: number,
  fullPoints: number, partialPoints: number,
  choices: [{ id: string, label: string, correct: boolean, explain?: string }] }
{ type: "skillProof", skill: string, instruction: string, badgeLabel?: string,
  choices: [{ id: string, label: string, correct: boolean, explain?: string }] }

// Manipulate / explore (referential integrity matters!)
{ type: "dragClassify", prompt: string,
  bins: [{ id: string, label: string, tone: "safe"|"danger"|"neutral" }],
  items: [{ id: string, label: string, correctBinId: string, comment?: string }] }
  // ⚠ every item.correctBinId MUST exist in bins[].id

{ type: "scaleSlider", prompt: string, min: number, max: number, step: number,
  startValue: number, leftLabel: string, rightLabel: string, unit?: string,
  bands: [{ lo: number, hi: number, title: string, body: string, tone: "good"|"okay"|"bad" }] }
  // ⚠ every band [lo, hi] must fit inside [min, max]

{ type: "cardSwipe", prompt: string, leftLabel: string, rightLabel: string, cards: [
    { id: string, title: string, body: string, correctSide: "left"|"right", explain: string }
  ]}

{ type: "branchScenario", title?: string, startNodeId: string, nodes: [
    { id: string, body: string, choices: [
        { id: string, label: string, nextNodeId?: string, outcome?: string }
      ]}
  ]}
  // ⚠ startNodeId MUST exist in nodes[].id
  // ⚠ every choice.nextNodeId MUST exist in nodes[].id (or be omitted with outcome)
  // ⚠ every choice MUST have either nextNodeId or outcome (not both empty)

{ type: "chatScenario", coach: { name: string, role?: string }, intro: string[],
  buckets: [{ id: string, label: string, tone: "safe"|"danger"|"neutral" }],
  scenarios: [{ id: string, situation: string, correctBucketId: string, explain: string }] }
  // ⚠ every scenario.correctBucketId MUST exist in buckets[].id

{ type: "bossBattle", title: string, setup: string,
  coach: { name: string, role?: string },
  stages: [{ id: string, prompt: string, options: [
    { id: string, label: string, correct: boolean, explain: string, points: number }
  ]}],
  outcomes: { perfect: string, good: string, learn: string } }
  // ⚠ every stage MUST have at least one correct: true option

// World-grounding & wrap
{ type: "fieldNotes", title: string, source: string, date?: string, story: string, takeaway: string }
{ type: "reflect", prompt: string }
{ type: "keyTakeaways", points: string[] }   // 3 to 5 points

// DO NOT use embedAnimation — those require separately generated HTML files.
\`\`\`

---

## 6 · Worked example — a single well-formed lesson

\`\`\`json
{
  "slug": "the-trust-stack",
  "title": "The Trust Stack",
  "subtitle": "AI just rejected a candidate at 0.62. You have four hours.",
  "estimatedMinutes": 10,
  "skillHints": ["ai-judgement", "decision-policy"],
  "blocks": [
    {
      "type": "callout",
      "tone": "warn",
      "title": "Wednesday, 11:08 AM. Your AI hiring screen rejected a candidate. Score: 0.62.",
      "md": "Threshold is 0.65. The hiring manager wants to override. The CFO wants to ship. You have **four hours**."
    },
    {
      "type": "revealCard",
      "front": "Trust the model is binary.",
      "back": "Trust isn't on/off. It's a **stack of small dials** — one per decision type — each calibrated to its own stake."
    },
    {
      "type": "scaleSlider",
      "prompt": "Where do you set the auto-accept threshold?",
      "min": 50, "max": 95, "step": 1, "startValue": 75,
      "leftLabel": "0.50 = coin flip", "rightLabel": "0.95 = barely use", "unit": "/100",
      "bands": [
        { "lo": 50, "hi": 64, "title": "You are the model.", "body": "Below 0.65 the model is barely better than random.", "tone": "bad" },
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
        { "id": "a", "label": "Auto-accept above threshold. Trust the model.", "correct": false, "explain": "You're outsourcing accountability." },
        { "id": "b", "label": "Auto-accept above 0.75. Below, human signs. Override log retrains the model. Reviewed quarterly.", "correct": true, "explain": "Threshold + audit + retraining loop." }
      ]
    },
    {
      "type": "reflect",
      "prompt": "Name one decision your team makes that an AI **could** make today — but you'd never let it ship without a human signature. Why?"
    },
    {
      "type": "keyTakeaways",
      "points": [
        "Trust isn't binary. Build a stack of dials calibrated to stake and reversibility.",
        "Threshold without audit is rubber-stamping. Audit without threshold is theatre.",
        "Human overrides are the most valuable training data you'll ever buy.",
        "Frame the override path *before* the override moment, not in it."
      ]
    }
  ]
}
\`\`\`

---

## 7 · Style guide — what separates a good lesson from a templated one

- **Each lesson: 8–12 cards.** Vary block types so no two consecutive cards feel similar.
- **Be CONCRETE.** Specific names, dates, ₹ figures, time references ("Tuesday, 4:12 PM").
- **Be TERSE.** Speech bubbles ≤ 100 chars. Markdown body ≤ 350 chars per card. \`callout.title\` ≤ 140 chars.
- **Cast continuity.** A character introduced in lesson 1 is the same person in lesson 5.
- **Open with a moment, not a definition.** First card = a callout with a specific scenario.
- **Every lesson ends with reflect + keyTakeaways.** 3–5 takeaways, ≤ 160 chars each, action-oriented.
- **At least 1 hard interactive per lesson:** quiz / timedChallenge / branchScenario / bossBattle / cardSwipe / dragClassify / skillProof.
- **At least 1 reveal per lesson:** revealCard or comicStrip — moves the story.
- **DO NOT use \`embedAnimation\`.** Animations are added separately.
- **DO NOT include any markdown wrapper around the JSON. No \`\`\`json. No prose.**

---

## 8 · Output format

Top-level: \`{ "slug", "title", "subtitle", "audience", "estimatedMinutes", "cast", "lessons" }\`

\`lessons\` is an array of ${input.lessonCount} lesson objects:
\`\`\`
{
  "slug": "url-safe-slug",
  "title": "...",
  "subtitle": "...",
  "estimatedMinutes": 10,
  "skillHints": ["one-of-the-skill-slugs", "another-one"],
  "blocks": [ ... 8 to 12 block objects ... ]
}
\`\`\`

Cast list: copy verbatim from section 3.

---

## 9 · Now write the course

Output the full JSON for **${input.title}** — ${input.lessonCount} lessons, audience: ${input.audience}, ~${input.estimatedMinutes} min total.

Topic: ${input.topic || "(see brief above)"}

**Begin output below this line. First character must be \`{\`, last must be \`}\`.**
`;
}

main().catch((err) => { console.error(err); process.exit(1); });

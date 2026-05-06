/**
 * Generate "student notes" — one HTML/PDF per lesson, styled to look like
 * handwritten notes from a classmate. Reads the course JSON, produces
 * downloadable assets under /public/notes/<course-slug>/.
 *
 * Usage:
 *   npx tsx scripts/generate-notes.ts ./courses/the-science-of-well-being.json
 *   npx tsx scripts/generate-notes.ts ./courses/the-science-of-well-being.json --pdf
 *
 * The default mode emits one HTML file per lesson plus an index.html. Pass
 * --pdf to additionally render PDF copies via Puppeteer (must be installed).
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";

type Block = Record<string, unknown> & { type: string };
interface Lesson {
  slug: string;
  title: string;
  subtitle?: string;
  estimatedMinutes?: number;
  blocks: Block[];
}
interface Course {
  path: { slug: string; title: string };
  lessons: Lesson[];
}

const fileArg = process.argv[2];
const wantPdf = process.argv.includes("--pdf");
if (!fileArg) {
  console.error("Usage: tsx scripts/generate-notes.ts <path-to-course.json> [--pdf]");
  process.exit(1);
}

const course = JSON.parse(readFileSync(resolve(process.cwd(), fileArg), "utf-8")) as Course;
const outDir = resolve(process.cwd(), "public/notes", course.path.slug);
mkdirSync(outDir, { recursive: true });

const STUDENTS = ["Aanya", "Vikrant", "Meera", "Karthik", "Ishaan"];

function pickStudent(i: number) {
  return STUDENTS[i % STUDENTS.length]!;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Mine a lesson's blocks for the bits that belong in "student notes":
 * headings, the meat of markdown paragraphs, callouts (mental models /
 * traps), key takeaways. Skip interactives — a student wouldn't transcribe
 * their own quiz answers.
 */
function blocksToNotes(blocks: Block[]): {
  hooks: string[];
  models: { title: string; body: string }[];
  sections: { heading: string; bullets: string[] }[];
  traps: string[];
  takeaways: string[];
} {
  const hooks: string[] = [];
  const models: { title: string; body: string }[] = [];
  const sections: { heading: string; bullets: string[] }[] = [];
  const traps: string[] = [];
  const takeaways: string[] = [];
  let currentSection: { heading: string; bullets: string[] } | null = null;

  function pushBullet(text: string) {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed) return;
    const sentences = trimmed.split(/(?<=[.!?])\s+/).filter((s) => s.length > 8);
    const picked = sentences.slice(0, 2).join(" ");
    if (currentSection) {
      currentSection.bullets.push(picked || trimmed.slice(0, 220));
    } else {
      hooks.push(picked || trimmed.slice(0, 220));
    }
  }

  for (const b of blocks) {
    switch (b.type) {
      case "heading": {
        if (b.level === 2) {
          if (currentSection) sections.push(currentSection);
          currentSection = { heading: String(b.text), bullets: [] };
        }
        break;
      }
      case "markdown":
        pushBullet(String(b.md));
        break;
      case "callout": {
        const title = String(b.title ?? "");
        const body = String(b.md);
        if (b.tone === "tip" && /mental model/i.test(title)) {
          models.push({ title, body });
        } else if (b.tone === "warn") {
          traps.push(`${title}: ${body.split("\n")[0] ?? body}`);
        } else if (currentSection) {
          currentSection.bullets.push(`${title} — ${body.split("\n")[0] ?? body}`);
        }
        break;
      }
      case "keyTakeaways":
        for (const p of (b.points as string[]) ?? []) takeaways.push(p);
        break;
      case "animatedTimeline": {
        const steps = (b.steps as { label: string; body: string }[]) ?? [];
        for (const s of steps) {
          if (currentSection) currentSection.bullets.push(`${s.label}: ${s.body}`);
        }
        break;
      }
      default:
        break;
    }
  }
  if (currentSection) sections.push(currentSection);
  return { hooks, models, sections, traps, takeaways };
}

const STYLE = `
:root { --paper:#FFFEF7; --ink:#1F2937; --ink2:#374151; --rule:#BFDBFE; --margin:#FCA5A5; --accent:#9D174D; --hl:#FDE68A; }
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&family=Architects+Daughter&display=swap");
* { box-sizing: border-box; }
html,body { margin:0; padding:0; background:#E5E7EB; font-family: "Patrick Hand","Caveat","Architects Daughter","Comic Sans MS",cursive; color: var(--ink); }
.page { background: var(--paper); width: 800px; margin: 24px auto; padding: 56px 56px 56px 88px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); position: relative; min-height: 1100px; background-image: repeating-linear-gradient(transparent 0 32px, var(--rule) 32px 33px); border-left: 2px solid var(--margin); }
.page::before { content:""; position:absolute; left: 64px; top:0; bottom:0; width:1px; background: var(--margin); opacity: 0.6; }
h1 { font-family:"Caveat",cursive; font-size: 48px; margin: 0 0 4px 0; color: var(--ink); transform: rotate(-1.5deg); transform-origin: 0 0; }
h2 { font-family:"Caveat",cursive; font-size: 30px; margin: 28px 0 8px 0; color: var(--accent); border-bottom: 2px dashed var(--accent); padding-bottom: 4px; transform: rotate(-0.7deg); transform-origin: 0 0; display: inline-block; }
h3 { font-family:"Caveat",cursive; font-size: 22px; margin: 18px 0 4px 0; color: var(--ink); }
.byline { font-family:"Caveat",cursive; font-size: 22px; color: var(--accent); transform: rotate(1deg); display: inline-block; }
.subtitle { font-size: 16px; color: var(--ink2); margin: 0 0 20px 0; }
ul { padding-left: 22px; margin: 6px 0 14px; }
li { font-size: 17px; line-height: 28px; margin-bottom: 4px; }
li::marker { color: var(--accent); }
.callout { background: var(--hl); border-left: 5px solid #D97706; padding: 8px 14px; margin: 10px 0; transform: rotate(-0.3deg); display: inline-block; max-width: 100%; }
.callout strong { color: var(--accent); }
.scribble { display: block; font-style: italic; color: #6B7280; font-size: 15px; transform: rotate(-1deg); margin: 8px 0; }
.takeaway { background: #FEF3C7; padding: 12px 16px; border: 2px dashed #92400E; border-radius: 8px; margin: 6px 0; font-size: 17px; line-height: 26px; transform: rotate(-0.2deg); }
.takeaway::before { content: "★  "; color: #D97706; }
.trap { background: #FEE2E2; border-left: 5px solid #B91C1C; padding: 8px 14px; margin: 8px 0; font-size: 16px; line-height: 24px; }
.trap::before { content: "⚠  "; color: #B91C1C; font-weight: bold; }
.doodle { font-family:"Caveat",cursive; color: #2563EB; font-size: 24px; transform: rotate(-3deg); display: inline-block; margin: 8px 4px; }
.signoff { margin-top: 36px; text-align: right; font-family:"Caveat",cursive; font-size: 22px; color: var(--accent); transform: rotate(-1deg); display: inline-block; float: right; }
@media print { body { background: white; } .page { box-shadow: none; margin: 0; width: auto; min-height: auto; page-break-after: always; } }
`;

function renderLesson(lesson: Lesson, byline: string): string {
  const notes = blocksToNotes(lesson.blocks);
  const sectionHtml = notes.sections
    .map(
      (s) => `
<h2>${escapeHtml(s.heading)}</h2>
<ul>
${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n")}
</ul>`,
    )
    .join("");
  const modelsHtml = notes.models
    .map(
      (m) => `<div class="callout"><strong>${escapeHtml(m.title)}</strong><br/>${escapeHtml(m.body.split("\n")[0] ?? m.body)}</div>`,
    )
    .join("\n");
  const trapsHtml = notes.traps.map((t) => `<div class="trap">${escapeHtml(t)}</div>`).join("\n");
  const takeawaysHtml = notes.takeaways
    .map((t) => `<div class="takeaway">${escapeHtml(t)}</div>`)
    .join("\n");
  const intro = notes.hooks.slice(0, 2).map((h) => `<p>${escapeHtml(h)}</p>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(lesson.title)} — Notes</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>${STYLE}</style>
</head>
<body>
<main class="page">
  <h1>${escapeHtml(lesson.title)}</h1>
  ${lesson.subtitle ? `<p class="subtitle">${escapeHtml(lesson.subtitle)}</p>` : ""}
  <p class="byline">notes by ${escapeHtml(byline)} ✏️</p>
  <span class="doodle">~ ${lesson.estimatedMinutes ?? 12} min read ~</span>
  ${intro}
  ${modelsHtml}
  ${sectionHtml}
  ${trapsHtml ? `<h3>Traps to flag for the exam</h3>${trapsHtml}` : ""}
  ${takeawaysHtml ? `<h3>Takeaways (memorize these)</h3>${takeawaysHtml}` : ""}
  <div class="signoff">— ${escapeHtml(byline)}, on the bus, again</div>
</main>
</body>
</html>`;
}

const indexLinks: string[] = [];
const generatedFiles: string[] = [];

for (let i = 0; i < course.lessons.length; i++) {
  const lesson = course.lessons[i]!;
  const html = renderLesson(lesson, pickStudent(i));
  const outFile = resolve(outDir, `${lesson.slug}.html`);
  writeFileSync(outFile, html, "utf-8");
  generatedFiles.push(outFile);
  indexLinks.push(`<li><a href="./${lesson.slug}.html">${escapeHtml(lesson.title)}</a></li>`);
  console.log(`✓ ${basename(outFile)}`);
}

writeFileSync(
  resolve(outDir, "index.html"),
  `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(course.path.title)} — Notes</title><style>body{font-family:system-ui;padding:32px;max-width:600px;margin:0 auto;}h1{font-family:"Caveat",cursive;}a{display:block;padding:12px;border:1px solid #ddd;border-radius:8px;margin:8px 0;color:#1F2937;text-decoration:none;}a:hover{background:#FEF3C7;}</style></head><body><h1>${escapeHtml(course.path.title)} — student notes</h1><ul style="list-style:none;padding:0;">${indexLinks.join("")}</ul></body></html>`,
  "utf-8",
);

if (wantPdf) {
  void (async () => {
    try {
      // Optional dep — types not installed in repo. If puppeteer isn't
      // available the catch block prints clear instructions.
      // @ts-expect-error — optional runtime dep
      const { default: puppeteer } = await import("puppeteer");
      const browser = await puppeteer.launch({ headless: true });
      for (const htmlFile of generatedFiles) {
        const pdfFile = htmlFile.replace(/\.html$/, ".pdf");
        const page = await browser.newPage();
        await page.goto(`file://${htmlFile}`, { waitUntil: "networkidle0" });
        await page.pdf({ path: pdfFile, format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "16mm", right: "16mm" } });
        await page.close();
        console.log(`✓ ${basename(pdfFile)}`);
      }
      await browser.close();
    } catch (e) {
      console.error("✗ Puppeteer not available; install with: npm i -D puppeteer");
      console.error("  Or open each HTML file in your browser and use 'Save as PDF.'");
      console.error("  Original error:", (e as Error).message);
    }
  })();
} else {
  console.log("");
  console.log(`✓ ${generatedFiles.length} HTML notes written to ${outDir}`);
  console.log("  To produce PDFs, run with --pdf (requires puppeteer):");
  console.log("    npx tsx scripts/generate-notes.ts " + fileArg + " --pdf");
  console.log("  Or open each HTML in a browser and Cmd+P → Save as PDF.");
}

# Anim Lab

**Anim Lab is a spare-parts catalogue of lesson-tagged interactives for
course authors — drop one in instead of commissioning, screenshotting, or
skipping.**

A growing set of ~20-artifact galleries, one per course in the Krit
catalogue. Each artifact is a small mount that goes into a single lesson —
animation or interactive, 30–90 seconds of attention, one specific concept.
Pick by gallery, filter by lesson, embed by ID.

The contract for every artifact is documented in
[`docs/ANIM_LAB_SPEC.md`](../../docs/ANIM_LAB_SPEC.md). Don't ship without reading it.

---

## Galleries

| name | course audience | status | artifacts | distinctive constraint |
| --- | --- | --- | --- | --- |
| [`leaders-ai-os.html`](leaders-ai-os.html) | leadership / AI strategy | **showcase** | 20 | every artifact is decision-shaped — slider, replay, scoring |
| [`ai-for-developers.html`](ai-for-developers.html) | engineering / AI | **showcase** | 21 | every artifact has code visible alongside the mechanic |
| [`python-foundations.html`](python-foundations.html) | python intro | **draft** | 20 | code + REPL-feeling output side-by-side |
| [`sql-foundations.html`](sql-foundations.html) | SQL intro | **draft** | 20 | query + result table side-by-side, every artifact |
| [`claude-pro.html`](claude-pro.html) | Claude tools / workflows | **draft** | 20 | tool-aware — emphasis on workflow + judgment |
| [`money-fundamentals.html`](money-fundamentals.html) | personal finance (India) | **draft** | 20 | ₹/Cr/Lakh formatting + Indian context (SIP, FD, ELSS) |
| [`ui-ux-design.html`](ui-ux-design.html) | design fundamentals | **draft** | 20 | every artifact is a before/after of one design decision |
| [`ai-fundamentals.html`](ai-fundamentals.html) | intro AI | **spec** | 16 | spec-compliant claim-not-description framing throughout |
| [`data-science-and-analysis.html`](data-science-and-analysis.html) | data / analytics | **spec** | 20 | every artifact has concrete numbers/datasets in the payload |
| [`digital-marketing-with-ai.html`](digital-marketing-with-ai.html) | marketing | **spec** | 20 | India-context (₹ amounts, channels, CAC) |
| [`product-management.html`](product-management.html) | PM | **spec** | 16 | decision-shaped: bet sizing, kill criteria, scoring |
| [`ai-for-leaders.html`](ai-for-leaders.html) | leadership variant | **spec** | 20 | portfolio bet sizing + build/wrap/buy + 90-day spec |
| [`ai-for-teachers.html`](ai-for-teachers.html) | educators | **spec** | 20 | classroom-anchored, Hattie effect sizes, rubric-grade |
| [`ai-for-accounting.html`](ai-for-accounting.html) | accountants | **spec** | 20 | India audit context, ICAI 2025 guidance, audit-trail fields |
| [`leadership-in-age-of-ai.html`](leadership-in-age-of-ai.html) | leadership variant 2 | **spec** | 20 | trust + people-decisions, not portfolio-style; what the leader owes the team |
| [`testing-with-playwright.html`](testing-with-playwright.html) | QA / testing | **spec** | 20 | code-visible alongside selectors, flake-diagnosis, CI math |
| [`the-science-of-well-being.html`](the-science-of-well-being.html) | well-being | **spec** | 20 | research-anchored (Gilbert, Hattie, Seligman); 14-day experiments |

**Status meaning:**
- **showcase** — full 20 artifacts, all pass the §5 quality floor of the spec
  AND have been peer-reviewed by the four expert subagents.
- **spec** — built against `docs/ANIM_LAB_SPEC.md` with the full 12-rule
  contract: frame titles, payload footers, claim-not-description what-lines,
  `Lab.makeDraggable`/`Lab.makeDropZone` for touch-safe drag, scaffold +
  runtime + mechanic fields on every artifact. Not yet peer-reviewed.
- **draft** — predates the spec. 20 artifacts each but some don't yet meet
  rules P1/P2/P3 or the contrast/touch-drag rules. Will be retrofitted.
  Safe to preview; flag rule violations as you spot them.

---

## Embedding an artifact in a lesson

The catalogue's premise is reusability. Each artifact is identified by:
- gallery filename (e.g. `sql-foundations.html`)
- artifact ID (e.g. `L3-i01`)
- URL fragment (e.g. `sql-foundations.html#L3-i01`)

To embed an artifact in a course lesson page, the cleanest current pattern is
an iframe to the artifact's deep-link URL:

```html
<iframe
  src="/anim-lab/sql-foundations.html#L3-i01"
  title="Pick the JOIN — anim-lab inter L3-i01"
  style="width:100%;height:560px;border:0"
  loading="lazy"></iframe>
```

A machine-readable embed contract (a JSON sidecar exposing each artifact's
recommended `minHeight`, `ariaLabel`, and `iframeSrc`) is on the spec doc's
backlog — see [`docs/ANIM_LAB_SPEC.md`](../../docs/ANIM_LAB_SPEC.md) §2.
Today you'll have to set the height by eye.

---

## Browsing the catalogue

Each gallery is a standalone single HTML file (~300–700 lines, ~12–30 KB).
Open the URL, browse the card grid, click any artifact to open it in the
focus view. Filter by lesson via the dropdown in the top bar. Keyboard nav
inside the focus view is `←` / `→` between artifacts and `Esc` to close.
State (sound on/off, artifact-open count) persists in `localStorage`.

The catalogue is for the **course-author user**, not the learner. Learners
encounter these artifacts one at a time, embedded in their lessons. The
gallery itself is an authoring tool.

---

## What this catalogue is not

- **Not a finished course.** None of these artifacts has been read by a
  learner; they exist to be drawn from when course lessons need them.
- **Not a curriculum.** The 20-artifact-per-course shape was a build
  constraint, not a pedagogical claim. Most lessons will use 2–4 artifacts,
  not all 20.
- **Not a design system.** Each gallery picks its own accent colour to match
  its parent course's identity. The shared shell guarantees layout +
  accessibility, not visual uniformity.
- **Not (yet) audio-polished.** SFX is ZzFX procedural; bg music per
  [`docs/music.md`](../../docs/music.md) is deferred. See
  [`docs/SURVEY_SETUP.md`](../../docs/SURVEY_SETUP.md) for the broader audio
  upgrade plan.

---

## Reviews on file

The first seven galleries have been through expert review. The reviews
shaped the spec doc above and are kept on disk for future build sessions:

- Learning / instructional design — `docs/review/learning/anim-lab-review.md`
- Marketing / positioning — `docs/review/marketing/anim-lab-review.md`
- Psychology / attention — `docs/review/psychology/anim-lab-review.md`
- UX / interaction + a11y — `docs/review/ux/anim-lab-review.md`

The two exemplar artifacts to clone (per the reviews) are:
- `leaders-ai-os.html#L1-i02` — drag-four-tokens commit + scored reveal
- `leaders-ai-os.html#L3-i02` — predict-then-reveal with calibration delta

Hold every new artifact up against those two before merging.

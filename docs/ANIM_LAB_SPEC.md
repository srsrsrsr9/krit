# Anim Lab — Spec for animations and interactives

*Source: the four expert reviews of the first seven galleries, in
`docs/review/{learning,marketing,psychology,ux}/anim-lab-review.md`. Where
reviewers disagreed, the conflict resolution is noted inline.*

This document is the contract every Anim Lab artifact must satisfy. It applies
to the **eleven galleries still to build**, and the **seven already built** are
being retrofitted against it.

---

## 0 · Positioning

The catalogue is **not** a portfolio. It is a **spare-parts inventory** for
course authors. Marketing reviewer's one-liner:

> **Anim Lab is a spare-parts catalogue of lesson-tagged interactives for
> course authors — drop one in instead of commissioning, screenshotting, or
> skipping.**

This positioning is enforced in three places: the `README.md` lede, every
gallery's `<p class="lede">`, and the structure of the artifact registry
(machine-readable embed contracts, see §4).

---

## 1 · The 12 Rules (canonical, no negotiation)

### Pedagogy (Learning reviewer)

**P1 · `anim` types must move.** Every artifact labelled `anim` must have at
least one piece of motion that *advances the concept* — a path-draw, a value
step, a bar-grow, a position interpolation. If the SVG is static at t=1s, it
is not an animation; relabel as `compare` (two-pane side-by-side) or `panel`
(static fact card). *Mayer's modality assumption: the animation channel costs
cognitive load; if you spend the budget, give the learner motion to integrate.*

**P2 · `inter` types must gate feedback behind a commitment.** A "Lock",
"Check", "Run", "Reveal" button, a complete drag-set, or a final-answer
choice. Slider-with-live-stat is allowed **only when the surprise is the
formula, not the answer.** No reveal-on-keystroke as the *only* feedback
mode. *Roediger/Karpicke: retrieval requires commitment; continuous reveal
collapses retrieval into recognition.*

**P3 · `inter` types must produce a consequence panel.** A `.reveal` block
with `win` / `bad` / neutral framing tied to the user's specific choice. Drag
without a scoring step is forbidden. *Bjork's generation effect is asymmetric:
commitment without feedback anchors the first answer regardless of correctness.*

**P4 · Max one MCQ-shell artifact per lesson.** Four-question multiple-choice
quizzes can carry only one lesson's retrieval load. The other three artifacts
in that lesson must use distinct mechanics: predict-a-number, drag-with-
scoring, build-a-thing, trace-the-execution, before/after fix. *Bjork
desirable difficulty: same retrieval shape produces one retrieval skill, not
four.*

**P5 · Four artifacts per lesson = decreasing scaffold, not four facets.**
Artifact 1 is the fully worked example (animation showing mechanic), artifact
2 is partial reveal (compare two cases; learner names the variable), artifact
3 is guided practice (commit + reveal with structured choices), artifact 4 is
independent application (open-ended build / drag / predict). *Sweller / Renkl
worked-example fading — what makes scaffolding teach instead of decorate.*

### Psychology / engagement (Psychology reviewer)

**E1 · State change within 800ms of first interaction.** No spinners, no
"press play to begin" curtain unless the play button itself is the pedagogy.

**E2 · Sliders paint verdicts, never numbers alone.** Any range input must
update a colour-classed stat, a textual reveal, or a zone label. A slider
that only updates `12% → 13%` is Fogg-fail: effort without prompt.

**E3 · Predict-then-reveal must withhold the reveal until commit.** The
`Lock prediction → reveal` pattern is correct; the auto-updating reveal is
psychologically weaker because no commit ever happens. Pick *one* pattern
per artifact; commit for one-shots (≤60s), live-update for sandboxes
(re-openable).

**E4 · No artifact may end in identical visual state to its opening.** The
final state must be *different* from the entry state in colour, density, or
position. Dragged tokens must visibly cluster differently after "Run"; not
just emit a verdict panel below.

**E5 · ≤3 artifacts per gallery share a mechanic.** Each ~20-artifact gallery
must field at least **6 distinct mechanics.** Cluster the unusual ones in the
middle of the gallery, where engagement traditionally dips.

### Marketing / catalogue voice (Marketing reviewer)

**M1 · Gallery `lede` names an enemy in sentence one.** Banned opener:
"Twenty drop-ins for X." Required shape: a claim the rest of the gallery
defends.

**M2 · Card titles are frames, not labels.** "GROUP BY in 60 seconds" is a
label. "Why your average is lying to you" is a frame. Must pass the "would I
click this if I weren't on a course platform" test.

**M3 · Footer ends with a load-bearing payload.** A number, a named tradeoff,
or a counter-intuitive rule. Banned shape: descriptive recap. Required shape:
the takeaway the learner can repeat 24 hours later.

### UX / accessibility (UX reviewer)

**U1 · No raw HTML5 drag-and-drop.** Use `Lab.makeDraggable()` and
`Lab.makeDropZone()` from `_shell.js`. Pointer + touch events both supported.
Tested on iPhone before merge.

**U2 · Two channels for type-signalling on cards.** Badge AND verb prefix
("Watch:" for anim, "Try:" for inter) in the `.what` line AND a glyph (▶ / ↻
/ ◐) next to the title. Two-channel coding is non-negotiable for
colour-impaired users.

---

## 2 · The Artifact Schema (machine-readable embed contract)

Every artifact registered in an `ART` array must declare:

```javascript
{
  id:        'L1-i01',              // lesson-id + type + ordinal
  type:      'anim'|'inter'|'compare'|'panel',
  lesson:    'L1',
  title:     'Why your average is lying to you',   // FRAME, not label (rule M2)
  what:      'Try: drag the outlier; watch the mean shift.', // verb-prefixed (rule U2)
  footer:    'Mean drops 12 points when one row moves to 200. Median doesn\'t budge.', // payload (rule M3)
  scaffold:  1|2|3|4,              // worked|faded|guided|solo (rule P5)
  runtime:   '<30s'|'30-60s'|'60-90s',
  mechanic:  'slider'|'predict-reveal'|'drag-bucket'|'decision-tree'|'mcq'|'trace-exec'|'before-after'|'hover-attend'|'build-yours'|'compare-two',
  predict:   'How far does the mean shift when one row moves?', // null for non-predict types
  mount(stage){ /* renders into the stage element */ }
}
```

`scaffold`, `runtime`, `mechanic`, and `predict` are new fields added per the
Learning reviewer's request. They power:

- The catalogue's filter UI (browse by mechanic, runtime, scaffold position)
- Per-gallery linting (enforce rules P4 / E5 — max-1-MCQ-per-lesson,
  ≥6-distinct-mechanics-per-gallery)
- The embed contract — a downstream course author reads the JSON to wire up
  an iframe / dialog / inline mount with the right minHeight and ariaLabel

---

## 3 · Shell helpers (required, in `_shell.js`)

```javascript
window.Lab = {
  // ── Motion gate (rule U3 — applies to CSS, SMIL, rAF, canvas)
  motionOK() { return !window.matchMedia('(prefers-reduced-motion:reduce)').matches; },

  // ── Drag + drop that work on pointer AND touch (rule U1)
  makeDraggable(el, opts) { /* attaches pointerdown handler that emits drag events */ },
  makeDropZone(el, onDrop) { /* listens for both HTML5 dragenter/over/drop AND custom pointer events */ },

  // ── Variable-ratio reward at gallery level (rule from Psych — closing-loop micro-moment)
  // Every artifact open increments a session counter; on a non-deterministic 3–7-artifact
  // cadence, fire a 1.5s quiet pulse on the close button + footer ticker ("you've seen 5/20").
  maybeFireMicroMoment(artifactCount) { /* implementation in _shell.js */ },

  // ── Persisted state (rule U5)
  loadState() { try { return JSON.parse(localStorage.getItem('krit.anim-lab.v1')||'{}'); } catch { return {}; } },
  saveState(s) { try { localStorage.setItem('krit.anim-lab.v1', JSON.stringify(s)); } catch {} },
};
```

Plus the existing `SFX` palette, `ZzFX` blob, and dialog/focus shell.

---

## 4 · CSS contract (`_shell.css`)

- `--accent` — for borders, backgrounds, and ≥24px bold display ONLY (rule U2)
- `--accent-strong` — for any colour-on-paper text. Each gallery's `<style>`
  override must set BOTH variables. Recommended pairs:

  | course audience | --accent | --accent-strong |
  | --- | --- | --- |
  | leadership / general (saffron) | `#c8881e` | `#946106` |
  | tech / code (sky) | `#0284c7` | `#0367a3` |
  | data / database (emerald) | `#14554a` | `#0e3f37` |
  | finance (gold) | `#b88e2d` | `#7a5c1b` |
  | well-being (rose) | `#b32d2d` | `#8a1e1e` |

  All `--accent-strong` values pass WCAG AA at 4.5:1 against `--paper`.

- `prefers-reduced-motion` block must zero CSS *and* SMIL via JS — the helper
  `Lab.motionOK()` must be consulted before starting any `requestAnimationFrame`
  loop or `<animate>` element.

- Cards are `<a href="#ID">` not `<button>` — supports right-click / cmd-click /
  middle-click to open in new tab. Dialog still opens in same tab via JS, but
  the URL semantics work.

- Dialog backdrop click closes the focus view.

---

## 5 · Quality floor (Marketing rule M5)

An artifact ships only if it has **all three** of:

1. **≥2 interactive states** OR a scrubbable timeline. A static panel with one
   button that hides itself is not 2 states.
2. **Footer that meets rule M3** — payload, not recap.
3. **`what` line that makes a claim, not a description.** "Shows compounding"
   is a description. "Saved hours flatten when given back as Slack" is a
   claim.

If an artifact fails any of these three at PR time, it is marked `status:
draft` in the catalogue and excluded from the gallery card grid until fixed.

---

## 6 · README — what the user lands on

The `README.md` for `public/anim-lab/` opens with the positioning lede from
§0, then a table listing **all** galleries (not just two), with columns:

| name | course audience | status | artifact count | distinctive constraint |
| --- | --- | --- | --- | --- |

`status` is one of `showcase` (production-quality, full 20 artifacts),
`draft` (compact version, may have rule violations), `pending` (not yet
built). This makes the catalogue self-serve and tells a course author exactly
what they're picking up.

---

## 7 · The two exemplars to clone

When in doubt, clone:

- **`leaders-ai-os.html` → `L1-i02` "Where did the hour go?"** (Learning's
  exemplar). Drag-four-tokens commitment → gated "Run year →" reveal →
  per-bucket multiplier formula → terse footer. The only artifact that
  combines commitment + retrieval + quantified consequence + scaffold-able
  formula in one mount.

- **`leaders-ai-os.html` → `L3-i02` "Predict your team's adoption"**
  (Psychology's exemplar). Commits user to a number → reveals real benchmark
  → frames delta as data about user's own calibration. Three psychological
  levers (commitment, calibration delta, identity) in 30 seconds.

Hold every new artifact up against these two before merging.

---

## 8 · What each gallery owes

Per gallery (20 artifacts spread across 5 lessons):

- **10 anim + 10 inter**, with each lesson getting at least 1 of each.
- **≥6 distinct mechanics** across the 20 (rule E5).
- **≤1 MCQ-shell per lesson** (rule P4). MCQ shells are the worst-case
  default; pick the lesson that most needs retrieval and place the MCQ there;
  rotate other formats elsewhere.
- **Lesson 1 = scaffold-1 + scaffold-2** (worked example + faded). **Lesson
  5 = scaffold-3 + scaffold-4** (guided + solo). Intermediate lessons mix.
- **One trace-execution artifact per gallery** for procedural courses (Python,
  SQL, claude-pro). These were conspicuously rare in the first seven and are
  the cleanest worked-example format for procedural concepts.
- **Voice consistency check:** before merge, paste a card title into the
  "would I click this if it weren't on a course platform" test (rule M2).

---

## 9 · Rollout order (the remaining 11)

The Learning + Marketing reviewers both flagged that the 5 newer galleries
(python, sql, claude-pro, money, ui-ux) have a visible quality drop vs the 2
showcase galleries (leaders-ai-os, ai-for-developers). The fix is to apply
this spec retroactively to those 5 *first*, then build the remaining 11.

Build order (by leverage):

1. **Retrofit `python-foundations`, `sql-foundations`, `claude-pro`,
   `money-fundamentals`, `ui-ux-design`** against rules P1–U2 — relabel
   `anim`s that don't animate, add consequence panels to bare `inter`s, fix
   contrast, replace HTML5 drag with `Lab.makeDraggable`.
2. **Shell-level upgrades** in `_shell.js` + `_shell.css` — the cards-as-`<a>`,
   dialog backdrop, sound persistence, `--accent-strong`, drag helpers, micro-
   moment. These propagate to all current and future galleries for free.
3. **Build the 11 remaining galleries** against the full spec. In rough
   priority:
   - `data-science-and-analysis` (lots of new chart-grow mechanics)
   - `ai-fundamentals` (high overlap with existing dev gallery; cheap)
   - `product-management` (broad audience, distinct mechanics)
   - `the-science-of-well-being` (psychology audience; helpful self-test)
   - `digital-marketing-with-ai` (paired with positioning prototype)
   - `ai-for-leaders` / `leadership-in-age-of-ai` (overlap; consider merging
     or sharing 5 artifacts between the two)
   - `ai-for-teachers`, `ai-for-accounting`, `testing-with-playwright` (last
     because the audiences are narrower)
4. **Catalogue README rewrite** per §6 once all 18 galleries exist.

---

## 10 · Things this spec does NOT do

- It does not define visual style beyond the palette tokens. Each gallery
  keeps its `--accent` override and its own typography choices within the
  shared shell.
- It does not pre-decide which mechanic goes where in each lesson — only that
  the rules above are satisfied across the gallery as a whole.
- It does not (yet) cover audio polish per `docs/music.md` and `docs/sfx.md`.
  ZzFX SFX is sufficient for the catalogue; Tone.js mood-design is still
  deferred per `memory/audio_guides.md`.

If a future review identifies a 13th rule, add it here and run the existing
galleries through it. Resist adding rules that don't survive review feedback —
the discipline of this spec is what makes the catalogue worth maintaining.

# Anim Lab — Pedagogical Review

## Verdict

Complete the catalogue, but tighten the spec before building the remaining eleven. The shell, visual identity, and the "one card, one mechanic, one footnote of intent" pattern are doing real work — most artifacts earn their 30-90 seconds. But about a third of the built artifacts are mis-labelled (static panels marked `anim`, passive widgets marked `inter`), and the predict-then-reveal commitment that the README promises is honoured in only a handful of cases. With three or four design rules added, the next eleven galleries can be cranked out without re-litigating each one.

---

## What is working

**1. Worked-example pairs that compare two surfaces side by side.** Mayer's contiguity principle in action. `python L1-a02` (reassign vs mutate, two code panels), `sql L3-a02` (INNER vs LEFT, two result tables), `ui-ux L5-a02` (reaction vs critique, two columns), `claude-pro L2-a02` (three diff rounds in sequence). The cognitive lift is doing the comparison, not parsing the prose — exactly the load reduction Sweller predicts when you let perception substitute for working memory.

**2. Live formulae that earn their immediacy.** `money L3-i01` (compounding calculator), `money L4-i02` (expense-ratio cost over 30 years), `leaders L4-i02` (salary band drift). These break the predict-then-reveal rule deliberately, and that's defensible — the *affordance itself* is the lesson (Bjork's generation effect via fluent manipulation). The learner is generating their own examples while the formula compounds the surprise.

**3. Drag-to-bucket with a consequence stage.** `leaders L1-i02` (Where did the hour go?) is the cleanest pedagogical artifact in the whole catalogue: commit (drag four tokens) → gated reveal (Run year) → quantified outcome (year-end multiplier) → mixed-buckets formula that genuinely punishes leakage choices. This is Roediger/Karpicke testing-effect done well — the chips force the commitment that a quiz button doesn't.

**4. Plain-English-of-code translation drills.** `sql L1-i02`, `python L2-i01` (branch picker for x=7), `claude-pro L1-i01`. Posner conceptual-change framing: pick from three close-but-wrong glosses, then see the right one with reasoning. Beats "type out the code" because the discrimination is the skill being trained.

**5. The shared `tbl()` helper inside `sql-foundations.html` and the chip / lane / panel / reveal primitives across all galleries.** Cross-artifact pattern recognition is doing pedagogical work — by gallery 3 a learner already knows what a saffron `reveal` panel means without reading it. This is closer to Mayer's signaling than to "sameness." Keep it.

---

## What is not working

**1. "Animation" without animation.** ~40% of artifacts tagged `anim` are static panels. `claude-pro L1-a02` (a bullet list of token-window facts), `claude-pro L3-a02` (a stat grid), `ui-ux L1-a02` (four static text samples), `ui-ux L2-a01` (8pt grid is a static SVG), `money L1-a02` (four stat tiles), `money L4-a02` (two static bars). Either build the motion (the SVG `<animate>` boilerplate is already in use elsewhere — `leaders L1-a01`, `sql L1-a02` does sequenced reveal) or rename the type to `compare` / `static`. Mis-labelling violates the implicit promise that `anim` = passive watch and `inter` = active commitment.

**2. Sliders that reveal continuously, with no commit moment.** `leaders L1-i01` reclaim-rate, `leaders L2-i01` threshold, `python L2-i02` range, `money L3-i02` years-to-crore, `ui-ux L1-i02` blur. These can be defended as live exploration, but the README claims "decision-shaped interactives follow the predict-then-reveal pattern." Pick one or the other per artifact and label honestly. The exemplar of doing it right is `leaders L3-i02` (Lock prediction button gates the reveal); the worst offender is `claude-pro L5-i02` (memory-key chooser) which logs no judgement at all — clicking just tints a button.

**3. Drag-to-lane interactives with no consequence stage.** `python L1-i02` (type-sticker game — drops anything anywhere, win-reveal pops on first drop regardless of choice), `python L3-i02` (pure vs impure — no scoring, drag and done), `money L2-i02` (bucket your money — no totals, no validity check), `ui-ux L5-i02` (three empty textareas, no submit). These are commitment without retrieval — the worst combination cognitively, because the learner pays the working-memory cost of dragging without the encoding benefit of feedback. Contrast with `leaders L1-i02` and `leaders L3-i01` which both score and explain.

**4. Quiz interactives that fail Bjork's desirable-difficulty test.** The 4-question quiz pattern (`python L4-i01`, `sql L1-i01`, `sql L3-i01`, `sql L4-i02`, `money L4-i01`, `claude-pro L1-i01`) is good — but six near-identical instances across the catalogue produce satiation, not retrieval practice. Reduce to one quiz per lesson; reserve the slot for a harder mechanic where the quiz wouldn't fit.

**5. The worked → faded → solo gradient is invisible.** Per the README the four artifacts per lesson are ANIM-ANIM-INTER-INTER. That's "two passive then two active," not Renkl-style fading. A learner moving L1-a01 → L1-a02 → L1-i01 → L1-i02 does not encounter progressively reduced scaffolding — they encounter format changes. The interactives often expose *new* concepts (`leaders L1-i02` introduces multipliers per bucket that the animations never named). The catalogue would be stronger if each lesson's four artifacts taught one concept at four scaffolding levels, not four sub-topics.

---

## Top 5 rules for the spec doc

1. **Every artifact labelled `anim` must have at least one piece of motion that advances the concept** — a path-draw, a value-step, a bar-grow, a position interpolation. If the SVG is static at t=1s, it is not an animation; relabel `compare` (two-pane side-by-side) or `panel` (static fact card). Why: respects Mayer's modality assumption — the animation channel costs cognitive load; if you spend the budget, give the learner motion to integrate.

2. **Every `inter` must gate at least one piece of feedback behind an explicit commitment** — a "Lock", "Check", "Run", "Reveal" button, or a complete drag-set, or a final-answer choice. No reveal-on-keystroke as the *only* feedback mode (slider-with-live-stat is fine if the surprise is the formula, not the answer). Why: Roediger/Karpicke — retrieval requires commitment, and continuous reveal converts retrieval into recognition.

3. **Every `inter` must produce a consequence panel, not just an animated re-render.** A `.reveal` block with `win` / `bad` / neutral framing tied to the user's specific choice. Drag-to-bucket without a "Run year →" scoring step is forbidden. Why: Bjork's generation effect is asymmetric — commitment without feedback closes the loop wrong, anchoring the *first* answer regardless of correctness.

4. **One quiz-format interactive per lesson maximum.** The 4-question MCQ pattern is repeating six times across the catalogue. Pick the lesson where retrieval-practice matters most (usually the last lesson, or the one with most discrimination errors) and rotate other formats elsewhere: predict-a-number, drag-with-scoring, build-a-thing, trace-the-execution, before/after fix. Why: Bjork's desirable difficulty depends on novelty of retrieval cue; six near-identical MCQ shells produce one retrieval skill, not six.

5. **The four artifacts in a lesson must teach the *same* concept at decreasing scaffold, not four facets of the topic.** Artifact 1 = fully worked example (animation showing the mechanic). Artifact 2 = partial reveal (compare two cases, learner names the variable). Artifact 3 = guided practice (commit and reveal with structured choices). Artifact 4 = independent application (open-ended build / drag / predict). Why: Sweller/Renkl worked-example fading is what makes scaffolding actually teach instead of just decorate.

---

## Keep / cut / add for the remaining eleven

**Keep:** the cream-paper visual system, the per-gallery accent override, the `tbl()`-style gallery-local helpers, the dialog/focus shell, the footer-pedagogy-line pattern, the bidirectional drag chips, the multi-question quiz mechanic (sparingly), the side-by-side compare layout. The shared `_shell.css` and `_shell.js` should stay as-is — they earn their weight.

**Cut:** static `anim` cards (or relabel), `inter` widgets with no consequence stage (the four flagged above), the universal MCQ shell as default interactive, the unscored drag-to-lane format. The "compose a workflow" / "type and attend" style of artifact where any input is accepted with the same response is the worst-of-class — cut or rebuild.

**Add:** an explicit `scaffold: 1|2|3|4` tag in the artifact registry so the worked-faded-solo gradient becomes visible to course authors; a `predict` schema field that names what the learner is committing to (so cards can show "Predict: how many rows survive WHERE age > 25?" before the reveal); a `runtime` field (`<30s` / `30-60s` / `60-90s`) to surface where a lesson is over-spending its attention budget; and one or two "trace the execution" artifacts per gallery in the style of `python L1-i01` and `sql L3-i02` — they are conspicuously rare and they're the cleanest worked-example format for procedural concepts.

Build the next eleven against these rules and the catalogue becomes a referenceable drop-in library. Build them as-is and you ship eleven more "this looks great but doesn't quite teach" cards.

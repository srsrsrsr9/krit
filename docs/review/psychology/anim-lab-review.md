# Anim Lab — Psychology Review

## Top verdict

Opening an anim-lab artifact is a fundamentally different mental event from opening a prototype deep-dive. A deep-dive is a **scene** — the learner enters, expects to spend ten minutes, and is willing to absorb stakes, narrative, and a reward arc. An anim-lab artifact is a **flashcard with a moving part** — the learner expects a glance, maybe a poke, and a one-line takeaway. The catalogue mostly honours that contract: visuals load fast, the "what it teaches" caption sets a tight goal, and most artifacts deliver their hit in under thirty seconds. The motivational mood is closer to *flipping through a beautifully-printed reference book* than *playing a game* — calm, low-stakes, slightly cool. The risk in that mood is that nothing **lands** emotionally; the learner closes the dialog with a small "huh" and forgets the artifact by the end of the day. The catalogue avoids reward fireworks by design (correctly — they'd compete with lesson-level rewards), but in doing so it leaves almost every artifact without a closing-of-loop moment. That is the central psychological gap.

---

## Per-gallery attention / motivation analysis

### 1. `leaders-ai-os.html` — The Leader's AI Operating System
The strongest gallery for **competence pressure**. Predict-then-reveal is built into nearly every interactive (L1-i01 reclaim slider, L1-i02 token-drag, L3-i02 adoption prediction, L4-i01 scorecard, L2-i02 the 0.62 coin). Each one ends with a verdict tied to a *zone* ("Compounding zone"/"Hard to defend") which is closer to an identity statement than a metric — that's a real SDT-competence move. Animations like L1-a02 ("Sam vs. her counterpart" with "→ Tech Lead" vs "→ laid off") use von Restorff to make the saffron-vs-muted contrast carry the whole pedagogical hit in <3 seconds. Weakness: the autonomy axis is mostly slider-shaped, and after L3 the sliders start to blur. The "Predict your team's adoption" benchmark reveal (L3-i02 actual=72) is the single most psychologically charged moment in the whole catalogue — it weaponises calibration delta. More of that mechanic, fewer sliders, would lift the whole gallery.
**Scores:** Autonomy 7 · Competence 8 · Relatedness 5

### 2. `ai-for-developers.html` — AI for Developers
Highest **cognitive engagement** per artifact, lowest emotional payoff. The "bank → token → embed → attention" walkthrough (L2-a01) and the ReAct trace (L6-a02) are exemplary because they make the invisible visible — that's a Kahneman dual-process win, converting System-2 effort into System-1 pattern. L1-i01 (keyword vs embedding race) is genuinely satisfying because you *see* the two retrievers diverge on a paraphrase. L3-i02 (decision tree) is a smart use of constrained autonomy — six questions, real recommendation. But several artifacts (L3-a01, L3-a02, L4-a01) are pure information charts with no interaction surface and no reward — they're slides. L5-a02 (top-K bobbing) is the most viscerally satisfying animation in the catalogue: the orbiting query with lit-up lines is genuine flow-bait. Apply that level of motion elsewhere.
**Scores:** Autonomy 6 · Competence 9 · Relatedness 3

### 3. `python-foundations.html`
Pedagogically tight, motivationally thin. L1-a01 (the sticker animation with the "Append to b" button) is *the* exemplar of one-shot conceptual hit: in 4 seconds you understand Python's reference model. L1-i01 (trace-the-references step-through) has perfect Zeigarnik tension — line counter increments toward a goal. L2-i01 (branch picker with x=7) commits before reveal — great pattern, but the wrong-answer feedback is too gentle ("Try again." — no consequence, no friction). The "Pick the container" quiz (L4-i01) is reused four times with a sliding correctness — pure variable-ratio territory, but as written every reveal is full-strength, so the surprise flattens. Animation density is lower than the leadership gallery — many artifacts are static panels with one button.
**Scores:** Autonomy 6 · Competence 7 · Relatedness 4

### 4. `sql-foundations.html`
The catalogue's **most consistent gallery**. Every interactive uses a real table that responds to the user's choice — L2-i01 highlights matching rows live, L3-i02 click-a-user lights up matching orders, L4-i01 group-by playground reshapes the table in place. This *show-me-the-rows-actually-change* mechanic is the highest-bandwidth predict-then-reveal in the whole anim-lab; the user's mental model and the visible state stay in lockstep. Weakness: it's almost too neat. Every artifact ends with a green "right" or red "wrong" panel and a "Next →" button; the rhythm becomes predictable inside 90 seconds. L2-i02 (NULL trap) is the one moment with genuine surprise value — a real *gotcha* in the data — and that surprise carries because the user has just been told they got something wrong by a system that's mostly been agreeing with them. More NULL-traps, please.
**Scores:** Autonomy 7 · Competence 8 · Relatedness 4

### 5. `claude-pro.html`
The **weakest gallery** for psychological architecture, though it covers the most ground per artifact. Most interactives are single-tap and stop — the prompt-tightener (L2-i01) gives a flat acknowledgement; the tone-tuner (L3-i02) responds but doesn't reward; the capability-radar (L1-a01) is decorative. The hallucination-risk toggler (L1-i02) is closest to a competence loop — the meter moves in real time as you check boxes — but there's no anchor: what does "LOW" feel like vs "HIGH" once you've achieved it? L5-i01 (workflow composer with terminate/runaway detection) has the catalogue's only real *risk* moment — pick wrong, get told you built a runaway agent. That fear-flicker is more useful than ten verdict panels.
**Scores:** Autonomy 5 · Competence 6 · Relatedness 4

### 6. `money-fundamentals.html`
The **highest emotional stakes** in the catalogue, and it shows. L1-i01 (upgrade simulator) is a textbook loss-aversion lever — every check-box subtracts visibly from the "Net to savings" stat. L3-i02 ("Years to crore" with three return-rate columns) is the single most motivating chart for a 25-year-old, exactly as the footer says. L5-i02 (subscription cost over 30 years) reframes a ₹500/month subscription as ₹1.5L of foregone retirement — that's a System-2 punch dressed as a calculator. Where the gallery falters: the relatedness axis is empty. Finance is intimate, but no artifact lets the user *see other people* — no "of 800 users your age, you're in the top X%" anchor, no cohort comparison. Even one of those would lift the gallery substantially.
**Scores:** Autonomy 7 · Competence 9 · Relatedness 3

### 7. `ui-ux-design.html`
The **most autonomy-rich** gallery, because design choices are intrinsically aesthetic. L1-i02 (blur slider squint test) is a *delightful* mechanism — the visual change carries the whole pedagogy in <500ms. L3-i01 (live WCAG contrast checker) is the catalogue's best example of a tool the learner might re-open and *use* outside the lesson — that's the highest form of competence transfer. The font-pairer (L3-i02) and spacing sandbox (L2-i01) both reward fiddling. L5-i02 (three-box critique template) is the only artifact in the catalogue that asks the user to *produce* something, not just react — that's a different cognitive load and a different reward (Zeigarnik-on-completion). Weakness: the "click the hotspots" pattern (L4-i01, L5-i01) is used twice and feels samey on second encounter.
**Scores:** Autonomy 8 · Competence 7 · Relatedness 3

---

## Three missing psychological levers (add once, across all artifacts via the spec)

1. **A closing-of-loop micro-moment.** Right now, most artifacts simply *stop* when the user releases the slider or drops the last chip. Add a single optional `endNote` (≤ 12 words, italic, slate-grey, appears 600ms after the last interaction) — e.g. *"That's the whole mechanism. Close when ready."* This is Zeigarnik resolution. Without it, the artifact has no completion signal; the user closes the dialog uncertain whether they're "done." Cost: one CSS rule, one prop in the artifact registry.

2. **A relatedness anchor — one sentence, post-reveal.** Insert a `cohort` field on any interactive that produces a numeric output: *"Most learners who got this far landed between X and Y."* Doesn't need real data; the *existence* of a peer band converts a private interaction into a small social act. Compare the embeddings prototype's "67% of learners undershot here" — that one line does enormous psychological work.

3. **Inversion mode on one artifact per gallery.** Right now everything is forward — *do this, see this*. Pick one interactive per gallery and run it backwards: show the outcome, ask the learner to set the inputs that would produce it. (E.g. "Here's a P&L that ends at ₹X — set the reinvest rate that gets you here.") Inversion forces System-2 engagement and rewards mastery with a different kind of reveal. One per gallery, not eighteen — habituation matters.

---

## Top 5 rules for the spec doc

1. **Every artifact must produce a state change within 800ms of first interaction.** No spinners, no "press play to begin" curtain unless the play button itself is the pedagogy. If the artifact opens cold, an autoplay-short (≤ 600ms, prefers-reduced-motion safe) must trigger to set baseline visual state.

2. **Sliders must never display only a number — they must always paint a verdict.** Any range input must update one of: a coloured zone label ("Compounding zone"), a stat-grid stat with a colour class, or a textual reveal. A slider that only updates `12% → 13%` is a Fogg-fail: effort without prompt.

3. **Predict-then-reveal artifacts must withhold the reveal until commit.** The "Lock prediction" button pattern in L3-i02 is correct; the auto-updating reveal in L1-i01 is psychologically weaker because no commit ever happens — the user just slides past every truth. Pick one pattern per artifact; commit is stronger for one-shot artifacts (≤ 60s), live-update is stronger for sandboxes (re-openable).

4. **No artifact may end in identical visual state to its opening.** Closing the loop is a visual contract — the final state must be *different* from the entry state in colour, density, or position. If the user dragged four tokens and hit "Run year," the tokens must visibly cluster differently, not just emit a verdict panel below.

5. **At most three artifacts per gallery may share a mechanic.** Slider, drag-to-bucket, predict-and-reveal, decision-tree, hover-attend — each is a flavour. Past three, habituation kicks in by artifact 4 and competence-reward decays. Each gallery of ~20 must field at least 6 distinct mechanics, with the unusual ones (e.g. ui-ux's blur-slider, money's loss-aversion checklist) clustered in the middle of the gallery, where engagement traditionally dips.

---

## The single biggest motivational concern

Across all seven galleries, **the bonus-toast pattern from the embeddings prototype has no analogue, and many artifacts feel pedagogically complete but emotionally inert as a result.** The prototype's chapter-complete surprise toast (variable-ratio reinforcement on a known event) created the only real dopamine moment in the deep-dive — it converted "I finished a section" from a private cognitive event into a publicly-rewarded one. The anim-lab's design note ("No reward fireworks") is defensible *for embedded use* — bursts would compete with lesson-level rewards — but it is wrong *for standalone gallery browsing*, which is how the catalogue is actually consumed today. The fix isn't fireworks; it's a single, optional, gallery-level reward layer: every Nth artifact opened in a session triggers a quiet 1.5-second micro-moment (a small saffron pulse on the close button, a one-line "you've now seen 5 of 20" footer ticker, an unexpected lede update). Variable-ratio because not every Nth — sometimes the 3rd, sometimes the 7th. This is the lowest-cost, highest-leverage addition the spec doc could mandate, and it sits at the gallery shell level (`_shell.js`), not per-artifact, so it's one implementation for all eighteen galleries.

---

**Word count:** ~1490
**Single biggest psychological gap:** no closing-of-loop micro-moment, and no gallery-level variable-ratio reward layer — artifacts inform but rarely *land*.
**Exemplar artifact:** `leaders-ai-os.html` L3-i02 *Predict your team's adoption* — commits the user to a number, reveals a real benchmark (72%), and frames the delta as data about the user's calibration of their own team. Three psychological levers (commitment, calibration delta, identity) in one 30-second flow. Hold this up as the spec's reference artifact.

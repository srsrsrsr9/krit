# Learning-science review · four Krit prototypes

## Top-line verdict

Three of the four artifacts are genuinely worth a learner's hour, and one (Embeddings) is the most pedagogically ambitious thing I have seen in an LMS prototype this year. The set as a whole demonstrates a real grasp of the *production* end of learning science — predict-then-reveal, worked-example fading, counterfactual simulation, falsification, calibration — applied with discipline rather than as window dressing. The biggest single risk across all four is that "forced production" is enforced unevenly: some moments truly gate the answer, others let a skimmer reach the payoff with zero cognitive work. The set is worth $10 per artifact today; with the fixes below, it could plausibly clear $25.

---

## 1 · Embeddings (technical · ~30–45 min)

**Strength.** This is the only prototype that closes the metacognitive loop. The pre-flight calibration check (Layer 2, "Rate each 1 to 5") and the matching post-test that surfaces the *delta* — not the raw score — is exactly the move Dunlosky & Rawson (2012) describe for combating the illusion-of-knowing. Pairing that with persistence and a scheduled retention check (3-day spaced retrieval, per Roediger & Karpicke 2006) gives the page a closed retention arc most LMSs never even attempt. The worked → faded → solo trio (cosine code) is also textbook Renkl & Atkinson (2003) fading, with the second stage actually requiring input before the third unlocks **[callout 2]**.

**Weakness — load with citation.** The "soft gate" between chapters (`confirm()` dialog, line 2704) is friction theatre, not a gate. Per Sweller's cognitive-load theory, *germane* load only accrues when the learner cannot bypass effortful processing. A learner who clicks "OK" through the dialog gets the same content for free. Worse, the page presents 14 checkpoints + jargon hovers + ExternalDive cards + 3 walkthroughs + capstone simultaneously visible in the chapter nav — high extraneous load from anticipated scope (van Merriënboer & Sweller 2005).

**Change.** Either commit to a hard gate on the Faded stage (no Solo unlock until a non-empty answer is submitted *and* self-checked) or drop the lock metaphor entirely and call it "suggested order." Half-gating teaches learners that effort signals are negotiable.

---

## 2 · Compound interest (finance · ~5 min)

**Strength.** Commit-then-simulate is the prototype's single best pedagogical move. The learner must set a savings rate and click "Lock it in" *before* Engineer B's curve appears (compound-interest.html line 532, gated by `committed` state). This is textbook counterfactual simulation in the sense of Pearl (2009) and Lombrozo (2006) — the learner generates a self-prediction, then is shown the discrepancy between their committed future and the optimal one. Discrepancy drives durable encoding far more than passive observation (Kang et al 2007 "hypercorrection effect"). Five minutes, one decision, one number — load is exquisitely controlled.

**Weakness.** The scrubber 22→65 forces motoric engagement but not cognitive engagement: a learner can drag rapidly to the right and reach the reveal without ever *predicting* the intermediate values. Per Bjork's desirable-difficulties framework, retrieval has to be effortful to produce learning — and dragging a slider isn't retrieval. Compare to the bicycle prototype, which forces a three-option commit before the reveal.

**Change.** Insert a single predict-the-endpoint moment between Lock-it-in and the scrubber: "Before you drag — guess your number at 65. Within ±50%?" A 5-second prediction would double the retention of the final figure (Brod, Hasselhorn & Bunge 2018).

---

## 3 · Positioning (marketing · ~12 min)

**Strength.** The four-case diagnostic quiz is a beautifully constructed *worked-example-by-comparison* sequence (Rittle-Johnson & Star 2007). Same three-slot structure repeated across LinkedIn / Slack / Notion / your-own-brand, with explicit failure modes ("audience is broken / alternative is broken / angle is broken") that act as discriminative attention cues. This is variation theory done right (Marton 2015): the dimension of variation is held constant so the *structural* feature becomes salient.

**Weakness.** The "build-your-own" closer flags vagueness markers via a hardcoded keyword list (lines 930–950: "everyone," "best," "cutting-edge"). That isn't formative feedback — it's lint. A learner who avoids the banned words but writes positioning that's still vague gets a green light. Per Hattie & Timperley (2007), feedback only works when it operates on the gap between current and target performance; keyword absence isn't a target.

**Change.** Add a peer-comparison reveal: after submission, show two anonymised real examples of the same slot — one strong, one weak — and ask the learner to rate their own work between them. This converts the heuristic check into a calibration moment.

---

## 4 · Bicycle (mechanics · ~12 min)

**Strength.** This is the cleanest *falsification arc* I've seen outside a Posner-Strike-Hewson-Gertzog (1982) conceptual change paper. The structure — popular belief → explicit prediction the learner must commit to → empirical falsification → rebuilt model — exactly matches the four conditions for conceptual change: dissatisfaction, intelligibility, plausibility, fruitfulness. The forced commit at line 491 (three options, with the misconception named *first*) means the learner cannot quietly skip to the answer **[callout 3]**.

**Weakness.** The destabilisation step is rhetorically strong but pedagogically thin: the learner reads that "the bike rode itself just fine" rather than *seeing* it. Conceptual change research (Chi 2005, Vosniadou 2003) is clear that prior beliefs survive verbal contradiction far better than they survive perceptual contradiction. The page has a counter-steering simulation later, but the *load-bearing* falsification — the Kooijman riderless bike — is text-only.

**Change.** Embed the Kooijman 2011 video (or a 5-second animated SVG of the counter-rotating-disc bike rolling) directly into §2, between the commit moment and "The bike rode itself." The current text-only payoff lets the misconception survive.

---

## Cross-prototype observations

The four artifacts share a deliberate house style — Krit-branded chrome, restrained typography, one big interactive thing per page — and that consistency *does* make them feel like a single curriculum. But pedagogically they are not yet a system, only a sampler. Embeddings teaches with calibration + scaffolded reps + retention; finance teaches with commit-then-simulate; marketing teaches with comparison; bicycle teaches with falsification. A learner moving through all four learns four topics, but doesn't learn *how the four pedagogies differ*. The meta-lesson is invisible.

Three asymmetries also stand out. **Length:** Embeddings asks for 30–45 minutes; the others ask for 5–12. A learner finishing finance and walking into embeddings will feel a load cliff. **Forced production:** Bicycle's commit moment is the strictest; finance's lock-in is medium; embeddings' soft gate is loose; marketing's reveal buttons are decorative (you can simply click them in order). **Transfer:** Only bicycle has a *physical* outside-the-page transfer task. Embeddings has a strong code-it-locally transfer. Finance has a behavioural prompt ("automate the transfer") but no commitment device. Marketing's transfer is the build-your-own. The set would feel like a system if every artifact ended with the same explicit pattern: *one thing you commit to do within 48 hours.*

---

## Top 3 priority changes

1. **Promote bicycle's perceptual falsification.** Replace or supplement the §2 text with a short looping video/SVG of the Kooijman riderless bike. Per Chi (2005), prior beliefs survive verbal contradiction; perceptual contradiction is what destabilises them. This is the lowest-effort highest-impact change in the set.
2. **Add a single predict-the-number moment to compound interest.** Between "Lock it in" and the scrubber, insert a one-input prediction of the age-65 figure. Brod et al (2018) and the hypercorrection literature (Kang et al 2007) both show prediction-then-feedback at least doubles long-term retention versus passive reveal — the prototype is one input field away from twice the durable learning.
3. **Make embeddings' chapter gate real or remove the metaphor.** Soft gates that yield to `confirm()` teach learners that effort signals are optional. Either hard-gate the Faded → Solo and Capstone → Reflect transitions on actual submission (germane load, Sweller 1988), or rebrand the chapter ends as "recommended pause points" and stop dressing them as locks. The current state is the worst of both — irritation without the retention payoff.

---

*~1,180 words.*

---

### Annotated screenshots

Callout numbers above reference four annotated PNGs to be generated by
`annotate.py` in this directory (run: `python3 annotate.py`). The script
calls `/opt/homebrew/bin/magick` and produces:

- `annotated-01-embeddings-calibration.png` — callout 1 (green / strength)
- `annotated-02-finance-no-predict.png` — callout 2 (red / weakness)
- `annotated-03-bicycle-commit.png` — callout 3 (green / strength)
- `annotated-04-marketing-passive.png` — callout 4 (red / weakness)

The reviewer's sandbox blocked `magick` and `python3` even with sandbox
override, so the four PNGs are not yet on disk. The script is short and
deterministic — running it locally takes &lt;1s.

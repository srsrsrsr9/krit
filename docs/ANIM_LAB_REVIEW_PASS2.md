# Anim Lab — Pass 2 Review Synthesis

Synthesis of four independent expert reviews of the 10 spec-compliant galleries (built against `docs/ANIM_LAB_SPEC.md`). Reviewers: learning science, marketing voice, psychology/attention, UX/a11y.

## Overall verdict

The body of work clears the §5 quality floor as an internal authoring catalogue. It does **not** yet clear the bar for public-facing demo on two fronts: WCAG 2.2 AA contrast in 3 galleries, and broken touch-drag in 6 galleries. Both are mechanical fixes — none of the reviewers questioned the pedagogical foundation or the content.

Two of the ten (`leadership-in-age-of-ai`, `ai-for-leaders`) are within striking distance of showcase tier. Two (`product-management`, `data-science-and-analysis`) carry the most §5 violations.

## Convergent findings, ranked by leverage

**(1) Native HTML5 drag still wins over `Lab.makeDraggable` — U1 systemic.**
Flagged by: psychology, UX. Galleries affected: 6 of 10.
Chips render as `<div draggable="true">` then call `Lab.makeDraggable(c)`. The inline attribute opts into the native HTML5 drag API which is broken on iOS Safari and overrides the pointer-events handler. **Fix:** strip `draggable="true"` from chip templates. `makeDraggable` sets the needed properties itself. One-line edit per gallery.
Worst: `data-science-and-analysis`, `ai-fundamentals`, `product-management`, `the-science-of-well-being`, `ai-for-leaders`, `testing-with-playwright`.

**(2) Homogeneous lede tail — M1 voice drift.**
Flagged by: learning (6 of 10), marketing (10 of 10), psychology (spec violation).
All ten ledes use "Twenty drop-ins for X" in sentence 2. Spec §M1 explicitly forbids this opener. The catalogue-tic dilutes the named-enemy hook. **Fix:** 30-minute editing pass; remove the "Twenty drop-ins" formula from each lede; let the grid speak.

**(3) Drag-bucket without scoring — P3/§5.1 violation.**
Flagged by: learning, psychology, UX.
Worst offenders: `product-management L4-i01` (no check button, no reveal), `the-science-of-well-being L4-i02` (cut/keep with no scoring), `digital-marketing L1-i01` (drag works but reveal fires only on a separate button bet).
**Fix:** every `drag-bucket` ends in a `.reveal` panel naming hits/misses. Clone the pattern from `ai-for-leaders L2-i01`.

**(4) Slider-as-predict-reveal without commit gate — E3.**
Flagged by: learning, psychology.
Worst: `digital-marketing L1-i02`, `ai-for-accounting L1-i02`, `well-being L4-i01`, `ai-fundamentals L1-i01`. All update live with right/wrong verdicts — that's recognition (Karpicke) dressed as prediction.
**Fix:** add a "Lock my guess" button before the verdict turns green, OR demote `scaffold` to 2 and reframe as exploration with no win/bad verdict.

**(5) `--accent` used as small text — U2 contrast fail.**
Flagged by: UX.
`ai-for-leaders.html:5` (`#b25e0c`) and `leadership-in-age-of-ai.html:5` (same hex) use `--accent` for 10-11px labels on paper → ~3.4:1, AA-fail. `digital-marketing-with-ai.html` borderline.
**Fix:** replace `fill="var(--accent)"` with `fill="var(--accent-strong)"` on every SVG text ≤14px. The spec already mandates this in `_shell.css`; per-gallery SVG bypassed it.

**(6) SMIL ignores `prefers-reduced-motion`.**
Flagged by: UX. Galleries affected: 10 of 10.
None of the new galleries call `Lab.motionOK()`. CSS reduce-motion only zeros CSS animations, not SMIL `<animate>`. **Fix:** wrap mounts with `if (!Lab.motionOK()) s.querySelectorAll('animate').forEach(a => a.remove());`.

**(7) Card titles drift to labels — M2.**
Flagged by: marketing, learning.
Worst: `product-management L3-i01 "RICE calculator"`, `ai-for-accounting L1-i01 "Build your close timeline"` / `L5-i01 "Build an audit-trail row"`, `digital-marketing L1-i02 "Funnel CAC calculator"`, `ai-for-teachers` (many imperatives: "Sort students", "Generate the 3-tier worksheet").
**Fix:** reframe each as a curiosity-gap question or a named tradeoff.

**(8) Palette mismatch on well-being + accounting — U2 / Russell circumplex.**
Flagged by: psychology.
Spec maps well-being → rose-warm, accounting → gold. Both files set emerald `#14554a` (the data/DB palette). Affect-mismatch undermines first-impression.
**Fix:** swap palettes per spec §4 table.

**(9) Compose-build feedback collapses to word-count grading.**
Flagged by: learning.
`well-being L2-i02`, `L5-i02`, `ai-for-accounting L5-i01`, `ai-for-leaders L5-i01` grade only on field-fill length. These are the highest-generation-effect artifacts in the catalogue (Bjork) and they're degraded to typing exercises.
**Fix:** keyword/regex checks like `ai-for-teachers L3-i01` already does (what/where/why/what-to-try).

**(10) Focus management in dialog.**
Flagged by: UX.
No `aria-labelledby` on `<dialog>`. No focus into dialog on open, no focus restoration on close. **Fix:** 8 lines in `_shell.js`.

## Killing nominations

- **`product-management L4-i01`** "Drag features into now/next/later" — no check, no reveal (learning, §5 floor fail).
- **`leadership-in-age-of-ai L1-i02`** "Pick 5 things to stop doing" — pure counter, no weighted scoring or consequence (psychology, E3+P3).
- **`testing-with-playwright L2-i01`** "Submit button selector drag-quiz" — draggable+contrast+no consequence (UX).
- **`ai-for-teachers L1-a02`** "A lesson plan in 5 prompts" — anim that doesn't animate, recap footer, label title (marketing, P1+M2+M3).

## Elevation nominations (to showcase exemplar list)

- **`digital-marketing-with-ai L1-i01`** "Find the leaky step" — quantified counterfactual, flow-match (psychology).
- **`leadership-in-age-of-ai L4-i01`** "Write the message to your team" — true generation + multi-axis regex feedback (learning).
- **`leadership-in-age-of-ai L1-a02`** — diverging-from-centre bar chart, unusual encoding, magnitudes carry pedagogy (UX).
- **`the-science-of-well-being` lede** — exemplar of the M1 named-enemy + concrete-examples + actionable-promise pattern (marketing).

## Recommended fix sequence

1. **30 min — strip `draggable="true"` from 6 galleries.** Unblocks mobile. Biggest single ROI.
2. **30 min — accent-strong sweep on small SVG text in 3 galleries.** Unblocks AA contrast.
3. **30 min — palette swap on well-being + accounting.** Restores affect-match.
4. **60 min — lede rewrite across 10 galleries.** Removes the "Twenty drop-ins" tic.
5. **60 min — SMIL motionOK gating + dialog focus restoration in `_shell.js`.** Shell-level; propagates to all 17.
6. **2-3 hr — fix or kill the 4 named §5-floor failures.**
7. **2-3 hr — retrofit the 4 named slider-as-predict artifacts with commit gates.**
8. **2-3 hr — replace word-count grading with regex-checks on 4 compose-build artifacts.**
9. **30 min — rename 6 worst label-titles to frames (M2 pass).**
10. **30 min — add the 3 elevated artifacts to spec §7 exemplar list.**

Total: ~12-14 hours. After this, the 10 spec galleries should be at showcase quality.

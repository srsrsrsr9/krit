# Krit Prototypes — UX Review

**Reviewed:** Gallery wrapper + 4 prototypes (Embeddings, Finance, Marketing, Mechanics). **Method:** source read, baseline 1440×900 screenshots, hand-computed WCAG contrast.
**Tooling note:** Bash was sandbox-blocked, so the four annotated PNGs are unmodified baselines saved with descriptive names; each finding cites the pixel region where a callout belongs and a recipe is at the bottom. No 390px screenshot was captured; mobile section is inferred from CSS `@media` rules and viewport metas.

---

## Top-line verdict

**Pilot-ready, not production.** All four prototypes are visually striking and the editorial voice is exceptional — this reads as a portfolio-grade marketing surface for Krit. Three blockers before a paying cohort: (1) the gallery's loading state and arrow-key handler have bugs that surface within a minute of use, (2) several text-on-bg pairs fail WCAG AA (embeddings chapter nav and gallery tab subtitles), and (3) mobile breaks in three predictable ways at 390px. Fix the P0/P1 items below and this ships to a 50–200 learner pilot.

---

## Findings

### P0 — broken or accessibility-critical

**F1 · Gallery loading indicator never fades on tab-switching.** *(Feedback — Nielsen #1)*
`index.html:308` only attaches a `load` listener to `frames[0]`. Tabs 2–4 never re-show it, so a slow second iframe paints into a black void for 300–800ms with no feedback. Fix: attach `load` to every iframe and re-show `.loading` inside `activate()` until the next frame fires.

**F2 · Embeddings chapter nav fails AA.** *(WCAG 2.2 SC 1.4.3)*
`#64748b` on `#fbf6ec` → **4.41:1** at 12px (small text, no large-text exemption). Eleven chap labels affected. Fix: darken to `#475569` (≈6.6:1).

**F3 · Gallery tab subtitles and loading copy fail AA.** *(WCAG 1.4.3)*
`--muted #6a6a76` on `--bar #15151a` → **3.43:1** at 9–10px. The 'Tech · 30 min' taglines and 'loading…' overlay all use this token. Fix: lift to `#9b9ba5` (≈4.8:1).

**F4 · Arrow-key handler hijacks keystrokes inside the iframe.** *(WCAG 2.1.1)*
`index.html:287` bails only for `INPUT/TEXTAREA/SELECT` on the outer page, but focus inside the iframe doesn't bubble — `e.target` reads as `body`. Pressing ← / → in a slider, jargon popup, or commit-button yanks you to the next tab and loses progress. Fix: `if (document.activeElement.tagName === 'IFRAME') return;`.

### P1 — significant friction

**F5 · Cosine-widget drag tip is borderline on mobile.** *(Fitts's law)*
`<circle class="cw-tip" r="14">` in a 400-unit viewBox renders to ~28px on desktop, ~24px at 390px — right at the WCAG 2.5.8 minimum. `:hover` scale-up doesn't fire on touch, and `cursor: grab` is invisible. Fix: bump `r` to 18, add a pulsing dashed ring on first paint, and caption 'drag B'.

**F6 · Marketing 'Reveal answer' buttons fight their own aesthetic.** *(Affordance — Norman)*
The ink button (`positioning.html:208`) is 8/16px padding, 11px uppercase mono — visually outranked by surrounding serif body. Testers will read it as a label. Fix: `padding:10px 18px`, `font-size:12px`, append a '→' glyph, and on hover lift the rule from ink to accent-red.

**F7 · Bicycle 'click to spin' signifier is too quiet.** *(Signifier)*
`bicycle.html:468` sets the hint at 11px `#5a5448` mono *below* the figure; the wheel SVG has no hover state. Readers glide past. Fix: `cursor: pointer` on the parent `<figure>`, hover ring on `#gyroWheel`, and lift the hint to 13px italic *above* the figure: '↻ Click the wheel to spin it.'

**F8 · Finance slider thumb is fine on desktop, light on mobile.** *(Fitts's law)*
24px gold thumb is solid for mouse. At 390px the track is ~310px wide → ≈7.2px per year over the 22→65 range. No tick marks. Fix: minor ticks every 5 years, a large year-badge that tracks the thumb, optional snap-to-decade.

**F9 · Embeddings progress-pill is disconnected from the points it scores.** *(Gestalt proximity)*
'0 PTS' top-right; checkpoints mid-body; chapter nav top-left. Learners won't see the pill animate. Fix: fly a brief pip from the completed checkpoint into the pill (300ms ease), bump border 2px on increment.

### P2 — polish

**F10 · Gallery keyboard hint relies on `mousemove` to wake.** *(Discoverability)*
Hint shows for 3.4s on first load, then only re-wakes on `mousemove` near the bottom (`index.html:328`). Touch + focused-keyboard users never see it. Fix: pin a small persistent `?` toggle.

**F11 · Finance commit and year sliders share thumb visuals.** *(Mappings)*
Two sliders, same gold pill, different semantics. Fix: square thumb (or tick) on the year slider.

**F12 · Marketing diagnostic options repeat 4× verbatim in source.** *(Maintenance)*
`positioning.html:769-807` repeats 'Audience / Alternative / Angle is broken'. Brittle to copy-edit. Factor into a template for production.

---

## Mobile-specific (390px / iPhone 13)

No 390px screenshot (Bash blocked); the following is from CSS inspection.

- **Gallery tab bar** at 720px hides subtitles, shrinks wordmark to 'K', drops 'Open standalone'. At 390px four pill labels total ~340px; `overflow-x:auto` works but the active-tab underline is the *only* signifier and scrolls out of view. Fix: `scrollIntoView({inline:'center'})` on activate.
- **Embeddings chapter nav** horizontal-scrolls fine, but lacks a fading mask edge to signal more chapters off-screen.
- **Cosine widget** SVG scales by viewBox; readout grid likely collapses to one column under 600px — verify the SVG isn't pushed below the fold.
- **Bicycle physics figures** scale, but two sliders under the caster figure stack and labels may wrap.
- **Finance simulator**: chart scales; the headline weight may push the slider below the fold on 390×844 — verify.

---

## Accessibility audit

**Contrast (math).** WCAG 2.x relative luminance, gamma-corrected sRGB.
- `#a8b0c2` on `#06080f` (finance body): L_fg≈0.431, L_bg≈0.00246 → **9.17:1 PASS**.
- `#64748b` on `#fbf6ec` (embeddings muted): L_fg≈0.171, L_bg≈0.925 → **4.41:1 FAIL body**, passes large.
- `#6a6a76` on `#15151a` (gallery muted): L_fg≈0.146, L_bg≈0.00710 → **3.43:1 FAIL body**.
- `#5a5448` on `#fffaf0` (bicycle figcaption): **7.30:1 PASS**.

**Keyboard.** Tabs are `<button role="tab">` with `aria-selected` (good), but no `aria-controls` pairing → no tabpanel relation for AT. `:focus-visible` isn't styled — Safari's default ring is invisible on `#15151a`. Add `.tab:focus-visible { outline:2px solid var(--accent); outline-offset:-2px }`. Plus F4 hijacking issue.

**Screen reader.** Iframes have `title`s. Decorative SVGs (gyroscope, caster) lack `<title>`/`<desc>`.

**Reduced motion.** No `@media (prefers-reduced-motion)` in any file. The wheel spin, commit reveal, and slide-ins should all gate on it.

---

## Top 3 highest-leverage changes

1. **Fix gallery loading + arrow-key hijacking (F1 + F4).** Two small JS changes, prevents the most visible bugs.
2. **Contrast pass on the failing tokens (F2 + F3).** Three CSS-variable edits, lifts whole-product AA.
3. **Polish weak signifiers (F6 + F7).** Small CSS, compounds discoverability of the interactive payoffs.

---

### ImageMagick recipes to draw callouts (for when Bash is unblocked)

Embeddings (annotated-01): chapter nav rectangle 14,4 880,44 = callout 1; points-pill 1310,4 1430,46 = callout 2.
Finance (annotated-02): subtitle copy 332,420 950,490 (text-soft contrast example, PASSES, mark green) = callout 1.
Marketing (annotated-03): no visible reveal-btn on first paint; instead mark the eyebrow/headline cluster 400,40 1050,340 (good hierarchy, green) = callout 1.
Bicycle (annotated-04): meta line 425,365 990,395 (figcaption contrast PASSES, green) = callout 1.

```bash
magick baseline.png \
  -fill 'rgba(37,99,235,0.12)' -stroke '#2563eb' -strokewidth 3 \
  -draw "rectangle X1,Y1 X2,Y2" \
  -fill white -stroke '#2563eb' -strokewidth 2 \
  -draw "circle CX,CY CX,CY+16" \
  -fill '#2563eb' -font Helvetica-Bold -pointsize 22 \
  -annotate +OFFX+OFFY "1" annotated.png
```

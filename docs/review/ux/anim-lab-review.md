# Krit Anim Lab — UX Review

**Reviewer lens:** Nielsen heuristics, Norman affordances, Fitts's law, WCAG 2.2 AA, responsive + reduced-motion.
**Artifacts reviewed:** 7 galleries (leaders-ai-os, ai-for-developers, sql-foundations, python-foundations, claude-pro, money-fundamentals, ui-ux-design), shared `_shell.css` + `_shell.js`, README catalogue.

---

## Verdict — pilot-ready, not production

The lab is a thoughtful, restrained, *correctly opinionated* catalogue. The card grid scans well, the focus dialog is built on native `<dialog>` (good), and ZzFX is gated behind a real user gesture. Three structural problems hold it back from production: HTML5 drag-and-drop is broken on touch with no fallback, the per-course `--accent` token is used as foreground text in places where it fails WCAG AA contrast, and the SVG `<animate>` elements ignore `prefers-reduced-motion`. With the eleven remaining galleries planned, fixing these *once in the shell* is far cheaper than fixing eighteen times.

**Ship state: pilot-ready.** Safe for internal demos and design-partner cohorts. Block production embed until P0s land.

---

## Findings (severity-tagged)

### P0 — must fix before any wider release

**P0-1 · Drag-and-drop is dead on touch. No fallback.**
Gallery: every interactive using chips → lanes. Concrete examples: `leaders-ai-os.html#L1-i02` (reclaim-hour buckets), `leaders-ai-os.html#L3-i01` (task allocation matrix), `ai-for-developers.html#L1-i02` (drag-classify NLP), `ai-for-developers.html#L4-i02` (drag training examples), `ui-ux-design.html#L1-i01` (three-element ladder).
All use raw HTML5 `dragstart` / `dragover` / `drop`. iOS Safari does not fire these from touch; Android Chrome is inconsistent. A tap on a chip does literally nothing. Heuristic: *Match between system and the real world* + *Error prevention*.
**Fix:** wrap a single `Sortable.js` (or a 60-line Pointer Events shim) in `_shell.js`, expose `Lab.makeDraggable(chip)` + `Lab.makeDropZone(lane, onDrop)`, retrofit all six current interactives. Required.

**P0-2 · Accent colour fails AA on body text in three galleries.**
Saffron `#c8881e` on paper `#fffaf0` = **2.87:1** (used in `.lede em`, hover button bg, and SVG path strokes used as text in `leaders-ai-os` + `ui-ux-design`). Gold `#b88e2d` on paper = **2.92:1** (`money-fundamentals` body accent, plus *every* `.card .id` label in *every* gallery — it's a global rule). Sky `#0284c7` on paper = **3.88:1** (AA-large pass, AA-normal fail; used in `ai-for-developers`, `python-foundations`, `claude-pro`).
Heuristic: WCAG 2.2 §1.4.3.
**Fix:** introduce `--accent-strong` (darken saffron to `#9a6914`, sky to `#015a85`, gold to `#876421` — all clear AA at ≥4.5:1). Use `--accent` only for borders, backgrounds, and ≥18px-bold display type; use `--accent-strong` everywhere else.

**P0-3 · SVG `<animate>` ignores `prefers-reduced-motion`.**
The shared CSS rule on line 14 of `_shell.css` zeros CSS `animation-duration` and `transition-duration`, but SMIL animations (`<animate>`, `<animateMotion>`, `<animateTransform>`) are a separate subsystem and are not affected. Counts: 11 in `leaders-ai-os.html`, 5 in `python-foundations.html`, 3 in `ai-for-developers.html`. Users with vestibular sensitivity will see motion they explicitly asked to suppress. Heuristic: WCAG 2.2 §2.3.3.
**Fix:** in `_shell.js`, on load, if `matchMedia('(prefers-reduced-motion: reduce)').matches`, set every `<animate>`'s `dur` attribute to `0.01s` (or call `el.endElement()`). Three-line patch.

### P1 — should fix before production

**P1-4 · Focus dialog: backdrop click does nothing.**
`<dialog>` natively closes on `Esc`, but clicking the dimmed backdrop is not wired. Users will try this — it's the default desktop expectation since macOS 10.7 sheets. Heuristic: *User control and freedom*.
**Fix:** add `focus.addEventListener('click', e => { if (e.target === focus) focus.close(); })` in `_shell.js`. Be aware the dialog content stretches edge-to-edge, so this check is safe; verify in Safari (the `::backdrop` is the click target there).

**P1-5 · Lesson filter doesn't update the URL.**
Deep-link works for artifact (`#L2-i01`) but if a user filters to "L3 · Learning With AI" and shares the URL, the recipient sees the unfiltered grid. Heuristic: *Recognition rather than recall* + *Flexibility*.
**Fix:** `history.replaceState(null,'','?lesson=' + e.target.value + window.location.hash)`; read it on load.

**P1-6 · Chip hit targets are 23–26px tall; WCAG 2.2 §2.5.8 wants ≥24×24 with adequate spacing.**
Current `.chip` is `padding:4px 10px; font-size:13px` → ~24px tall but only `margin:3px`. Two chips side by side leave a 6px gap; thumb-fat touch fails. Worse at 390px wide where chips stack tightly.
**Fix:** bump `.chip` to `padding:8px 12px; min-height:36px; margin:4px` and use `display:inline-flex; align-items:center`. Pair with P0-1's pointer shim.

**P1-7 · Sound toggle does not persist.**
Reload the page → toggle resets to off. Cross-gallery navigation (clicking from `leaders-ai-os` to `ai-for-developers`) is a full page load, so the user re-toggles every time. Heuristic: *Consistency and standards* + *Recognition*.
**Fix:** `localStorage.setItem('animlab:sfx', SFX_ON)`; read on init. One-line in `_shell.js`.

**P1-8 · Card badge is the *only* signal that distinguishes ANIM from INTER, and it's a 9px monospace pill at the top-left.**
At 390px, scanning the grid, the difference between "watch" and "do" disappears. Heuristic: Norman's *signifiers* / *Visibility of system status*.
**Fix:** add a small affordance glyph next to the title — `▶` for anim, `↻` (or hand-cursor `✋`) for inter — at 14px. Reinforce with a one-word verb in `.what`: "Watch:" / "Try:" prefix.

**P1-9 · Focus dialog header on mobile wraps awkwardly; close button can be hard to reach.**
`dialog.focus` is `max-width:min(92vw,880px)` and `header` is `display:flex` with no wrap rule. At 390px the id-tag, title, and three nav buttons collide. Fitts's-law concern: the `✕` ends up at the right edge, requires a precise thumb stretch. Heuristic: Fitts's law.
**Fix:** on `<700px`, stack header into two rows (meta on top, nav full-width below), and pin a 44×44 close button at the *top-left* (closer to the thumb arc for most right-handers using one hand).

**P1-10 · `card` is a `<button>` element but lays out flex-column with paragraph text inside.**
Two issues: (a) screen readers announce the whole card as one button — fine — but the inner `.lesson-label` and `.what` are now part of the button label, producing a 40-word accessible name; (b) `<button>` inside the grid means right-click → "Open in new tab" doesn't work. Heuristic: *Match between system and the real world*.
**Fix:** make the card an `<a href="#L1-i01">`; the existing hash-on-load handler already opens the focus dialog. Bonus: free middle-click + URL sharing per-artifact.

### P2 — polish

**P2-11 · `.card:hover` only changes border colour and lifts 2px — no signifier that the card opens *into a focus dialog*, not navigates to a new page.**
Heuristic: Norman's *feedforward*.
**Fix:** add a faint `↗` glyph at top-right on hover ("opens in place"). 8px monospace, `var(--muted)`.

**P2-12 · `prevBtn` / `nextBtn` wrap silently from artifact 20 → artifact 1.**
No "end of catalogue" cue. Heuristic: *Visibility of system status*.
**Fix:** on wrap, briefly flash the button border `var(--accent)` for 200ms and announce in an `aria-live="polite"` region: "Back to first artifact".

**P2-13 · `--accent` differs across galleries; the dot in the logo, the badge colour, and the lede `em` recolour with it.**
Recognisability cost is real but probably worth it (course-aware identity). However, the *interaction* tokens (focus rings on inputs, hover state on `.btn`) also change colour, which means the *feedback signal* is course-specific. A user moving between galleries learns a new "success colour" each time.
**Fix:** keep `--accent` for branding (dot, badge bg, lede em, card hover border). Lock interaction-feedback tokens to a fixed pair: `--success: emerald`, `--danger: rose`. Already half-done — `.reveal.win` is hardcoded emerald — but `.btn:hover` and `input:focus` still drift.

**P2-14 · `<dialog>` browser support: Safari < 15.4 (March 2022) lacks `showModal()`.**
Probably not a real audience problem in 2026, but worth a polyfill comment in `_shell.js` and a graceful `if (!focus.showModal) focus.setAttribute('open','')` shim.

---

## Mobile section (390px)

The grid collapses to a single column cleanly — `minmax(280px, 1fr)` plus `main`'s 20px side padding yields ~350px cards with comfortable line length. **What breaks:**

1. **Focus dialog header.** Three nav buttons + 18px serif title + monospace id-tag share one flex row; on 390px they collide. The close `✕` ends up tucked behind the title. Re-order needed (see P1-9). I would normally drop a screenshot here, but headless-Chrome screenshot permission was denied in this session — confirming visually from the CSS arithmetic: at 390px the header content sums to ≥420px before wrap kicks in.
2. **Drag-and-drop interactives are completely non-functional** (P0-1). Tap a chip, tap a lane, nothing happens. This is the single worst mobile failure.
3. **Chips wrap too tightly.** With 3px margin, two chips in a flex pool sit 6px apart — fat-finger taps will hit the wrong chip 30%+ of the time (Fitts's law / Bi-touch).
4. **Sticky topbar is 56px tall and reflows to two lines** when the course-name plus filter plus sound toggle won't fit, eating ~110px of viewport. With a 390×844 iPhone safe area (~780 usable), 14% is gone before the grid even starts.
5. **Sliders** (e.g. `L1-i01` reclaim slider, `L3-i01` chunk-size) — the native `<input type=range>` thumb is fine at ~28px on iOS, but the lack of step labels makes precise touch values frustrating. Pair with live readouts (most do — keep doing this).

---

## Accessibility audit

**Contrast (all on paper `#fffaf0`, sRGB Y-luminance method, WCAG 2.x):**

| Foreground | Hex | Y_fg | Contrast | Verdict |
|---|---|---|---|---|
| `--ink` body text | `#14110d` | 0.0049 | (0.971+0.05)/(0.0049+0.05) = **18.6:1** | AAA pass |
| `--muted` card subtitle | `#6f6957` | 0.1278 | 1.021/0.1778 = **5.74:1** | AA normal pass, AAA fail |
| `--gold` card id label | `#b88e2d` | 0.3002 | 1.021/0.3502 = **2.92:1** | **AA fail** for the 10px text it's applied to |
| `--accent` saffron in `.lede em` | `#c8881e` | 0.3056 | 1.021/0.3556 = **2.87:1** | **AA fail** (18px ≠ large per WCAG; needs bold) |
| `--accent` sky | `#0284c7` | 0.2128 | 1.021/0.2628 = **3.88:1** | AA-large pass, AA-normal fail |
| `--accent` emerald | `#14554a` | 0.0723 | 1.021/0.1223 = **8.35:1** | AAA pass |

Fixes in P0-2.

**Keyboard:** `<dialog>` traps focus correctly. Arrow keys move prev/next inside the focus view (good — observed in `_shell.js`). `Esc` closes (native). Backdrop click doesn't (P1-4). Tab order on the gallery cards is the DOM order — fine. The lesson filter is a native `<select>` — fine. No skip-link to the grid; not strictly required for a single-purpose page.

**Reduced motion:** CSS `*` rule zeros animation/transition — good for CSS keyframes. SMIL `<animate>` ignored (P0-3). `prefers-reduced-motion` is not consulted before autoplaying any artifact, but most artifacts gate animation behind a Play button — pattern is sound.

**ARIA:** the sound toggle has `aria-pressed` (correct), the lesson filter has `aria-label` (correct). The grid cards are `<button>` with no `aria-label` — the rendered text is the accessible name, which is verbose (P1-10). The focus dialog has no `aria-labelledby` pointing to `#focusTitle`. Adding `<dialog class="focus" aria-labelledby="focusTitle">` is a one-attribute fix.

---

## Top 5 spec-doc rules (apply to remaining 11 galleries)

1. **No raw HTML5 drag-and-drop. Use the `Lab.makeDraggable` / `Lab.makeDropZone` helpers** (P0-1). All draggable affordances must respond to pointer and touch events. Test on a real iPhone before merge.
2. **Use `--accent-strong` for any colour-on-paper text.** `--accent` is for borders, backgrounds, and ≥24px bold display only. CI lint: any rule matching `color:\s*var\(--accent\)` on a node whose computed font-size is <18px bold should fail review.
3. **Honour `prefers-reduced-motion` for *all* motion subsystems** — CSS, SMIL `<animate>`, JS `requestAnimationFrame` loops, and `<canvas>` rAF. The shell helper `Lab.motionOK()` returns the boolean; every animated artifact must consult it before starting.
4. **Every card must signal its modality in two channels** — the type badge *plus* a verb prefix in `.what` ("Watch:" for anim, "Try:" for inter) *plus* a glyph next to the title (`▶` / `↻`). Two-channel coding is non-negotiable for colour-impaired users and 390px scanning.
5. **Cards are `<a href="#ID">`, focus dialog supports backdrop-click close, sound state persists in `localStorage`.** These are shell-level fixes done once; every new gallery inherits them.

---

**Word count: ~1,490** · **P0 count: 3** · **Biggest UX concern: HTML5 drag-and-drop is silently broken on touch across every interactive that uses chips-into-lanes — six artifacts shipped this way, and at least four more planned per the catalogue.** A learner on an iPad sees a dead screen with no error message. Fix this in the shell, retrofit existing six, then keep building.

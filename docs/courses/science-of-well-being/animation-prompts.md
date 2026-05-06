# Science of Well-Being — animation prompts

Five self-contained HTML animations, one per lesson. Generated externally (Gemini 3 Pro / Claude Opus / GPT), then dropped into:

```
public/courses/science-of-well-being/anim/<file>.html
```

The exact filenames the course JSON expects:

| # | Lesson | File |
|---|---|---|
| 1 | Miswanting | `miswanting-photographer.html` |
| 2 | Hedonic Adaptation | `thermostat-curve.html` |
| 3 | G.I. Joe Fallacy | `four-part-rewire.html` |
| 4 | Two Cheat Codes | `gratitude-vs-connection.html` |
| 5 | Wellbeing Diagnostics | `14-day-experiment.html` |

Optional poster fallback at `<file>-poster.png` for offline rendering.

---

## How to use these prompts

1. Open Gemini 3 Pro (or your preferred model).
2. Paste the **system style preamble** below in the system prompt slot (or as the first user message).
3. Paste the **lesson-specific prompt** for the animation you want.
4. Save the model's reply verbatim as the file named in the table above.
5. Open the file directly in a browser to verify it renders. Then drop it under `/public/courses/science-of-well-being/anim/`.

---

## System style preamble (use for every prompt)

```
You are producing a single self-contained HTML animation for the Krit LMS.

VISUAL STYLE
- Picture-book pop meets science textbook. Vivid but earthy. Studio Ghibli + The New Yorker.
- Palette: warm desaturated backgrounds (#FFF7ED, #FAF5FF, #ECFDF5, #EFF6FF, #FEF3C7). Accents from #F59E0B, #10B981, #0EA5E9, #8B5CF6, #F43F5E. Ink #1F2937, never pure black.
- Typography: system-ui, -apple-system, "Inter", sans-serif. Numbers in ui-monospace.
- Stroke: 2-3 px solid, round caps. Rounded corners on rects (rx 8-14).
- Mood: dry-funny, gentle, scientifically honest. Captions OK to be wry.
- Avoid: neon glow, drop shadows on text, generic UI mockups, particle effects, photorealism, springy bouncy easing.

TECHNICAL CONTRACT
- Single HTML file. All CSS + JS inline. Zero network calls. No external CDN, fonts, images.
- Vanilla SVG + CSS keyframes (or one requestAnimationFrame loop). No React, three.js, GSAP, anime.js, no build step.
- Sandboxed iframe context: no localStorage, no cookies, no window.location writes, no console.log.
- Width responsive 320-900 px. Use viewBox-based SVG.
- aria-label on root <svg>. Respect @media (prefers-reduced-motion: reduce) — collapse to instant state changes.
- Easing: cubic-bezier(0.22, 0.61, 0.36, 1). 8-15 second runtime. Loops cleanly OR has a small reset button bottom-right.
- File size under 80 KB.

OUTPUT FORMAT
Reply with the full HTML file only. First character must be "<", last character must be ">". No prose, no markdown fence, no commentary.
```

---

## Prompt 1 — Miswanting (the wedding photographer)

**Filename:** `miswanting-photographer.html`

```
SUBJECT: The "wedding photographer with a broken memory card" mental model.

STORY
A cartoon brain holding a camera. The brain is friendly, slightly tired-looking. Over 12 seconds, the brain experiences a life event (e.g. buying a phone) and tries to remember it. But the camera's memory card slot is empty. Only two filmstrips get saved — labelled "PEAK" and "END" — and they get pinned to a corkboard on the right. Everything else falls into a wastebasket beside the brain.

STAGES (each 1.5-2.5s, with brief pauses)
1. Title card: "Your brain remembering yesterday." Subtitle smaller: "(allegedly)"
2. Scene fades in: brain holding camera, blank memory slot pulsing softly red. A row of 8 small filmstrips (the day's moments) line up above the brain.
3. The camera flashes once — a frame "PEAK" detaches and floats to the corkboard, getting pinned with a tiny tack animation.
4. The camera flashes again — a frame "END" detaches and joins it.
5. The remaining 6 filmstrips dim and fall, one by one, into a wastebasket — bonk, bonk, bonk, with the bin lightly bouncing.
6. Caption fades in below: "Two frames out of eight. The other six become the future you forgot to plan for."
7. Soft loop: filmstrips reappear at top, cycle restarts.

EMOTIONAL TONE
Wry, gentle, slightly fatalistic. The brain should look like it's doing its best. This is not a tragedy; it's a feature being misused.

INTERACTIVITY
None. Auto-loop. Optional reset button bottom-right. Total ~12s.
```

---

## Prompt 2 — Hedonic Adaptation (the thermostat)

**Filename:** `thermostat-curve.html`

```
SUBJECT: The happiness thermostat with setpoint 7. External events push it; it resets.

STORY
Left half: a round thermostat dial labelled "happiness" with markings 0-10, needle resting at 7. Right half: a line chart titled "happiness over 90 days" with the same y-axis 0-10 and an x-axis 0-90 days. Three sequential events demonstrate symmetric adaptation.

STAGES (~14s total)
1. Title card: "The thermostat in your skull."
2. EVENT A (positive): a small phone icon flies in from the left. Thermostat needle swings up to 9 (smooth ease, ~600ms). The chart simultaneously plots a sharp upward spike to 9 around day 7. Caption: "Big new purchase."
3. ADAPTATION A: needle gently glides back to 7 (~2s). Chart line decays back to 7 by day 30. Caption updates: "Back to baseline by day 30."
4. EVENT B (negative): a small storm cloud icon flies in. Needle swings down to 4. Chart plots downward spike around day 45. Caption: "Bad week at work."
5. ADAPTATION B: needle returns to 7 over ~2s. Chart decays back. Caption: "Symmetric. The thermostat doesn't care which direction."
6. EVENT C (variety): three small icons (coffee, walk, friend) flicker in sequentially. Needle nudges to 7.5 and stays slightly elevated. Chart shows a gentle, sustained rise from day 60 to 90. Caption: "Variety nudges the setpoint, not just the dial."
7. End card: "Setpoint changes are slow. Dial swings are fast. Don't confuse them."
8. Loop after 1.5s pause.

VISUAL DETAILS
- Thermostat: white face, 3 px stroke, dial in #0E7490, needle in #F43F5E. Tick marks at 0, 5, 10. Subtle glow when needle is moving.
- Chart: 2 px line in #0EA5E9. Light grid lines. Y-axis baseline at 7 marked with a dashed gray line.
- Event icons: 28 px round badges, simple SVG glyphs, color-coded.

INTERACTIVITY
None. Auto-loop with a tiny reset button bottom-right. Total ~14s.
```

---

## Prompt 3 — G.I. Joe Fallacy (the 4-part rewire)

**Filename:** `four-part-rewire.html`

```
SUBJECT: The 4-part habit rewire executed end-to-end on a "walk every morning" example, with a 'before' (failed) version and an 'after' (succeeded) version.

STORY
Split-screen across two side-by-side phone-shaped frames. Left frame: a person trying and failing to walk. Right frame: the same person succeeding using the 4-part rewire.

STAGES (~15s total)

LEFT FRAME, the failed loop (parallel to the right frame; shows what doesn't work):
- Person in bed at 6:30 am. Alarm rings. They reach for phone, get sucked into Instagram, fall asleep. Caption: "Vague intention, no cue, no friction reduction. Doer ignores the memo."

RIGHT FRAME, the succeeded loop (the meat of the animation, longer dwell time):
1. Cue: alarm rings at 6:30 am. The phone is across the room — they have to get up. Caption beat: "1. Cue: alarm OFF → physical movement."
2. Friction reduction: shoes appear neatly placed by the door. Walking clothes are draped on a chair. Caption: "2. Friction reduction: -3 (clothes, shoes, phone in another room)."
3. Tiny first step: the person walks to the doorway. Speech bubble: "Goal: cross the doorway." A small green checkmark appears. Caption: "3. Tiny first step: cross the doorway. That's it."
4. Inertia + accountability: outside, they walk for 15 min. They text a friend a 👍. A physical wall calendar gets a tick mark. Caption: "4. Accountability + log: streak is the dopamine."

End card across both frames: "Same person. Same alarm. Different design."

VISUAL DETAILS
- Two phone-shaped frames, each ~280 px wide, side by side on desktop, stacked on mobile.
- Person rendered as a simple 8-frame stick-figure with rounded head; consistent across both frames.
- Color cue: left frame slightly desaturated; right frame slightly warmer.
- Each numbered step in the right frame gets a small numbered chip in the top-left corner: 1, 2, 3, 4.

INTERACTIVITY
A small reset button bottom-right. Animation auto-loops once, then pauses; reset to play again. Total ~15s.
```

---

## Prompt 4 — Two Cheat Codes (gratitude vs connection)

**Filename:** `gratitude-vs-connection.html`

```
SUBJECT: A two-track timeline showing a 10-week structured gratitude practice on top and a 4-week engineered friendship plan on the bottom. Both produce visible improvements; the animation makes the *mechanism* of each visible.

STORY
Two horizontal tracks, parallel. Top track: a notebook page that fills, week by week, with three specific entries each Sunday for 10 weeks. Bottom track: a calendar that fills with engineered social events across 4 weeks.

STAGES (~13s total)

TOP TRACK — gratitude (Sundays 1-10):
- A blank notebook is centered. The week counter at top-left ticks: "Sunday 1," "Sunday 2," etc.
- Each Sunday, three short ink-style handwritten lines appear with a tiny pen-stroke animation. Each entry is short and unique (the model can fabricate plausible specific entries).
- A small "well-being score" gauge to the right of the notebook ticks up gently from 7.0 to 7.6 across the 10 weeks (very gradual, NOT a hockey stick).

BOTTOM TRACK — friendship engineering (4 weeks):
- A blank weekly calendar grid.
- Week 1: a single contact added to a "5 close people" list. Caption beat: "The audit."
- Week 2: a "no-agenda message" speech bubble appears, lights up, sends. Caption beat: "The opener."
- Week 3: a recurring slot appears on Tuesdays at 8 pm, in green. Caption beat: "The cadence."
- Week 4: an icon of two heads in conversation, with a small "vulnerability" sparkle effect (subtle, not glittery). Caption beat: "The depth move."

End card spans both tracks: "Boring on the surface. Index-fund returns underneath."

VISUAL DETAILS
- Notebook on top is on a #FAF5FF background; calendar on bottom is on a #ECFDF5 background. Subtle horizontal divider.
- Use a friendly faux-handwriting style for the gratitude entries — DO NOT load an external font. Use an SVG path style or a CSS letter-spacing + skew trick to fake handwriting.
- The well-being gauge is a small circular dial at right; needle moves smoothly.

INTERACTIVITY
None. Auto-loop. Reset button bottom-right. Total ~13s.
```

---

## Prompt 5 — Wellbeing Diagnostics (the 14-day experiment)

**Filename:** `14-day-experiment.html`

```
SUBJECT: A complete 14-day intervention loop visualized as a horizontal track with three measurement points (day 0, day 7, day 14) and a decision step on day 15.

STORY
A horizontal axis labelled days 0-15. Three labelled measurement points (day 0, day 7, day 14). Between them, a colored "intervention bar" fills in over time. Three small numeric tiles above the track represent the 3 numbers (PANAS+, Cantril, Sleep). The tile values change at each measurement point.

STAGES (~14s total)

1. Title card: "The 14-day loop."
2. Day 0 — baseline: numeric tiles materialize with their day-0 values. Cantril 6, PANAS+ 14, Sleep 7.2. A vertical drop line marks day 0 in green.
3. Days 1-6: the intervention bar fills in green, with a faint repeating motif (e.g. tiny calendar ticks). The tiles do NOT change yet.
4. Day 7 — mid-check: a yellow vertical line marks day 7. Tiles update with subtle motion: Cantril 6.5, PANAS+ 17, Sleep 7.0. A small caption: "Mid-check. Resist adding a second intervention."
5. Days 8-13: bar continues to fill.
6. Day 14 — final check: a green vertical line marks day 14. Tiles update again: Cantril 7, PANAS+ 19, Sleep 6.8. The Sleep tile briefly turns amber to flag the slight drop.
7. Day 15 — decision: a card slides up with three options: Keep / Modify w/ guardrail / Drop. The "Modify with sleep guardrail" option highlights. Caption: "2 of 3 numbers improved; sleep dropped. Modify, don't drop."
8. End card: "Single intervention. Two real measurements. One decision."
9. Loop after 1.5s pause.

VISUAL DETAILS
- Track height ~80 px, full width minus margins. Day labels every other day, tick marks below.
- Tiles 90x90 px, white with thick #0369A1 stroke; one number large in the center, label small below.
- Vertical measurement lines have a small flag at the top with the day number.
- Color rules: improvements in #10B981, regressions in #F43F5E, no-change in #6B7280.

INTERACTIVITY
None. Auto-loop. Reset button bottom-right. Total ~14s.
```

---

## After generation — installation checklist

For each generated file:

- [ ] Save it under `/public/courses/science-of-well-being/anim/<filename>.html`
- [ ] Open `http://localhost:3000/courses/science-of-well-being/anim/<filename>.html` directly in a browser to verify it loads
- [ ] Open the lesson page (`/learn/science-of-well-being/...`) and verify the animation appears in the iframe
- [ ] If it doesn't fit the height, edit the JSON's `embedAnimation.height` field and re-import
- [ ] Optionally, capture a poster frame and save it as `<filename>-poster.png` for the fallback

# PLAN — Lesson Player: Swipe Nav + Game Sounds + Emotion Block Types
Status: DONE
Owner: [developer]
Created: 2026-05-08

## Goal

Upgrade the section-by-section LessonPlayer to feel native on mobile (swipe navigation, top-anchored progress dots), add programmatic game sound effects to interactive blocks via Web Audio API, and introduce six new emotion-driven content block types (hotspotReveal, timedChallenge, xpMoment, branchScenario, revealCard, skillProof) into the typed content schema and renderer.

---

## Files to modify

| File | Why |
|---|---|
| `src/components/lesson/lesson-player.tsx` | Add touch swipe handlers, reposition progress dots to top, mobile full-screen-ish layout, wire `useGameSound` on section transition |
| `lib/content/blocks.ts` | Add six new Zod block schemas + add them to the `ContentBlock` discriminated union |
| `src/components/lesson/block-renderer.tsx` | Add `case` branches for all six new block types; lazy-load heavy ones; pass sound callbacks into interactive blocks |
| `src/components/lesson/blocks/embed-animation-block.tsx` | No change required — narration audio already handled separately; no game sound needed here |

---

## Files to create

| File | Purpose |
|---|---|
| `src/hooks/use-game-sound.ts` | Web Audio API hook — exposes `playSound(event)` where event is `'correct' \| 'wrong' \| 'achievement' \| 'transition' \| 'click'`. Each tone is a short programmatic synth (no files). Returns no-op if `AudioContext` is unavailable (SSR / old browser). |
| `src/components/lesson/blocks/hotspot-reveal-block.tsx` | Renders an `<img>` or inline SVG with absolutely-positioned clickable hotspot zones; each zone reveals a tooltip/popover on click |
| `src/components/lesson/blocks/timed-challenge-block.tsx` | Quiz-like question with countdown timer; awards partial credit for slow correct answers; plays `correct`/`wrong` sounds |
| `src/components/lesson/blocks/xp-moment.tsx` | Overlay/badge component (not a block itself) — shown by quiz and boss-battle after a correct answer; XP number pops up with motion/react animation and streak counter |
| `src/components/lesson/blocks/branch-scenario-block.tsx` | Inline Twine-style branching story (3–5 nodes); each node has prompt + 2–3 choices pointing to next node IDs; renders current node only; plays `click` sound on choice |
| `src/components/lesson/blocks/reveal-card-block.tsx` | Flip-card: front = provocative claim, back = nuanced truth; CSS 3D flip on click/tap; plays `achievement` sound on reveal |
| `src/components/lesson/blocks/skill-proof-block.tsx` | "Prove it" wrapper around a `tryIt`-style textarea; rule-based eval against `expected` pattern; on pass renders badge unlock with `xpMoment` overlay; plays `achievement` sound |

---

## Implementation steps

### Phase A — Mobile swipe navigation

1. **Create `src/hooks/use-swipe.ts`** — a minimal hook that attaches `touchstart`/`touchend` listeners to a ref, returns `{ onSwipeLeft, onSwipeRight }` callbacks. Threshold: 50 px horizontal delta, vertical drift guard (reject if |dy| > |dx|). No dependency. Pure DOM, no library. Under 40 lines.

2. **Modify `lesson-player.tsx` — move progress dots to the top** — lift the dots `<div>` above `LessonMetaBar` so they pin at the very top of the player on mobile. On `md+` screens keep current layout. Tailwind only, no inline styles. This is purely a JSX reorder.

3. **Modify `lesson-player.tsx` — mobile full-screen-ish layout** — wrap the outer `<div>` in `min-h-[calc(100dvh-4rem)]` on mobile so the stage fills the screen. Add `pb-safe` (Tailwind `pb-[env(safe-area-inset-bottom)]`) so iOS bottom bar is respected. Only applies below `md` breakpoint.

4. **Modify `lesson-player.tsx` — wire swipe handlers** — attach `useSwipe` to `stageRef`. `onSwipeLeft` calls `go(1)`, `onSwipeRight` calls `go(-1)`. The existing Prev/Next buttons remain — swipe is additive, not a replacement. On last section a left-swipe does nothing (already guarded by `go`).

5. **Modify `lesson-player.tsx` — play transition sound** — after importing `useGameSound`, call `playSound('transition')` inside the `go` function whenever the index actually changes (guard with `if (i + delta !== i)`). This makes every section step feel tactile.

6. **Smoke-test Phase A** — verify on Chrome DevTools mobile emulation: swipe triggers navigation, dots are at top, footer nav buttons still work, tutor FAB is not obscured.

---

### Phase B — Web Audio game sound system

7. **Create `src/hooks/use-game-sound.ts`** — implement `useGameSound()` hook:
   - Returns `playSound(event: SoundEvent)` where `SoundEvent = 'correct' | 'wrong' | 'achievement' | 'transition' | 'click'`.
   - Lazily creates one `AudioContext` per mount (stored in a module-level singleton ref so multiple callers share one context, avoiding the "too many contexts" browser limit).
   - Each sound is synthesised inline with `OscillatorNode` + `GainNode`:
     - `correct` — short rising two-tone (220 Hz → 440 Hz, 0.12 s, sine)
     - `wrong` — descending buzz (300 Hz → 180 Hz, 0.15 s, sawtooth, gain 0.3)
     - `achievement` — three-note ascending arpeggio (261, 329, 392 Hz, 80 ms each, triangle)
     - `transition` — subtle click (800 Hz, 0.04 s, sine, gain 0.15)
     - `click` — even shorter click (600 Hz, 0.03 s, sine, gain 0.1)
   - Returns a no-op function when `typeof AudioContext === 'undefined'` (SSR guard). No mp3 files. No network requests. Works offline.
   - Function body under 40 lines — each tone is a one-shot helper `playTone(ctx, freq, duration, type, gain)` extracted to keep the switch under the limit.

8. **Wire `useGameSound` into `InlineQuiz`** (inside `block-renderer.tsx`) — import the hook; call `playSound('correct')` or `playSound('wrong')` in the `setSubmitted(true)` handler after computing `isCorrect`. This is the highest-frequency interactive block.

9. **Wire sound into `BossBattleBlock`** — add `useGameSound` to `boss-battle-block.tsx`; call `playSound('correct')` / `playSound('wrong')` in `pick()`; call `playSound('achievement')` when `done` transitions to true (use a `useEffect` on `done`).

10. **Wire sound into `SortableStepsBlock`** — open `sortable-steps-block.tsx`, add `useGameSound`; call `playSound('correct')` / `playSound('wrong')` when the learner submits their order. Read the file before editing.

11. **Wire sound into `ChatScenarioBlock`** — add `useGameSound` to `chat-scenario-block.tsx`; call `playSound('click')` on chip selection, `playSound('correct')` or `playSound('wrong')` on reveal. Read the file before editing.

---

### Phase C — Emotion-driven block types

12. **Extend `lib/content/blocks.ts` — add six new Zod schemas** before the `ContentBlock` discriminated union:

    ```ts
    export const HotspotRevealBlock = z.object({
      type: z.literal("hotspotReveal"),
      src: z.string(),           // image path (public/)
      alt: z.string(),
      width: z.number().int().min(120).max(1920).default(800),
      height: z.number().int().min(120).max(1080).default(450),
      hotspots: z.array(z.object({
        id: z.string(),
        xPct: z.number().min(0).max(100),  // % from left
        yPct: z.number().min(0).max(100),  // % from top
        label: z.string(),
        body: z.string(),                  // markdown tooltip
      })).min(1).max(20),
    });

    export const TimedChallengeBlock = z.object({
      type: z.literal("timedChallenge"),
      prompt: z.string(),
      choices: z.array(z.object({
        id: z.string(),
        label: z.string(),
        correct: z.boolean(),
      })).min(2).max(6),
      timeLimitSec: z.number().int().min(5).max(120).default(30),
      // Credit tiers: full if answered within fastSec, partial if within timeLimitSec
      fastSec: z.number().int().min(3).max(60).default(10),
      fullPoints: z.number().int().min(1).max(10).default(3),
      partialPoints: z.number().int().min(0).max(9).default(1),
    });

    export const XpMomentConfig = z.object({
      type: z.literal("xpMoment"),
      xp: z.number().int().min(1).max(500).default(10),
      label: z.string().optional(),        // e.g. "Nice work!"
    });
    // Note: xpMoment is a UI overlay, not a standalone block.
    // Authors include it inside quiz/boss-battle via an optional xpConfig field.
    // It is in the union so the renderer type-checks but GroupIntoSections skips it.

    export const BranchScenarioBlock = z.object({
      type: z.literal("branchScenario"),
      title: z.string().optional(),
      startNodeId: z.string(),
      nodes: z.array(z.object({
        id: z.string(),
        body: z.string(),                  // markdown
        choices: z.array(z.object({
          id: z.string(),
          label: z.string(),
          nextNodeId: z.string().optional(), // absent = terminal
          outcome: z.string().optional(),    // shown if terminal
        })).min(1).max(4),
      })).min(2).max(10),
    });

    export const RevealCardBlock = z.object({
      type: z.literal("revealCard"),
      front: z.string(),   // provocative claim
      back: z.string(),    // nuanced truth (markdown)
      hint: z.string().optional(),
    });

    export const SkillProofBlock = z.object({
      type: z.literal("skillProof"),
      skill: z.string(),              // skill name label
      instruction: z.string(),
      starter: z.string().optional(),
      // Rule-based eval: the learner's trimmed answer must match this regex (case-insensitive).
      // When absent, a "Show reference answer" path is used instead.
      evalPattern: z.string().optional(),
      referenceAnswer: z.string().optional(),
      badgeLabel: z.string().default("Skill unlocked"),
    });
    ```

    Add all six to the `ContentBlock` discriminated union array.

13. **Create `src/hooks/use-game-sound.ts`** (already listed in Phase B, step 7 — Phase C depends on it being in place).

14. **Create `src/components/lesson/blocks/hotspot-reveal-block.tsx`** — relative-positioned container with `<img>`, map over `hotspots`, render each as an absolutely-positioned `<button>` using `left: xPct%`, `top: yPct%`. On click, toggle a popover showing `label` + markdown `body`. Use a `useState<string | null>` for active hotspot id. Close on outside-click via a backdrop div. No external popover library needed — a positioned `<div>` is sufficient and keeps the bundle slim. Play `playSound('click')` on hotspot activation.

15. **Create `src/components/lesson/blocks/timed-challenge-block.tsx`** — similar structure to `InlineQuiz` but adds a countdown `useEffect` (`setInterval`, 1 s tick). Timer starts on mount, ends on answer or time expiry. Compute credit tier in the submit handler. Show elapsed-time feedback after answer. Play `correct`/`wrong` sounds. Tailwind only; animate the timer bar with `transition-[width]` on a `<div style={{ width: ... }}` — inline style is justified here (dynamic percentage from state) and is the sole exception in this plan; document the justification inline.

16. **Create `src/components/lesson/blocks/xp-moment.tsx`** — an overlay `<div>` that renders conditionally. Accepts `{ xp, label, streakCount }`. Uses `motion/react` `AnimatePresence` + `motion.div` for a pop-up-and-fade-out animation. Renders a badge chip `+{xp} XP` and a streak counter if `streakCount > 1`. Auto-dismisses after 2.2 s. This is a presentational component consumed by quiz, boss-battle, and skill-proof — not registered as a block-renderer case.

17. **Create `src/components/lesson/blocks/branch-scenario-block.tsx`** — `useState<string>` for current node ID, initialized to `startNodeId`. Render the current node's `body` (markdown) and its choices as buttons. On choice click: if `nextNodeId` exists, advance to it; else show `outcome` text and a "Restart" button. Play `playSound('click')` on each choice. Keep all node lookup in a `useMemo`-derived map. Under 40-line component body — extract `NodeView` sub-component.

18. **Create `src/components/lesson/blocks/reveal-card-block.tsx`** — `useState<boolean>` for flipped state. Outer div uses `perspective-[1000px]`. Inner div uses `transform-style-preserve-3d` via Tailwind arbitrary `[transform-style:preserve-3d]`. Front and back faces use `backface-hidden`. On click: toggle flipped, play `playSound('achievement')`. The inline `transform: rotateY(180deg)` on the inner div is a single dynamic style justified by the 3D-flip mechanic (no Tailwind equivalent for runtime rotation value); document inline.

19. **Create `src/components/lesson/blocks/skill-proof-block.tsx`** — renders a `<textarea>` with instruction. On "Submit proof" click: if `evalPattern` is set, test the trimmed answer against `new RegExp(evalPattern, 'i')`; if match → show `XpMoment` overlay + badge unlock state; play `playSound('achievement')`; if no match → play `playSound('wrong')` + show retry hint. If no `evalPattern`, show `referenceAnswer` in a "Compare your answer" expand panel. Keep eval logic in a pure helper `evalAnswer(answer: string, pattern: string): boolean` in the same file.

20. **Add all six new cases to `block-renderer.tsx`** — add imports for each new block component (lazy-load `BranchScenarioBlock` and `SkillProofBlock` via `dynamic()` as they are heavier; the others are small enough to eager-import). Add `case` branches to the `BlockOne` switch. Add `case "xpMoment": return null` since it is a UI overlay, not a standalone renderable.

21. **Update `groupIntoSections` in `lesson-player.tsx`** — add handling for `branchScenario`, `skillProof`, `hotspotReveal`, `timedChallenge`, and `revealCard` block types so they each get their own section when they appear (same pattern as `bossBattle`). Add `xpMoment` to the skip list alongside `lessonMeta`.

22. **TypeScript and lint pass** — run `npm run typecheck` and `npm run lint`. Fix any type errors. Confirm discriminated union exhaustiveness is preserved (TypeScript will error on the switch if a case is missing).

---

## Risk / rollback

- **Risk: `AudioContext` creation on first interaction is blocked by browser autoplay policy.** Game sounds are always triggered by a user gesture (button click, swipe), so this is safe by spec. However, iOS Safari has been known to require the context to be created inside a touch handler. The hook's lazy-init (context created on first `playSound` call, which is always inside a handler) mitigates this.
- **Detection:** Open the lesson on iOS Safari; verify sounds play on the first quiz submit without a console warning about `AudioContext` state.
- **Risk: Touch swipe conflicts with vertical scroll on mobile.** The drift guard (reject if |dy| > |dx|) in `useSwipe` prevents vertical scrolls from triggering navigation. If content inside the stage is horizontally scrollable (e.g. a wide code block), the 50 px threshold may cause false positives.
- **Detection:** Test a lesson with a wide `<code>` block on mobile; confirm horizontal code scrolling is not hijacked.
- **Risk: New Zod discriminated union variants break `LessonBlocks.parse()` on lessons that contain legacy-only blocks.** This is additive-only; existing block JSON does not include new type literals, so parse is unaffected. However, if any seed data or fixture contains a block with one of the six new type strings that does not yet conform to the new schema, it will throw. Audit seed data.
- **Detection:** `npm run db:seed` completes without Zod parse errors.
- **Risk: `revealCard` and `timedChallenge` use two justified inline styles.** These are the only two exceptions. They are documented inline. A future Tailwind v4 upgrade may provide dynamic `rotate` utilities, at which point the inline style can be removed.
- **Rollback:** All changes are additive (new files, new switch cases, new Zod variants). To roll back any phase independently: remove the new cases from the discriminated union and `BlockOne` switch, delete the component files, and revert the `lesson-player.tsx` changes. No database migration is involved. No API contract changes.

---

## Out of scope

- Expanding `PLAYER_PILOT_SLUGS` — the developer decides rollout; this plan does not touch that set.
- Authoring UI for any new block type — JSON authoring only, matching the existing pattern.
- Persisting XP or streak state to the database — `xpMoment` is a UI-only overlay; real XP ledger integration is a separate feature.
- Narration audio for new block types — existing `audioSrc` on `embedAnimation` is the audio pattern; new blocks do not add audio file dependencies.
- Any change to the legacy (non-pilot) lesson page layout.
- `branchScenario` multiplayer or cloud-saved state — choices are ephemeral per session.
- External drag library for `hotspotReveal` — hotspot pins are click-only, not draggable.
- AI-based eval for `skillProof` — regex eval only in this plan; AI eval is a future extension point.

---

## Open questions

1. **`timedChallenge` inline style exception** — the timer bar requires a dynamic `width` percentage driven by React state. The only Tailwind-clean alternative is `@property` CSS custom property or a CSS variable set via a data attribute; both require non-trivial workarounds. Should we accept the single inline style (with comment) or use a CSS variable approach?
2. **`revealCard` 3D flip** — the CSS 3D flip needs `rotateY(180deg)` applied conditionally from state. This cannot be expressed in static Tailwind classes. Same question as above: accept one inline style with comment, or use a `data-flipped` attribute + `[@data-flipped=true]:rotate-y-180` arbitrary variant?
3. **`xpMoment` streak counter source** — the `XpMoment` component accepts `streakCount` as a prop, but there is no client-side streak state currently. Should streak be derived from the number of consecutive correct answers within the session (ephemeral, no DB), or deferred until the XP ledger integration is done? If ephemeral: `QuizBlock` and `BossBattleBlock` would need a shared session counter (Zustand or lifted state in `LessonPlayer`).
4. **`hotspotReveal` accessibility** — hotspot buttons need `aria-haspopup` and `aria-expanded`. The popover should be reachable by keyboard (Tab to each hotspot, Enter/Space to open, Escape to close). Should we accept that the first version is click-only with ARIA labels, with full keyboard nav as a follow-up, or build keyboard nav in step 14?
5. **Sound volume / user preference** — should there be a global mute toggle for game sounds (separate from the narration mute already in `embed-animation-block.tsx`)? Suggested location: a small speaker icon inside `LessonPlayer`'s top bar. Not in scope unless the developer confirms it.

---

<!-- Previous completed plans are preserved below this line -->

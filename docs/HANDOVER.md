# Handover — Krit, project-docs-v6

_Written 2026-05-08 by the previous Claude Code session. Read this after CLAUDE.md and STACK.md._

## What you're picking up

Krit is a skill-first LMS for India. Repo state today:

- 15 courses, 75 lessons, ~150 animations, 75 student-style HTML notes, 75 bossBattle + fieldNotes pairs
- Block types defined as a Zod discriminated union in `lib/content/blocks.ts` — heading, markdown, callout, code, image, video, quiz, tryIt, reflect, keyTakeaways, animatedTimeline, sortableSteps, joinExplorer, sqlPlayground, remotion, svgFigure, culturalAside, embedAnimation, chatScenario, lessonMeta, bossBattle, fieldNotes
- Auth is `iron-session` cookie (PROVISIONAL — swap to Clerk/SSO before production)
- Authoring UI is read-only; courses today are JSON → `npx tsx prisma/seed/import-course.ts <file>`

## Open question for the user

**Does the new `LessonPlayer` layout earn rollout?** The user piloted the section-by-section player + AI drawer for `leadership-in-age-of-ai` only. They will tell you whether to expand or refine. Don't assume rollout. The gate is one set in `src/app/(learner)/learn/[pathSlug]/[lessonSlug]/page.tsx`:

```ts
const PLAYER_PILOT_SLUGS = new Set(["leadership-in-age-of-ai"]);
```

To roll out: add slugs to the set. To roll back: remove from the set; legacy layout takes over with no other changes.

## Pilot — what's different about leadership-in-age-of-ai

1. **Section-by-section player** (`src/components/lesson/lesson-player.tsx`). Splits a lesson into sections by `heading` blocks, with dedicated sections for fieldNotes / bossBattle / "Wrap up" (keyTakeaways + reflect). Progress dots, prev/next nav, lessonMeta sticky at top.
2. **AI tutor as a drawer**. Big "Ask Atlas" pillar on desktop (right side), FAB on mobile. Click opens a slide-in drawer wrapping the existing `TutorSidebar`. Esc + backdrop close it.
3. **Animation narration audio**. 10 mp3s under `public/audio/leadership-in-age-of-ai/anim/` — voiced via macOS `say -v Aman` (en_IN). Wired through new `audioSrc` field on `embedAnimation` blocks. Each animation has a play-overlay that doubles as the gesture that unlocks audio (browsers block autoplay-with-sound).
4. **Reduced interaction repetition**. Removed 3 of 5 `sortableSteps` (from L1, L3, L5) — those lessons already had a `chatScenario` and the ranking content was artificial. L2 and L4 keep theirs because the ordering is genuinely sequential.

## Bug fixes that apply to all 15 courses

These shipped before the pilot work and aren't pilot-gated:

- **Auto-scroll on lesson load** (`src/components/tutor/tutor-sidebar.tsx`). `bottomRef.current.scrollIntoView()` was bubbling out of the sticky sidebar to the document scroller. Fix: scroll only the chat-list container's `scrollTop`. Don't reintroduce `scrollIntoView` on a sticky child.
- **Animation iframe scrollbars** (`src/components/lesson/blocks/embed-animation-block.tsx`). Added `scrolling="no"` + `style={{overflow:"hidden"}}` and injected `html,body{overflow:hidden}` into all 149 animation HTML files via `/tmp/strip-anim-scroll.mjs` (recreate from history if needed).
- **39 broken animation paths**. JSON refs across 12 courses didn't match files on disk. Auto-renamed by longest-prefix match (34 cases), manual map (5 cases). The on-disk convention is `<lesson-slug>.html` and `trap-<lesson-slug>.html` — agents sometimes invent suffixes; reconcile to the slug.

## Traps you will hit

### Krit's dev server is on port 3001, not 3000

Port 3000 is `mednext`, an unrelated project elsewhere on this Mac. If a static-asset URL 404s and the file exists on disk, **check the port first**:

```bash
lsof -P -p $(pgrep -f 'next-server.*v15' | head -1) | grep LISTEN
```

### Subagent stalls on big single Writes

Subagents stall (~600s watchdog) when asked to produce one large file in one Write call. Brief them to write **5–6 small files in separate Write calls**. The pattern is encoded in `docs/MASTER_COURSE_PROMPT.md`. When agents fail mid-batch from rate limits, finish the missing files in the main thread rather than waiting — limits reset around 1pm IST and 12:50am IST (Asia/Calcutta).

### Course assembly pipeline

```
courses/parts/<slug>/{path,lesson-1..5}.json    # subagent output (can include {"lesson": {...}} envelope — auto-unwrapped)
        │
        ▼  scripts/assemble-course.mjs
courses/<slug>.json                              # canonical course content
        │
        ▼  scripts/splice-bonus.mjs              # injects fieldNotes + bossBattle from courses/bonus/<slug>/<lesson-slug>.json
        ▼  scripts/splice-trap-animations.mjs    # injects embedAnimation before warn callouts where trap-<lesson>.html exists
        │
        ▼  npx tsx prisma/seed/import-course.ts courses/<slug>.json
DB
        │
        ▼  npm run course:notes <slug>           # regenerates handwriting-style notes
        ▼  npm run course:audio <slug>           # full-lesson TTS (existing)
```

Per-animation narration is a separate inline recipe (not yet a script): write scripts in `docs/courses/<slug>/anim-narration/scripts.json` keyed by animation file stem, then `say -v Aman -r 145 -o $key.aiff "$text" && ffmpeg -y -i $key.aiff -ar 22050 -ac 1 $key.wav && lame --preset 64 -m m $key.wav $key.mp3`. Output to `public/audio/<slug>/anim/<key>.mp3`. Set `audioSrc` on the matching `embedAnimation` blocks. Re-import.

### Audio is gitignored

`public/audio/` is in `.gitignore` (~300MB across all courses if rendered). Mp3s don't deploy. Production needs a CDN strategy — not yet decided. For now mp3s exist locally only.

### chatScenario buckets max at 4

If an agent writes 5+ buckets the import fails Zod validation. Merge two buckets manually (e.g., the leadership pilot merged Director + Manager). Update any scenarios referencing the merged bucket id.

### `migrate dev` is dev-only

Kernel rule. Production migrations use `migrate deploy`.

## Pending work the user has hinted at

| Item | Status | Where to start |
|---|---|---|
| Player rollout decision | **awaiting user verdict** | wait for direction; don't expand `PLAYER_PILOT_SLUGS` unprompted |
| Narration for other 14 courses | not started | 140 more clips if rolled out; reuse the recipe above |
| Better narration voice (ElevenLabs Niraj / Google Cloud `en-IN-Chirp3-HD-Charon`) | discussed, deferred | user accepted `say -v Aman` as placeholder |
| Audio hosting for prod | undecided | will block staging deploy if not figured out |
| Authoring UI | data model supports it; UI doesn't | `docs/COURSE_AUTHORING_KIT.md` for context |
| Prod DB + GitHub init + staging deploy | deferred | from CLAUDE.md "Current Focus" |
| Auth swap to Clerk/SSO | provisional today | flagged in STACK.md |

## Key files

```
lib/content/blocks.ts                                        # Zod schema (discriminated union)
src/components/lesson/block-renderer.tsx                     # main switch
src/components/lesson/lesson-player.tsx                      # NEW — pilot section-by-section player
src/components/lesson/blocks/*.tsx                           # one renderer per block type
src/components/lesson/blocks/embed-animation-block.tsx       # iframe + play overlay + audioSrc
src/components/tutor/tutor-sidebar.tsx                       # AI tutor (used inline AND as drawer content)
src/app/(learner)/learn/[pathSlug]/[lessonSlug]/page.tsx     # lesson page; PLAYER_PILOT_SLUGS gate

scripts/assemble-course.mjs                                  # parts → main JSON
scripts/splice-bonus.mjs                                     # bonus content splicer
scripts/splice-trap-animations.mjs                           # trap-anim splicer
prisma/seed/import-course.ts                                 # Zod-validates and imports

docs/MASTER_COURSE_PROMPT.md                                 # the paste-into-LLM prompt
docs/ANIMATION_STYLE.md                                      # animation visual + technical contract
docs/COURSE_AUTHORING_KIT.md                                 # authoring overview
docs/courses/<slug>/anim-narration/scripts.json              # per-animation narration scripts (leadership only so far)

courses/<slug>.json                                          # canonical content
courses/parts/<slug>/                                        # intermediate files (kept for re-runs)
courses/bonus/<slug>/<lesson-slug>.json                      # fieldNotes + bossBattle
public/courses/<slug>/anim/*.html                            # animations (main + trap-)
public/audio/<slug>/anim/*.mp3                               # narration mp3s (gitignored)
public/notes/<slug>/*.html                                   # student-style notes
```

## Things to NOT do

- Don't autoplay narration without a click. Play overlay is the unlock gesture.
- Don't add `scrollIntoView` calls inside sticky elements — they bubble to the page scroller.
- Don't run `prisma migrate dev` against any non-dev database.
- Don't commit `public/audio/` or huge binaries — both gitignored on purpose.
- Don't ask a single subagent to Write a 60KB+ file in one call. Split into 5–6 small Writes.
- Don't curl `localhost:3000` for Krit testing. It's the other project. Krit is **3001**.
- Don't expand `PLAYER_PILOT_SLUGS` until the user explicitly OKs rollout.
- Don't replace `<lesson-slug>.html` filename convention without updating `splice-trap-animations.mjs` accordingly.

## Last 5 commits (for context loading)

```
5b25465 feat(player): section-by-section LessonPlayer (pilot — leadership)
56950d4 feat(animations): play-overlay + optional narration audio
ecdf466 fix(lesson): auto-scroll, iframe scrollbars, 39 broken animation paths
7e55db1 feat(tooling): assemble-course + splice-trap-animations scripts
8cd1466 feat(assets): animations + notes for 10 new courses + 50 trap animations
```

## Resume checklist

1. Read CLAUDE.md (kernel) + STACK.md (deps).
2. Read this file.
3. `git log --oneline -10` to see what landed since.
4. `lsof -P -p $(pgrep -f 'next-server.*v15' | head -1) | grep LISTEN` — confirm Krit's port.
5. Open `/learn/leadership-in-age-of-ai/ai-and-the-job` in the browser to see the player layout.
6. Open any other course's lesson (e.g., `/learn/sql-foundations/<slug>`) to see legacy layout.
7. Ask the user what's next — there's no auto-advance from the pilot.

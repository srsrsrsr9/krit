# Anim Lab — Marketing & Positioning Review

_Reviewer lens: April Dunford positioning + JTBD + brand voice. Scope: the 7 galleries shipped, the `README.md` that fronts them, and the question of whether a future course author can pull from this without help._

---

## Top Verdict

The Anim Lab is doing more than it claims and worse than it could. As an _internal seed inventory_ it is over-delivering: 140 catalogued artifacts across 7 courses, a consistent shell, real pedagogical intent on every card. As a _catalogue that an external course author can self-serve from_, it is failing the basic April Dunford test — the README never names the audience, never says what the lab is the alternative _to_, and never declares the angle. It reads like an internal staging area that was accidentally left at a public URL. Worse, the seven galleries have already drifted in voice and density between the two showcases (`leaders-ai-os`, `ai-for-developers`) and the five compact ones — so any author landing on `claude-pro.html` first will not believe the Krit voice is real. The good news: this is fixable at the catalogue layer without re-cutting a single artifact. Get the positioning slot right, set five voice rules for the remaining 11, and the inventory becomes a moat.

---

## Catalogue Positioning Audit (~300 words)

**Dunford's three-slot test — audience / alternative / angle:**

- **Audience.** The README says nothing about _who_ this is for. Internal Krit team? Collaborating course authors? Buyers evaluating Krit? The lede says "two galleries, twenty artifacts each, tied to lessons" — that's a description, not a positioning slot. Implicit answer (from `CLAUDE.md` context): future course authors, with Krit team as bootstrap users. That needs to be the first sentence of the README.
- **Alternative.** Nowhere is the alternative named. A course author's actual alternatives are: (a) embed a Figma prototype, (b) commission a Lottie/Rive animation, (c) screenshot something from 3Blue1Brown, (d) skip the interactive and use a static diagram. Anim Lab beats all four on a specific axis — _drop-in, lesson-tagged, voice-aligned, no commission cycle_ — but the README never says so.
- **Angle.** The unique value is **"interactives indexed by lesson, not by aesthetic"** — every artifact ships with a `what it teaches` line and a footer that closes the loop. That is genuinely rare; most animation libraries (LottieFiles, UI8 packs, codepens) are indexed by visual effect. Krit is indexed by pedagogical intent. _The README never says this._ This is the single biggest positioning miss.

**Three-slot pass/fail: 0/3.**

**Implicit promise (what the catalogue actually communicates today):** "Here is a portfolio of animations we built. Browse." That is a portfolio framing. The desired framing is a _spare-parts catalogue_ — predictable, indexed, droppable, with a stable contract per artifact. A McMaster-Carr for course interactives, not a Behance for animation work. The difference matters: a portfolio invites admiration, a catalogue invites use.

**Other catalogue-level issues:** the README only documents 2 of the 7 galleries that have shipped. The five newer ones (`python-foundations`, `sql-foundations`, `claude-pro`, `money-fundamentals`, `ui-ux-design`) exist as files but are not in the catalogue at all. A course author landing on the README cannot find them. There is also no index page (`anim-lab/index.html`) — the user has to know filenames.

---

## Voice Consistency Note (~200 words)

The Krit voice — opinionated, named-enemy, willing to say "the answer everyone gives you is wrong" — is **partially present** and **unevenly distributed**.

**Where it shows up well:** the `footer:` field on individual artifacts in the two showcase galleries. Examples that read like Krit: _"Tight on a P&L, generous enough to compound. Most surviving teams land in the 5–19% reinvestment zone"_ (leaders-ai-os, L1-i01) and _"Splurge is required — without it, you don't stick to the plan"_ (money-fundamentals). These have a take. They name a number. They argue.

**Where the voice goes flat:**

1. **Every lede starts "Twenty drop-ins for X."** Five out of seven galleries open with that template. It is descriptive, not opinionated. Compare to the embeddings prototype which opens with a wrongness claim.
2. **Card titles are mostly mechanical.** "WHERE filters rows," "Capability map," "Diff over time." They describe the artifact, not the insight. The Krit prototypes title things like _"The 30-Minute Trap"_ — a frame, not a label.
3. **The `what it teaches` line is one-clause utilitarian.** It tells you the topic; it never makes a claim.
4. **No artifact contradicts received wisdom out loud.** The prototypes' signature move ("the answer everyone gives you is wrong") is absent from every gallery.

The voice is in the footers. It needs to be in the lede, the card titles, and the artifact `what` line too.

---

## Top 5 Rules for the Spec Doc

These are imperative, non-negotiable constraints for the remaining 11 galleries.

1. **Every gallery's `lede` must name an enemy or a wrong default in its first sentence.** Banned opener: "Twenty drop-ins for X." Required shape: a claim the rest of the gallery defends. Example for a hypothetical _Data Visualisation_ gallery: "Bar charts are the default. They are also the wrong default for ~30% of the questions you'll be asked. Twenty drop-ins for spotting the other cases."

2. **Every artifact's `footer` must end with a load-bearing number, a named tradeoff, or a counter-intuitive rule.** Banned shape: descriptive recap of what the user just clicked. Required shape: the takeaway they should be able to repeat 24 hours later. Audit existing footers against this rule — `leaders-ai-os` mostly passes, `claude-pro` and `ui-ux-design` mostly fail.

3. **Card titles must be frames, not labels.** "GROUP BY in 60 seconds" is a label; "Why your average is lying to you" is a frame. Every card title must pass the "would a learner click this if it weren't on a course platform" test. No title may simply restate the SQL keyword, the Python concept, or the design term.

4. **Every artifact must declare an `embed-as` contract in machine-readable form** (a JSON sidecar or a `data-embed` attribute on the gallery card): `{ courseSlug, lessonId, artifactId, type, iframeSrc, minHeight, ariaLabel }`. Without this, the "drop-in" claim in the README is false — a course author currently has to view-source and grep. This is the single highest-leverage reusability fix.

5. **Quality floor: no gallery ships with artifact density below the showcase line.** Define the showcase line concretely: an artifact must have (a) ≥2 interactive states OR a scrubbable timeline, (b) a footer that meets rule #2, and (c) a `what it teaches` line that makes a claim, not a description. The five newer galleries currently fall short on (b) and (c) more often than not. Either backfill them or mark them clearly as `draft` in the README so a course author knows what they are picking up.

---

## The One README Change That Matters Most

Replace the current opening paragraph with a positioning lede that names the audience, the alternative, and the angle — in that order — and then list **all seven galleries with their status and what's distinctive about each**, not just the two showcases. Something close to: _"Anim Lab is a spare-parts catalogue for course authors building on Krit. Instead of commissioning a custom Lottie or screenshotting 3Blue1Brown, drop a lesson-tagged interactive into your course. Every artifact ships with a pedagogical intent line, an embeddable contract, and the Krit voice baked in. Seven galleries shipped (2 showcase, 5 draft); 11 in progress. Browse by course, search by lesson topic, embed by ID."_ Then a one-row-per-gallery table: name, course audience, status (`showcase` / `draft`), artifact count, distinctive constraint (e.g. "every artifact shows query + result side by side"). This single change turns the catalogue from a portfolio-shaped artifact into a self-serve inventory and answers the "can I find a GROUP BY interactive in 30 seconds" question in the affirmative.

---

## Wrap

**Word count:** ~1,180.

**Top concern:** the catalogue's framing is portfolio-shaped, not inventory-shaped. The remaining 11 builds will compound that mistake unless the spec doc encodes the five rules above _before_ the next gallery is cut.

**Proposed one-line positioning statement for the Anim Lab:**

> **Anim Lab is a spare-parts catalogue of lesson-tagged interactives for course authors — drop one in instead of commissioning, screenshotting, or skipping.**

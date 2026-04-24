# SPEC.md — Feature Specification & Prototype Validation

Per-feature, not per-project.
Lives at the project root during validation, then moves to `docs/specs/[feature-name].md` after.
Source of truth for what gets built. `PLAN.md` is derived from it.

Invoke via `/spec [feature-name]`.

---

## When to Write a SPEC

**Write a SPEC before building when:**
- New user-facing flow (more than one screen)
- New interaction pattern not already in the app
- UX isn't obvious up front
- Anything you'd show a stakeholder or user for feedback before building

**Skip SPEC, go straight to PLAN:**
- Internal change (API refactor, DB migration, background job)
- UI addition to a validated pattern
- High-confidence design, no validation needed

---

## Phase 1 — Define the Feature

Fill this in before any prototype code.

### Feature Name
`[short-name]` — becomes filename `docs/specs/[short-name].md`

### Problem Being Solved
One paragraph. What is the user unable to do, or doing poorly, right now? Be specific: "Users can't find their order history" beats "navigation needs work."

### User Goal
Complete: "The user wants to ___"

### Success Criteria
How will you know the feature worked? Behavioural — not "the button is blue" but "the user completes checkout without calling support."

### Personas in This Flow
Define 2–4 fictional users with consistent identities. Reuse across all screens.

```
Persona 1:
  Name:    Sarah Chen
  Avatar:  https://i.pravatar.cc/150?img=47
  Context: Freelance designer, 34, uses weekly, 12 active projects

Persona 2:
  Name:    Marcus Webb
  Avatar:  https://i.pravatar.cc/150?img=11
  Context: Agency owner, 41, team of 5, billing-focused

Persona 3:
  Name:    Priya Nair
  Avatar:  https://i.pravatar.cc/150?img=32
  Context: New user, just signed up, no data yet
```

### Screens in This Flow
Exhaustive — missing a state here means discovering it during development.

```
1. Entry point — where does the user come from?
2. [Screen] — [one sentence]
3. [Screen] — [one sentence]
...
N. Exit point — where does the user end up?

States to cover (check all that apply):
[ ] Empty state (no data — Priya's view)
[ ] Populated state (normal use — Sarah's view)
[ ] Loading / skeleton
[ ] Error state
[ ] Edge case: [e.g. list with 200+ items, name > 40 chars]
[ ] Mobile layout
[ ] Disabled / read-only (if applicable)
[ ] Success confirmation
```

---

## Phase 2 — Build the Prototype

Claude builds a single HTML file with all screens, states, flows.

### Prototype Brief for Claude

```
Build an interactive HTML prototype for [feature name].

SCREENS: [list from Phase 1]
STATES: [list from Phase 1]

PERSONAS — use these people throughout, never placeholder text:
[paste personas]

REALISTIC DATA:
- Names, emails, amounts, dates must look real
- Dates: relative ("3 minutes ago", "yesterday", "Mar 12") not "2024-01-01"
- Amounts: realistic for the domain (not $0.00, not $999,999.99)
- Text: realistic length — 2-sentence description, not 5 words
- Numbers: varied and plausible

NAVIGATION:
- All screens in one HTML file
- Hash routing (#screen-name) or show/hide with JS
- Back button / breadcrumb where expected
- Browser back button works

INTERACTIONS:
[ ] [list specific clickable things]
[ ] Form validation — inline errors, not browser defaults
[ ] [specific interaction]

ANIMATIONS:
[ ] [specific — "slide in from right on screen transition"]
[ ] [e.g. "toast slides up, stays 3s, fades out"]
[ ] [e.g. "skeleton loader for 1.5s then content fades in"]
[ ] [e.g. "button spinner on submit, then success state"]

ERROR STATES:
[ ] [form fail — inline errors on invalid fields]
[ ] [network error — banner with retry]
[ ] [empty search — empty state with suggestion]

TECHNICAL:
- Single HTML file, no build step, openable by double-click
- Tailwind via CDN
- Alpine.js via CDN (preferred) or vanilla JS
- Avatars: https://i.pravatar.cc/150?img=[N]
- Other images: https://picsum.photos/[w]/[h]?random=[N]
- Icons: Heroicons via CDN or Unicode
- No external API calls
- Must work offline after initial CDN load
```

### Output Location
`prototypes/[feature-name].html`

Not in `public/` or `src/` — prototypes are not application code.

---

## Phase 3 — Validation

### What to Look For

Work through the prototype with fresh eyes before marking it validated.

**Flow integrity**
- [ ] Can Priya (new user) complete the flow without confusion?
- [ ] Is the primary action clear at every step?
- [ ] Any dead ends — screens with no obvious next step?
- [ ] Does back / cancel behaviour feel right everywhere?

**Information architecture**
- [ ] Right info visible at each decision point?
- [ ] Anything shown the user wouldn't care about at that moment?
- [ ] Labels and headings clear without tooltips?

**States coverage**
- [ ] Empty state communicates what to do, not just that it's empty?
- [ ] Error state explains what went wrong and what to do next?
- [ ] Success state confirms what happened?
- [ ] Loading state appropriate for expected wait?

**Edge cases**
- [ ] Layout holds with very long name / description?
- [ ] List with many items still navigable?
- [ ] List with one item feels right?

**Mobile**
- [ ] Works at 375px?
- [ ] Touch targets at least 44px?
- [ ] Text not truncated in ways that lose meaning?

**Interactions**
- [ ] Every action has visible feedback?
- [ ] Animations communicate intent?
- [ ] Timing feels right?

### Validation Method

- [ ] Solo — developer walks through with checklist
- [ ] Team — share HTML directly (self-contained)
- [ ] User — share with 2-3 target users, watch unguided

### Outcome

```
Outcome: [ APPROVED | NEEDS CHANGES | REJECTED — RETHINK ]

If NEEDS CHANGES — what:
[Precise: "empty state needs an action button" not "empty state should be better"]

If REJECTED — why:
[What assumption was wrong? What does the user actually need?]
```

---

## Phase 4 — From Prototype to Plan

Validated SPEC becomes input for PLAN.md.

### Record Design Decisions

Append to `docs/DECISIONS.md`:

```
## [YYYY-MM-DD] — [Feature] design decisions

**Flow decision:** [e.g. "Wizard over single long form because user testing showed the form felt overwhelming."]

**State decision:** [e.g. "Empty state includes primary CTA because Priya didn't know what to do on a blank dashboard."]

**Deferred:** [e.g. "Drag-to-reorder in prototype, cut from MVP scope. Revisit v2."]
```

### Carries Forward to PLAN.md

```
From this SPEC, PLAN.md includes:

Screens to build:     [confirmed by validation]
Components needed:    [new vs existing]
States to implement:  [validated]
Interactions:         [approved from prototype]
Animations:           [approved from prototype]
Cut from MVP scope:   [explicit list so nothing silently built or forgotten]
```

### Prototype Status After Build

Kept in `prototypes/` after the feature ships. Visual reference if the feature is revisited. Not deleted, not in `public/`, not production code.

---

## Ready-to-Build Checklist

```
[ ] Personas defined with consistent identities
[ ] All screens listed including empty, error, edge cases
[ ] Prototype built as single HTML file
[ ] All listed states visible in the prototype
[ ] Navigation works (including back)
[ ] Validation complete with one of three methods
[ ] Outcome: APPROVED
[ ] Design decisions appended to DECISIONS.md
[ ] Cut items listed explicitly
[ ] PLAN.md written from this SPEC
```

When all boxes are checked: move this file to `docs/specs/[feature-name].md`.

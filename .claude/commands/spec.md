---
description: Scaffold docs/specs/[feature].md and build an interactive HTML prototype
argument-hint: [feature-name]
---

Feature has unclear UX or is a new user-facing flow. Run SPEC.md's four phases.

## Step 1 — Name the feature

If $ARGUMENTS is empty, ask for a short kebab-case name. Enforce kebab-case.

## Step 2 — Create the spec file

Copy `docs/SPEC.md` to `docs/specs/$FEATURE.md`. Don't overwrite if it exists — ask first.

## Step 3 — Phase 1 (define)

Interview the developer for each field in Phase 1: problem, user goal, success criteria, personas, screens, states. Fill the spec as you go. Use realistic personas — offer three by default (populated user, new user, power user) and let the developer edit.

Do not proceed until every Phase 1 field is filled.

## Step 4 — Phase 2 (build prototype)

Construct the prototype brief from Phase 1 data. Build `prototypes/$FEATURE.html` per the technical constraints:
- Single HTML file, no build step
- Tailwind CDN + Alpine.js CDN
- Hash routing or show/hide for screens
- All states visible (empty, populated, loading, error, edge cases)
- Personas reused across screens with consistent identity
- Avatars from `i.pravatar.cc`, other images from `picsum.photos`
- No real API calls, no real API keys

Open the file in the developer's browser after building (report the path; do not attempt to open it automatically).

## Step 5 — Phase 3 (validation)

Present the Phase 3 checklist. Wait for the developer's outcome: APPROVED / NEEDS CHANGES / REJECTED.

If NEEDS CHANGES: apply precise changes, re-present.
If REJECTED: return to Phase 1 and re-interview on the assumption that needs revising.

## Step 6 — Phase 4 (carry forward)

Once APPROVED:
1. Append design decisions to `docs/DECISIONS.md`.
2. Suggest `/plan` to derive PLAN.md from this SPEC.
3. Move the spec from `docs/specs/$FEATURE.md` (it was already there) — no further move needed.
4. Leave `prototypes/$FEATURE.html` as reference. Do not delete it.

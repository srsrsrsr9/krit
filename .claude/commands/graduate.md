---
description: Upgrade the project tier with a checklist (prototype → mvp → production)
argument-hint: [mvp | production]
---

Move the project up a tier. This is a deliberate upgrade with prerequisites — not a rename.

## Parse target

- `mvp` — prototype → MVP
- `production` — MVP → Production

If the current tier is already at or above the target: stop, explain, suggest no action.

Determine the current tier from:
1. `CLAUDE_PROJECT_TIER` in `.claude/settings.json`
2. Which kernel file is named `CLAUDE.md` at the root

## Gate checklists

### Prototype → MVP

Ask the developer to confirm each before proceeding:
- [ ] Real users will interact with this
- [ ] You have a deployment target (not just localhost)
- [ ] You're willing to maintain `docs/ENV.md` and `docs/DECISIONS.md`
- [ ] The stack in `STACK.md` is final (no more `[PROVISIONAL]`) or will be before first public deploy
- [ ] Auth choice made (Clerk / NextAuth / Supabase / custom / none)

### MVP → Production

- [ ] Users are paying or depend on uptime
- [ ] A second developer has contributed (or will)
- [ ] Sentry (or equivalent) is already in place
- [ ] Staging environment exists and deploys are tested there first
- [ ] A recent incident exists that justified the upgrade (optional but telling)

If any box is unchecked and the developer still wants to graduate, record the reason in `DECISIONS.md` and proceed.

## Execute

### Prototype → MVP

1. Replace `CLAUDE.md` with the content of `CLAUDE.mvp.md` (from the V6 distribution).
2. Delete `CLAUDE.prototype.md` (or rename `prototype.md.bak` for reference).
3. Create `docs/ENV.md` if missing.
4. Create `docs/DECISIONS.md` if missing — append the graduation event.
5. Create a minimal `docs/SECURITY.md` stub (session check, Zod on inputs, no secrets in source).
6. Move any `prototypes/*.html` to `prototypes/archive/` for reference.
7. Update `.claude/settings.json` env `CLAUDE_PROJECT_TIER` to `mvp`.

### MVP → Production

1. Replace `CLAUDE.md` with the V6 production kernel.
2. Scaffold the full module docs that MVP omitted: `TESTING.md` (full), `PERFORMANCE.md`, `MONITORING.md`, `MAINTENANCE.md`, `PACKAGES.md`, full `QUALITY.md`.
3. Write `docs/PLAN.md` with a **graduation hardening plan** — ordered steps, Sentry first, then rate limiting, then CSP headers, then test coverage uplift. Don't execute it yet; produce the plan and wait.
4. Append a graduation entry to `docs/DECISIONS.md` with the justification.
5. Update `.claude/settings.json` env `CLAUDE_PROJECT_TIER` to `production`.

## Output

```
/graduate [target] — COMPLETE

Kernel:              [swapped file]
Docs added:          [list]
Docs unchanged:      [list]
Env tier:            production/mvp
Next step:           review docs/PLAN.md (hardening plan)
                     approve or edit before any implementation
```

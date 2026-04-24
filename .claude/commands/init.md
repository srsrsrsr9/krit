---
description: First-session bootstrap — runs SETUP.md, fills STACK.md and CLAUDE.md, deletes SETUP.md
argument-hint: (no args)
---

You are starting a new project with the V6 system. Execute these steps in order.

## Step 1 — Verify preconditions

Check that `SETUP.md`, `STACK.md`, and `CLAUDE.md` exist at the project root. If `SETUP.md` is missing, tell the user this is not a fresh V6 project and stop.

## Step 2 — Run the questionnaire

Read `SETUP.md`. Ask the developer each question in Stack Questionnaire one at a time. Show the default. Wait for each answer before moving on.

## Step 3 — Fill STACK.md

Populate every field in `STACK.md` with the chosen values. Mark any "not sure" answers `[PROVISIONAL]`. Do not leave `[fill in]` placeholders.

## Step 4 — Update CLAUDE.md

Fill the **Project Overview** and **Current Focus** sections. The Tech Stack section should reference `STACK.md`, not duplicate its contents.

If the developer chose tier **Prototype**: replace `CLAUDE.md` with `CLAUDE.prototype.md` and delete unused module docs (leave only `SPEC.md`, `PATTERNS.md`, `DECISIONS.md`).

If **MVP**: replace with `CLAUDE.mvp.md`. Keep the MVP-scope docs, delete the rest (`PERFORMANCE.md`, `MONITORING.md`, `MAINTENANCE.md`, `PACKAGES.md`, full `QUALITY.md`).

If **Production**: leave CLAUDE.md as-is.

## Step 5 — Initialise operational docs

- `docs/ENV.md` — create the deployment URL table using the platforms from Q8.
- `docs/DECISIONS.md` — append the initial stack decision with alternatives considered and why they were rejected.

## Step 6 — Offer tooling install

Ask the developer whether to install Prettier + Tailwind plugin + Husky + commitlint now. If yes, run:
```bash
npm i -D prettier prettier-plugin-tailwindcss husky @commitlint/cli @commitlint/config-conventional
npx husky init
echo 'npm run typecheck && npm run lint' > .husky/pre-commit
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

## Step 7 — Clean up

Delete `SETUP.md`. Report what was done, what was deferred, and what the next step is (usually `/spec` or `/plan` for the first feature).

## Output

One-paragraph summary + a checklist of files modified. Do not proceed to any other work in the same session.

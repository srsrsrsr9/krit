---
description: Write docs/PLAN.md in canonical format and wait for approval
argument-hint: [optional: brief description of what to plan]
---

Invoke the `planner` subagent in an isolated context window to produce `docs/PLAN.md`. Your main session stays clean.

## Preconditions

1. If `docs/PLAN.md` already exists with status `IN PROGRESS`, stop. Ask the user whether to resume it, supersede it, or archive and restart.
2. If the task is trivially small (1–2 file touches, no auth/payments/schema), tell the user a plan isn't required and suggest proceeding directly.

## Subagent brief

Spawn the `planner` subagent with:
- The user's description of the work
- Current branch + `git status`
- Relevant module doc(s) per the Load Before Acting table in `CLAUDE.md`

The subagent reads `docs/PLAN.md` template, produces the plan, returns a 5-bullet summary.

## Canonical PLAN.md sections

1. **Goal** — one sentence. What does "done" look like?
2. **Files to modify** — path + one-line reason each
3. **Files to create** — path + purpose
4. **Implementation steps** — ordered, numbered, each step an observable change
5. **Risk / rollback** — what can break, how to revert
6. **Out of scope** — explicit non-goals
7. **Status** — `DRAFT` → `APPROVED` → `IN PROGRESS` → `DONE`

## After the subagent returns

Print the 5-bullet summary. Show where `docs/PLAN.md` was written. **Do not write code yet.**

Wait for the developer to say one of: `approved`, `lgtm`, `go`, or a specific change request. Only then advance `Status` to `APPROVED` and begin implementation.

If `/break-glass` was invoked in this session, you may skip approval — but flag that you did and document in `DECISIONS.md`.

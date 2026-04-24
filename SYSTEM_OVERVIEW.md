# The V6 Claude Code System — Complete Reference

*What every file does, why it exists, and how it fits together.*

---

## The core idea

Most people interact with Claude Code imperatively: "do this, then do that." It works for simple tasks and scales badly. You repeat yourself every session. The AI drifts. Quality varies with how you phrased the instruction that day.

V6 takes a different approach: **declarative constraints, enforced by the harness, with declarative prose as the fallback.** Instead of standing over Claude's shoulder, you write a handbook. And where the handbook depends on Claude remembering it, you push it down into hooks, slash commands, and subagents so the harness enforces the rule whether Claude remembers or not.

The analogy: onboard a new hire with a thorough handbook *and* commit hooks that make the most dangerous mistakes literally impossible to commit. The handbook is for judgment. The hooks are for the things you can't afford to leave to judgment.

---

## What's new vs V5 (if you've used it)

V5 was a strong markdown system with a known weakness: its rules were advisory. A rule like "never autonomous commits" depended on Claude reading CLAUDE.md and remembering it. After an hour-long session, that rule degraded in the context window along with everything else.

V6 solves this structurally:

1. **Hooks in `.claude/settings.json`** block `git commit` in Bash unless the user typed it verbatim. Scan staged files for secret patterns. Run typecheck before any commit goes through.
2. **Slash commands in `.claude/commands/`** replace "here's the protocol" prose. `/plan` *is* the plan gate. `/bugfix` *is* the BUGFIX protocol.
3. **Subagents in `.claude/agents/`** run in isolated context windows, so long debugging sessions don't poison the main session's rules.
4. **`STACK.md`** extracts stack nouns once. V5 hard-coded Prisma, Clerk, Vercel, Zustand across 15 files; V6 lets you swap stacks by editing one.
5. **`lib/result.ts`** ships actual code for the `Result<T,E>` pattern V5 only philosophized about. An ESLint rule flags `throw` in data-layer paths.
6. **`docs/SPEC.md`** replaces V5's misnamed `STATICflow.md` and is now routed from the kernel. The Prototype tier references it explicitly.
7. **`docs/PATTERNS.md`** is a new slot for "Claude did something I want to keep" — previously homeless between DECISIONS.md (decisions) and the module docs (permanent rules).
8. **Adoption threshold** at the top of each kernel prevents people from importing the full 19-file system into hobby repos.
9. **Tier transitions** are documented both ways (prototype → MVP → production). V5 documented only the last hop.
10. **Tooling enforces MAY rules** (Tailwind class order, import sort, Conventional Commits) so they don't rot.

Full diff in `MIGRATION.md`.

---

## Architecture: kernel and modules

Claude Code has a context window. Every file it reads takes up space. Load all 19 module docs upfront and you hit context limits mid-session; rules degrade; Claude "forgets" things.

V6 keeps this architecture from V5: one small kernel that loads every session, module docs loaded on demand, and a Quick Reference table that compresses the highest-leverage rule from each domain into a single line.

The new layer: the harness loads `.claude/settings.json` and the `.claude/commands/` and `.claude/agents/` definitions automatically. They don't compete for context with the module docs — they live *above* the context window.

---

## Three tiers, three kernels

| Tier | Kernel | Use when |
|---|---|---|
| **Prototype / Static** | `CLAUDE.prototype.md` | No auth, no real data, no real keys. Demos, prototypes, landing pages. |
| **MVP** | `CLAUDE.mvp.md` | Real users, real data, pre-revenue. Ship fast, secure basics, defer hardening. |
| **Production** | `CLAUDE.md` | Paying users, uptime matters, team > 1, regulated surface. Full kernel. |

Each kernel has an explicit **adoption threshold** at the top and a **graduation checklist** for moving up. Moving down is possible (`/graduate` accepts a target tier) but rare.

The tiers share docs where appropriate. MVP's kernel loads a subset of the module docs; Production loads them all. Prototype mostly stands alone but references `docs/SPEC.md` for any non-trivial user flow.

---

## The files

### Root
- `README.md` — entry point for a human reading the system
- `MIGRATION.md` — V5 → V6 upgrade guide
- `SYSTEM_OVERVIEW.md` — this file
- `SETUP.md` — one-time onboarding questionnaire; used by `/init` then deleted
- `STACK.md` — stack nouns; the one place these are recorded
- `CLAUDE.md` / `CLAUDE.mvp.md` / `CLAUDE.prototype.md` — the three kernels

### Runtime
- `lib/result.ts` — the `Result<T,E>` helper and guards
- `.claude/settings.json` — permissions, env vars, hooks
- `.claude/commands/` — slash commands (see below)
- `.claude/agents/` — subagents (see below)
- `.claude/hooks/` — shell scripts called from settings.json hooks

### Docs (load on demand)
- `SPEC.md` — feature spec + prototype validation (renamed from STATICflow.md)
- `PATTERNS.md` — reusable patterns captured during work
- `PLAN.md` — current feature plan (the gatekeeper)
- `DECISIONS.md` — append-only decision log
- `STYLE.md` / `QUALITY.md` / `STATE.md` / `ERRORS.md` / `SECURITY.md` — code
- `DATABASE.md` / `TESTING.md` / `BUGFIX.md` — work patterns
- `PERFORMANCE.md` / `DEPLOY.md` / `ENV.md` — operations
- `GIT.md` / `PACKAGES.md` — source control + dependencies
- `MONITORING.md` / `MAINTENANCE.md` — observability + hygiene
- `MOBILE.md` / `AI.md` — specialized domains

---

## Slash commands

Slash commands are entry points. They force a protocol to start in a consistent state rather than relying on Claude remembering it.

| Command | Purpose |
|---|---|
| `/init` | First-session bootstrap. Runs SETUP.md questionnaire, fills STACK.md and CLAUDE.md, deletes SETUP.md. |
| `/spec [name]` | Scaffolds `docs/specs/[name].md` and kicks off Phase 1 of SPEC.md. |
| `/plan` | Writes `docs/PLAN.md` in canonical format and blocks code changes until the user approves. |
| `/bugfix [desc]` | Drives BUGFIX.md step by step: reproduce → read error → one hypothesis → verify → one change → verify. Enforces the 3-attempt rule. |
| `/ship [env]` | Pre-deploy checklist: typecheck, lint, test, build, staging verified. Does *not* deploy; it prepares and reports. |
| `/reset` | Session reset: re-reads kernel, `git status`, `npm run typecheck`, 5-bullet summary, waits. |
| `/break-glass [reason]` | Suspends PLAN gate + staging-first, flags the reason, schedules DECISIONS.md entry within 24h. |
| `/graduate [tier]` | Upgrades the tier with a checklist: swaps kernels, scaffolds newly-required docs, writes a hardening PLAN.md. |

Each command's markdown file in `.claude/commands/` defines: the exact instructions Claude follows, the docs it loads, and the output it produces.

---

## Subagents

Subagents run in isolated context windows. They're for work that would otherwise poison the main session: long debugging loops, large searches, PR review.

| Agent | Purpose |
|---|---|
| `planner` | Reads the task, produces `docs/PLAN.md`, returns the summary. Main session stays clean. |
| `bug-hunter` | Executes the BUGFIX protocol from reproduction to verified fix. Returns a 5-bullet report. |
| `pr-reviewer` | Reads a diff (or branch), applies the QUALITY + SECURITY + PERFORMANCE checklists, returns findings. |

Subagents are invoked by name. The main session sends them context; they work in isolation; they return a compact result.

---

## Hooks

Hooks are configured in `.claude/settings.json`. They run before/after tool calls and can block execution.

Default hooks in V6:

1. **`preToolUse` on `Bash`** — scans the command for `git commit`, `git push`, `gh pr create`, `vercel --prod`, etc. Blocks if the user did not explicitly say so in their prompt. Enforces the "no autonomous commits" rule at harness level.
2. **`preToolUse` on `Write` / `Edit`** — scans the content for common secret patterns (`sk_live_`, `AKIA`, `xoxb-`, `ghp_`, long hex strings in suspicious positions). Blocks if found.
3. **`postToolUse` on `Write` / `Edit`** — runs `npm run typecheck --silent` on the changed file's project if the change plausibly affects types. Non-blocking; reports issues.
4. **`userPromptSubmit`** — if the prompt mentions "deploy to production" without `/ship` or `/break-glass`, inject a reminder to use one.

These are defaults. Disable any you don't want in `settings.json`.

---

## Memory

V6 uses Claude Code's file-based memory system for things that belong across sessions:

- User role, preferences, working style → memory
- Decisions about this project → `docs/DECISIONS.md`
- Patterns Claude discovered → `docs/PATTERNS.md`
- In-progress work → `docs/PLAN.md`

Memory is read automatically. DECISIONS.md / PATTERNS.md / PLAN.md are loaded on demand per the routing table.

---

## Day-to-day

**New project:** `/init` → answer 12 questions → STACK.md and CLAUDE.md populated → SETUP.md deleted → start.

**New feature (simple):** describe it → Claude loads the relevant module doc(s) → codes → stages changes for review. No plan needed.

**New feature (3+ files or risky):** `/plan` → Claude writes PLAN.md → you review → say "approved" or "lgtm" → Claude implements against the plan → updates DECISIONS.md if any tool/pattern choice was made.

**New feature (unclear UX):** `/spec [name]` → Claude writes SPEC.md with personas and states → builds an HTML prototype → you validate → SPEC becomes input to `/plan`.

**Bug:** `/bugfix [description]` → reproduce → read full error → one hypothesis → verify without fixing → one change → verify. If not fixed in 3 attempts, revert everything and hand off.

**Deploying:** `/ship staging` to verify staging is good. `/ship production` to prepare production deploy. You run the actual deploy.

**Emergency:** `/break-glass [reason]` → flag suspended gates → fix → document in DECISIONS.md within 24h.

**Long session:** `/reset` whenever the same fix fails twice or the context feels degraded.

**End of session:** update `Current Focus` and `Known Issues` in the kernel.

---

## What this system is not

- Not a substitute for judgment. It catches common mistakes and sets a quality floor. It does not substitute for architectural thinking on novel problems.
- Not static. Add to `docs/PATTERNS.md` whenever Claude does something you want to keep. Add rules when you notice a new failure mode.
- Not complete. No coverage for i18n, complex animation, WebSockets, background queues, multi-tenancy. Add `docs/<DOMAIN>.md` and a routing row in CLAUDE.md when you need one.

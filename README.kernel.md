# Project Docs V6 — Claude Code Operating System

A declarative-constraints system for building software with Claude Code. Three tiers — **Static**, **Prototype/MVP**, **Production** — each with its own kernel. Picks up real Claude Code primitives (slash commands, subagents, hooks) instead of relying on Claude remembering markdown rules.

---

## What's new in V6

V6 is V5's good ideas plus the tooling V5 was missing.

| Change | Why |
|---|---|
| **Claude Code primitives** (`.claude/commands`, `.claude/agents`, `.claude/settings.json` hooks) | Rules enforced by the harness, not hoped for. `/plan`, `/bugfix`, `/ship`, `/reset`, `/break-glass`, `/spec`, `/graduate` all wired up. |
| **STACK.md extraction** | Stack-specific nouns (Prisma, Clerk, Vercel…) live in one file. Module docs reference them. Swapping the stack stops being a 15-file edit. |
| **`lib/result.ts` shipped** | The `Result<T,E>` type that V5 referenced philosophically is now actual code. ESLint rule included. |
| **SPEC.md fixed + routed** | V5's `STATICflow.md` (internally titled SPEC.md, referenced as SPEC.md, routed as neither) is now correctly named and in the kernel's Load table. |
| **PATTERNS.md** | Dedicated slot for "Claude did something I want to keep" — V5 had nowhere for this. |
| **Adoption threshold** | Top of the kernel states when to use this tier. Prevents hobby repos from importing 19 files they don't need. |
| **Tier transitions documented** | Explicit prototype → MVP → production bridges with checklists. V5 only had MVP → production. |
| **Prettier + ESLint wiring** | Tailwind class order and `Result<T,E>` enforced by tooling, not by Claude re-reading rules. |
| **Multi-domain task guidance** | The Load Before Acting table now handles "build login page" style tasks that span STYLE + SECURITY + QUALITY. |

---

## Pick a tier

| Tier | Use when | Kernel |
|---|---|---|
| **Static** | One HTML file, no backend, no auth, no persistence beyond localStorage. Demos, landing pages, interactive prototypes. | `CLAUDE.prototype.md` + `docs/SPEC.md` |
| **MVP** | Real users, real data, but pre-revenue or still finding product-market fit. Ship fast, secure the basics, defer hardening. | `CLAUDE.mvp.md` |
| **Production** | Paying users, uptime commitments, team > 1, or regulatory surface. Full 19-file V6 kernel. | `CLAUDE.md` |

**Adoption threshold for the Production tier:** use it when at least one of — (a) real users depend on uptime, (b) the codebase will outlive a single sprint, (c) more than one developer touches it. Below that threshold, MVP is usually correct; V6 Production is over-engineering.

---

## Folder layout

```
project-docs-v6/
├── README.md              (this file)
├── MIGRATION.md           upgrading from V5
├── SYSTEM_OVERVIEW.md     philosophy and architecture
├── SETUP.md               one-time onboarding (run then delete)
├── STACK.md               stack nouns — edit once, reference everywhere
├── CLAUDE.md              Production kernel
├── CLAUDE.mvp.md          MVP kernel
├── CLAUDE.prototype.md    Prototype/Static kernel
├── lib/
│   └── result.ts          Result<T,E> helper
├── .claude/
│   ├── settings.json      permissions, env, hooks
│   ├── commands/          slash commands
│   ├── agents/            subagents (planner, bug-hunter, pr-reviewer)
│   └── hooks/             shell scripts referenced from settings.json
└── docs/
    ├── SPEC.md            feature spec + prototype validation
    ├── PATTERNS.md        good patterns to reuse
    ├── PLAN.md            current feature plan (gatekeeper)
    ├── DECISIONS.md       append-only decision log
    ├── STYLE.md
    ├── QUALITY.md
    ├── STATE.md
    ├── ERRORS.md
    ├── SECURITY.md
    ├── TESTING.md
    ├── BUGFIX.md
    ├── DATABASE.md
    ├── PERFORMANCE.md
    ├── DEPLOY.md
    ├── ENV.md
    ├── GIT.md
    ├── PACKAGES.md
    ├── MONITORING.md
    ├── MAINTENANCE.md
    ├── MOBILE.md
    └── AI.md
```

---

## Quickstart

**New Production project:**
```bash
cp -r project-docs-v6/. <your-repo>/
cd <your-repo>
# open Claude Code; it will read .claude/ and CLAUDE.md automatically
# type:  /init
```
The `/init` slash command runs SETUP.md's questionnaire, fills in STACK.md and CLAUDE.md, and deletes SETUP.md when done.

**New MVP or prototype:** copy only the relevant kernel and the files it references. For a prototype, that's `CLAUDE.prototype.md` + `docs/SPEC.md`. For MVP, `CLAUDE.mvp.md` is standalone.

**Upgrading from V5:** see `MIGRATION.md`.

---

## How this is different from "just write a CLAUDE.md"

Markdown rules are advisory. Hooks and subagents are load-bearing. V6 leans on:

- **Hooks** (settings.json) — block `git commit` in Bash unless the user typed it; scan staged files for secrets before they're written; enforce pre-commit lint/typecheck.
- **Slash commands** — canonical entry points. `/plan` loads PLAN.md's format and won't let you start a 3+ file change without one. `/bugfix` drives the BUGFIX protocol step by step.
- **Subagents** — the planner and bug-hunter run in isolated context windows, so a 40-minute debugging session doesn't poison the main session's rules.
- **Memory** — user preferences and feedback persist across sessions via Claude's file-based memory system.

The markdown docs remain the knowledge base. The harness is what makes them load-bearing.

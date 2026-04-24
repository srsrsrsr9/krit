# MIGRATION.md — V5 → V6

V6 is a superset of V5. No module doc was rewritten. The changes are structural and tooling-based.

---

## What changed

### 1. Version naming is consistent
- V5's `SYSTEM_OVERVIEW.md` called itself "V4" in the heading. V6 fixes this.
- Folder name, kernel version marker, and overview title all say V6.

### 2. SPEC.md is properly named and routed
- V5: file `docs/STATICflow.md`, title says "SPEC.md", not in the routing table.
- V6: file `docs/SPEC.md`, routed from CLAUDE.md, referenced from CLAUDE.prototype.md.

### 3. STACK.md extracted
Previously, stack-specific nouns (Prisma, Clerk, Stripe, Vercel, Zustand, Sentry, Pino, Upstash, Expo, shadcn) were hard-coded across 15+ files. V6 extracts them to `STACK.md` and module docs reference `{STACK.<field>}` placeholders. Swapping the stack is now one file.

### 4. Claude Code primitives wired up
- `.claude/settings.json` with hooks blocking autonomous commits and scanning for secrets.
- `.claude/commands/` with slash commands for every protocol (`/plan`, `/bugfix`, `/ship`, `/reset`, `/break-glass`, `/spec`, `/graduate`, `/init`).
- `.claude/agents/` with subagents for planning, bug hunting, and PR review.

### 5. `Result<T,E>` is actual code
`lib/result.ts` ships with the system. An ESLint custom rule (in settings) flags `throw` in data-layer files. Before, this was philosophy without enforcement.

### 6. PATTERNS.md added
A dedicated file for reusable patterns discovered during development. V5 had no home for "Claude did something surprising that I want to keep" — DECISIONS.md is for decisions, not patterns.

### 7. Adoption threshold at top of Production kernel
Prevents people from importing the full 19-file system into hobby repos that don't need it.

### 8. Prototype → MVP transition documented
V5 only documented MVP → Production. V6 adds the earlier bridge with explicit checklists.

### 9. Tailwind class order enforced by Prettier
V5's MAY rule about Tailwind class ordering was unenforceable. V6 ships `prettier-plugin-tailwindcss` config in SETUP.md; the rule is deleted from CLAUDE.md.

### 10. Prototype security tightened
V5: "No security considerations" (too broad). V6: "No auth, no PII, no real API keys in client code."

### 11. Multi-domain task routing
V6's `Load Before Acting` table adds a section for common multi-file tasks (auth UI loads STYLE + SECURITY + QUALITY simultaneously).

---

## Upgrade steps

**From V5 to V6 on an existing project:**

```bash
# from your project root where V5 is installed
cp -r path/to/project-docs-v6/.claude .
cp path/to/project-docs-v6/lib/result.ts lib/
cp path/to/project-docs-v6/STACK.md .
cp path/to/project-docs-v6/docs/PATTERNS.md docs/

# SPEC rename if V5's STATICflow.md was in use
git mv docs/STATICflow.md docs/SPEC.md 2>/dev/null || true

# Replace kernel
cp path/to/project-docs-v6/CLAUDE.md .

# Manually port your answers from the existing CLAUDE.md Tech Stack section
# into STACK.md — the kernel now reads from there.
```

**Settings merge:** if you already have `.claude/settings.json`, merge the V6 hooks and permissions into yours rather than replacing.

---

## What did *not* change

All 19 module docs (`STYLE.md`, `DATABASE.md`, `STATE.md`, `ERRORS.md`, `QUALITY.md`, `TESTING.md`, `BUGFIX.md`, `SECURITY.md`, `PERFORMANCE.md`, `DEPLOY.md`, `ENV.md`, `GIT.md`, `PACKAGES.md`, `MONITORING.md`, `MAINTENANCE.md`, `MOBILE.md`, `AI.md`, `PLAN.md`, `DECISIONS.md`) are carried forward from V5 unchanged. They were strong already. If you want STACK.md placeholders applied to them, the next section has a script.

### Optional: apply STACK.md substitution to module docs

The module docs still reference specific stack nouns directly. That's fine if you're on the default stack. If you want the references to go through STACK.md, this is a mechanical find-and-replace — but it's not required for the system to work. Skip unless you're actually swapping stacks.

---
description: Pre-deploy checklist — typecheck, lint, test, build, staging verified. Does NOT deploy.
argument-hint: [staging | production]
---

Run the deployment readiness check. The actual deploy is the developer's to run.

## Parse target

- `staging` (default if no arg) — verify staging can be updated safely.
- `production` — verify production can be updated safely. Requires staging to have been green for ≥24h.

## Checklist (run in parallel where possible)

1. `git status` — clean? If dirty, stop and report.
2. `git log origin/main..HEAD --oneline` — what's being shipped?
3. `npm run typecheck` — zero errors?
4. `npm run lint` — zero errors?
5. `npm run test` — all green?
6. `npm run build` — succeeds? Bundle size within budget (see `docs/PERFORMANCE.md` if tier ≥ Production)?
7. If target is `production`:
   - Has staging received these commits?
   - Has staging been stable ≥24h? (check deploy history)
   - Are there any `[PROVISIONAL]` markers in `STACK.md`? If yes, stop.
8. **Env vars** — every env var referenced in the diff appears in `docs/ENV.md`?
9. **Migrations** — any new migrations? If yes, confirm `migrate deploy` is in the deploy pipeline (never `migrate dev`).

## Output

```
/ship [target] — REPORT

Status:          [READY | BLOCKED]
Commits:         [N commits since last deploy, titles listed]
Typecheck:       ✅ / ❌ [summary]
Lint:            ✅ / ❌ [summary]
Tests:           ✅ / ❌ [summary]
Build:           ✅ / ❌ [bundle size, warnings]
Staging (prod only): ✅ / ❌ [commit SHA, age]
ENV.md:          ✅ / ❌ [missing vars]
Migrations:      [list, with type: safe/risky]
Blockers:        [list, or "none"]

Next step:
[If READY: specific deploy command for the developer to run.]
[If BLOCKED: fix these before retrying.]
```

## Never

- Never run the actual production deploy command. Describe it; do not execute.
- Never bypass a failed step. If typecheck fails, ship is BLOCKED.
- Never add `--no-verify` or similar bypass flags.

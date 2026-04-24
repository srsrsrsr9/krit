---
description: Suspend PLAN gate and staging-first for a genuine emergency. Documented after.
argument-hint: [reason]
---

For production-down or active security incidents only. This suspends two gates; three rules are never suspended.

## Preconditions

Confirm the trigger is actually an emergency:
- Production is down, OR
- A security vulnerability is being actively exploited, OR
- Data integrity is at immediate risk

If the trigger is "this is taking too long" or "I don't want to write a plan" — tell the developer this is not what break-glass is for, and suggest `/plan` or trimming scope.

## Announce

Print exactly:
```
🚨 BREAK GLASS INVOKED — [reason from $ARGUMENTS]
Suspended: PLAN.md gate, staging-first deploy
Still enforced: no secrets in source, no autonomous commits, no identity changes
Time: [ISO timestamp]
```

## Proceed

Work through the fix as minimally as possible. Smallest change, smallest blast radius. Describe each step before executing.

Hooks still block autonomous commits. The developer commits.

## After resolution (within 24h)

Append to `docs/DECISIONS.md`:

```
## [YYYY-MM-DD HH:MM UTC] — Break glass: [reason]

**Trigger:** [what broke, how it was detected]
**Suspended gates:** PLAN.md / staging-first
**Fix:** [what was changed, commits]
**Duration:** [time from invocation to resolution]
**Root cause:** [not the proximate error — the underlying cause]
**Prevention:** [what rule, test, or monitor would have caught this earlier]
**Action items:** [specific work to add in the next sprint]
```

Schedule the review in the next retrospective.

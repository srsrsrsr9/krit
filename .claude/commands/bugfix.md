---
description: Drive the BUGFIX protocol step by step
argument-hint: [bug description]
---

Invoke the `bug-hunter` subagent. Your main session stays clean so a long debugging loop doesn't poison it.

## Subagent brief

Send to `bug-hunter`:
- The bug description from $ARGUMENTS (or ask the user now if empty)
- Recent `git log --oneline -10`
- `git status` output
- The file(s) implicated, if known

## Protocol the subagent runs

Read `docs/BUGFIX.md`. Steps:

1. **Reproduce reliably.** Write a failing test if possible. If not, document the exact steps. No fix attempts until this succeeds.
2. **Read the error completely.** Full stack trace. The relevant line is usually in the middle, not the top.
3. **One hypothesis.** State it as: "I think the bug is X because Y. I will verify by Z."
4. **Verify without fixing.** Add temporary logging, print actual values, check assumptions. If hypothesis is wrong, return to step 3 with new info — do not guess again.
5. **One change.** Smallest possible fix for the confirmed root cause.
6. **Verify the fix.** Does the failing test pass? Does anything else break? If yes: commit-stage. If no: **fully revert before trying anything else**.

## 3-attempt rule

If the same bug is attempted 3 times without resolution, the subagent stops, reverts everything, and produces this hand-off:

```
BUG HAND-OFF — [date]
Exact error:       [message + where]
Reproduction:      [steps]
Attempts:
  1. [hypothesis] → [result, why it was wrong]
  2. [hypothesis] → [result, why it was wrong]
  3. [hypothesis] → [result, why it was wrong]
Current hypothesis: [new thinking]
What's needed:     [questions for the developer]
```

## Return to main session

`bug-hunter` returns either:
- ✅ FIXED — brief summary of root cause and fix
- ❌ HANDOFF — the 5-line structured description above

Present whichever was returned. Do not re-attempt the bug from the main session; if handoff, wait for developer input.

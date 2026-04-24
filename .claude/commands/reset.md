---
description: Session reset — re-anchor to the kernel, check real state, write a 5-bullet summary
argument-hint: (no args)
---

Context has drifted or a fix has failed multiple times. Hard stop and re-anchor.

## Steps

1. **Re-read the kernel.** `CLAUDE.md` (or the tier's kernel). Do not summarize — actually read.
2. **Re-read the relevant doc.** Whatever the current work touches (STYLE, DATABASE, SECURITY, etc.). Pick one, not five.
3. **Check real state.** Run in parallel:
   - `git status`
   - `git log --oneline -5`
   - `npm run typecheck` (if stack supports it)
4. **Write the 5-bullet summary** and present it to the developer:

```
## Session Reset Summary

Goal:           [what we were trying to do]
Changes made:   [files touched, one line each]
What's broken:  [current failure mode, exact error if any]
Last attempt:   [what was tried most recently and what happened]
Next step:      [single concrete proposal for how to proceed]
```

5. **Wait.** Do not continue the work. The developer reads the summary and confirms, redirects, or takes over.

## If the trigger was "same bug failed 3 times"

In addition to the above: revert any uncommitted changes related to the bug (`git restore <files>`) so the baseline is clean. Then produce the BUGFIX hand-off format from `docs/BUGFIX.md`.

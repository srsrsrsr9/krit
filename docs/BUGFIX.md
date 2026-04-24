# BUGFIX.md — Bug Fixing Protocol

---

## The Core Problem

When a fix doesn't work, the instinct is to try another fix immediately.
This is wrong. Each failed attempt that isn't fully reverted leaves the
codebase in a dirtier state than before, and makes the next diagnosis harder.

**Patch-on-patch is the enemy.** Stop. Revert. Understand. Then fix.

---

## The Protocol

Follow these steps in order. Do not skip ahead to "just try something."

### Step 1 — Reproduce it reliably

Before touching any code, confirm you can reproduce the bug consistently.

```
- What exact steps produce the bug?
- Does it happen every time, or intermittently?
- Does it happen in all environments or only specific ones?
- What is the exact error message or wrong behaviour?
```

If you cannot reproduce it reliably, you cannot verify the fix.
Do not proceed until reproduction is consistent.

Write the reproduction as a failing test if at all possible:

```ts
// A failing test is the best reproduction — it proves the bug,
// and proves the fix when it passes.
it("should not charge customer twice when webhook fires twice", async () => {
  const payload = makeWebhookPayload({ type: "payment_intent.succeeded" })
  await handleWebhook(payload)
  await handleWebhook(payload)   // second fire — should be idempotent
  expect(stripeMock.charges.create).toHaveBeenCalledOnce()  // fails — bug confirmed
})
```

### Step 2 — Read the error completely

Read the full error message and stack trace before forming any hypothesis.

```
- What is the exact error type and message?
- What line does the stack trace point to?
- Is this the actual source or just where it surfaced?
- What was the call chain that led here?
```

Claude's most common mistake is reading the first line of an error and
guessing without reading the rest. The relevant information is usually
in the middle of the stack trace, not the top.

```bash
# Get the full error — don't truncate
npm run test 2>&1 | head -100
npm run typecheck 2>&1

# For runtime errors, check logs with full context
vercel logs --follow | grep -A 20 "Error"
```

### Step 3 — Form one hypothesis

State a single, specific hypothesis before touching any code:

```
"I think the bug is X because Y.
I will verify this by checking Z."
```

Not: "Maybe it's A, or possibly B, let me try changing both."

If you have multiple hypotheses, rank them by likelihood and test one at a time.

### Step 4 — Verify the hypothesis (without fixing yet)

Before changing anything, confirm your hypothesis is correct:

```ts
// Add temporary logging to confirm your theory
logger.debug({ webhookId, existingCharge }, "Checking idempotency state")

// Check the actual value, not what you assume it is
console.log("typeof value:", typeof value, "value:", JSON.stringify(value))

// For TypeScript errors: read what the type actually is
// Hover in IDE, or:
type Debug = typeof problematicValue  // will show in error
```

If your hypothesis is wrong, go back to Step 3 with the new information.
Do not start fixing based on a hypothesis you haven't confirmed.

### Step 5 — Make one change

Make the smallest possible change that addresses the confirmed root cause.

```
- One logical change per attempt.
- If it requires changing 3 files, that's still one change if they're all
  part of the same fix.
- Do not fix other things you notice while fixing this. Note them, fix later.
```

### Step 6 — Verify the fix

```bash
# Does the failing test now pass?
npm run test -- --testNamePattern "webhook"

# Did anything else break?
npm run test
npm run typecheck
npm run lint
```

If the fix works: commit it, then address the things you noted in Step 5.
If the fix doesn't work: **fully revert it before trying anything else.**

```bash
git diff                  # see exactly what you changed
git checkout -- .         # revert everything uncommitted
```

---

## The 3-Attempt Rule

If you have attempted the same bug 3 times without resolving it:

**STOP. Do not attempt a fourth fix.**

Instead:

```
1. Revert all changes to a clean state: git checkout -- .
2. Write a precise description of the bug:
   - Exact error message or wrong behaviour
   - Steps to reproduce
   - What you've tried and why each attempt failed
   - What you currently believe the root cause is
3. Share this with the developer before continuing.
```

Three failed attempts means the hypothesis is wrong, not that the fix
needs to be bigger. A fresh description almost always surfaces the real cause.

---

## Clean Slate Rule

If the code around a bug has become tangled from previous fix attempts,
**revert to a known-good state before continuing** — even if that means
losing some work.

```bash
# Revert to last commit
git checkout -- .

# Revert to a specific known-good commit
git log --oneline -10     # find the good commit
git checkout [hash] -- src/lib/problematic-file.ts

# Nuclear option — stash everything and start fresh on this file
git stash
```

A clean starting point is worth more than half-fixed code.

---

## Common Bug Patterns

### TypeScript errors

**Pattern:** "Type X is not assignable to type Y"

```
Diagnosis protocol:
1. Read what the type IS (left side of the error), not what you want it to be.
2. Read what the type MUST BE (right side).
3. Trace back to where the type was introduced — that's usually the real problem.
4. Do not cast with `as` — that hides the bug.
```

```ts
// ❌ Silences the error, doesn't fix it
const user = data as User

// ✅ Understand why data isn't User — usually a missing null check
if (!data) return null
const user = data  // now TypeScript knows it's defined
```

**Pattern:** "Property X does not exist on type Y"

```
Usually means:
- The type is wider than expected (could be undefined)
- The API response type doesn't match the actual shape
- A Prisma relation isn't included in the select
```

---

### Hydration mismatch (Next.js)

**Symptom:** "Hydration failed because the initial UI does not match what was rendered on the server"

```
Root cause is always: something rendered differently on server vs client.
Common causes:
- Date.now() or Math.random() called during render
- Reading from localStorage/window during render
- Browser extension injecting elements
- Conditional rendering based on typeof window
```

```tsx
// ❌ Different on server (undefined) vs client (actual value)
<div>{typeof window !== "undefined" ? localStorage.getItem("theme") : ""}</div>

// ✅ Defer client-only rendering
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null   // or a skeleton

// ✅ For dates — format on client only, or use a stable format
// ❌ new Date().toLocaleString()  — locale differs server/client
// ✅ new Date().toISOString()     — stable
```

---

### Stale closure / stale state

**Symptom:** Handler uses an old value of state or props. Reads as if
a previous render's values are being used.

```ts
// ❌ Stale — handleClick captures the initial value of count
const [count, setCount] = useState(0)
const handleClick = () => {
  setTimeout(() => {
    setCount(count + 1)   // count is always 0 here
  }, 1000)
}

// ✅ Functional update — always uses current value
const handleClick = () => {
  setTimeout(() => {
    setCount(c => c + 1)  // c is the current value at update time
  }, 1000)
}
```

**Symptom:** useEffect doesn't re-run when a value changes.

```ts
// Almost always a missing dependency
useEffect(() => {
  fetchOrders(userId)    // re-runs when userId changes
}, [userId])             // userId must be in the array

// If adding the dependency causes an infinite loop,
// the real problem is an unstable reference (object/array created inline)
```

---

### Race condition / async ordering

**Symptom:** Results appear out of order, or an older request overwrites a newer one.

```ts
// ❌ If user types fast, older requests can resolve after newer ones
useEffect(() => {
  fetchSearch(query).then(setResults)
}, [query])

// ✅ Abort previous request when query changes
useEffect(() => {
  const controller = new AbortController()

  fetchSearch(query, { signal: controller.signal })
    .then(setResults)
    .catch(err => {
      if (err.name === "AbortError") return  // ignore — intentional
      captureError(err)
    })

  return () => controller.abort()
}, [query])
```

**Symptom:** Database record updated by two concurrent requests, one overwrites the other.

```ts
// ✅ Optimistic locking — fail if record changed since we read it
await db.order.update({
  where: {
    id: orderId,
    updatedAt: lastKnownUpdatedAt,   // only update if unchanged
  },
  data: { status: "PAID" },
})
```

---

### Environment-specific bugs (works locally, fails in prod)

**Diagnosis protocol:**

```
1. What is different between the two environments?
   - Environment variables (check ENV.md — is var set in prod?)
   - Node version
   - Build output vs dev server (some bugs only appear in built code)
   - Edge runtime vs Node runtime
   - Cold start vs warm instance

2. Check logs in the failing environment first — don't guess from local behaviour.

3. Common culprits:
   - Missing env var in Vercel dashboard
   - `process.env.NODE_ENV` behaviour difference
   - Dynamic import that works in dev, fails in edge runtime
   - File system access that works locally, fails in serverless
   - Relative paths that differ between dev and build output
```

```bash
# Reproduce build conditions locally
npm run build && npm run start   # tests the built output, not dev server

# Check what env vars are actually set in Vercel
vercel env ls production
```

---

### Tailwind classes not applying

**Diagnosis protocol — in this exact order:**

```
1. Is the class name fully static? (no string concatenation/interpolation)
2. Is the file scanned by Tailwind? (check content array in tailwind.config.js)
3. Is this a class conflict? (two classes setting the same property — use cn())
4. Is this a specificity issue? (third-party style overriding it — use ! prefix)
5. Is the class actually valid? (typo, or wrong v4 syntax)
```

```bash
# Check if class is in the generated CSS
npm run build
grep "bg-brand-500" .next/static/css/*.css   # should appear if scanned correctly
```

---

### N+1 queries

**Symptom:** Page is slow, database logs show many similar queries firing in sequence.

```ts
// ❌ N+1 — one query per order to get the user
const orders = await db.order.findMany()
const ordersWithUsers = await Promise.all(
  orders.map(o => db.user.findUnique({ where: { id: o.userId } }))
)

// ✅ One query — include the relation
const orders = await db.order.findMany({
  include: { user: { select: { name: true, email: true } } }
})
```

---

### Webhook / event processed multiple times

**Symptom:** Charges fired twice, emails sent twice, inventory decremented twice.

```ts
// ✅ Idempotency key pattern — store processed event IDs
export async function handleWebhook(event: StripeEvent) {
  const existing = await db.processedEvent.findUnique({
    where: { eventId: event.id }
  })
  if (existing) return   // already processed — safe to ignore

  await db.$transaction([
    db.processedEvent.create({ data: { eventId: event.id } }),
    // ... actual processing
  ])
}
```

---

## Regression Prevention

Every bug fix must include a test that would have caught the bug.
No exceptions.

```ts
// After fixing: write the test that proves it's fixed
// and would catch it if it regresses
it("does not process the same webhook event twice", async () => {
  const event = makeStripeEvent({ type: "payment_intent.succeeded" })

  await handleWebhook(event)
  await handleWebhook(event)   // deliberate duplicate

  expect(chargeMock).toHaveBeenCalledOnce()
})
```

If writing the test is hard, that's information — the code may need
to be restructured so it's testable. A bug in untestable code will
come back.

---

## Describing a Bug You're Stuck On

When invoking the 3-attempt rule, structure the handoff to the developer clearly:

```
## Bug: [short title]

**Observed behaviour:**
[exact error message or wrong output]

**Expected behaviour:**
[what should happen instead]

**Reproduction steps:**
1. ...
2. ...

**Environments affected:**
[local / staging / production / all]

**What I've tried:**
1. [Attempt 1] — Changed X. Result: didn't fix it because Y.
2. [Attempt 2] — Changed X back, tried Z. Result: different error W.
3. [Attempt 3] — Reverted. Tried Q. Result: original error returned.

**Current hypothesis:**
[What I currently believe the root cause is, and why]

**Current state:**
[Is the code clean? What's reverted? What's still changed?]
```

---

## Rules for Claude

- Reproduce before fixing. Always.
- Read the full error message and stack trace before forming any hypothesis.
- State a hypothesis explicitly before making any change.
- One change at a time. Fully revert before trying a different approach.
- After 3 failed attempts: stop, revert everything, write a structured description.
- Never cast with `as` to silence a TypeScript error — find the real mismatch.
- Never add `// @ts-ignore` or `// eslint-disable` to make a bug disappear.
- Every bug fix ships with a regression test.
- If the code around the bug is tangled from previous attempts, revert to clean before continuing.

---

## Self-Check — Run Before Marking Bug as Fixed

```
[ ] Is there a failing test that proves the bug existed?
[ ] Does that test now pass?
[ ] Does the full test suite still pass? (npm run test)
[ ] Does TypeScript still pass? (npm run typecheck)
[ ] Have I reverted any experimental changes that didn't work?
[ ] Is the code clean — no debug logs, no commented-out attempts?
[ ] Have I written a regression test that would catch this if it returns?
[ ] Is the root cause documented (in a comment, or in DECISIONS.md if architectural)?
```

If any box is unchecked, the bug is not fixed. Do not mark it done.

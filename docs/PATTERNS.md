# PATTERNS.md — Reusable Patterns Captured During Work

Append-only log of patterns worth reusing. Complements `DECISIONS.md` (which records *choices*) by capturing *how* we do things once we've done them well.

---

## When to append

Write here when:
- Claude produced a small piece of code that solved a problem cleanly — and you want it reached for by default next time.
- You invented a convention that isn't big enough for its own module doc.
- You found a local idiom (a hook, a utility, a test helper) that should be the house style.

Do **not** write here for:
- One-off code that won't be reused.
- Things already documented in module docs.
- Things that need a whole file (make a new module doc and add a routing row to CLAUDE.md).

---

## Format

```
## [YYYY-MM-DD] — [Short pattern name]

**Problem:** [What does this pattern solve?]

**Pattern:**
```ts
// minimal, runnable example
```

**When to use:** [triggers — when should Claude reach for this?]
**When not to use:** [where this pattern would be wrong]
**See also:** [link to file where the canonical version lives, if any]
```

---

## Worked Examples

### 2026-04-15 — Optimistic mutation with rollback and toast

**Problem:** Mutations that update a list feel slow if we wait for the server. Manual rollback is error-prone.

**Pattern:**
```ts
const update = useMutation({
  mutationFn: updateOrder,
  onMutate: async (next) => {
    await qc.cancelQueries({ queryKey: ['orders'] })
    const prev = qc.getQueryData<Order[]>(['orders'])
    qc.setQueryData<Order[]>(['orders'], (cur) =>
      cur?.map((o) => (o.id === next.id ? next : o))
    )
    return { prev }
  },
  onError: (err, _next, ctx) => {
    qc.setQueryData(['orders'], ctx?.prev)
    toast.error('Could not save — rolled back')
  },
  onSettled: () => qc.invalidateQueries({ queryKey: ['orders'] }),
})
```

**When to use:** Any user-initiated mutation on a list the user is viewing and expects to feel instant.
**When not to use:** Payments, destructive actions, anything where "rolled back" is confusing or dangerous.
**See also:** `docs/STATE.md` for TanStack Query conventions.

---

### 2026-03-22 — Zod-validated server action with Result return

**Problem:** Server actions without input validation + with thrown errors produce inconsistent client-side handling.

**Pattern:**
```ts
'use server'
import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'

const Input = z.object({ id: z.string().cuid(), title: z.string().min(1).max(120) })

export async function renameOrder(raw: unknown): Promise<Result<{ id: string }, string>> {
  const parsed = Input.safeParse(raw)
  if (!parsed.success) return err('Invalid input')

  const session = await auth()
  if (!session?.userId) return err('Unauthorized')

  const order = await db.order.findUnique({ where: { id: parsed.data.id }, select: { userId: true } })
  if (!order || order.userId !== session.userId) return err('Not found')

  await db.order.update({ where: { id: parsed.data.id }, data: { title: parsed.data.title } })
  return ok({ id: parsed.data.id })
}
```

**When to use:** Every server action that mutates data.
**When not to use:** Read-only loaders — prefer React Server Components or TanStack Query.
**See also:** `lib/result.ts`, `docs/SECURITY.md`, `docs/ERRORS.md`.

---

### 2026-02-08 — Skeleton that matches real content shape

**Problem:** Generic "Loading…" text causes layout shift when content arrives.

**Pattern:**
```tsx
function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-3 w-16 rounded bg-muted animate-pulse" />
    </div>
  )
}
```

**When to use:** Lists, cards, anything with predictable shape.
**When not to use:** Content where the shape varies per item (use a single spinner instead).
**See also:** `docs/STYLE.md`.

---

*Add new entries at the top. Never edit past entries; if a pattern is superseded, add a new entry that references the old one.*

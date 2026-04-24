# ERRORS.md — Error Handling Patterns

---

## Core Rule

Every error must be:
1. **Caught** — nothing propagates silently
2. **Logged** — with enough context to debug
3. **Surfaced** — user sees a meaningful message, never a raw stack trace

`console.error` is not error handling. It is a debug statement. Remove it before committing.

---

## Result Pattern — Server-Side Functions

All server-side functions that can fail return a typed Result, never throw.

```ts
// lib/types.ts
export type Result<T, E = string> =
  | { ok: true;  data: T }
  | { ok: false; error: E }
```

```ts
// lib/orders.ts
import type { Result } from "@/lib/types"

export async function getOrder(id: string): Promise<Result<Order>> {
  try {
    const order = await db.order.findUnique({ where: { id } })
    if (!order) return { ok: false, error: "Order not found" }
    return { ok: true, data: order }
  } catch (err) {
    logger.error("getOrder failed", { id, err })
    return { ok: false, error: "Failed to fetch order" }
  }
}
```

```ts
// Usage in API route
const result = await getOrder(params.id)
if (!result.ok) {
  return Response.json({ error: result.error }, { status: 404 })
}
return Response.json(result.data)
```

**Rules:**
- Never `throw` from a data-fetching or mutation function — return a Result.
- Never swallow an error by returning `null` silently.
- The `error` field in a Result is a user-safe message. Log the raw error separately.

---

## API Route Errors

All API routes must return consistent error shapes:

```ts
// lib/api-error.ts
export function apiError(message: string, status: number = 500) {
  return Response.json({ error: message }, { status })
}

export function notFound(message = "Not found") {
  return apiError(message, 404)
}

export function unauthorized(message = "Unauthorised") {
  return apiError(message, 401)
}

export function badRequest(message: string) {
  return apiError(message, 400)
}
```

```ts
// app/api/orders/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return unauthorized()

  const result = await getOrder(params.id)
  if (!result.ok) return notFound(result.error)

  return Response.json(result.data)
}
```

---

## Client-Side Error Boundaries

Wrap all major page sections in an error boundary. Use the app directory's `error.tsx` in Next.js:

```tsx
// app/dashboard/error.tsx
"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("Dashboard error boundary triggered", { error })
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-500">
        We've been notified and are looking into it.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
```

---

## User-Facing Errors — Toast Notifications

Use a consistent toast pattern for mutation feedback. Never alert() or console.error().

```ts
// Preferred pattern with React Query / server actions
async function handleSubmit() {
  const result = await createOrder(formData)
  if (!result.ok) {
    toast.error(result.error)   // user-safe message from Result
    return
  }
  toast.success("Order created!")
  router.push(`/orders/${result.data.id}`)
}
```

**Rules:**
- Error messages shown to users must never include: stack traces, database errors, internal IDs, file paths.
- Use generic messages for unexpected errors: "Something went wrong. Please try again."
- Use specific messages for known/expected errors: "That email is already in use."

---

## Logging

Use a structured logger, not `console.log`. Configure once, import everywhere.

```ts
// lib/logger.ts
import pino from "pino"

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
})
```

```ts
// Usage
logger.info({ userId, orderId }, "Order created")
logger.error({ err, userId }, "Payment failed")
logger.warn({ attempt }, "Retry limit approaching")
```

Log levels:
- `error` — something broke, needs attention
- `warn` — unexpected but recoverable
- `info` — significant events (user signup, order placed)
- `debug` — detailed flow tracing (dev only)

**Rules:**
- Never log passwords, tokens, full credit card numbers, or raw PII.
- Always include relevant context: user ID, resource ID, operation name.
- Remove `console.log` and `console.error` before committing — use the logger.

---

## Monitoring (Production)

Connect a monitoring service. Recommended: Sentry.

```ts
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs"

export function captureError(err: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(err, { extra: context })
}
```

Call `captureError` in:
- Error boundaries
- Catch blocks for unexpected errors
- Failed webhook processing

---

## Rules for Claude

- Never use bare `try/catch` that silently swallows errors.
- Never use `console.error` as the sole error handler — use the logger.
- Never expose raw database errors, stack traces, or internal paths to the client.
- Always return a typed Result from functions that can fail.
- Always add an error boundary to new page-level components.
- When fixing a bug caused by an unhandled error, add both the fix and a test that would have caught it.

---

## Escape Hatches — When Result<T,E> Doesn't Apply

The Result pattern applies to **your own data-fetching and mutation functions**.
It does not apply everywhere. Allowed exceptions:

| Situation | What to do |
|---|---|
| Next.js server actions | `throw` is expected by the framework — convert to `Result` in your logic layer, throw at the action boundary |
| React error boundaries | Must throw — this is the mechanism. Throw from render, not from data functions |
| Third-party library throws | Catch at your boundary, convert to `Result` before it propagates into your code |
| Middleware (Next.js) | `NextResponse` / redirect patterns take precedence over Result |

The rule: **your code returns Results; framework boundaries throw**. Put a comment at
the conversion point explaining why you're converting:

```ts
// Server action boundary — Next.js expects throw, not Result
// Our internal functions return Result<T,E>; we convert here
export async function createOrderAction(data: FormData) {
  const result = await createOrder(parseFormData(data))
  if (!result.ok) throw new Error(result.error)  // boundary conversion
  redirect(`/orders/${result.data.id}`)
}
```

---

## Self-Check — Run Before Finishing Any Function That Can Fail

```
[ ] Does every code path return a Result or explicitly throw at a documented boundary?
[ ] Is the raw error logged (with context) before being converted to a user message?
[ ] Does the user-facing error message contain no stack traces, paths, or internal IDs?
[ ] Is console.error replaced with logger.error?
[ ] Does the calling code handle both ok: true and ok: false branches?
[ ] Is there an error boundary on the nearest page-level component?
```

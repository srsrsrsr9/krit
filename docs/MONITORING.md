# MONITORING.md — Observability & Incident Response

---

## Stack

| Concern | Tool |
|---|---|
| Error tracking | Sentry |
| Uptime monitoring | Better Uptime or Checkly |
| Performance (Web Vitals) | Vercel Analytics or Sentry Perf |
| Logging | Pino → Axiom / Logtail / Papertrail |
| Alerting | PagerDuty / Slack webhooks via Sentry |

Configure these before going to production. Not after the first incident.

---

## Sentry Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```ts
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.MYAPP_SENTRY_DSN,
  environment: process.env.APP_ENV,        // "production" | "staging" | "development"
  tracesSampleRate: process.env.APP_ENV === "production" ? 0.1 : 1.0,
  enabled: process.env.APP_ENV !== "development",

  beforeSend(event) {
    // Strip PII before sending to Sentry
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    return event
  },
})
```

### Capture errors with context

```ts
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs"

export function captureError(
  err: unknown,
  context?: Record<string, unknown>
) {
  console.error(err)  // local dev visibility
  Sentry.captureException(err, {
    extra: context,
    tags: { service: "api" },
  })
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
) {
  Sentry.captureMessage(message, { level, extra: context })
}
```

### Attach user context on login

```ts
// After successful authentication
Sentry.setUser({ id: session.user.id })

// On logout
Sentry.setUser(null)
```

---

## Logging Strategy

Use structured logging everywhere. Never `console.log` in production code.

```ts
// lib/logger.ts
import pino from "pino"

export const logger = pino({
  level: process.env.APP_ENV === "production" ? "info" : "debug",
  transport: process.env.APP_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined,
  redact: ["password", "token", "secret", "authorization", "cookie"],  // never log these
})
```

### Log levels — when to use each

```ts
logger.error({ err, orderId, userId }, "Payment charge failed")
// → Something broke that needs attention. Always includes err object.

logger.warn({ attempt, maxAttempts }, "Retry limit approaching")
// → Unexpected but recoverable. Worth watching in dashboards.

logger.info({ userId, orderId }, "Order created")
// → Significant business event. These power your audit trail.

logger.debug({ query, duration }, "DB query completed")
// → Dev/staging only. Not logged in production by default.
```

### What to always include in log context

```ts
// Every log should have enough context to debug without asking questions
logger.error(
  {
    err,                           // the actual error
    userId: session?.user.id,      // who was doing it
    resource: "order",             // what they were doing it to
    resourceId: orderId,           // which one specifically
    operation: "create",           // what operation
    durationMs: Date.now() - start // how long it took
  },
  "Order creation failed"          // human-readable summary
)
```

### Never log

```ts
// ❌ These must never appear in logs
logger.info({ password })           // credentials
logger.info({ token })              // auth tokens
logger.info({ cardNumber })         // payment data
logger.info({ ssn })               // PII
logger.info({ fullRequest })       // raw request bodies (may contain any of above)
```

---

## Uptime Monitoring

Set up synthetic checks on these endpoints before going live:

| Check | Endpoint | Frequency | Alert if down > |
|---|---|---|---|
| Home page | `GET /` | 1 min | 2 min |
| API health | `GET /api/health` | 1 min | 2 min |
| Auth flow | `POST /api/auth/session` | 5 min | 5 min |
| Payment webhook | `POST /api/webhooks/stripe` | — | monitor via Stripe dashboard |

```ts
// app/api/health/route.ts
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`   // verify DB connection
    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: process.env.APP_ENV,
    })
  } catch (err) {
    logger.error({ err }, "Health check failed")
    return Response.json({ status: "error" }, { status: 503 })
  }
}
```

---

## Alerting

Set alerts in Sentry for:

| Condition | Threshold | Channel |
|---|---|---|
| Error rate spike | >10 new errors/min | Slack #alerts |
| New unhandled exception | Any | Slack #alerts |
| Performance regression | P95 > 3s | Slack #alerts |
| Unresolved critical error | >1 hour old | PagerDuty / email |

Configure `MYAPP_SENTRY_DSN` and `MYAPP_SLACK_WEBHOOK_URL` in `docs/ENV.md`.

---

## Performance Monitoring

### Web Vitals tracking

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### API route timing

```ts
// Wrap slow operations with timing
export async function GET(req: Request) {
  const start = performance.now()

  const result = await expensiveOperation()

  const durationMs = Math.round(performance.now() - start)
  logger.info({ durationMs, endpoint: "/api/orders" }, "Request completed")

  if (durationMs > 1000) {
    captureMessage("Slow API response", "warning", { durationMs, endpoint: "/api/orders" })
  }

  return Response.json(result)
}
```

---

## Incident Response

When something breaks in production, follow this order. Don't skip steps.

### 1. Acknowledge (< 5 min)
- Confirm the incident is real (not a false alarm).
- Post in Slack: `🔴 Incident: [brief description] - investigating`

### 2. Assess (< 15 min)
- How many users are affected?
- Is it total outage or partial degradation?
- Is data at risk?

```bash
# Quick diagnostic commands
vercel logs --follow                         # tail production logs
npx vercel inspect [deployment-url]          # deployment info
# Check Sentry for error spike time and first occurrence
```

### 3. Mitigate (immediately if possible)
Options in order of speed:
- **Rollback**: fastest for bad deploys. Vercel dashboard → Deployments → Redeploy previous.
- **Feature flag off**: if the bug is in a flagged feature.
- **Hotfix + OTA**: for mobile, JS-only fixes can be pushed without store review.
- **Hotfix deploy**: for code fixes — invoke Break Glass Protocol if needed.

### 4. Resolve
- Confirm the fix is live and the error rate has dropped.
- Post in Slack: `✅ Resolved: [what was done]`

### 5. Post-mortem (within 48 hours)
Append to `docs/DECISIONS.md`:

```
## [YYYY-MM-DD] — Incident: [title]
**What happened:** ...
**Root cause:** ...
**Impact:** X users affected for Y minutes
**Fix:** ...
**Prevention:** What will stop this happening again?
```

---

## Dashboard to Check Weekly

- Sentry: unresolved errors, error trends
- Vercel Analytics: Core Web Vitals, p95 response times
- Uptime monitor: incident history, MTTR
- Stripe: failed payment rate (should be < 2%)
- Database: slow query log (queries > 500ms)

---

## Rules for Claude

- Always implement the `/api/health` endpoint in new projects.
- Always call `captureError()` from `lib/monitoring.ts` in catch blocks — not raw `Sentry.captureException`.
- Never log passwords, tokens, or PII — use the `redact` config in the logger.
- Always include `userId`, `resourceId`, and `operation` in error log context.
- When writing API routes, add timing logs for any operation that calls an external service.
- If `MYAPP_SENTRY_DSN` is not in `docs/ENV.md`, add it before finishing any backend task.

# SECURITY.md — Security Baseline

---

## Core Rules

- **Never trust user input.** Validate and sanitise everything.
- **Never expose secrets to the client.** No `NEXT_PUBLIC_` prefix on anything sensitive.
- **Never commit secrets.** Not in source, not in comments, not in test fixtures.
- **Never use `dangerouslySetInnerHTML`** without explicit sanitisation and a documented reason.
- **Never raw-query the database** with user-supplied strings — always use parameterised queries.

---

## Environment Variables & Secrets

```ts
// ❌ Wrong — exposes secret to the browser bundle
const key = process.env.NEXT_PUBLIC_STRIPE_SECRET

// ✅ Correct — server only
const key = process.env.MYAPP_STRIPE_SECRET
```

Rules:
- `NEXT_PUBLIC_` prefix is for genuinely public values only: site URL, publishable Stripe key, analytics ID.
- All other secrets are server-only env vars.
- Never hardcode API keys, tokens, or passwords anywhere in source code.
- Rotate any secret that appears in a commit immediately — assume it is compromised.

---

## Input Validation

Validate all user input at the API boundary using Zod. Never trust what the client sends.

```ts
// lib/schemas/order.ts
import { z } from "zod"

export const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity:  z.number().int().min(1).max(100),
  note:      z.string().max(500).optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
```

```ts
// app/api/orders/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = CreateOrderSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await createOrder(parsed.data)
  // ...
}
```

**Rules:**
- Every API route that accepts a body must parse it through a Zod schema.
- Validate on the server even if you also validate on the client.
- Reject unknown fields — use `.strict()` on schemas where appropriate.

---

## Authentication & Authorisation

```ts
// Always check session before accessing protected resources
export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorised" }, { status: 401 })

  // Always verify ownership — don't trust IDs from the request
  const order = await db.order.findUnique({ where: { id: params.id } })
  if (!order) return Response.json({ error: "Not found" }, { status: 404 })
  if (order.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  return Response.json(order)
}
```

**Rules:**
- Every API route that returns user data must verify the session.
- Always verify resource ownership — never trust an ID from the request body or URL alone.
- 401 = not authenticated (no session), 403 = authenticated but not authorised.
- Protect routes at the middleware level, not just inside each handler.

---

## Database Security

```ts
// ❌ Wrong — SQL injection risk
const user = await db.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ Correct — parameterised
const user = await db.user.findUnique({ where: { email } })

// ✅ Correct — raw query when needed
const user = await db.$queryRaw`SELECT * FROM users WHERE email = ${email}`
```

**Rules:**
- Use the ORM (Prisma/Drizzle) for all queries — raw SQL only when absolutely necessary.
- When raw SQL is needed, always use tagged template literals for parameterisation.
- Never pass user-supplied strings directly into `$queryRawUnsafe`.
- Database connection strings never appear in client-side code.

---

## XSS Prevention

React escapes content by default. Only bypass this with explicit review.

```tsx
// ❌ Dangerous — only use if content is fully sanitised
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ If unavoidable, sanitise first
import DOMPurify from "isomorphic-dompurify"
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

**Rules:**
- Never use `dangerouslySetInnerHTML` without sanitising with DOMPurify.
- Never use `eval()`, `new Function()`, or `innerHTML` with user content.
- Leave a comment explaining why `dangerouslySetInnerHTML` was necessary.

---

## CSRF Protection

Next.js App Router API routes are CSRF-safe for same-origin requests.
For additional protection on sensitive mutations, verify the `Origin` header:

```ts
export async function POST(req: Request) {
  const origin = req.headers.get("origin")
  if (origin !== process.env.MYAPP_SITE_URL) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
  // ...
}
```

---

## Security Headers

Add to `next.config.js`:

```js
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // tighten in production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.stripe.com",
    ].join("; "),
  },
]
```

---

## Rate Limiting

All API routes that accept user input or are publicly accessible must be rate limited.
Never implement rate limiting in-memory — it doesn't survive serverless cold starts or
multiple instances.

```bash
npm install @upstash/ratelimit @upstash/redis
```

```ts
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),  // 10 req / 10 sec
  analytics: true,
})

// Usage in API route
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous"
  const { success } = await rateLimiter.limit(ip)
  if (!success) return Response.json({ error: "Too many requests" }, { status: 429 })
  // ...
}
```

**Rules:**
- Rate limit by IP for public routes, by user ID for authenticated routes.
- Use Redis-backed rate limiting (Upstash) — never in-memory.
- Auth endpoints (login, signup, password reset) always need rate limiting.
- Return `429` with a `Retry-After` header when the limit is hit.

---

## Dependency Security

```bash
# Run monthly alongside package updates
npm audit
npm audit fix

# Check for known vulnerabilities
npx better-npm-audit audit
```

**Rules:**
- Fix critical and high severity vulnerabilities before deploying.
- Do not ignore audit warnings without a documented reason in `DECISIONS.md`.

---

## Secrets Scanning

Prevent secrets from ever reaching git. Set this up before first commit.

```bash
# Install git-secrets (prevents committing secrets)
brew install git-secrets      # macOS
git secrets --install         # installs hooks into current repo
git secrets --register-aws    # adds AWS key patterns
# Add custom patterns:
git secrets --add 'sk_live_[a-zA-Z0-9]+'    # Stripe live key
git secrets --add 'MYAPP_[A-Z_]+_KEY'        # project key pattern
```

Or use `detect-secrets` for CI:

```bash
pip install detect-secrets
detect-secrets scan > .secrets.baseline      # run once to establish baseline
detect-secrets audit .secrets.baseline       # review and mark false positives
```

Add to CI pipeline:
```yaml
- name: Check for secrets
  run: detect-secrets-hook --baseline .secrets.baseline $(git diff HEAD~1 --name-only)
```

**If a secret is accidentally committed:**
1. Rotate the secret immediately — assume it's compromised.
2. Remove it from git history: `git filter-repo --path-glob '*.env' --invert-paths`
3. Force-push (coordinate with team — this rewrites history).
4. Document in `DECISIONS.md`.

---

## OWASP Top 10 — Project Checklist

Review this before every production release.

| # | Risk | Covered by |
|---|---|---|
| A01 | Broken Access Control | Auth checks on every route · ownership verification · `docs/SECURITY.md` auth section |
| A02 | Cryptographic Failures | No secrets in source · HTTPS enforced · httpOnly cookies for tokens |
| A03 | Injection | Zod validation on all input · Prisma parameterised queries · no raw SQL with user data |
| A04 | Insecure Design | Threat modelling during planning · rate limiting on auth endpoints |
| A05 | Security Misconfiguration | Security headers in `next.config.js` · no debug mode in production · env var audit |
| A06 | Vulnerable Components | `npm audit` monthly · `detect-secrets` in CI |
| A07 | Auth & Auth Failures | Session verification on protected routes · rate limit on login · MFA if available |
| A08 | Software & Data Integrity | Verify webhook signatures (Stripe etc) · subresource integrity on CDN assets |
| A09 | Logging & Monitoring Failures | Structured logging · Sentry · `/api/health` endpoint · `docs/MONITORING.md` |
| A10 | SSRF | Validate and allowlist external URLs before fetching · no user-controlled redirect targets |

---

## Rules for Claude

- Validate all API input with Zod before using it.
- Check session and ownership before returning any user-specific data.
- Never write raw SQL with string concatenation.
- Never use `dangerouslySetInnerHTML` without sanitisation and a comment.
- Flag any code that exposes sensitive env vars to the client bundle.
- Do not store sensitive data (tokens, passwords) in localStorage or sessionStorage — use httpOnly cookies.
- When in doubt about a security decision, flag it explicitly rather than guessing.

---

## Self-Check — Run Before Any Code That Touches Auth, Input, or Data

```
[ ] Is every API route that returns user data checking the session first?
[ ] Is resource ownership verified (not just session, but "does this user own this record")?
[ ] Is all user input parsed through a Zod schema before use?
[ ] Are there no secrets or tokens in source code, comments, or test fixtures?
[ ] Are no sensitive values prefixed NEXT_PUBLIC_?
[ ] Does any new external URL fetch validate or allowlist the URL first?
[ ] Is dangerouslySetInnerHTML absent, or if present, is DOMPurify applied and commented?
[ ] Does the auth endpoint have rate limiting?
[ ] Has npm audit been run if new dependencies were added?
```

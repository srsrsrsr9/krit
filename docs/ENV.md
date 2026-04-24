# ENV.md — Environment Variables & Deployment URLs

Values never go in this file. This is documentation only.
Actual values live in `.env.local` (never committed).

Claude must update this file whenever a new env var is introduced or a deployment URL changes.

---

## Naming Convention

All project env vars are prefixed with the project name:

```
MYAPP_OPENAI_KEY        ✅
MYAPP_STRIPE_SECRET     ✅
OPENAI_API_KEY          ❌  (generic, no project context)
SECRET                  ❌  (meaningless)
```

Client-side vars (exposed to browser) use `NEXT_PUBLIC_` prefix — only for truly public values:

```
NEXT_PUBLIC_MYAPP_SITE_URL     ✅  (public, fine to expose)
NEXT_PUBLIC_MYAPP_STRIPE_KEY   ❌  (never expose stripe secret to client)
```

---

## Variable Registry

### Template — copy for each new variable

```
## MYAPP_VARIABLE_NAME
- **Service:**         e.g. Stripe / OpenAI / Supabase
- **Purpose:**         What this key does in one sentence
- **Used in:**         e.g. src/lib/stripe.ts
- **Expiry:**          never | YYYY-MM-DD | rolling 90 days
- **Rotation needed:** yes / no
- **Environment:**     all | production only | staging only
- **Notes:**           e.g. "Use test key for staging, live key for production"
```

---

### Auth

## MYAPP_AUTH_SECRET
- **Service:** NextAuth / Clerk / custom
- **Purpose:** Signs session tokens
- **Used in:** src/lib/auth.ts
- **Expiry:** never
- **Rotation needed:** Only if compromised
- **Environment:** all

---

### Database

## MYAPP_DATABASE_URL
- **Service:** Supabase / PlanetScale / Railway Postgres
- **Purpose:** Primary database connection string
- **Used in:** src/lib/db.ts, prisma/schema.prisma
- **Expiry:** never (rotate if compromised)
- **Rotation needed:** no
- **Environment:** all (separate DBs per environment)
- **Notes:** Never point staging at the production database

---

### Payments

## MYAPP_STRIPE_SECRET_KEY
- **Service:** Stripe
- **Purpose:** Server-side Stripe API calls
- **Used in:** src/lib/stripe.ts
- **Expiry:** never
- **Rotation needed:** no
- **Environment:** all (test key for dev/staging, live key for production)

## NEXT_PUBLIC_MYAPP_STRIPE_PUBLISHABLE_KEY
- **Service:** Stripe
- **Purpose:** Client-side Stripe.js initialisation
- **Used in:** src/components/CheckoutForm.tsx
- **Expiry:** never
- **Environment:** all

---

### Third-Party APIs

## MYAPP_OPENAI_KEY
- **Service:** OpenAI
- **Purpose:** [describe use]
- **Used in:** src/lib/ai.ts
- **Expiry:** never (set no expiry when creating)
- **Rotation needed:** no
- **Environment:** all
- **Notes:** Monitor usage dashboard monthly

---

## Deployment URLs

Update this table whenever a new environment is added or a URL changes.

| Environment | URL | Platform | Branch | Last updated |
|---|---|---|---|---|
| Production  | https://[yourapp].com | Vercel | main | YYYY-MM-DD |
| Staging     | https://[yourapp]-staging.railway.app | Railway | staging | YYYY-MM-DD |
| Demo        | https://[yourapp]-demo.fly.dev | Fly.io | demo | YYYY-MM-DD |
| PR Previews | https://[yourapp]-git-[branch].vercel.app | Vercel | feature/* | auto |

---

## Rules for Claude

- Any new env var introduced in code must have a matching entry added here immediately.
- Never add actual values to this file — document only.
- When a URL changes (redeploy, domain change), update the table above.
- If an expiry date is within 30 days, flag it prominently at the top of this file.
- If staging and production use different values for the same var, note both under **Notes**.

# DEPLOY.md — Deployment Conventions

---

## Platform Map

| Context | Platform | When to use |
|---|---|---|
| **Production** | [Vercel](https://vercel.com) | Live, user-facing. Git-connected, edge network, automatic preview deploys. |
| **Staging** | [Railway](https://railway.app) or [Render](https://render.com) | Pre-production. Full backend, databases, cron jobs, workers. |
| **Demo / Internal tools** | [Fly.io](https://fly.io) | Long-running demos, internal tools, persistent processes, WebSockets. |
| **Quick static share** | [Netlify](https://netlify.com) | One-off static builds, design reviews, no-backend prototypes. |

Never use the same platform for multiple environments. Never use Netlify for production apps.

---

## Branch → Environment Mapping

```
main        →  Vercel (production auto-deploy)
staging     →  Railway / Render (staging auto-deploy)
feature/*   →  Vercel preview deploy (automatic on PR)
demo        →  Fly.io (manual deploy)
```

---

## Pre-Deploy Checklist

Run this before every production deploy. Do not skip steps.

```
[ ] npm run typecheck      — zero TypeScript errors
[ ] npm run lint           — zero lint errors
[ ] npm run test           — all tests passing
[ ] npm run build          — clean production build
[ ] ENV.md is current      — all vars documented
[ ] Staging has been live for at least 24 hours without errors
[ ] No console.log / debug statements in committed code
[ ] No .env.local or secrets in git diff
[ ] DECISIONS.md updated if a new tool or pattern was introduced
```

---

## Vercel (Production)

```bash
# Install CLI once
npm install -g vercel

# Link project (run once per machine)
vercel link

# Pull env vars to local (use instead of copying from dashboard)
vercel env pull .env.local

# Preview deploy (does not affect production)
vercel

# Production deploy (only from main via git — prefer git push over manual)
vercel --prod
```

**Rules:**
- Production deploys happen via git push to `main`, not manual `vercel --prod`.
- Env vars are managed in the Vercel dashboard, not in committed files.
- Use `vercel env pull` to sync vars locally — never copy-paste from the dashboard.
- Preview URLs are shareable — do not put sensitive data in preview builds.

---

## Railway / Render (Staging)

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway link
railway up          # deploy current branch
railway logs        # tail logs
```

**Rules:**
- Staging DB must be separate from production — never share connection strings.
- Env vars are set in the Railway/Render dashboard per service.
- Staging should mirror production config as closely as possible.
- Run the full test suite against staging before promoting to production.

---

## Fly.io (Demo / Internal)

```bash
# Install CLI
brew install flyctl       # macOS
curl -L https://fly.io/install.sh | sh   # Linux

flyctl auth login
flyctl launch            # first time setup
flyctl deploy            # subsequent deploys
flyctl logs              # tail logs
flyctl ssh console       # SSH into container
```

**Rules:**
- Use Fly for anything that needs persistent processes or WebSockets.
- Scale to zero when not in active use: `flyctl scale count 0`
- Demo apps should use clearly non-production data — never real user data.

---

## Netlify (Quick Share)

```bash
npm install -g netlify-cli
netlify deploy              # draft deploy (preview URL)
netlify deploy --prod       # production deploy
```

**Rules:**
- Netlify is for static-only builds and quick shares.
- No server-side code, no persistent backends.
- Suitable for: design reviews, static docs, landing pages.

---

## Environment Variable Rules

- Never commit `.env.local`, `.env.production`, or any file with real values.
- Each environment (production, staging, demo) has its own set of API keys — never shared.
- Update `docs/ENV.md` whenever a deployment URL or var changes.
- If a service is down in production, check staging first — if staging is also broken, it's a code issue not an infra issue.

---

## Rollback

**Vercel:** Instant rollback via dashboard → Deployments → select previous → Redeploy.

**Railway:** Redeploy a previous commit via dashboard or:
```bash
git revert HEAD
git push origin staging
```

**Fly.io:**
```bash
flyctl releases list
flyctl deploy --image [previous-image-ref]
```

---

## Rules for Claude

- Always ask which environment is the target before writing deploy config or commands.
- Never generate commands that deploy directly to production from a feature branch.
- Never put production credentials in staging config files.
- When a new deployment URL is created, update `docs/ENV.md` immediately.
- Do not run `vercel --prod` or equivalent — let the developer trigger production deploys.

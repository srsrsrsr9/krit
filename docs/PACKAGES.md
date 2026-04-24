# PACKAGES.md — Dependency Management

---

## Monthly Update Cycle

Run on the first of each month. Always update staging first — never touch production directly.

```bash
# 1. Create a dedicated branch
git checkout staging
git pull origin staging
git checkout -b chore/update-$(date +%Y-%m)-packages

# 2. See what's outdated
npx npm-check-updates

# 3. Update patch + minor versions (safe)
npx npm-check-updates -u --target minor
npm install

# 4. Verify nothing broke
npm run typecheck
npm run lint
npm run test
npm run build

# 5. Deploy to staging
git add package.json package-lock.json
git commit -m "chore(deps): update packages to latest minor versions $(date +%Y-%m)"
git push origin chore/update-$(date +%Y-%m)-packages
# Open PR into staging, deploy, monitor for 48h

# 6. If staging is clean after 48h, merge to main
```

---

## Major Version Upgrades

Major version upgrades are separate PRs, not part of the monthly cycle.

```bash
# Check what major upgrades are available
npx npm-check-updates --target major

# Upgrade one package at a time
npx npm-check-updates -u --filter [package-name] --target latest
npm install

# Read the changelog before upgrading
# https://github.com/[org]/[package]/releases
```

**Rules:**
- Never batch major upgrades — upgrade one package per PR.
- Read the migration guide before upgrading.
- Log the upgrade in `DECISIONS.md` with a note on what changed.
- If a major upgrade breaks something and can't be fixed quickly, pin and document:

```json
{
  "some-package": "3.2.1",
  "//": "pinned — v4 breaks X, revisit after https://github.com/org/repo/issues/123"
}
```

---

## Before Adding a New Dependency

Ask these questions before `npm install [package]`:

1. **Do we actually need it?** Can we achieve this with what's already installed or with a small custom function?
2. **How big is it?** Run `npx bundlephobia [package]` — flag anything over 20KB gzipped.
3. **Is it maintained?** Check last publish date and open issues on npm/GitHub.
4. **Does it have a good security record?** Run `npm audit` after installing.
5. **Is there a smaller alternative?** e.g. `date-fns` over `moment`, `mitt` over `eventemitter3`.

Document the choice in `DECISIONS.md` for any non-trivial addition.

---

## Preferred Libraries (Use These)

| Purpose | Library |
|---|---|
| Dates | `date-fns` |
| Schema validation | `zod` |
| Class merging | `clsx` + `tailwind-merge` |
| State management | `zustand` (client), React Query / SWR (server state) |
| Forms | `react-hook-form` + `zod` resolver |
| Icons | `lucide-react` |
| Email | `resend` + `react-email` |
| Payments | `stripe` |
| Animation | `framer-motion` (if needed — lazy load it) |
| Logging | `pino` |
| Testing | `vitest` + `@testing-library/react` + `playwright` |

---

## Deprecated / Do Not Use

| Library | Reason | Use instead |
|---|---|---|
| `moment` | Massive bundle, unmaintained | `date-fns` |
| `lodash` (full) | Large bundle | `lodash/[function]` or native JS |
| `axios` | Unnecessary wrapper | `fetch` (native) or `ky` |
| `redux` | Overkill for most apps | `zustand` |
| `class-validator` | Duplicates Zod | `zod` |
| `react-query` v3 | Outdated API | TanStack Query v5 |

---

## Security Audits

```bash
# Run as part of monthly update cycle
npm audit

# Fix automatically where possible
npm audit fix

# Review remaining issues — never ignore critical/high severity
npm audit --audit-level=high
```

**Rules:**
- Never deploy with known critical or high severity vulnerabilities.
- If a fix isn't available, document the vulnerability in `DECISIONS.md` with a timeline to resolve.
- Run `npm audit` in CI on every PR.

---

## Rules for Claude

- Never add a package without checking bundle size with `bundlephobia` first.
- Never add a package that duplicates something already installed.
- When updating packages, always update `staging` first — never `main` directly.
- Log major version upgrades in `DECISIONS.md`.
- Pin packages that can't be upgraded, with a comment explaining why.
- Do not upgrade packages that are pinned without reading and addressing the documented reason.

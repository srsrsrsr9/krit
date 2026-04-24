# MAINTENANCE.md — Maintenance & Tech Debt

---

## Philosophy

Maintenance is not optional work that happens when there's spare time.
It is scheduled, recurring work — the same as features.

Unmanaged tech debt compounds. A codebase that's never maintained
becomes one that can't be changed safely.

---

## Tech Debt Tracking

Tech debt lives in two places:

**1. Inline TODO comments** — for small, localised debt near the code it affects.

```ts
// TODO(#123): Remove this once Stripe webhook retry is handled upstream
// Workaround: manually retry on 503 because their SDK doesn't
if (res.status === 503) {
  await new Promise(r => setTimeout(r, 1000))
  return processWebhook(payload)
}
```

Rules for TODO comments:
- Must include a GitHub issue number: `TODO(#123)`.
- Never commit a TODO without a corresponding open issue.
- The issue describes the fix; the comment describes the workaround.
- Run `grep -r "TODO" src/` monthly and close or escalate stale ones.

**2. GitHub Issues with label `tech-debt`** — for anything that requires its own PR.

Issue template:
```md
**What:** [What is the current suboptimal state?]
**Why it matters:** [What risk or pain does this cause?]
**Proposed fix:** [What's the right solution?]
**Effort:** [Small / Medium / Large]
**Priority:** [Low / Medium / High]
```

---

## Deprecation Pattern

When removing a function, API, or pattern that might be used elsewhere:

### Phase 1 — Mark as deprecated (one release)

```ts
/**
 * @deprecated Use `formatCurrency(amount, currency)` instead.
 * Will be removed in the next major version.
 * See: https://github.com/org/repo/issues/456
 */
export function formatPrice(cents: number): string {
  console.warn("formatPrice is deprecated. Use formatCurrency instead.")
  return formatCurrency(cents, "USD")
}
```

### Phase 2 — Migrate all callers

```bash
# Find all usages
grep -r "formatPrice" src/ --include="*.ts" --include="*.tsx"
```

### Phase 3 — Remove

Once all callers are migrated, delete the deprecated function and the issue.
Log the removal in `DECISIONS.md`.

---

## Changelog

Maintain `CHANGELOG.md` in the project root. Follow [Keep a Changelog](https://keepachangelog.com) format.

```md
# Changelog

## [Unreleased]

### Added
- Order status webhook from Stripe

### Changed
- Checkout form now uses server action instead of client fetch

### Fixed
- Cart item count not updating on mobile Safari

### Deprecated
- `formatPrice()` — use `formatCurrency()` instead

### Removed
- Legacy `/api/v1/` routes (migrated to `/api/`)

### Security
- Added rate limiting to auth endpoints

---

## [1.2.0] — 2026-03-01
...
```

**Rules for Claude:**
- When completing a feature or fix, append an entry to `## [Unreleased]`.
- Use the right section: Added / Changed / Fixed / Deprecated / Removed / Security.
- One line per change, present tense, plain English.
- Do not create a versioned section — that happens at release time.

---

## Refactoring Rules

Refactoring is changing code structure without changing behaviour.
It is not the same as a feature, and should not be mixed with one.

```
❌ PR title: "Add dark mode + refactor auth module"
✅ PR title: "Add dark mode"
✅ PR title: "Refactor: extract auth helpers into lib/auth/"
```

### When to refactor

Refactor when:
- You're about to add a feature and the existing code makes it hard
- A file has hit its hard line limit (see QUALITY.md)
- The same logic appears in 3+ places
- A bug was caused by unclear code (refactor after fixing, not during)

Do not refactor:
- Just because the code looks old
- Without tests already in place (refactor = tests must pass before and after)
- In the same PR as a feature or bug fix

### Strangler Fig pattern for large rewrites

Never rewrite a large module all at once. Use the strangler fig:

```ts
// Step 1: New implementation alongside the old one
export function parseOrderV2(raw: RawOrder): Order { ... }

// Step 2: Route new callers to v2
// Step 3: Migrate old callers one by one
// Step 4: Delete v1 once all callers use v2
```

---

## Monthly Maintenance Checklist

Run this on the first of each month alongside the package update cycle.

```
[ ] npm audit — fix critical/high severity issues
[ ] grep -r "TODO" src/ — close or escalate stale TODOs
[ ] Review GitHub issues labelled tech-debt — prioritise for next sprint
[ ] Check Sentry unresolved errors — close false positives, ticket real ones
[ ] Check slow query log — anything > 500ms consistently needs attention
[ ] Review API key list in each service — delete unused keys
[ ] Review ENV.md — any keys expiring in next 90 days?
[ ] Run npm-check-updates — see what's outdated (update in staging per PACKAGES.md)
[ ] Review CHANGELOG [Unreleased] — prepare for release if substantial
[ ] Check bundle size — has it grown unexpectedly?
```

---

## Versioning & Releases

Use Semantic Versioning: `MAJOR.MINOR.PATCH`

| Change type | Version bump |
|---|---|
| Breaking API or data change | MAJOR (1.0.0 → 2.0.0) |
| New feature, backward compatible | MINOR (1.0.0 → 1.1.0) |
| Bug fix, no API change | PATCH (1.0.0 → 1.0.1) |

```bash
# Tag a release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# Or use standard-version to automate changelog + tag
npx standard-version
```

Move `## [Unreleased]` entries to `## [1.2.0] — YYYY-MM-DD` at release time.

---

## Database Maintenance

```bash
# Monthly: check for slow queries
# In Supabase: Dashboard → Query Performance
# In Railway: Metrics → Query Stats

# Check for unused indexes (PostgreSQL)
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pk_%';

# Check table bloat (after heavy deletes/updates)
# Run VACUUM ANALYZE on tables with > 20% dead tuples
VACUUM ANALYZE orders;
```

---

## Code Review Debt

Track "review debt" separately from tech debt. Review debt is when PRs wait too long for review.

Rules:
- PRs should be reviewed within 24 hours of opening.
- Stale PRs (no activity > 3 days) should be pinged or closed.
- A PR that's been open > 1 week is a process failure, not a people failure.

---

## Rules for Claude

- When fixing a bug, check if there's a related TODO comment and close it.
- When introducing a workaround, always add a `TODO(#issue)` comment — never silent workarounds.
- When completing any feature or fix, append to `CHANGELOG.md [Unreleased]`.
- When deprecating something, follow the two-phase pattern — never delete without a migration period.
- Never mix refactoring with features in the same PR.
- If asked to refactor something, check that tests exist first — if not, write tests before refactoring.

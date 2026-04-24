# GIT.md — Git & GitHub Conventions

---

## Identity — Commits Are Always the Developer's

Git identity must never be changed. All commits appear under the developer's name.

```bash
# Verify before any commit
git config user.name   # must be the developer's name
git config user.email  # must be the developer's email

# If wrong, fix globally
git config --global user.name  "Your Name"
git config --global user.email "you@yourdomain.com"
```

**Rules for Claude:**
- Never change `user.name` or `user.email`.
- Never add `Co-Authored-By: Claude` to commit messages unless explicitly asked.
- Never create commits autonomously. Stage changes, write the message, then stop — the developer runs `git commit`.
- Never push autonomously. The developer pushes.

---

## Commit Message Format

Use Conventional Commits. This enables automatic changelogs and clear git history.

```
<type>(<scope>): <short description>

[optional body — why, not what]

[optional footer — breaking changes, issue refs]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `chore` | Maintenance, dependency updates, config changes |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (not CSS) |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverting a previous commit |

### Examples

```
feat(auth): add magic link login via Resend
fix(checkout): resolve stripe webhook signature validation on edge runtime
chore(deps): update packages to latest minor versions
perf(images): convert hero images to avif format
test(api): add integration tests for /api/orders endpoint
docs: update ENV.md with new Stripe webhook secret
refactor(db): extract query helpers into lib/db/queries.ts
```

### Rules
- Subject line: imperative present tense, no capital first letter, no period.
- Max 72 characters in subject line.
- Body explains *why*, not *what* — the diff shows what.
- Reference issues: `Closes #123` or `Refs #456` in footer.

---

## Branching Strategy

```
main            ← production. Protected. PR only, no direct push.
staging         ← pre-production. Merges from feature branches for QA.
feature/<name>  ← all new work. Branch from main, merge back via PR.
fix/<name>      ← bug fixes. Same rules as feature branches.
chore/<name>    ← maintenance, dependency updates.
```

### Branch naming
```
feature/user-authentication
feature/dashboard-redesign
fix/mobile-nav-overflow
chore/update-october-packages
```

### Rules
- Never push directly to `main`.
- Delete feature branches after merge.
- Keep branches short-lived — long-running branches cause merge conflicts.
- Rebase onto main before opening a PR if the branch is behind.

---

## Pull Request Convention

### Title
Same format as a commit message: `feat(auth): add magic link login`

### Body template

```md
## What
Brief description of what changed.

## Why
Why this change is needed.

## How to test
1. Step one
2. Step two
3. Expected result

## Screenshots (if UI change)
[attach before/after screenshots]

## Checklist
- [ ] Tests written and passing
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)
- [ ] ENV.md updated if new env vars added
- [ ] DECISIONS.md updated if a tool or pattern choice was made
```

---

## Workflow for Large Changes

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Work in small, logical commits
git add -p               # stage interactively — review each hunk
git diff --staged        # review before committing
git commit               # developer runs this

# 3. Keep in sync
git fetch origin
git rebase origin/main   # prefer rebase over merge for cleaner history

# 4. Open PR when ready
gh pr create --title "feat: ..." --body "..."

# 5. After merge, clean up
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

## What Claude Should Do (and Not Do)

| Claude should | Claude should not |
|---|---|
| Stage files with `git add` | Run `git commit` |
| Write the commit message | Run `git push` |
| Run `git status` before staging | Change `user.name` or `user.email` |
| Run `git diff --staged` for review | Add Co-Authored-By without being asked |
| Suggest the branch name | Merge or rebase without confirmation |
| Describe what each file change does | Create tags or releases autonomously |

---

## `.gitignore` Essentials

Always ensure these are ignored:

```
.env.local
.env.*.local
.env.production
*.pem
*.key
.DS_Store
node_modules/
.next/
dist/
build/
coverage/
*.log
```

# CLAUDE.md — Prototype / Static (V6)

**Tier: Prototype / Static** — move fast, stay simple, zero process overhead.
The goal is a working demo that looks real. Not production code.

---

## When to use this tier

Use this kernel when **all** of the following are true:
- No authenticated users
- No persistence beyond `localStorage` or in-file mocks
- No real API keys in client code
- No PII collection

If any of these become false, graduate: `/graduate mvp` (or copy `CLAUDE.mvp.md` into place).

---

## Project

**Name:** [Project name]
**What it is:** [One sentence]
**Output:** [Single HTML file | Static folder | React SPA | Other]

---

## Stack

- **Styling:** Tailwind CSS (CDN is fine for prototypes)
- **Framework:** [Vanilla HTML + Alpine.js | React via Vite | Next.js]
- **Language:** [JavaScript | TypeScript]
- **Data:** [None | In-file mocks | localStorage only]

---

## If the feature is new or UX isn't obvious — use SPEC.md

For any user-facing flow with more than one screen, read `docs/SPEC.md` first. Its Phase 2 prototype brief is the canonical starting point for this tier. Use `/spec` to scaffold one.

Skip SPEC.md only for: single-screen demos, landing pages, layout experiments.

---

## Rules — Short List

**Always:**
- Tailwind classes only. No inline styles. No CSS files.
- `cn()` for conditional classes in React. Plain string concat otherwise.
- Mobile-first layout. Design for small screens first.
- Meaningful names. `handleDeleteItem` not `handleClick`.
- Components under 150 lines. Split if bigger.
- Semantic HTML: `<button>` not `<div onClick>`. `<label for>` on inputs. `alt` on images.

**Never:**
- No `any` in TypeScript — use `unknown` or type it.
- No `console.log` left in final output.
- No placeholder text like "Lorem ipsum" — use realistic fake data.
- No real API keys in client code. Not even for demos. Fake the API.
- No PII collection (no real email fields wired to real services).

**Explicitly not required:**
- No tests.
- No error handling beyond what the user would see.
- No performance optimisation.
- No hardened security (CSP, rate limits, audits).
- No git conventions.
- No PLAN.md approval gates.
- No ENV.md tracking.

---

## Stay Simple

If Claude is about to:
- Add a build step that wasn't asked for → don't
- Introduce a state management library for a 2-screen app → don't
- Add TypeScript to a plain HTML request → don't
- Create 8 files for something that fits in 2 → don't
- Add error boundaries, loading states, and retry logic to a demo → don't
- Wire auth into a prototype → don't (if you need it, graduate first)

**Ask: is this the simplest thing that works and looks good?** If not, simplify before writing.

---

## Output Quality

The one thing that matters: **it should look real**.

- Real-looking data — names, prices, dates (not "User 1", "$0.00", "2024-01-01")
- Personas reused consistently across screens (define in SPEC.md if the flow has any depth)
- Use `https://i.pravatar.cc/150?img=[N]` for avatars, `https://picsum.photos/[w]/[h]?random=[N]` for other images
- Consistent spacing using Tailwind's scale (don't mix `p-3` and `p-[11px]`)
- Proper empty states (don't leave blank divs when a list is empty)
- Hover, focus, and active states on interactive elements
- Readable typography — body text at least `text-sm` with `leading-relaxed`
- Animations that communicate intent (transitions, skeletons, toasts) — not decoration

---

## Graduating to MVP

When **any** of the following becomes true, run `/graduate mvp`:

- [ ] Real users are about to log in
- [ ] A real database is being wired
- [ ] You're about to deploy to a public URL as a product (not a demo)
- [ ] Real API keys would need to exist
- [ ] You're collecting any PII

`/graduate mvp` swaps this kernel for `CLAUDE.mvp.md`, scaffolds `docs/ENV.md`, `docs/DECISIONS.md`, and a minimal `SECURITY.md` posture. The prototype HTML moves to `prototypes/[feature].html` as visual reference.

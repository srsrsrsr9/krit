# TESTING.md — Testing Strategy & Conventions

---

## Core Rule

**No feature is complete without tests.** Claude must write tests before marking any task done.
If a task adds or changes behaviour, it adds or updates tests. No exceptions.

---

## Stack

| Layer | Tool |
|---|---|
| Unit & integration | Vitest |
| React components | React Testing Library |
| End-to-end | Playwright |
| API routes | Vitest + supertest (or native fetch) |
| Mocking | Vitest built-in mocks + MSW for network |

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D playwright msw
```

---

## File Conventions

Co-locate tests with source files. Do not use a separate `__tests__` root directory.

```
src/
  components/
    Button.tsx
    Button.test.tsx        ← unit test lives here
  lib/
    stripe.ts
    stripe.test.ts
  app/
    api/
      orders/
        route.ts
        route.test.ts
e2e/
  checkout.spec.ts         ← Playwright e2e tests only
  auth.spec.ts
```

Test file naming:
- `*.test.ts` / `*.test.tsx` — unit and integration
- `*.spec.ts` — Playwright e2e only

---

## What to Test at Each Layer

### Unit tests — pure functions, utilities, hooks
```ts
// lib/formatPrice.test.ts
import { formatPrice } from "./formatPrice"

describe("formatPrice", () => {
  it("formats cents to dollars with currency symbol", () => {
    expect(formatPrice(1999)).toBe("$19.99")
  })
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00")
  })
  it("handles large amounts", () => {
    expect(formatPrice(100000)).toBe("$1,000.00")
  })
})
```

### Component tests — rendering, interaction, accessibility
```tsx
// components/Button.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./Button"

describe("Button", () => {
  it("renders label", () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Save</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Save</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
```

### API route tests — request/response, auth, validation
```ts
// app/api/orders/route.test.ts
import { GET } from "./route"

describe("GET /api/orders", () => {
  it("returns 401 when unauthenticated", async () => {
    const req = new Request("http://localhost/api/orders")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})
```

### E2E tests — critical user journeys only
```ts
// e2e/checkout.spec.ts
test("user can complete checkout", async ({ page }) => {
  await page.goto("/products")
  await page.getByRole("button", { name: "Add to cart" }).first().click()
  await page.getByRole("link", { name: "Checkout" }).click()
  // ...
  await expect(page.getByText("Order confirmed")).toBeVisible()
})
```

---

## Test Priority — What Matters Most

Not all code carries equal risk. Write tests in this order of priority:

**Always test thoroughly (100% coverage target):**
- Money movement — payment processing, refunds, calculations, totals
- Auth and permissions — login, session, ownership checks, role gates
- Data mutations — anything that writes to the database
- Webhook handlers — external events that trigger state changes
- Public API contracts — anything external services depend on

**Test the important paths (aim for critical branches covered):**
- Form validation logic
- Error handling and edge cases (empty, null, network failure)
- Retry and idempotency logic
- Data transformation functions

**Deprioritise (test if fast, skip if slow or trivial):**
- Pure UI styling (whether a button is blue)
- Simple passthrough functions with no logic
- Component snapshot tests (they break on every style change and tell you nothing)
- Code with no branching logic

**The rule:** if this code handles money, auth, or modifies data, it needs a test.
If it only renders text, a test is optional.

---

- Implementation details (internal state, private methods)
- Third-party library internals
- Styles or exact CSS class names
- Things that never break and add no value (simple getters, one-line wrappers)

---

## Mocking

Use MSW for network-level mocking. Do not mock modules unless unavoidable.

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("/api/user", () => {
    return HttpResponse.json({ id: "1", name: "Test User" })
  }),
]
```

For module mocks when truly needed:
```ts
vi.mock("@/lib/stripe", () => ({
  stripe: { checkout: { sessions: { create: vi.fn() } } }
}))
```

---

## Coverage

Run coverage locally before opening a PR:

```bash
npm run test -- --coverage
```

Targets (enforced in CI):
- Statements: 80%
- Branches: 75%
- Functions: 80%

These are floors, not ceilings. Critical paths (auth, payments, data mutations) should be at 100%.

---

## CI Integration

All of these must pass before a PR can merge:

```yaml
# .github/workflows/ci.yml
- run: npm run typecheck
- run: npm run lint
- run: npm run test -- --coverage
- run: npm run build
```

Playwright e2e runs on merge to `staging` only — not on every PR (too slow).

---

## Rules for Claude

- Write tests in the same session as the feature — not as a follow-up task.
- Test the behaviour, not the implementation. Ask "what should this do?" not "how does it do it?"
- Use `screen.getByRole` over `getByTestId` — test what the user sees.
- Do not add `data-testid` attributes unless no semantic selector exists.
- If a bug is fixed, write a regression test that would have caught it.
- If a test is hard to write, that's a signal the code needs refactoring, not that the test should be skipped.

---

## Test Data — Factories

Never use raw object literals as test data. Use factories — they stay in sync with your types.

```bash
npm install -D @anatine/zod-mock  # or hand-roll factories
```

```ts
// tests/factories/order.ts
import type { Order, User } from "@prisma/client"

let id = 0
const nextId = () => `test-${++id}`

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id:        nextId(),
    email:     `user-${id}@example.com`,
    name:      "Test User",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id:        nextId(),
    status:    "PENDING",
    total:     1999,           // always cents
    userId:    nextId(),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}
```

```ts
// Usage in tests
const user  = makeUser({ name: "Alice" })
const order = makeOrder({ userId: user.id, status: "PAID" })
```

**Rules:**
- Factories in `tests/factories/` — one file per model.
- Factories return the full type, with sensible defaults, overridable with a partial.
- Never hardcode IDs like `"user-123"` — use the `nextId()` counter so tests don't collide.
- For DB integration tests, use `db.$transaction` + rollback to keep tests isolated.

---

## Mock Strategy — When to Use What

Not all mocking is equal. Wrong mocking strategy = tests that pass but don't catch real bugs.

| Situation | Tool | Why |
|---|---|---|
| HTTP calls to external APIs | MSW | Intercepts at network level — closest to real |
| Database in unit tests | vi.mock prisma client | Fast, no DB needed |
| Database in integration tests | Real DB + transaction rollback | Catches query bugs |
| Time-dependent logic | `vi.useFakeTimers()` | Deterministic |
| Environment variables | `vi.stubEnv()` | Isolated |
| Browser APIs (localStorage etc) | `vi.stubGlobal()` | JSDOM doesn't have them |
| Third-party React components | Render them — don't mock | Test integration, not isolation |

```ts
// ✅ MSW for HTTP — tests your actual fetch logic
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("https://api.stripe.com/v1/customers/:id", ({ params }) => {
    return HttpResponse.json({ id: params.id, email: "test@example.com" })
  }),

  http.post("https://api.stripe.com/v1/charges", () => {
    return HttpResponse.json({ id: "ch_test", status: "succeeded" })
  }),
]

// ✅ vi.useFakeTimers for time-sensitive tests
it("expires session after 30 minutes", () => {
  vi.useFakeTimers()
  const session = createSession()
  vi.advanceTimersByTime(31 * 60 * 1000)
  expect(isSessionExpired(session)).toBe(true)
  vi.useRealTimers()
})

// ✅ Transaction rollback for DB integration tests
describe("createOrder (integration)", () => {
  beforeEach(async () => {
    await db.$executeRaw`BEGIN`
  })
  afterEach(async () => {
    await db.$executeRaw`ROLLBACK`
  })

  it("creates order and decrements inventory", async () => {
    const user  = await db.user.create({ data: makeUser() })
    const result = await createOrder({ userId: user.id, productId: "p1", qty: 2 })
    expect(result.ok).toBe(true)
    const inventory = await db.inventory.findUnique({ where: { productId: "p1" } })
    expect(inventory?.stock).toBe(8)  // was 10
  })
})
```

**Rules:**
- Prefer MSW over mocking your own fetch/api functions — it tests more of the real code path.
- Use real DB (with rollback) for tests that touch Prisma — mocking Prisma catches almost nothing.
- `vi.mock()` a module only when it has genuine side effects you can't control (email sending, file system).
- Never mock what you own — test it.

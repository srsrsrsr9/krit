# QUALITY.md — Code Quality Standards

---

## The Standard

Code is read far more than it is written. Every file should be understandable to
a competent developer who has never seen the project before, without needing to ask
anyone what it does.

When in doubt: **clarity over cleverness.**

---

## TypeScript

### No `any`. Ever.

```ts
// ❌ Opt-out of type safety
function process(data: any) { ... }

// ✅ Type it properly
function process(data: OrderPayload) { ... }

// ✅ If the shape is genuinely unknown, say so explicitly
function process(data: unknown) {
  if (!isOrderPayload(data)) throw new Error("Invalid payload")
  // now data is OrderPayload
}

// ✅ If any is truly unavoidable, comment why
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyAdapter = (input: any) => ...  // third-party lib ships no types
```

### Prefer inference, avoid redundant annotations

```ts
// ❌ Redundant — TypeScript infers this
const count: number = 0
const name: string = "Alice"

// ✅ Let TypeScript infer where it's obvious
const count = 0
const name = "Alice"

// ✅ Annotate where inference would be wrong or unclear
const items: Order[] = []          // empty array needs annotation
function getUser(): Promise<User>  // return type is good to annotate explicitly
```

### Prefer `type` over `interface` for most things

```ts
// ✅ type for data shapes
type User = { id: string; name: string; email: string }

// ✅ interface when you need declaration merging or class implementation
interface Repository<T> {
  findById(id: string): Promise<T | null>
  save(entity: T): Promise<T>
}

// ✅ Use discriminated unions for state machines — not boolean flags
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Order[] }
  | { status: "error"; error: string }
```

### Narrowing over casting

```ts
// ❌ Casting — silences the error, doesn't fix it
const order = response as Order

// ✅ Narrowing — actually verifies the shape
function isOrder(value: unknown): value is Order {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "status" in value
  )
}
if (isOrder(response)) { /* response is Order here */ }

// ✅ Zod for runtime validation + type narrowing together
const order = OrderSchema.parse(response)  // throws if invalid, types correctly
```

### Avoid type assertions on props

```ts
// ❌ You're lying to the compiler
<UserCard user={data as User} />

// ✅ Handle the undefined case
if (!data) return <Skeleton />
<UserCard user={data} />
```

---

## Naming

### Be specific, not abstract

```ts
// ❌ Too abstract — what data? what type?
const data = await fetchData()
const result = processResult(input)
const handleClick = () => ...

// ✅ Says what it is
const orders = await fetchUserOrders(userId)
const sanitised = sanitiseHtmlContent(rawHtml)
const handleDeleteOrder = () => ...
```

### Conventions by type

| What | Convention | Example |
|---|---|---|
| Variables, functions | camelCase | `getUserOrders`, `isLoading` |
| Components | PascalCase | `OrderCard`, `CheckoutForm` |
| Types, interfaces | PascalCase | `OrderPayload`, `ApiError` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Files (components) | PascalCase | `OrderCard.tsx` |
| Files (utilities) | kebab-case | `format-price.ts` |
| CSS classes / ids | kebab-case | `order-card`, `checkout-form` |
| Env vars | SCREAMING_SNAKE | `MYAPP_STRIPE_SECRET` |
| Boolean variables | prefix with `is`, `has`, `can`, `should` | `isLoading`, `hasError`, `canDelete` |
| Event handlers | prefix with `handle` | `handleSubmit`, `handleDeleteOrder` |
| Async functions | verb + noun | `fetchOrders`, `createUser`, `deleteOrder` |

### Don't abbreviate unless universally known

```ts
// ❌ Saves 3 chars, costs comprehension
const usr = getUsr(usrId)
const idx = arr.findIdx(...)
const cfg = loadCfg()

// ✅ These abbreviations are fine (universally understood)
const db = new PrismaClient()
const id = cuid()
const res = await fetch(url)
const req = request
const err = error
const i = index  // in short loops only
```

---

## Component Architecture

### One component, one responsibility

```tsx
// ❌ Does too much — fetches, formats, renders, handles delete
function OrdersPage() {
  const [orders, setOrders] = useState([])
  useEffect(() => { fetch("/api/orders").then(...).then(setOrders) }, [])
  const formatDate = (d: string) => new Date(d).toLocaleDateString()
  const handleDelete = async (id: string) => { ... }
  return <div>{orders.map(o => <div onClick={() => handleDelete(o.id)}>{formatDate(o.createdAt)}</div>)}</div>
}

// ✅ Separated by responsibility
function OrdersPage() {
  const { data: orders } = useOrders()                // data fetching in hook
  return <OrderList orders={orders ?? []} />           // rendering in component
}

function OrderList({ orders }: { orders: Order[] }) {
  return <ul>{orders.map(o => <OrderItem key={o.id} order={o} />)}</ul>
}

function OrderItem({ order }: { order: Order }) {
  const { mutate: deleteOrder } = useDeleteOrder()    // mutation in hook
  return <li onClick={() => deleteOrder(order.id)}>{formatDate(order.createdAt)}</li>
}
```

### Props

```tsx
// ❌ Prop drilling — passing data through 3+ layers
<Page user={user} onUserUpdate={handleUpdate} userPermissions={perms} />
  <Layout user={user} onUserUpdate={handleUpdate} userPermissions={perms} />
    <Sidebar user={user} userPermissions={perms} />

// ✅ Compose or use context for deep trees
// ✅ Keep prop interfaces small and focused
type OrderCardProps = {
  order: Order
  onDelete?: (id: string) => void  // optional actions
  className?: string               // styling passthrough
}

// ❌ Too many props = component doing too much
type TableProps = {
  data: Row[]
  sortBy: string
  sortOrder: "asc" | "desc"
  onSort: (col: string) => void
  filters: Filter[]
  onFilter: (f: Filter) => void
  pagination: PaginationState
  onPageChange: (page: number) => void
  selectedRows: string[]
  onRowSelect: (id: string) => void
  // ... 10 more
}
// ✅ Split into composable sub-components
```

### File size limits

| File type | Soft limit | Hard limit |
|---|---|---|
| Component | 150 lines | 300 lines |
| Utility / helper | 100 lines | 200 lines |
| API route handler | 50 lines | 100 lines |
| Hook | 80 lines | 150 lines |
| Store | 60 lines | 120 lines |

If a file is approaching the hard limit, it should be split. A file that's too long
is almost always doing too many things.

---

## Functions

### Keep functions short and single-purpose

```ts
// ❌ Long function doing multiple things
async function processOrder(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error("Not found")
  const user = await db.user.findUnique({ where: { id: order.userId } })
  const total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  await stripe.charges.create({ amount: total, customer: user.stripeId })
  await db.order.update({ where: { id: orderId }, data: { status: "PAID" } })
  await sendEmail(user.email, "order-confirmed", { order })
  await db.inventory.updateMany({ ... })
}

// ✅ Each step is named and testable independently
async function processOrder(orderId: string) {
  const { order, user } = await fetchOrderWithUser(orderId)
  const total = calculateOrderTotal(order.items)
  await chargeCustomer(user.stripeId, total)
  await markOrderPaid(orderId)
  await notifyCustomer(user.email, order)
  await decrementInventory(order.items)
}
```

### Prefer pure functions

```ts
// ❌ Side effects hidden inside
function getDisplayName(user: User) {
  analytics.track("name_viewed", { userId: user.id })  // hidden side effect
  return user.name ?? user.email
}

// ✅ Pure — predictable, testable
function getDisplayName(user: User): string {
  return user.name ?? user.email
}
// Side effect is explicit at the call site
analytics.track("name_viewed", { userId: user.id })
const name = getDisplayName(user)
```

### Early returns over nesting

```ts
// ❌ Arrow anti-pattern — deeply nested
function processPayment(order: Order) {
  if (order) {
    if (order.status === "PENDING") {
      if (order.total > 0) {
        if (order.user.stripeId) {
          // actual logic buried here
        }
      }
    }
  }
}

// ✅ Guard clauses — flat and readable
function processPayment(order: Order) {
  if (!order) return { ok: false, error: "No order" }
  if (order.status !== "PENDING") return { ok: false, error: "Wrong status" }
  if (order.total <= 0) return { ok: false, error: "Invalid total" }
  if (!order.user.stripeId) return { ok: false, error: "No payment method" }

  // actual logic here, without nesting
}
```

---

## PR Review Checklist

Before approving any PR, verify:

**Correctness**
- [ ] Does it do what the ticket/issue says?
- [ ] Are edge cases handled? (empty state, error state, loading state)
- [ ] Are there tests for the new behaviour?
- [ ] Does `npm run typecheck` pass?

**Code Quality**
- [ ] No `any` without a comment
- [ ] No `console.log` or debug statements
- [ ] Functions are focused — no function doing more than one thing
- [ ] No obvious performance issue (N+1 queries, missing memoisation on hot path)
- [ ] Names are clear without needing to read the implementation

**Security**
- [ ] User input validated with Zod at the API boundary
- [ ] Resource ownership verified (user can only access their own data)
- [ ] No secrets in source code
- [ ] No `dangerouslySetInnerHTML` without sanitisation

**Hygiene**
- [ ] `ENV.md` updated if new env vars added
- [ ] `DECISIONS.md` updated if a tool/pattern choice was made
- [ ] No commented-out code committed
- [ ] No TODO comments without a linked issue

---

## Linting Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:tailwindcss/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Rules for Claude

- No `any` — if you don't know the type, use `unknown` and narrow it.
- No commented-out code — delete it, git history keeps it.
- No TODO comments without a linked issue number.
- No `console.log` — use the structured logger from `lib/logger.ts`.
- Functions over 40 lines are a smell — split before committing.
- If a component has more than 6 props, ask if it should be split.
- Guard clauses over nested conditionals always.
- If you write the same logic twice, extract a function. Three times, put it in `lib/`.

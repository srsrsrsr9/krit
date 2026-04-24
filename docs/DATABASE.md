# DATABASE.md — Database Conventions

---

## Stack

- **ORM:** Prisma (default) — change this line if using Drizzle or Supabase client
- **Database:** PostgreSQL
- **Connection pooling:** PgBouncer (via Railway/Supabase managed) or Prisma Accelerate
- **Migrations:** Prisma Migrate (dev) → `prisma migrate deploy` (production)

---

## Connection Rules

```ts
// lib/db.ts — single shared instance
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

**Rules:**
- Import `db` from `@/lib/db` everywhere — never instantiate `PrismaClient` directly in a file.
- Staging and production use separate databases — never share connection strings between environments.
- Never connect to the production database from a local development machine.
- Connection strings go in `.env.local` only — never committed.

---

## Schema Conventions

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())   // cuid for public IDs
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt              // always include updatedAt

  orders    Order[]
}

model Order {
  id        String      @id @default(cuid())
  status    OrderStatus @default(PENDING)
  total     Int                              // store money as cents (Int), never Float
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

**Rules:**
- Use `cuid()` for IDs (not auto-increment integers — exposes record counts).
- Always include `createdAt` and `updatedAt` on every model.
- Store money as `Int` (cents), never `Float` (floating point precision issues).
- Use enums for fields with a fixed set of values.
- Soft-delete with a `deletedAt DateTime?` field — prefer over hard deletes for auditable data.

---

## Query Patterns

### Always select only what you need

```ts
// ❌ Wrong — fetches entire user row including sensitive fields
const user = await db.user.findUnique({ where: { id } })

// ✅ Correct — select only what this function needs
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true },
})
```

### Paginate large lists

```ts
// ✅ Cursor-based pagination (preferred for large datasets)
const orders = await db.order.findMany({
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: "desc" },
})

// ✅ Offset pagination (simpler, fine for small datasets)
const orders = await db.order.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: "desc" },
})
```

### Batch operations

```ts
// ❌ Wrong — N+1 queries
const ordersWithUsers = await Promise.all(
  orders.map(order => db.user.findUnique({ where: { id: order.userId } }))
)

// ✅ Correct — single query with include
const orders = await db.order.findMany({
  include: { user: { select: { name: true, email: true } } },
})
```

---

## Migrations

```bash
# Development — creates and applies a migration
npx prisma migrate dev --name add-order-status

# Production — applies pending migrations (no schema changes)
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate

# Explore data
npx prisma studio
```

**Rules:**
- Never run `prisma migrate dev` against production.
- Never edit a migration file after it has been applied — create a new migration instead.
- Every schema change requires a migration — never use `prisma db push` in production.
- Review migration SQL before deploying: `prisma migrate diff`.
- For destructive changes (column drops, renames): add the new column first, migrate data, drop the old column in a separate deployment.

---

## Transactions

Use transactions for operations that must succeed or fail together:

```ts
// ✅ Both updates succeed or both roll back
const result = await db.$transaction(async (tx) => {
  const order = await tx.order.update({
    where: { id: orderId },
    data:  { status: "PAID" },
  })

  await tx.inventory.update({
    where: { productId: order.productId },
    data:  { stock: { decrement: order.quantity } },
  })

  return order
})
```

**Rules:**
- Any operation that modifies more than one table should use a transaction.
- Keep transactions short — don't do slow operations (external API calls) inside a transaction.

---

## Seeding

```ts
// prisma/seed.ts
import { db } from "@/lib/db"

async function main() {
  await db.user.upsert({
    where:  { email: "test@example.com" },
    update: {},
    create: { email: "test@example.com", name: "Test User" },
  })
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
```

```bash
npx prisma db seed
```

**Rules:**
- Seeds are for development and staging only — never run against production.
- Use `upsert` in seeds so they're idempotent (safe to run multiple times).

---

## Rules for Claude

- Always use the shared `db` instance from `@/lib/db`.
- Always select only the fields needed — no bare `findUnique` without `select` on large models.
- Never write raw SQL with string concatenation — use Prisma or tagged template literals.
- Store money as `Int` (cents), never `Float`.
- Use transactions for multi-table mutations.
- Never run `migrate dev` or `db push` against production.
- Paginate any query that could return unbounded rows.
- After any schema change, remind the developer to run `prisma generate` and create a migration.

---

## Migration Safety — Destructive Changes

For column drops, renames, or type changes on a live database, never do it in one step.

```
Step 1 (deploy): Add new column, write to both old and new
Step 2 (deploy): Migrate existing data to new column
Step 3 (deploy): Read from new column only
Step 4 (deploy): Drop old column
```

Each step is a separate deployment. This pattern prevents downtime and gives a
rollback window at each stage. A single migration that renames a column will break
any running instance that hasn't deployed yet.

---

## Self-Check — Run Before Any Database Work

```
[ ] Am I using the shared db instance from lib/db.ts (not a new PrismaClient)?
[ ] Do all queries have select: clauses (no bare findUnique/findMany on large models)?
[ ] Are multi-table mutations wrapped in a transaction?
[ ] Is money stored as Int (cents), not Float?
[ ] Is any raw SQL using tagged template literals (not string concatenation)?
[ ] For migrations: am I running migrate deploy (not migrate dev) against production?
[ ] For destructive schema changes: is this a multi-step deploy, not a single migration?
[ ] Could this query return unbounded rows? If so, is it paginated?
```

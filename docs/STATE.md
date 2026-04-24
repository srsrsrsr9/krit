# STATE.md — State Management Patterns

---

## Decision Tree — Which State Goes Where?

Before reaching for any state tool, ask:

```
Can this be derived from existing state or props?
  → Yes: compute it, don't store it

Does this come from the server?
  → Yes: TanStack Query (or SWR)

Does this need to be bookmarkable / shareable via URL?
  → Yes: URL state (searchParams)

Is this purely local UI state (open/closed, hover, focus)?
  → Yes: useState or useReducer in the component

Does this need to be shared across many components?
  → Yes: Zustand store

Everything else: useState first, promote when needed
```

**The rule:** reach for the simplest tool that solves the problem.
`useState` → `useReducer` → `Zustand` → only if truly needed.

---

## Server State — TanStack Query

Use TanStack Query for all data that lives on the server. This covers: fetching, caching, background refetching, optimistic updates, and pagination.

```bash
npm install @tanstack/react-query
```

### Basic fetch

```tsx
// hooks/useOrders.ts
import { useQuery } from "@tanstack/react-query"
import { getOrders } from "@/lib/api"

export function useOrders(userId: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn:  () => getOrders(userId),
    staleTime: 1000 * 60 * 5,   // 5 min — don't refetch if fresh
  })
}

// Usage
const { data, isLoading, error } = useOrders(session.user.id)
```

### Mutations with optimistic update

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),

    // Optimistically remove from cache immediately
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] })
      const previous = queryClient.getQueryData(["orders"])
      queryClient.setQueryData(["orders"], (old: Order[]) =>
        old.filter(o => o.id !== orderId)
      )
      return { previous }
    },

    // Roll back if the mutation fails
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["orders"], context?.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
```

### Query key conventions

```ts
// Hierarchical keys — invalidating ["orders"] invalidates all below
["orders"]                          // all orders
["orders", userId]                  // user's orders
["orders", userId, { status }]      // filtered orders
["orders", orderId]                 // single order
```

**Rules:**
- Always use hierarchical query keys — makes targeted invalidation easy.
- Set `staleTime` explicitly — the default (0) refetches on every focus, which is usually wrong.
- Prefer `invalidateQueries` after mutations over `setQueryData` — keeps server as source of truth.
- In Next.js App Router: fetch on the server in Server Components, use Query only in Client Components where you need reactivity.

---

## Client State — Zustand

Use Zustand for UI state that must be shared across components and has nothing to do with the server.

```bash
npm install zustand
```

### Store pattern

```ts
// store/ui.ts
import { create } from "zustand"

type UIStore = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
```

```tsx
// Usage — anywhere in the tree, no providers needed
const { sidebarOpen, toggleSidebar } = useUIStore()
```

### Persisted store (survives page refresh)

```ts
// store/preferences.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

type PrefsStore = {
  theme: "light" | "dark" | "system"
  setTheme: (theme: PrefsStore["theme"]) => void
}

export const usePrefsStore = create<PrefsStore>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "user-preferences" }   // localStorage key
  )
)
```

**Rules:**
- One store per domain — don't put everything in one giant store.
- Actions live inside the store, not in components.
- Don't put server data in Zustand — that's TanStack Query's job.
- Keep stores serialisable — no functions, no class instances as stored values.

---

## URL State — Shareable Filters & Pagination

Use URL state for anything the user should be able to bookmark or share: filters, search queries, pagination, selected tabs.

```tsx
// app/orders/page.tsx (Next.js App Router)
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function OrderFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const status = searchParams.get("status") ?? "all"

  function setStatus(newStatus: string) {
    const params = new URLSearchParams(searchParams)
    params.set("status", newStatus)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select value={status} onChange={(e) => setStatus(e.target.value)}>
      <option value="all">All</option>
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
    </select>
  )
}
```

**Rules:**
- Filters, search, sort, and pagination → URL state.
- Transient UI (dropdowns, tooltips, modals) → `useState`.
- Use `nuqs` library if URL state gets complex:
  ```bash
  npm install nuqs
  ```

---

## Local Component State — useState / useReducer

Default for anything that doesn't need to be shared.

```tsx
// Simple toggle
const [isOpen, setIsOpen] = useState(false)

// Multi-field form state — useReducer is cleaner
type FormState = { name: string; email: string; errors: Record<string, string> }
type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "SET_ERRORS"; errors: Record<string, string> }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD": return { ...state, [action.field]: action.value }
    case "SET_ERRORS": return { ...state, errors: action.errors }
  }
}
```

**Rules:**
- Use `useState` for single values; `useReducer` when multiple fields change together.
- Don't lift state higher than necessary — keep it as local as possible.
- For forms: use `react-hook-form` + `zod` rather than hand-rolling form state.

---

## Form State — React Hook Form

All forms use React Hook Form + Zod. Never hand-roll form state.

```bash
npm install react-hook-form @hookform/resolvers zod
```

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    // data is fully typed and validated
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit" disabled={isSubmitting}>Login</button>
    </form>
  )
}
```

---

## Anti-Patterns

```ts
// ❌ Server data in Zustand — use TanStack Query
const useOrderStore = create(() => ({ orders: [] }))
useEffect(() => { fetch("/api/orders").then(r => r.json()).then(set) }, [])

// ❌ useState for server data — use TanStack Query
const [orders, setOrders] = useState([])
useEffect(() => { ... }, [])

// ❌ Zustand for form state — use react-hook-form
const useFormStore = create(() => ({ name: "", email: "" }))

// ❌ Derivable state stored unnecessarily
const [fullName, setFullName] = useState("")  // if you already have first + last
// ✅ const fullName = `${firstName} ${lastName}`

// ❌ Sharing state by lifting to root unnecessarily
// ✅ Keep state as local as possible, promote only when two unrelated branches need it
```

---

## Rules for Claude

- Before choosing a state tool, work through the decision tree at the top of this file.
- Never store server data in Zustand — use TanStack Query.
- Never use `useEffect` + `useState` to fetch data — use TanStack Query.
- Always use `react-hook-form` + `zod` for forms — never hand-rolled form state.
- URL state for filters and pagination — not component state.
- Keep Zustand stores focused on one domain — no God stores.

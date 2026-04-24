# PERFORMANCE.md — Performance Conventions

---

## Core Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Bundle size (initial JS) | < 200KB gzipped |
| Time to First Byte | < 600ms |

Measure with: `npm run build && npx @next/bundle-analyzer` and Lighthouse CI.

---

## Images

Always use `next/image`. Never use raw `<img>` tags for content images.

```tsx
// ❌ Wrong
<img src="/hero.png" alt="Hero" className="w-full" />

// ✅ Correct
import Image from "next/image"
<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={630}
  priority           // only for above-the-fold images
  className="w-full"
/>
```

**Rules:**
- `priority` prop only on the largest above-the-fold image (LCP element). Not on everything.
- Always provide `width` and `height` to prevent layout shift (CLS).
- Use `sizes` prop for responsive images: `sizes="(max-width: 768px) 100vw, 50vw"`.
- Prefer WebP/AVIF (Next.js handles this automatically).
- Never load images larger than they'll be displayed.

---

## Fonts

```tsx
// app/layout.tsx — load fonts once at the root
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",       // prevents invisible text during load
  variable: "--font-sans",
})
```

**Rules:**
- Use `next/font` — never link Google Fonts via `<link>` in `<head>`.
- `display: "swap"` always.
- Load only the weights and subsets you actually use.
- Self-host fonts in production if possible (avoids third-party DNS lookup).

---

## Code Splitting & Lazy Loading

```tsx
import dynamic from "next/dynamic"

// ❌ Wrong — loads heavy library for everyone upfront
import { HeavyChart } from "recharts"

// ✅ Correct — loads only when component renders
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false,   // only if component uses browser APIs
})
```

**When to use `dynamic()`:**
- Components below the fold
- Components only shown on user interaction (modals, drawers)
- Heavy third-party libraries (charts, editors, maps)
- Components that use browser-only APIs

---

## React Performance

```tsx
// Memoize expensive computations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.price - b.price),
  [items]
)

// Memoize callbacks passed to child components
const handleDelete = useCallback(
  (id: string) => deleteItem(id),
  [deleteItem]
)

// Memoize components that receive stable props
export const ItemCard = memo(function ItemCard({ item }: { item: Item }) {
  return <div>{item.name}</div>
})
```

**Rules:**
- Don't wrap everything in `memo`, `useMemo`, `useCallback` — only where profiling shows benefit.
- Profile first (`React DevTools > Profiler`), optimise second.
- Avoid creating new object/array literals in JSX props — they trigger re-renders.

```tsx
// ❌ New object created every render — child always re-renders
<Chart config={{ color: "blue" }} />

// ✅ Stable reference
const chartConfig = { color: "blue" }
<Chart config={chartConfig} />
```

---

## Bundle Size

```bash
# Analyse your bundle
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build
```

**Rules:**
- Import only what you use from large libraries:

```ts
// ❌ Imports entire lodash (~70KB)
import _ from "lodash"
const result = _.groupBy(items, "category")

// ✅ Imports one function (~2KB)
import groupBy from "lodash/groupBy"
const result = groupBy(items, "category")
```

- Check bundle impact before adding a new dependency: `npx bundlephobia [package-name]`
- Prefer smaller alternatives: `date-fns` over `moment`, `zustand` over `redux`, `zod` over `joi`.

---

## Data Fetching

```tsx
// ✅ Fetch on the server when possible — no client-side waterfall
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const [user, orders] = await Promise.all([
    getUser(),
    getOrders(),
  ])
  return <Dashboard user={user} orders={orders} />
}
```

**Rules:**
- Default to Server Components for data fetching — avoids client/server waterfalls.
- Use `Promise.all` for parallel fetches — never sequential `await` for independent requests.
- Cache aggressively: `fetch(url, { next: { revalidate: 3600 } })` for semi-static data.
- For real-time data, use SWR or React Query with appropriate `staleTime`.

---

## Third-Party Scripts

```tsx
// ❌ Blocks rendering — never in <head>
<script src="https://cdn.example.com/analytics.js" />

// ✅ Loads after page is interactive
import Script from "next/script"
<Script src="https://cdn.example.com/analytics.js" strategy="lazyOnload" />
```

`strategy` options:
- `afterInteractive` — loads after hydration (default, safe for analytics)
- `lazyOnload` — loads during browser idle time (best for non-critical scripts)
- `beforeInteractive` — blocks rendering (only for essential polyfills)

---

## Rules for Claude

- Never use raw `<img>` for content images — always `next/image`.
- Never add `priority` to more than one or two images per page.
- Always use `next/font` — never `<link>` to Google Fonts.
- Flag heavy dependencies before adding them. Check bundle size first.
- Use `dynamic()` for any component that isn't needed immediately on load.
- Fetch data in parallel with `Promise.all`, never sequentially.
- Never add third-party scripts with a blocking strategy.

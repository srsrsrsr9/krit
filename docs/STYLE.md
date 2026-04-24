# STYLE.md — Tailwind CSS & UI Conventions

---

## Core Rules (Non-Negotiable)

- **Tailwind utility classes exclusively.** No inline styles. No CSS modules. No `styled-components`.
- **Never fall back to inline styles.** If a class isn't working, fix the config — do not work around it.
- **Never construct class names dynamically.** `bg-${color}-500` gets purged in production. Use a full-class lookup map.

```ts
// ❌ Wrong — purged in production
const cls = `bg-${color}-500`

// ✅ Correct — full strings visible to the compiler
const colorMap = {
  blue:  "bg-blue-500",
  red:   "bg-red-500",
  green: "bg-green-500",
}
const cls = colorMap[color]
```

---

## The `cn()` Helper — Use It Always

Install once, use everywhere:

```bash
npm install clsx tailwind-merge
```

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Rules:**
- Use `cn()` for all conditional or merged class strings — never template literal concatenation.
- `cn()` resolves Tailwind class conflicts (e.g. `p-4` and `p-6` on the same element).
- Always import from `@/lib/utils`.

```tsx
// ❌ Wrong
<div className={`flex ${isActive ? "bg-blue-500" : "bg-gray-200"}`}>

// ✅ Correct
<div className={cn("flex", isActive ? "bg-blue-500" : "bg-gray-200")}>
```

---

## Class Ordering Convention

Write classes in this order. Install `prettier-plugin-tailwindcss` to enforce automatically.

```
1. Layout        → flex, grid, block, hidden
2. Position      → relative, absolute, inset-*, z-*
3. Sizing        → w-*, h-*, min-*, max-*
4. Spacing       → p-*, m-*, gap-*, space-*
5. Typography    → text-*, font-*, leading-*, tracking-*
6. Color         → bg-*, text-*, border-*
7. Border        → rounded-*, border-*, outline-*
8. Effects       → shadow-*, opacity-*, ring-*
9. Transitions   → transition-*, duration-*, ease-*
10. State        → hover:, focus:, active:, disabled:
11. Responsive   → sm:, md:, lg:, xl:, 2xl:
12. Dark mode    → dark:
```

```bash
npm install -D prettier-plugin-tailwindcss
```

---

## Responsive Design — Mobile First, Always

Start with base (mobile) styles. Enhance upward with breakpoint prefixes.

```tsx
// ❌ Wrong — desktop first
<div className="flex-row md:flex-col">

// ✅ Correct — mobile first
<div className="flex-col md:flex-row">
```

Always prefix breakpoint-scoped classes explicitly:

```tsx
// ❌ Ambiguous
<div className="block lg:flex flex-col justify-center">

// ✅ Clear — flex utilities are lg-only
<div className="block lg:flex lg:flex-col lg:justify-center">
```

Use container queries for components that must be reusable regardless of layout context:

```tsx
<div className="@container">
  <div className="flex-col @lg:flex-row">
```

---

## Arbitrary Values — Use Sparingly

Tailwind's default scale covers 95% of cases. Use `[]` for genuine exceptions only.

```tsx
// ❌ Avoid — breaks design system consistency
<div className="w-[347px] text-[#213547] rounded-[19px]">

// ✅ Prefer scale values
<div className="w-80 text-slate-800 rounded-2xl">

// ✅ Acceptable — genuinely off-scale, justified by design
<div className="bg-[#1DA1F2]">  {/* Twitter brand blue */}
```

If arbitrary values appear frequently, the real fix is adding the token to `tailwind.config.js`.

---

## No `@apply` — Extract Components Instead

**This is a project convention, not a Tailwind limitation.**
Tailwind v4 technically supports `@apply` and uses it in some official examples.
We avoid it anyway because: it hides utility classes from the file that uses them,
makes debugging harder (you trace CSS, not components), and doesn't benefit from
TypeScript or component props.

Repeated class patterns belong in a typed component, not a CSS class.

```tsx
// ❌ Wrong
// .btn-primary { @apply px-4 py-2 bg-blue-500 text-white rounded-lg; }

// ✅ Correct — typed, composable, debuggable
function Button({ children, variant = "primary", size = "md" }: ButtonProps) {
  return (
    <button className={cn(
      "rounded-lg font-medium transition-colors",
      size === "md" && "px-4 py-2 text-sm",
      size === "lg" && "px-6 py-3 text-base",
      variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
      variant === "ghost"   && "bg-transparent text-gray-700 hover:bg-gray-100",
    )}>
      {children}
    </button>
  )
}
```

---

## Design Tokens — Centralise in Config

Define your design system once. Never hardcode brand values as arbitrary classes.

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50:  "#f0f9ff",
        500: "#0ea5e9",
        900: "#0c4a6e",
      },
      surface: {
        DEFAULT: "#ffffff",
        muted:   "#f8fafc",
      }
    },
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
    },
  }
}
```

Then use tokens everywhere: `bg-brand-500`, `text-surface-muted`, `font-sans`.

---

## Dark Mode

Use the `dark:` variant. Configure once in `tailwind.config.js`:

```js
darkMode: "class"  // toggled by 'dark' class on <html>
```

Use CSS custom properties for semantic tokens that flip automatically:

```css
@layer base {
  :root   { --color-bg: theme(colors.white); --color-fg: theme(colors.slate.900); }
  .dark   { --color-bg: theme(colors.slate.950); --color-fg: theme(colors.slate.50); }
}
```

---

## Accessibility — Your Responsibility

Tailwind is CSS only. These are always required:

- `alt` text on all images.
- Semantic HTML — `<button>`, `<nav>`, `<main>`, `<section>` not divs for everything.
- `aria-*` attributes on interactive elements that lack visible labels.
- Focus styles on every interactive element:

```tsx
<button className={cn(
  "rounded-xl bg-sky-600 px-4 py-2 text-white transition",
  "hover:bg-sky-500",
  "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-60"
)}>
  Save
</button>
```

- `sr-only` for visually-hidden-but-accessible text.
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text (WCAG AA).

---

## Content Config — Keep It Broad

Wrong content paths = classes purged in production. Keep the glob wide:

```js
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./app/**/*.{js,ts,jsx,tsx}",
],
```

---

## Overriding Third-Party Inline Styles

Only acceptable use of `!important` — when a third-party library forces an inline style you cannot control.
Use `!` prefix, scope tightly, document the reason:

```tsx
{/* Third-party widget injects inline red bg — can't override via className */}
<div className="p-4 text-white !bg-brand-500">
```

Remove as soon as the upstream library allows class overrides.

---

## Linting

```bash
npm install -D eslint-plugin-tailwindcss prettier-plugin-tailwindcss
```

`eslint-plugin-tailwindcss` catches unknown classes, conflicts, and wrong responsive syntax.
`prettier-plugin-tailwindcss` enforces class ordering automatically on save.

---

## Quick Reference

| Do | Don't |
|---|---|
| `cn("flex", isActive && "bg-blue-500")` | `` `flex ${isActive ? "bg-blue-500" : ""}` `` |
| `bg-brand-500` (design token) | `bg-[#0ea5e9]` (hardcoded hex) |
| `flex-col md:flex-row` (mobile first) | `flex-row md:flex-col` (desktop first) |
| Extract a `<Button>` component | `@apply btn-primary` in CSS |
| `focus:ring-2 focus:ring-offset-2` | No focus styles |
| Fix the Tailwind config | Fall back to inline styles |

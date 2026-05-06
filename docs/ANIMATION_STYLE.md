# Krit animation style

Visual + technical contract for the HTML animations embedded into Krit lessons via `embedAnimation` blocks. Hand this style guide + the lesson-specific prompt to Gemini 3 Pro / Claude / GPT and you should get a single self-contained HTML file you can drop into `/public/courses/<slug>/anim/<file>.html`.

---

## 1 · Visual style

Picture-book pop, but disciplined. Imagine *The New Yorker* meets *Khan Academy* with a dash of Studio Ghibli. Vivid but not garish. Friendly but not childish.

| Element | Spec |
|---|---|
| **Palette** | Warm desaturated background (`#FFF7ED`, `#FAF5FF`, `#ECFDF5`, `#EFF6FF`, `#FEF3C7`). Bright but earthy accents (`#F59E0B`, `#10B981`, `#0EA5E9`, `#8B5CF6`, `#F43F5E`). Avoid pure black; use `#1F2937`. |
| **Typography** | Single sans-serif system stack: `system-ui, -apple-system, "Inter", sans-serif`. Headings 18-22 px bold. Captions 12-13 px italic. Numbers in `ui-monospace, monospace`. |
| **Stroke** | 2-3 px solid lines for outlines. Round line caps. No drop shadows except very soft (`0 4px 12px rgba(0,0,0,0.06)`). |
| **Shapes** | Rounded corners on rectangles (`rx=8` to `rx=14`). Friendly oval characters when humans are needed. Avoid photorealism. |
| **Composition** | Generous whitespace. Single focal point at any time. Use a single prop (a thermostat dial, a staircase, a chart) and animate it through 3-5 stages. |
| **Motion personality** | Easing `cubic-bezier(0.22, 0.61, 0.36, 1)`. No bouncy springs. Pauses between stages — let the eye breathe. Total runtime 8-15 seconds; loops cleanly. |
| **Mood** | Slightly self-aware. Captions can be dry-funny ("the thermostat is annoyingly competent"). Never preachy. |

Avoid: gradients used as decoration, neon glow, drop shadows on text, rotation-as-decoration, flying particles, generic UI mockups.

---

## 2 · Technical contract

The HTML file is loaded inside a sandboxed iframe (`sandbox="allow-scripts allow-same-origin"`). Therefore:

- **Single file.** All HTML, CSS, JS inline. No external CDN, no fonts loaded from Google Fonts, no remote images. If you need an image, inline it as a base64 SVG data URI.
- **No network calls.** No `fetch`, no analytics, no third-party scripts.
- **No persistent state.** No `localStorage`. No cookies.
- **No navigation.** No links, no `window.location` writes.
- **No console noise.** No `console.log` in production.
- **Responsive.** Render correctly at widths between 320 px and 900 px. Use viewport `<meta>`. Use SVG/CSS for all visuals — no fixed pixel layouts.
- **Accessibility.** Provide `aria-label` on the root `<svg>`. Honour `prefers-reduced-motion: reduce` — collapse animation to instant state changes when set.
- **Lightweight.** Aim under 80 KB total file size. The animation should still feel rich.
- **Auto-loop or reset button.** Either loop seamlessly forever, or expose a small reset button bottom-right.

Recommended tech: vanilla SVG + CSS keyframes, or a single `requestAnimationFrame` loop. **Do not** use React, three.js, GSAP, anime.js, or anything that requires a build step. Hand-written SVG + CSS only.

Output the full HTML file ready to save. The first character of your reply must be `<` and the last must be `>`. No prose, no markdown fence.

---

## 3 · Standard skeleton

When you hand the prompt to the LLM, expect output that looks roughly like:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Animation</title>
<style>
  :root { --bg: #FFF7ED; --ink: #1F2937; --accent: #F59E0B; --good: #10B981; --bad: #F43F5E; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background:var(--bg); color:var(--ink); font-family: system-ui,-apple-system,"Inter",sans-serif; }
  .stage { width:100%; height:100vh; min-height:300px; display:flex; align-items:center; justify-content:center; padding:16px; }
  .frame { width:100%; max-width:720px; aspect-ratio: 16/9; }
  .caption { text-align:center; font-size:13px; font-style:italic; color:#6B7280; margin-top:8px; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>
</head>
<body>
<main class="stage">
  <div>
    <svg class="frame" viewBox="0 0 720 405" aria-label="...">
      <!-- shapes + animations -->
    </svg>
    <div class="caption">...</div>
  </div>
</main>
<script>
  // optional rAF loop or staged CSS animations
</script>
</body>
</html>
```

---

## 4 · One sentence to remember

> **Picture-book pop, monastery palette, scientific honesty, gentle humor.** If you hit those four, you are in the Krit zone.

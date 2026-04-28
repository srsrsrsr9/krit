# ML Animations · catalog

The two `ML Animations*.html` files in this folder contain **16 production-grade SVG + rAF animations** suitable for an ML Foundations course. Each is self-contained, deterministic, and brand-aligned (OKLCH indigo/violet palette).

There's no ML course in the platform yet, so these are not yet ported to React. When you build that course, these become drop-in block content.

## How to integrate

For each animation, you have three options:

1. **Inline React component** — copy the function out of the HTML, replace inline styles with Tailwind/CSS, and use as a custom block (extend `lib/content/blocks.ts` with an `mlAnimation` discriminated variant referencing the composition id).
2. **Remotion composition** — wrap the animation as a Remotion composition (it already uses requestAnimationFrame, just bind the timeline to `useCurrentFrame()`). Register in `src/remotion/index.ts` and reference via the existing `remotion` block type.
3. **Pre-rendered MP4** — for very heavy animations (Transformer, Attention), render once via `npx remotion render` and store as a video block.

## Catalog

### `ML Animations.html` (823 lines)

| Animation | What it teaches | Recommended block type |
|---|---|---|
| `GradientDescent` | Loss landscape with descending ball, learning-rate intuition | Remotion |
| `TransformerArch` | High-level transformer block diagram | Remotion (heavy) or pre-rendered |
| `LinearRegression` | Best-fit line as MSE shrinks | Inline animatedTimeline-style |
| `LogisticRegression` | Sigmoid decision boundary on 2D points | Remotion |
| `ThreeRegressions` | Linear / polynomial / underfit comparison side-by-side | Remotion |

### `ML Animations 2.html` (955 lines)

| Animation | What it teaches | Recommended block type |
|---|---|---|
| `Backprop` | Gradients flowing backward through a tiny network | Remotion |
| `KMeans` | Centroids re-converging across iterations | Remotion |
| `DecisionTree` | Splits drawn on a 2D dataset, recursive partition | Inline component |
| `PCA` | Eigenvector axes rotating to fit variance | Remotion |
| `CNN` | Feature maps + pooling stages | Remotion (heavy) |
| `RNN` | Hidden-state passing through time | Remotion |
| `BiasVariance` | Train vs test loss curves with the classic U-shape | Inline |
| `Regularisation` | L1/L2 decision boundaries shrinking | Inline |
| `SVM` | Margin maximisation with support vectors highlighted | Remotion |
| `Attention` | Token-to-token attention weights as heatmap | Remotion (heavy) |

## When to port

Trigger a port when an ML Foundations course (or any of: Statistics for Decision Making, Deep Learning Foundations, Classical ML) lands in the platform. The animations are written against the brand tokens already used in `src/components/landing/animated-skill-graph.tsx` so there's nothing new to learn.

## Cost estimate

Per animation: ~30–60 minutes to port to Remotion + register + drop into a lesson. Bulk porting all 16 in one go: a focused half-day of work.

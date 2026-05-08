import { z } from "zod";

/**
 * Typed content blocks for lessons. Serialised as JSON in Lesson.blocks.
 * Renderer lives at src/components/lesson/BlockRenderer.tsx.
 *
 * Why typed JSON (not raw HTML): lets us render across surfaces (web/mobile/
 * slack card), enables AI authoring + AI tutor retrieval, and keeps content
 * portable.
 */

export const HeadingBlock = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string(),
});
export const MarkdownBlock = z.object({
  type: z.literal("markdown"),
  md: z.string(),
});
export const CalloutBlock = z.object({
  type: z.literal("callout"),
  tone: z.enum(["info", "tip", "warn", "success"]).default("info"),
  title: z.string().optional(),
  md: z.string(),
});
export const CodeBlock = z.object({
  type: z.literal("code"),
  lang: z.string().default("sql"),
  code: z.string(),
  caption: z.string().optional(),
});
export const ImageBlock = z.object({
  type: z.literal("image"),
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});
export const VideoBlock = z.object({
  type: z.literal("video"),
  provider: z.enum(["youtube", "vimeo", "url"]),
  src: z.string(),
  caption: z.string().optional(),
});
export const QuizBlock = z.object({
  type: z.literal("quiz"),
  prompt: z.string(),
  choices: z.array(
    z.object({ id: z.string(), label: z.string(), correct: z.boolean(), explain: z.string().optional() }),
  ),
  multi: z.boolean().default(false),
});
export const ReflectBlock = z.object({
  type: z.literal("reflect"),
  prompt: z.string(),
});
export const KeyTakeawaysBlock = z.object({
  type: z.literal("keyTakeaways"),
  points: z.array(z.string()),
});
export const TryItBlock = z.object({
  type: z.literal("tryIt"),
  instruction: z.string(),
  starter: z.string().optional(),
  expected: z.string().optional(),
  lang: z.string().optional(),
});

// Cinematic + interactive blocks. Each is a discriminated variant the
// renderer maps to a dedicated component.

/**
 * A Remotion composition played inline via @remotion/player.
 * `composition` is the registered ID, `props` is passed straight in.
 */
export const RemotionBlock = z.object({
  type: z.literal("remotion"),
  composition: z.enum(["sqlExecutionOrder", "joinFlow", "groupByCollapse"]),
  durationFrames: z.number().int().min(30).max(3600).default(360),
  fps: z.number().int().min(15).max(60).default(30),
  width: z.number().int().min(320).max(1920).default(1280),
  height: z.number().int().min(180).max(1080).default(720),
  caption: z.string().optional(),
  // Loose JSON props passed to the composition.
  props: z.record(z.string(), z.unknown()).default({}),
});

/** Animated step-by-step timeline (motion-based, scroll-triggered). */
export const AnimatedTimelineBlock = z.object({
  type: z.literal("animatedTimeline"),
  title: z.string().optional(),
  steps: z.array(z.object({
    label: z.string(),
    body: z.string(),         // markdown
    code: z.string().optional(),
  })).min(2),
});

/** Sortable list — learner drags items into a target order. */
export const SortableStepsBlock = z.object({
  type: z.literal("sortableSteps"),
  prompt: z.string(),
  // Order represents the *correct* order; UI shuffles them.
  items: z.array(z.object({
    id: z.string(),
    label: z.string(),
    detail: z.string().optional(),
  })).min(2),
  hint: z.string().optional(),
});

/** Pick a JOIN type, see which rows survive. Live, not pre-rendered. */
export const JoinExplorerBlock = z.object({
  type: z.literal("joinExplorer"),
  prompt: z.string().optional(),
  left: z.object({
    name: z.string(),
    rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
    keyColumn: z.string(),
  }),
  right: z.object({
    name: z.string(),
    rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
    keyColumn: z.string(),
  }),
});

/** Real SQL playground — alasql in the browser. Lazy-loaded. */
export const SqlPlaygroundBlock = z.object({
  type: z.literal("sqlPlayground"),
  prompt: z.string(),
  // Tables seeded into the in-browser DB before each run.
  tables: z.array(z.object({
    name: z.string(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
  })),
  starter: z.string().optional(),
  expected: z.string().optional(),
  hint: z.string().optional(),
});

/**
 * Inline SVG figure with sanitization at render time. Use this for concept
 * diagrams; use ImageBlock for raster art.
 */
export const SvgFigureBlock = z.object({
  type: z.literal("svgFigure"),
  svg: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  maxWidth: z.number().int().min(120).max(1200).optional(),
});

/**
 * Locale-swappable humor / culture box. Default locale wins if the user's
 * locale isn't in `variants`. Designed for the Indian-Hindi slang asides;
 * trivially extends to other languages later.
 */
export const CulturalAsideBlock = z.object({
  type: z.literal("culturalAside"),
  defaultLocale: z.string().default("hi-IN"),
  variants: z.record(
    z.string(),
    z.object({
      title: z.string().optional(),
      tone: z.enum(["info", "tip", "warn", "success"]).default("info"),
      md: z.string(),
      attribution: z.string().optional(),
    }),
  ),
});

/**
 * Sandbox-iframe for a self-contained HTML animation produced outside the
 * codebase (Gemini-generated, hand-coded, etc). The HTML must be loadable
 * from `/public/...`. Iframe is sandboxed; no script access to parent.
 */
export const EmbedAnimationBlock = z.object({
  type: z.literal("embedAnimation"),
  src: z.string(),
  height: z.number().int().min(120).max(1200).default(420),
  caption: z.string().optional(),
  fallbackImage: z.string().optional(),
  audioSrc: z.string().optional(),
});

/**
 * Multi-turn coach with chip-button answers. Each scenario can be classified
 * into one of 2-4 buckets; explanations reveal after the choice.
 */
export const ChatScenarioBlock = z.object({
  type: z.literal("chatScenario"),
  coach: z.object({
    name: z.string(),
    role: z.string().optional(),
    avatarSrc: z.string().optional(),
  }),
  intro: z.array(z.string()).min(1),
  buckets: z.array(z.object({
    id: z.string(),
    label: z.string(),
    tone: z.enum(["danger", "neutral", "safe"]).default("neutral"),
  })).min(2).max(4),
  scenarios: z.array(z.object({
    id: z.string(),
    situation: z.string(),
    correctBucketId: z.string(),
    explain: z.string(),
  })).min(1),
});

/**
 * Lesson-level meta. Per-lesson audio narration (single mp3) and a
 * downloadable handwritten-notes PDF. Place as the FIRST block of a lesson;
 * the renderer pulls it out and renders a sticky audio bar + notes button.
 */
export const LessonMetaBlock = z.object({
  type: z.literal("lessonMeta"),
  audioUrl: z.string().optional(),
  audioDurationSec: z.number().int().min(1).optional(),
  audioChapters: z.array(z.object({
    startSec: z.number().int().min(0),
    label: z.string(),
  })).optional(),
  notesPdfUrl: z.string().optional(),
  notesByline: z.string().optional(),
});

/**
 * Boss Battle — multi-stage end-of-lesson interactive challenge.
 * Each stage is a decision point; each option has points + an explanation.
 * Final score maps to a letter grade and one of three outcome messages.
 * Designed to feel like the "final boss" of the lesson; uses cross-lesson
 * narrative continuity where possible.
 */
export const BossBattleBlock = z.object({
  type: z.literal("bossBattle"),
  title: z.string(),
  setup: z.string(),
  coach: z.object({
    name: z.string(),
    role: z.string().optional(),
    avatarSrc: z.string().optional(),
  }),
  stages: z.array(z.object({
    id: z.string(),
    prompt: z.string(),
    options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      correct: z.boolean(),
      explain: z.string(),
      points: z.number().int().min(0).max(5),
    })).min(2).max(5),
  })).min(2).max(5),
  outcomes: z.object({
    perfect: z.string(),
    good: z.string(),
    learn: z.string(),
  }),
});

/**
 * Field Notes — a short production-realistic case study at the end of the
 * lesson. Specific company name (fictional but specific), specific dates,
 * exact numbers. Adds industry-grounding and signals "this is real-world."
 */
export const FieldNotesBlock = z.object({
  type: z.literal("fieldNotes"),
  title: z.string(),
  source: z.string(),
  date: z.string().optional(),
  story: z.string(),
  takeaway: z.string(),
});

export const ContentBlock = z.discriminatedUnion("type", [
  HeadingBlock,
  MarkdownBlock,
  CalloutBlock,
  CodeBlock,
  ImageBlock,
  VideoBlock,
  QuizBlock,
  ReflectBlock,
  KeyTakeawaysBlock,
  TryItBlock,
  RemotionBlock,
  AnimatedTimelineBlock,
  SortableStepsBlock,
  JoinExplorerBlock,
  SqlPlaygroundBlock,
  SvgFigureBlock,
  CulturalAsideBlock,
  EmbedAnimationBlock,
  ChatScenarioBlock,
  LessonMetaBlock,
  BossBattleBlock,
  FieldNotesBlock,
]);

export type ContentBlock = z.infer<typeof ContentBlock>;
export const LessonBlocks = z.array(ContentBlock);
export type LessonBlocks = z.infer<typeof LessonBlocks>;

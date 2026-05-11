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

// ── Emotion-driven interactive block types ────────────────────────────────────

/** CURIOSITY — image with clickable hotspot zones that reveal tooltip content. */
export const HotspotRevealBlock = z.object({
  type: z.literal("hotspotReveal"),
  src: z.string(),
  alt: z.string(),
  width: z.number().int().min(120).max(1920).default(800),
  height: z.number().int().min(120).max(1080).default(450),
  hotspots: z.array(z.object({
    id: z.string(),
    xPct: z.number().min(0).max(100),
    yPct: z.number().min(0).max(100),
    label: z.string(),
    body: z.string(),
  })).min(1).max(20),
  caption: z.string().optional(),
});

/** TENSION — quiz with a countdown timer; partial credit for slow correct answers. */
export const TimedChallengeBlock = z.object({
  type: z.literal("timedChallenge"),
  prompt: z.string(),
  choices: z.array(z.object({
    id: z.string(),
    label: z.string(),
    correct: z.boolean(),
    explain: z.string().optional(),
  })).min(2).max(6),
  timeLimitSec: z.number().int().min(5).max(120).default(30),
  fastSec: z.number().int().min(3).max(60).default(10),
  fullPoints: z.number().int().min(1).max(10).default(3),
  partialPoints: z.number().int().min(0).max(9).default(1),
});

/** EXPLORATION — inline branching story (Twine-style); choices lead to other nodes. */
export const BranchScenarioBlock = z.object({
  type: z.literal("branchScenario"),
  title: z.string().optional(),
  startNodeId: z.string(),
  nodes: z.array(z.object({
    id: z.string(),
    body: z.string(),
    choices: z.array(z.object({
      id: z.string(),
      label: z.string(),
      nextNodeId: z.string().optional(),
      outcome: z.string().optional(),
    })).min(1).max(4),
  })).min(2).max(10),
});

/** SURPRISE — flip-card: front = provocative claim, back = nuanced truth. */
export const RevealCardBlock = z.object({
  type: z.literal("revealCard"),
  front: z.string(),
  back: z.string(),
  hint: z.string().optional(),
});

/** STORYTELLING — Phantom-style panel comic with scenes, narration boxes,
 *  speech bubbles with tails, and SFX between panels. */
export const PanelComicBlock = z.object({
  type: z.literal("panelComic"),
  title: z.string().optional(),
  panels: z.array(z.object({
    scene: z.enum([
      "handshake", "boardroom-rina", "cfo-math",
      "boardroom-kavya", "ic-desk", "ending",
    ]),
    /** Narration box, top of the panel — like Phantom's yellow caption. */
    narration: z.string().optional(),
    /** Speech bubbles overlaid on the scene. Up to 2 per panel. */
    dialog: z.array(z.object({
      speaker: z.enum(["sam", "cfo", "rina", "kavya", "trap", "narrator"]).optional(),
      text: z.string(),
    })).max(2).optional(),
    /** Sound-effect text rendered between this panel and the next. */
    sfxAfter: z.string().optional(),
  })).min(1).max(8),
});

/** STORYTELLING — Tap-to-reveal comic-strip frames with cartoon characters. */
export const ComicStripBlock = z.object({
  type: z.literal("comicStrip"),
  title: z.string().optional(),
  frames: z.array(z.object({
    character: z.enum(["sam", "cfo", "rina", "kavya", "trap", "seedling", "narrator"]),
    expression: z.enum(["neutral", "happy", "confused", "tired", "smug", "excited", "wilted", "frown"]).default("neutral"),
    bubble: z.string(),
    caption: z.string().optional(),
  })).min(1).max(6),
});

/** MASTERY (hands-on) — Run-it-locally exercise: setup → numbered steps with
 *  commands + expected output → verify. Mobile-friendly, no lab needed. */
export const HandsOnBlock = z.object({
  type: z.literal("handsOn"),
  title: z.string(),
  /** Markdown — what to install, what assumptions, prerequisites. */
  setup: z.string().optional(),
  steps: z.array(z.object({
    instruction: z.string(),                  // markdown
    command: z.string().optional(),           // shell or code to copy + run
    lang: z.string().optional().default("bash"),
    expect: z.string().optional(),            // expected output or behaviour
  })).min(1).max(8),
  /** Markdown — how to know it worked, common gotchas. */
  verify: z.string().optional(),
});

/** SURPRISE — Tinder-style swipe through cards; reveal verdict after each. */
export const CardSwipeBlock = z.object({
  type: z.literal("cardSwipe"),
  prompt: z.string(),
  leftLabel: z.string(),
  rightLabel: z.string(),
  cards: z.array(z.object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    correctSide: z.enum(["left", "right"]),
    explain: z.string(),
  })).min(2).max(8),
});

/** TENSION — Drag a value on a continuum; banded feedback after lock-in. */
export const ScaleSliderBlock = z.object({
  type: z.literal("scaleSlider"),
  prompt: z.string(),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().min(0.1).default(5),
  startValue: z.number().default(50),
  leftLabel: z.string(),
  rightLabel: z.string(),
  unit: z.string().optional(),
  /** Feedback bands — first match wins (low → high). */
  bands: z.array(z.object({
    lo: z.number(),
    hi: z.number(),
    title: z.string(),
    body: z.string(),
    tone: z.enum(["bad", "okay", "good"]).default("okay"),
  })).min(2).max(6),
});

/** ACHIEVEMENT — Drag scenarios into named bins; cartoon mascots react. */
export const DragClassifyBlock = z.object({
  type: z.literal("dragClassify"),
  prompt: z.string(),
  bins: z.array(z.object({
    id: z.string(),
    label: z.string(),
    tone: z.enum(["safe", "danger", "neutral"]).default("neutral"),
    /** Optional flavor text shown when an item lands here. */
    flavor: z.string().optional(),
  })).min(2).max(4),
  items: z.array(z.object({
    id: z.string(),
    label: z.string(),
    correctBinId: z.string(),
    comment: z.string().optional(),
  })).min(2).max(10),
});

/** MASTERY — "Prove it" challenge. Two modes: multi-choice (choices set) or
 * free-text (evalPattern set). Choices is the default learner-friendly path. */
export const SkillProofBlock = z.object({
  type: z.literal("skillProof"),
  skill: z.string(),
  instruction: z.string(),
  /** When present, render as multi-choice (recommended). One must be correct. */
  choices: z.array(z.object({
    id: z.string(),
    label: z.string(),
    correct: z.boolean(),
    explain: z.string().optional(),
  })).min(2).max(5).optional(),
  /** Free-text mode (legacy / when nuance must be expressed). */
  starter: z.string().optional(),
  evalPattern: z.string().optional(),
  referenceAnswer: z.string().optional(),
  badgeLabel: z.string().default("Skill unlocked"),
  lang: z.string().optional(),
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
  HotspotRevealBlock,
  TimedChallengeBlock,
  BranchScenarioBlock,
  RevealCardBlock,
  SkillProofBlock,
  DragClassifyBlock,
  ComicStripBlock,
  PanelComicBlock,
  ScaleSliderBlock,
  CardSwipeBlock,
  HandsOnBlock,
]);

export type ContentBlock = z.infer<typeof ContentBlock>;
export const LessonBlocks = z.array(ContentBlock);
export type LessonBlocks = z.infer<typeof LessonBlocks>;

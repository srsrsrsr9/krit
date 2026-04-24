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
]);

export type ContentBlock = z.infer<typeof ContentBlock>;
export const LessonBlocks = z.array(ContentBlock);
export type LessonBlocks = z.infer<typeof LessonBlocks>;

import { z } from "zod";
import { LessonBlocks } from "./blocks";

/**
 * A single lesson inside a course. Mirrors the standalone showcase lesson
 * format but is composed inline so the course is one self-contained object.
 */
export const CourseLesson = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "lesson slug must be url-safe"),
  title: z.string(),
  subtitle: z.string().optional(),
  estimatedMinutes: z.number().int().min(1).max(120),
  skillHints: z.array(z.string()).default([]),
  blocks: LessonBlocks,
});
export type CourseLesson = z.infer<typeof CourseLesson>;

/**
 * A course is a single JSON object that produces a navigable, chained
 * Story-Mode experience. Drop the file in `courses/showcase/<slug>.json`
 * and the showcase route renders it.
 */
export const Course = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "course slug must be url-safe"),
  title: z.string(),
  subtitle: z.string().optional(),
  audience: z.string().optional(),
  estimatedMinutes: z.number().int().min(1).max(900),
  /** A short cast list — keeps content authors disciplined about character continuity. */
  cast: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    summary: z.string().optional(),
  })).default([]),
  lessons: z.array(CourseLesson).min(1).max(20),
});
export type Course = z.infer<typeof Course>;

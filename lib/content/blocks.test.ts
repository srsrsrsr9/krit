import { describe, it, expect } from "vitest";
import { LessonBlocks } from "./blocks";
import { lessonDefs } from "../../prisma/seed/lessons";

describe("Lesson content blocks", () => {
  it("validates every seeded lesson's blocks against the schema", () => {
    for (const def of lessonDefs) {
      const res = LessonBlocks.safeParse(def.blocks);
      expect(res.success, `lesson ${def.slug} has invalid blocks: ${JSON.stringify(res.success ? null : res.error.issues, null, 2)}`).toBe(true);
    }
  });

  it("every quiz has exactly at least one correct choice", () => {
    for (const def of lessonDefs) {
      const quizzes = def.blocks.filter((b) => b.type === "quiz");
      for (const q of quizzes) {
        if (q.type !== "quiz") continue;
        const correct = q.choices.filter((c) => c.correct);
        expect(correct.length, `lesson ${def.slug} has a quiz with no correct choice`).toBeGreaterThan(0);
      }
    }
  });
});

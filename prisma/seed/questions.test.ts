import { describe, it, expect } from "vitest";
import { sqlAssessmentQuestions } from "./questions";

describe("SQL assessment question bank", () => {
  it("has exactly 20 questions", () => {
    expect(sqlAssessmentQuestions.length).toBe(20);
  });

  it("every question has at least one correct choice", () => {
    for (const q of sqlAssessmentQuestions) {
      const correct = q.choices.filter((c) => c.correct);
      expect(correct.length, `question "${q.stem}" has no correct choice`).toBeGreaterThan(0);
    }
  });

  it("MCQ_SINGLE has exactly one correct choice", () => {
    for (const q of sqlAssessmentQuestions) {
      if (q.kind === "MCQ_SINGLE") {
        const correct = q.choices.filter((c) => c.correct);
        expect(correct.length, `single-answer question "${q.stem}" has ${correct.length} correct`).toBe(1);
      }
    }
  });

  it("MCQ_MULTI has more than one correct choice", () => {
    for (const q of sqlAssessmentQuestions) {
      if (q.kind === "MCQ_MULTI") {
        const correct = q.choices.filter((c) => c.correct);
        expect(correct.length, `multi-answer question "${q.stem}" has only ${correct.length} correct`).toBeGreaterThan(1);
      }
    }
  });

  it("choice IDs are unique within each question", () => {
    for (const q of sqlAssessmentQuestions) {
      const ids = q.choices.map((c) => c.id);
      expect(new Set(ids).size, `question "${q.stem}" has duplicate choice ids`).toBe(ids.length);
    }
  });

  it("points are positive integers", () => {
    for (const q of sqlAssessmentQuestions) {
      expect(q.points).toBeGreaterThan(0);
      expect(Number.isInteger(q.points)).toBe(true);
    }
  });
});

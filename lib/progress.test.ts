import { describe, it, expect } from "vitest";
import { LEVEL_RANK } from "./progress";

describe("Proficiency level rank", () => {
  it("orders levels monotonically", () => {
    expect(LEVEL_RANK.NOVICE).toBeLessThan(LEVEL_RANK.WORKING);
    expect(LEVEL_RANK.WORKING).toBeLessThan(LEVEL_RANK.PROFICIENT);
    expect(LEVEL_RANK.PROFICIENT).toBeLessThan(LEVEL_RANK.EXPERT);
  });
});

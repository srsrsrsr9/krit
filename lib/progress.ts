import cuid from "cuid";
import { db } from "./db";
import { ProficiencyLevel } from "@prisma/client";

/** Numeric rank used for level math. */
export const LEVEL_RANK: Record<ProficiencyLevel, number> = {
  NOVICE: 0,
  WORKING: 1,
  PROFICIENT: 2,
  EXPERT: 3,
};

const RANK_LEVEL: ProficiencyLevel[] = ["NOVICE", "WORKING", "PROFICIENT", "EXPERT"];

/**
 * Recompute a learner's SkillState for a given skill from the evidence ledger.
 * This is the *single* source of truth for proficiency. Call after any
 * evidence insert.
 */
export async function recomputeSkillState(userId: string, skillId: string) {
  const evidence = await db.evidence.findMany({
    where: { userId, skillId },
    orderBy: { createdAt: "asc" },
  });

  if (evidence.length === 0) {
    await db.skillState.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: {
        id: cuid(),
        userId,
        skillId,
        level: "NOVICE",
        confidence: 0,
      },
      update: { level: "NOVICE", confidence: 0, lastEvidenceAt: null },
    });
    return;
  }

  // Level = max level awarded by evidence (simple starting heuristic).
  // Confidence grows with weighted evidence count, asymptoting to 1.
  const maxRank = Math.max(...evidence.map((e) => LEVEL_RANK[e.levelAwarded]));
  const totalWeight = evidence.reduce((s, e) => s + e.weight, 0);
  const confidence = Math.min(1, 1 - Math.exp(-totalWeight / 3));
  const lastEvidenceAt = evidence[evidence.length - 1]!.createdAt;

  const skill = await db.skill.findUnique({ where: { id: skillId } });
  const nextReverificationAt =
    skill?.decayDays && skill.decayDays > 0
      ? new Date(lastEvidenceAt.getTime() + skill.decayDays * 86_400_000)
      : null;

  await db.skillState.upsert({
    where: { userId_skillId: { userId, skillId } },
    create: {
      id: cuid(),
      userId,
      skillId,
      level: RANK_LEVEL[maxRank]!,
      confidence,
      lastEvidenceAt,
      nextReverificationAt,
    },
    update: {
      level: RANK_LEVEL[maxRank]!,
      confidence,
      lastEvidenceAt,
      nextReverificationAt,
    },
  });
}

/**
 * Compute path completion %: (completed required items) / (total required).
 * Batches all attempt + submission lookups into 2 queries instead of 2 per
 * required item — major perf win on paths with many items.
 */
export async function computePathProgress(enrollmentId: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      path: { include: { items: true } },
      lessonProgress: true,
    },
  });
  if (!enrollment) return { completed: 0, total: 0, pct: 0, done: false };

  const required = enrollment.path.items.filter((i) => i.required);
  const total = required.length;
  if (total === 0) return { completed: 0, total: 0, pct: 0, done: true };

  const assessmentIds = required.flatMap((i) => (i.kind === "ASSESSMENT" && i.assessmentId ? [i.assessmentId] : []));
  const projectIds = required.flatMap((i) => (i.kind === "PROJECT" && i.projectId ? [i.projectId] : []));

  const [passedAttempts, reviewedSubs] = await Promise.all([
    assessmentIds.length
      ? db.attempt.findMany({
          where: { userId: enrollment.userId, assessmentId: { in: assessmentIds }, passed: true },
          select: { assessmentId: true },
        })
      : Promise.resolve([]),
    projectIds.length
      ? db.submission.findMany({
          where: { userId: enrollment.userId, projectId: { in: projectIds }, status: "REVIEWED" },
          select: { projectId: true },
        })
      : Promise.resolve([]),
  ]);
  const passedAssessments = new Set(passedAttempts.map((a) => a.assessmentId));
  const reviewedProjects = new Set(reviewedSubs.map((s) => s.projectId));

  let completed = 0;
  for (const item of required) {
    if (item.kind === "LESSON" && item.lessonId) {
      const lp = enrollment.lessonProgress.find((p) => p.lessonId === item.lessonId);
      if (lp?.completedAt) completed++;
    } else if (item.kind === "ASSESSMENT" && item.assessmentId) {
      if (passedAssessments.has(item.assessmentId)) completed++;
    } else if (item.kind === "PROJECT" && item.projectId) {
      if (reviewedProjects.has(item.projectId)) completed++;
    }
  }

  return {
    completed,
    total,
    pct: Math.round((completed / total) * 100),
    done: completed === total,
  };
}

export const LEVEL_LABEL: Record<ProficiencyLevel, string> = {
  NOVICE: "Novice",
  WORKING: "Working",
  PROFICIENT: "Proficient",
  EXPERT: "Expert",
};

export const LEVEL_COLOR: Record<ProficiencyLevel, string> = {
  NOVICE: "bg-skill-novice/20 text-foreground border-skill-novice/40",
  WORKING: "bg-skill-working/15 text-skill-working border-skill-working/30",
  PROFICIENT: "bg-skill-proficient/15 text-skill-proficient border-skill-proficient/30",
  EXPERT: "bg-skill-expert/15 text-skill-expert border-skill-expert/30",
};

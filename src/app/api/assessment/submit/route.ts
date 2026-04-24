import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/lrs";
import { recomputeSkillState, computePathProgress } from "@/lib/progress";
import { maybeIssueCredential } from "@/lib/credential";
import { captureError } from "@/lib/logger";

const Body = z.object({
  attemptId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      response: z.array(z.string()).default([]),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { attemptId, answers } = Body.parse(await req.json());

    const attempt = await db.attempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { include: { questions: true, skills: true } } },
    });
    if (!attempt || attempt.userId !== user.id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "already_submitted" }, { status: 400 });
    }

    const qById = new Map(attempt.assessment.questions.map((q) => [q.id, q]));
    let earned = 0;
    let total = 0;

    await db.answer.deleteMany({ where: { attemptId: attempt.id } });

    for (const ans of answers) {
      const q = qById.get(ans.questionId);
      if (!q) continue;
      total += q.points;
      const payload = q.payload as { choices?: { id: string; correct: boolean }[] };
      const correctIds = (payload.choices ?? []).filter((c) => c.correct).map((c) => c.id).sort();
      const chosen = [...ans.response].sort();
      const isExact =
        correctIds.length === chosen.length && correctIds.every((c, i) => c === chosen[i]);
      const pointsEarned = isExact ? q.points : 0;
      earned += pointsEarned;

      await db.answer.create({
        data: {
          id: cuid(),
          attemptId: attempt.id,
          questionId: q.id,
          response: ans.response,
          isCorrect: isExact,
          pointsEarned,
        },
      });
    }

    // Also create zero-point rows for skipped questions (for full review).
    for (const q of attempt.assessment.questions) {
      const had = answers.find((a) => a.questionId === q.id);
      if (!had) {
        total += q.points;
        await db.answer.create({
          data: {
            id: cuid(),
            attemptId: attempt.id,
            questionId: q.id,
            response: [],
            isCorrect: false,
            pointsEarned: 0,
          },
        });
      }
    }

    const scorePct = total === 0 ? 0 : Math.round((earned / total) * 100);
    const passed = scorePct >= attempt.assessment.passThreshold;

    await db.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        scorePct,
        passed,
        timeSpentSec: Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000),
      },
    });

    await recordEvent({
      userId: user.id,
      workspaceId: attempt.assessment.workspaceId,
      verb: passed ? "passed" : "failed",
      objectType: "assessment",
      objectId: attempt.assessment.id,
      result: { scorePct, earned, total },
      context: { attemptId: attempt.id },
    });

    if (passed) {
      // Record evidence per mapped skill.
      for (const as of attempt.assessment.skills) {
        await db.evidence.create({
          data: {
            id: cuid(),
            userId: user.id,
            skillId: as.skillId,
            kind: "ASSESSMENT_PASS",
            sourceType: "assessment",
            sourceId: attempt.assessment.id,
            levelAwarded: as.awardsAtLevel,
            weight: as.weight,
            note: `Scored ${scorePct}% on ${attempt.assessment.title}`,
          },
        });
        await recomputeSkillState(user.id, as.skillId);
      }
    }

    // If this assessment is part of a path we're enrolled in, check completion.
    const pathItems = await db.pathItem.findMany({
      where: { assessmentId: attempt.assessment.id },
      include: { path: true },
    });
    for (const pi of pathItems) {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_pathId: { userId: user.id, pathId: pi.pathId } },
      });
      if (!enrollment) continue;
      await db.enrollment.update({ where: { id: enrollment.id }, data: { lastActivityAt: new Date() } });
      const progress = await computePathProgress(enrollment.id);
      if (progress.done && enrollment.status !== "COMPLETED") {
        await db.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        await recordEvent({
          userId: user.id,
          workspaceId: pi.path.workspaceId,
          verb: "completed",
          objectType: "path",
          objectId: pi.pathId,
        });
        await maybeIssueCredential(user.id, pi.pathId);
      }
    }

    return NextResponse.json({ attemptId: attempt.id, scorePct, passed });
  } catch (e) {
    captureError(e, { route: "assessment/submit" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

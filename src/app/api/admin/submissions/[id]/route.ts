import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, INSTRUCTOR_ROLES } from "@/lib/roles";
import { recordEvent } from "@/lib/lrs";
import { recomputeSkillState, computePathProgress } from "@/lib/progress";
import { maybeIssueCredential } from "@/lib/credential";
import { captureError } from "@/lib/logger";

const Body = z.object({
  action: z.enum(["review", "request_revision"]),
  scores: z.record(z.string(), z.number()),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(INSTRUCTOR_ROLES);
    const body = Body.parse(await req.json());

    const submission = await db.submission.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!submission || submission.project.workspaceId !== m.workspaceId) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const reviewedAt = new Date();
    const status = body.action === "review" ? "REVIEWED" : "REVISION_REQUESTED";

    await db.submission.update({
      where: { id },
      data: {
        status,
        reviewerId: m.userId,
        rubricScore: body.scores as unknown as Prisma.InputJsonValue,
        reviewNotes: body.notes ?? null,
        reviewedAt,
      },
    });

    await recordEvent({
      userId: submission.userId,
      workspaceId: m.workspaceId,
      verb: "reviewed",
      objectType: "submission",
      objectId: submission.id,
      result: { scores: body.scores, status },
    });

    if (body.action === "review") {
      // Award PROJECT_REVIEWED evidence for skills attached to any path-item
      // that includes this project. (Projects don't directly map to skills
      // in the schema today; we infer through the path.)
      const items = await db.pathItem.findMany({
        where: { projectId: submission.projectId },
        include: { path: { include: { items: { include: { lesson: { include: { skills: true } }, assessment: { include: { skills: true } } } } } } },
      });
      const skillSet = new Set<string>();
      for (const it of items) {
        for (const sub of it.path.items) {
          if (sub.lesson) for (const ls of sub.lesson.skills) skillSet.add(ls.skillId);
          if (sub.assessment) for (const as of sub.assessment.skills) skillSet.add(as.skillId);
        }
      }
      for (const skillId of skillSet) {
        await db.evidence.create({
          data: {
            id: cuid(),
            userId: submission.userId,
            skillId,
            kind: "PROJECT_REVIEWED",
            sourceType: "submission",
            sourceId: submission.id,
            levelAwarded: "PROFICIENT",
            weight: 1.5,
            note: `Project reviewed: ${submission.project.title}`,
          },
        });
        await recomputeSkillState(submission.userId, skillId);
      }

      // Trigger path completion check + credential.
      for (const it of items) {
        const enrollment = await db.enrollment.findUnique({
          where: { userId_pathId: { userId: submission.userId, pathId: it.pathId } },
        });
        if (!enrollment) continue;
        const progress = await computePathProgress(enrollment.id);
        if (progress.done && enrollment.status !== "COMPLETED") {
          await db.enrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED", completedAt: new Date() } });
          await recordEvent({ userId: submission.userId, workspaceId: m.workspaceId, verb: "completed", objectType: "path", objectId: it.pathId });
          await maybeIssueCredential(submission.userId, it.pathId);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/submissions PATCH" });
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 500 });
  }
}

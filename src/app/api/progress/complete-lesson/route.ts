import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/lrs";
import { recomputeSkillState, computePathProgress } from "@/lib/progress";
import { captureError } from "@/lib/logger";
import { maybeIssueCredential } from "@/lib/credential";

const Body = z.object({
  lessonId: z.string().min(1),
  pathSlug: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const json = await req.json();
    const { lessonId, pathSlug } = Body.parse(json);

    const path = await db.path.findFirst({ where: { slug: pathSlug } });
    if (!path) return NextResponse.json({ error: "path_not_found" }, { status: 404 });

    const enrollment = await db.enrollment.findUnique({
      where: { userId_pathId: { userId: user.id, pathId: path.id } },
    });
    if (!enrollment) return NextResponse.json({ error: "not_enrolled" }, { status: 400 });

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { skills: true },
    });
    if (!lesson) return NextResponse.json({ error: "lesson_not_found" }, { status: 404 });

    const existing = await db.lessonProgress.findUnique({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    });

    const now = new Date();
    const alreadyComplete = existing?.completedAt != null;

    if (!alreadyComplete) {
      await db.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
        create: {
          id: cuid(),
          enrollmentId: enrollment.id,
          lessonId,
          startedAt: now,
          completedAt: now,
        },
        update: { completedAt: now },
      });

      // One piece of evidence per skill tagged on the lesson.
      for (const ls of lesson.skills) {
        await db.evidence.create({
          data: {
            id: cuid(),
            userId: user.id,
            skillId: ls.skillId,
            kind: "LESSON_COMPLETE",
            sourceType: "lesson",
            sourceId: lesson.id,
            levelAwarded: "WORKING",
            weight: 0.5,
          },
        });
        await recomputeSkillState(user.id, ls.skillId);
      }

      await recordEvent({
        userId: user.id,
        workspaceId: path.workspaceId,
        verb: "completed",
        objectType: "lesson",
        objectId: lesson.id,
        context: { pathId: path.id, enrollmentId: enrollment.id },
      });
    }

    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { lastActivityAt: now },
    });

    const progress = await computePathProgress(enrollment.id);
    if (progress.done && enrollment.status !== "COMPLETED") {
      await db.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", completedAt: now },
      });
      await recordEvent({
        userId: user.id,
        workspaceId: path.workspaceId,
        verb: "completed",
        objectType: "path",
        objectId: path.id,
      });
      await maybeIssueCredential(user.id, path.id);
    }

    return NextResponse.json({ ok: true, progress });
  } catch (e) {
    captureError(e, { route: "complete-lesson" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

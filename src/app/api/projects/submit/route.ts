import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/lrs";
import { captureError } from "@/lib/logger";

const Body = z.object({
  projectId: z.string().min(1),
  content: z.string().min(10),
  pathSlug: z.string().nullable(),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { projectId, content } = Body.parse(await req.json());

    const project = await db.projectBrief.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const existing = await db.submission.findFirst({
      where: { projectId, userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const submission = existing
      ? await db.submission.update({
          where: { id: existing.id },
          data: { content, status: "SUBMITTED", submittedAt: now },
        })
      : await db.submission.create({
          data: {
            id: cuid(),
            projectId,
            userId: user.id,
            content,
            status: "SUBMITTED",
            submittedAt: now,
          },
        });

    await recordEvent({
      userId: user.id,
      workspaceId: project.workspaceId,
      verb: "submitted",
      objectType: "submission",
      objectId: submission.id,
      context: { projectId },
    });

    return NextResponse.json({ ok: true, submissionId: submission.id });
  } catch (e) {
    captureError(e, { route: "projects/submit" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

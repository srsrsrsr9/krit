import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { LessonBlocks } from "@/lib/content/blocks";
import { captureError } from "@/lib/logger";

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  blocks: LessonBlocks.optional(),
  skillIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const lesson = await db.lesson.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!lesson) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.lesson.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        estimatedMinutes: body.estimatedMinutes,
        blocks: body.blocks ? (body.blocks as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
    if (body.skillIds) {
      await db.lessonSkill.deleteMany({ where: { lessonId: id } });
      if (body.skillIds.length) {
        await db.lessonSkill.createMany({
          data: body.skillIds.map((sid) => ({ id: cuid(), lessonId: id, skillId: sid })),
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/lessons PATCH" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const lesson = await db.lesson.findFirst({
      where: { id, workspaceId: m.workspaceId },
      include: { _count: { select: { items: true } } },
    });
    if (!lesson) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (lesson._count.items > 0) {
      return NextResponse.json({ error: "lesson_in_use" }, { status: 409 });
    }
    await db.lesson.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/lessons DELETE" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

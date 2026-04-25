import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { LessonBlocks } from "@/lib/content/blocks";
import { captureError } from "@/lib/logger";

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(1),
  blocks: LessonBlocks,
  skillIds: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  try {
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const id = cuid();
    await db.lesson.create({
      data: {
        id,
        workspaceId: m.workspaceId,
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle ?? null,
        estimatedMinutes: body.estimatedMinutes,
        blocks: body.blocks as unknown as Prisma.InputJsonValue,
      },
    });
    if (body.skillIds.length) {
      await db.lessonSkill.createMany({
        data: body.skillIds.map((sid) => ({ id: cuid(), lessonId: id, skillId: sid })),
      });
    }
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    captureError(e, { route: "admin/lessons POST" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

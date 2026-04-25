import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  title: z.string().min(1),
  prompt: z.string().min(10),
  rubric: z.array(z.object({
    criterion: z.string().min(1),
    levels: z.array(z.object({ label: z.string().min(1), points: z.number().int().min(0) })).min(1),
  })),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const p = await db.projectBrief.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.projectBrief.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        prompt: body.prompt,
        rubric: body.rubric as unknown as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/projects PATCH" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

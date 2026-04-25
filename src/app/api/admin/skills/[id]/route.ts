import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i).optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  decayDays: z.number().int().min(0).nullable().optional(),
  prerequisiteIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const skill = await db.skill.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!skill) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await db.skill.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        category: body.category,
        decayDays: body.decayDays,
      },
    });

    if (body.prerequisiteIds) {
      await db.skillPrerequisite.deleteMany({ where: { skillId: id } });
      if (body.prerequisiteIds.length) {
        await db.skillPrerequisite.createMany({
          data: body.prerequisiteIds.map((pid) => ({
            id: cuid(),
            skillId: id,
            prereqId: pid,
          })),
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/skills PATCH" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const skill = await db.skill.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!skill) return NextResponse.json({ error: "not_found" }, { status: 404 });
    // Hard delete is fine — cascades remove dependents. Evidence rows are
    // also cascade-deleted: this is intentional. In production we'd add
    // a soft-archive flag.
    await db.skill.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/skills DELETE" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

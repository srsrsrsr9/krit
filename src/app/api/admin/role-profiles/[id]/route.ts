import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, ADMIN_ROLES } from "@/lib/roles";

const Body = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  requirements: z.array(z.object({
    skillId: z.string(),
    requiredLevel: z.enum(["NOVICE", "WORKING", "PROFICIENT", "EXPERT"]),
  })),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(ADMIN_ROLES);
    const body = Body.parse(await req.json());
    const rp = await db.roleProfile.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!rp) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.roleProfile.update({
      where: { id },
      data: { name: body.name, description: body.description ?? null },
    });
    await db.roleRequirement.deleteMany({ where: { roleProfileId: id } });
    if (body.requirements.length) {
      await db.roleRequirement.createMany({
        data: body.requirements.map((r) => ({ id: cuid(), roleProfileId: id, skillId: r.skillId, requiredLevel: r.requiredLevel })),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(ADMIN_ROLES);
    const rp = await db.roleProfile.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!rp) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.roleProfile.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

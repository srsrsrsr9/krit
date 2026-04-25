import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, ADMIN_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Body = z.object({
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "AUTHOR", "INSTRUCTOR", "LEARNER"]).optional(),
  managerId: z.string().nullable().optional(),
  roleProfileId: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(ADMIN_ROLES);
    const body = Body.parse(await req.json());
    const target = await db.membership.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.membership.update({
      where: { id },
      data: {
        role: body.role,
        managerId: body.managerId,
        roleProfileId: body.roleProfileId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/memberships PATCH" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(ADMIN_ROLES);
    const target = await db.membership.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (target.userId === m.userId) return NextResponse.json({ error: "Cannot remove yourself." }, { status: 400 });
    await db.membership.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/memberships DELETE" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

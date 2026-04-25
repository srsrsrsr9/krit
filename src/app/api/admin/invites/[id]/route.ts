import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, ADMIN_ROLES } from "@/lib/roles";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(ADMIN_ROLES);
    const inv = await db.workspaceInvite.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!inv) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.workspaceInvite.update({ where: { id }, data: { revokedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

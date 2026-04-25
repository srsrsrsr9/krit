import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, ADMIN_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Body = z.object({
  role: z.enum(["LEARNER", "AUTHOR", "INSTRUCTOR", "MANAGER", "ADMIN"]),
  roleProfileId: z.string().nullable().optional(),
  maxUses: z.number().int().min(1).max(100),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
});

function token(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  try {
    const m = await requireRole(ADMIN_ROLES);
    const body = Body.parse(await req.json());
    const expiresAt = body.expiresInDays ? new Date(Date.now() + body.expiresInDays * 86_400_000) : null;
    await db.workspaceInvite.create({
      data: {
        id: cuid(),
        workspaceId: m.workspaceId,
        token: token(),
        role: body.role,
        roleProfileId: body.roleProfileId ?? null,
        createdById: m.userId,
        maxUses: body.maxUses,
        expiresAt,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/invites POST" });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

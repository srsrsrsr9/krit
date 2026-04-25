import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/roles";
import { recordEvents } from "@/lib/lrs";
import { captureError } from "@/lib/logger";

const Body = z.object({
  pathId: z.string().min(1),
  assignedToIds: z.array(z.string()).min(1),
  reason: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  compliance: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const m = await requireRole(MANAGER_ROLES);
    const body = Body.parse(await req.json());
    const path = await db.path.findFirst({ where: { id: body.pathId, workspaceId: m.workspaceId } });
    if (!path) return NextResponse.json({ error: "path_not_found" }, { status: 404 });
    const dueAt = body.dueAt ? new Date(body.dueAt) : null;

    // Skip people who already have an open assignment for this path.
    const existing = await db.assignment.findMany({
      where: {
        pathId: body.pathId,
        assignedToId: { in: body.assignedToIds },
        status: { in: ["PENDING", "ACTIVE"] },
      },
      select: { assignedToId: true },
    });
    const skipIds = new Set(existing.map((a) => a.assignedToId));
    const targets = body.assignedToIds.filter((id) => !skipIds.has(id));
    if (targets.length === 0) {
      return NextResponse.json({ error: "All selected people already have an active assignment for this path." }, { status: 409 });
    }

    const created = await db.assignment.createMany({
      data: targets.map((toId) => ({
        id: cuid(),
        workspaceId: m.workspaceId,
        pathId: body.pathId,
        assignedById: m.userId,
        assignedToId: toId,
        dueAt,
        status: "ACTIVE",
        compliance: body.compliance,
        reason: body.reason ?? null,
      })),
    });

    await recordEvents(targets.map((toId) => ({
      userId: toId,
      workspaceId: m.workspaceId,
      verb: "enrolled",
      objectType: "path",
      objectId: body.pathId,
      context: { reason: body.reason ?? null, compliance: body.compliance, assignedById: m.userId },
    })));

    return NextResponse.json({ ok: true, created: created.count });
  } catch (e) {
    captureError(e, { route: "admin/assignments POST" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
